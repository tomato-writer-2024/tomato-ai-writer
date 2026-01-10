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

/**
 * 微信登录API
 *
 * 支持真实的微信开放平台OAuth2.0流程
 *
 * 配置环境变量：
 * - WECHAT_APPID: 微信开放平台AppID
 * - WECHAT_SECRET: 微信开放平台AppSecret
 *
 * 流程：
 * 1. 前端跳转到微信授权页面
 * 2. 用户授权后，微信返回code
 * 3. 后端使用code换取access_token和用户信息
 * 4. 根据unionid查找或创建用户
 * 5. 返回token
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: '缺少授权码' },
        { status: 400 }
      );
    }

    // 从环境变量获取微信配置
    const appId = process.env.WECHAT_APPID;
    const secret = process.env.WECHAT_SECRET;

    if (!appId || !secret) {
      console.error('[微信登录] 未配置微信AppID或Secret');
      return NextResponse.json(
        { success: false, error: '微信登录未配置' },
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

    const wechatOpenId = tokenData.openid;
    const wechatUnionId = tokenData.unionid;
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

    const nickname = userData.nickname;
    const avatar = userData.headimgurl;
    const sex = userData.sex; // 性别：1男性，2女性，0未知
    const province = userData.province;
    const city = userData.city;
    const country = userData.country;

    console.log('[微信登录] 用户信息:', {
      openId: wechatOpenId,
      unionId: wechatUnionId,
      nickname,
    });

    // 3. 查找是否已存在该微信用户
    const existingUser = await userManager.getUserByWechatOpenId(wechatOpenId);

    let user;

    if (existingUser) {
      // 用户已存在，直接登录
      user = existingUser;

      // 更新用户信息
      await userManager.updateUser(user.id, {
        wechatUnionId: wechatUnionId || undefined,
        username: nickname || undefined,
        avatarUrl: avatar || undefined,
        lastLoginAt: new Date().toISOString(),
      });

      console.log('[微信登录] 用户已存在:', user.id);
    } else {
      // 用户不存在，创建新用户
      // 生成随机密码（微信登录用户不需要真实密码）
      const randomPassword = crypto.randomUUID().substring(0, 32);

      // 构造用户数据
      user = await userManager.createUser({
        email: `wx_${wechatOpenId}@wechat.user`, // 使用临时邮箱标识
        username: nickname || '微信用户',
        passwordHash: randomPassword, // 实际上微信用户不使用密码登录
        role: UserRole.FREE,
        membershipLevel: MembershipLevel.FREE,
        avatarUrl: avatar,
        wechatOpenId: wechatOpenId,
        wechatUnionId: wechatUnionId,
      });

      console.log('[微信登录] 创建新用户:', user.id);
    }

    // 记录登录事件
    await authManager.logSecurityEvent({
      userId: user.id,
      action: 'LOGIN',
      details: JSON.stringify({
        email: user.email,
        method: 'wechat',
        openId: wechatOpenId,
        unionId: wechatUnionId,
      }),
      ipAddress: getClientIp(request),
      status: 'SUCCESS',
    });

    // 检查用户配额
    const quotaCheck = await checkUserQuota(user.id);
    if (!quotaCheck.canUse) {
      return NextResponse.json(
        {
          success: false,
          error: quotaCheck.reason,
        },
        { status: 403 }
      );
    }

    // 生成token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      membershipLevel: user.membershipLevel as MembershipLevel,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // 返回用户信息
    return NextResponse.json({
      success: true,
      message: '微信登录成功',
      data: {
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          membershipLevel: user.membershipLevel,
          membershipExpireAt: user.membershipExpireAt,
          dailyUsageCount: user.dailyUsageCount,
          monthlyUsageCount: user.monthlyUsageCount,
          storageUsed: user.storageUsed,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          loginMethod: 'wechat',
        },
      },
    });
  } catch (error) {
    console.error('WeChat login error:', error);

    // 记录失败事件
    await authManager.logSecurityEvent({
      userId: null,
      action: 'LOGIN',
      details: JSON.stringify({ error: String(error), method: 'wechat' }),
      ipAddress: getClientIp(request),
      status: 'FAILED',
    });

    return NextResponse.json(
      { success: false, error: '微信登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}

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
