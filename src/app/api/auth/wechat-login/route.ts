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
 * 注意：这是一个MVP版本的实现，使用模拟的微信OAuth流程。
 * 生产环境需要接入真实的微信开放平台API。
 *
 * 流程：
 * 1. 前端跳转到微信授权页面（模拟页面：/auth/wechat）
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

    // TODO: 生产环境需要接入真实的微信API
    // 示例：
    /*
    // 使用code换取access_token
    const tokenResponse = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${APPID}&secret=${SECRET}&code=${code}&grant_type=authorization_code`
    );
    const tokenData = await tokenResponse.json();

    // 使用access_token获取用户信息
    const userResponse = await fetch(
      `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenData.access_token}&openid=${tokenData.openid}`
    );
    const userData = await userResponse.json();

    const wechatOpenId = userData.openid;
    const wechatUnionId = userData.unionid;
    const nickname = userData.nickname;
    const avatar = userData.headimgurl;
    */

    // MVP版本：模拟微信用户信息
    const mockWechatUser = {
      openid: 'mock_wechat_openid_' + Date.now(),
      unionid: 'mock_wechat_unionid_' + Date.now(),
      nickname: '微信用户',
      avatar: 'https://via.placeholder.com/100',
      email: 'wx_user_' + Date.now() + '@example.com',
    };

    console.log('[微信登录] 模拟用户信息:', mockWechatUser);

    // 查找是否已存在该微信用户
    const existingUser = await userManager.getUserByWechatOpenId(mockWechatUser.openid);

    let user;

    if (existingUser) {
      // 用户已存在，直接登录
      user = existingUser;

      // 更新最后登录时间和头像（直接使用SQL，updateUserSchema不允许更新lastLoginAt）
      const db = await getDb();
      await db.update(users)
        .set({ 
          lastLoginAt: new Date().toISOString(),
          avatarUrl: mockWechatUser.avatar,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, user.id));

      console.log('[微信登录] 用户已存在:', user.id);
    } else {
      // 用户不存在，创建新用户
      // 注意：MVP版本不支持wechatOpenId字段，使用passwordHash为空来标识微信用户
      user = await userManager.createUser({
        email: mockWechatUser.email,
        username: mockWechatUser.nickname,
        passwordHash: '', // 微信登录用户不需要密码，使用空字符串标识
        role: UserRole.FREE,
        membershipLevel: MembershipLevel.FREE,
        avatarUrl: mockWechatUser.avatar,
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
        openId: mockWechatUser.openid,
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
