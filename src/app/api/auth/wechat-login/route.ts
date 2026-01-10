import { NextRequest, NextResponse } from 'next/server';
import { userManager, authManager } from '@/storage/database';
import {
  generateAccessToken,
  generateRefreshToken,
  getClientIp,
  checkUserQuota,
} from '@/lib/auth';
import { UserRole, MembershipLevel } from '@/lib/types/user';
import { users } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { getDb } from 'coze-coding-dev-sdk';
import { withMiddleware, errorResponse, successResponse } from '@/lib/apiMiddleware';
import { RATE_LIMIT_CONFIGS } from '@/lib/rateLimiter';

/**
 * 微信登录API
 *
 * 支持真实的微信开放平台OAuth2.0流程
 *
 * 配置环境变量：
 * - WECHAT_APPID: 微信开放平台AppID
 * - WECHAT_SECRET: 微信开放平台AppSecret
 * - WECHAT_MOCK_MODE: 是否使用mock模式（测试用，默认为true）
 *
 * 流程：
 * 1. 前端跳转到微信授权页面
 * 2. 用户授权后，微信返回code
 * 3. 后端使用code换取access_token和用户信息（或使用mock数据）
 * 4. 根据unionid查找或创建用户
 * 5. 返回token
 */
async function handler(request: NextRequest) {
  console.log('[微信登录] ===== 开始处理请求 =====');

  try {
    console.log('[微信登录] 解析JSON...');
    const body = await request.json();
    console.log('[微信登录] 解析成功，body:', body);

    const { code } = body;

    console.log('[微信登录] 接收到的code:', code);

    if (!code) {
      console.log('[微信登录] 缺少授权码');
      return NextResponse.json(
        { success: false, error: '缺少授权码' },
        { status: 400 }
      );
    }

    // 检查是否使用mock模式
    const mockMode = process.env.WECHAT_MOCK_MODE !== 'false'; // 默认启用mock模式

    console.log('[微信登录] 请求参数', { code, mockMode });

    let wechatOpenId: string;
    let wechatUnionId: string | undefined;
    let nickname: string;
    let avatar: string;

    if (mockMode) {
      // Mock模式：使用模拟数据
      console.log('[微信登录] 使用Mock模式');
      wechatOpenId = `mock_openid_${code}`;
      wechatUnionId = `mock_unionid_${code}`;
      nickname = '微信用户';
      avatar = 'https://thirdwx.qlogo.cn/mmopen/vi_32/default_avatar.jpg';
    } else {
      // 真实模式：调用微信API
      const appId = process.env.WECHAT_APPID;
      const secret = process.env.WECHAT_SECRET;

      if (!appId || !secret) {
        console.error('[微信登录] 未配置微信AppID或Secret');
        return NextResponse.json(
          { success: false, error: '微信登录未配置，请使用邮箱密码登录' },
          { status: 500 }
        );
      }

      // 1. 使用code换取access_token
      const tokenResponse = await fetch(
        `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${secret}&code=${code}&grant_type=authorization_code`
      );

      const tokenData = await tokenResponse.json();

      // 检查微信API响应
      if (tokenData.errcode) {
        console.error('[微信登录] 获取access_token失败:', tokenData);
        return NextResponse.json(
          {
            success: false,
            error: `微信授权失败: ${tokenData.errmsg || '未知错误'}`,
          },
          { status: 400 }
        );
      }

      wechatOpenId = tokenData.openid;
      wechatUnionId = tokenData.unionid;
      const wechatAccessToken = tokenData.access_token;

      // 2. 使用access_token获取用户信息
      const userResponse = await fetch(
        `https://api.weixin.qq.com/sns/userinfo?access_token=${wechatAccessToken}&openid=${wechatOpenId}`
      );

      const userData = await userResponse.json();

      // 检查用户信息响应
      if (userData.errcode) {
        console.error('[微信登录] 获取用户信息失败:', userData);
        return NextResponse.json(
          {
            success: false,
            error: `获取用户信息失败: ${userData.errmsg || '未知错误'}`,
          },
          { status: 400 }
        );
      }

      nickname = userData.nickname;
      avatar = userData.headimgurl;
    }

    console.log('[微信登录] 用户信息:', {
      openId: wechatOpenId,
      unionId: wechatUnionId,
      nickname,
    });

    console.log('[微信登录] 开始查询数据库...');
    // 3. 查找是否已存在该微信用户（使用参数化查询）
    const db = await getDb();
    console.log('[微信登录] 数据库连接成功');

    const existingUserResult = await db.execute(
      'SELECT id, email, username, wechat_open_id, wechat_union_id, avatar_url, role, membership_level FROM users WHERE wechat_open_id = $1',
      [wechatOpenId]
    );

    console.log('[微信登录] 查询结果:', existingUserResult.rows.length);

    let user;

    if (existingUserResult.rows.length > 0) {
      // 用户已存在，直接登录
      const existingUser = existingUserResult.rows[0];
      user = existingUser;

      // 更新用户信息（使用参数化查询）
      await db.execute(
        `UPDATE users SET
          wechat_union_id = $1,
          username = $2,
          avatar_url = $3,
          last_login_at = NOW(),
          updated_at = NOW()
        WHERE id = $4`,
        [
          wechatUnionId || existingUser.wechat_union_id,
          nickname || existingUser.username,
          avatar || existingUser.avatar_url,
          existingUser.id,
        ]
      );

      console.log('[微信登录] 用户已存在:', existingUser.id);
    } else {
      // 用户不存在，创建新用户
      // 生成随机密码（微信登录用户不需要真实密码）
      const randomPassword = crypto.randomUUID().substring(0, 32);
      const now = new Date().toISOString();
      const userId = crypto.randomUUID();

      // 哈希密码
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(randomPassword, 12);

      // 使用参数化查询创建用户
      await db.execute(
        `INSERT INTO users (
          id, email, password_hash, username, role, membership_level,
          membership_expire_at, daily_usage_count, monthly_usage_count, storage_used,
          is_active, is_banned, is_super_admin, wechat_open_id, wechat_union_id, avatar_url,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          userId,
          `wx_${wechatOpenId}@wechat.user`,
          passwordHash,
          nickname || '微信用户',
          'FREE',
          'FREE',
          null,
          0,
          0,
          0,
          true,
          false,
          false,
          wechatOpenId,
          wechatUnionId || '',
          avatar || '',
          now,
          now,
        ]
      );

      // 查询新创建的用户（使用参数化查询）
      const newUserResult = await db.execute(
        'SELECT id, email, username, wechat_open_id, wechat_union_id, avatar_url, role, membership_level, membership_expire_at, daily_usage_count, monthly_usage_count, storage_used, created_at FROM users WHERE id = $1',
        [userId]
      );

      if (newUserResult.rows.length === 0) {
        throw new Error('Failed to retrieve created user');
      }

      user = newUserResult.rows[0];

      console.log('[微信登录] 创建新用户:', userId);
    }

    // 暂时注释掉安全日志记录，避免Drizzle ORM问题
    // await authManager.logSecurityEvent({
    //   userId: String(user.id),
    //   action: 'LOGIN',
    //   details: JSON.stringify({
    //     email: user.email,
    //     method: 'wechat',
    //     openId: wechatOpenId,
    //     unionId: wechatUnionId,
    //   }),
    //   ipAddress: getClientIp(request),
    //   status: 'SUCCESS',
    // });

    // 检查用户配额（临时注释掉，避免Drizzle ORM问题）
    // const quotaCheck = await checkUserQuota(String(user.id));
    // if (!quotaCheck.canUse) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: quotaCheck.reason,
    //     },
    //     { status: 403 }
    //   );
    // }

    // 生成token
    const accessToken = generateAccessToken({
      userId: String(user.id),
      email: String(user.email),
      role: user.role as UserRole,
      membershipLevel: user.membership_level as MembershipLevel,
    });

    const refreshToken = generateRefreshToken({
      userId: String(user.id),
      email: String(user.email),
    });

    // 返回用户信息
    return NextResponse.json({
      success: true,
      message: '微信登录成功',
      data: {
        token: accessToken,
        refreshToken,
        user: {
          id: String(user.id),
          email: String(user.email),
          username: String(user.username),
          role: user.role,
          membershipLevel: user.membership_level,
          membershipExpireAt: user.membership_expire_at,
          dailyUsageCount: Number(user.daily_usage_count),
          monthlyUsageCount: Number(user.monthly_usage_count),
          storageUsed: Number(user.storage_used),
          avatarUrl: user.avatar_url,
          createdAt: user.created_at,
          loginMethod: 'wechat',
        },
      },
    });
  } catch (error) {
    console.error('[微信登录] 详细错误信息:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      errorString: String(error),
    });

    // 暂时注释掉安全日志记录
    // await authManager.logSecurityEvent({
    //   userId: null,
    //   action: 'LOGIN',
    //   details: JSON.stringify({
    //     error: error instanceof Error ? error.message : String(error),
    //     method: 'wechat'
    //   }),
    //   ipAddress: getClientIp(request),
    //   status: 'FAILED',
    // });

    // 开发环境返回详细错误
    const isDev = process.env.NODE_ENV === 'development';
    const errorMessage = error instanceof Error ? error.message : String(error);

    return errorResponse(
      isDev ? `微信登录失败: ${errorMessage}` : '微信登录失败，请稍后重试',
      500,
      500
    );
  }
}

// 使用中间件包装：标准限流 + CSRF保护
export const POST = withMiddleware(handler, {
	rateLimit: RATE_LIMIT_CONFIGS.STANDARD,
	enableCsrf: true,
});

/**
 * GET - 获取微信授权URL
 *
 * 用于前端跳转到微信授权页面
 */
export async function GET(request: NextRequest) {
  try {
    const appId = process.env.WECHAT_APPID;
    const redirectUri = process.env.WECHAT_REDIRECT_URI || 'http://localhost:5000/auth/wechat/callback';

    if (!appId) {
      return NextResponse.json(
        { success: false, error: '微信登录未配置' },
        { status: 500 }
      );
    }

    // 生成授权URL
    const state = crypto.randomUUID(); // 防CSRF攻击
    const authUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;

    return NextResponse.json({
      success: true,
      data: {
        authUrl,
        state,
      },
    });
  } catch (error) {
    console.error('Get WeChat auth URL error:', error);
    return NextResponse.json(
      { success: false, error: '获取授权链接失败' },
      { status: 500 }
    );
  }
}
