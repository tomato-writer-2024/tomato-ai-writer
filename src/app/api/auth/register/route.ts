import { NextRequest, NextResponse } from 'next/server';
import { userManager, authManager } from '@/storage/database';
import {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  getClientIp,
  checkUserQuota,
} from '@/lib/auth';
import { UserRole, MembershipLevel } from '@/lib/types/user';

/**
 * 用户注册API
 */
export async function POST(request: NextRequest) {
  try {
    const { username, email, password, confirmPassword } = await request.json();

    // 验证输入
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: '所有字段都是必填的' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // 降低密码强度要求，不再强制要求大小写字母和数字
    // 只要长度>=6即可，让用户设置简单的密码

    // 验证确认密码
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: '两次输入的密码不一致' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已注册
    const existingUser = await userManager.getUserByEmail(email);
    if (existingUser) {
      await authManager.logSecurityEvent({
        userId: null,
        action: 'LOGIN',
        details: JSON.stringify({ email, reason: 'Email already registered' }),
        ipAddress: getClientIp(request),
        status: 'FAILED',
      });

      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 哈希密码
    const passwordHash = await hashPassword(password);

    // 创建用户（默认为免费用户）
    const newUser = await userManager.createUser({
      email,
      passwordHash,
      username: username || email.split('@')[0],
      role: UserRole.FREE,
      membershipLevel: MembershipLevel.FREE,
    });

    // 记录注册事件
    await authManager.logSecurityEvent({
      userId: newUser.id,
      action: 'LOGIN',
      details: JSON.stringify({ email, action: 'User registered' }),
      ipAddress: getClientIp(request),
      status: 'SUCCESS',
    });

    // 生成token
    const accessToken = generateAccessToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role as UserRole,
      membershipLevel: newUser.membershipLevel as MembershipLevel,
    });

    const refreshToken = generateRefreshToken({
      userId: newUser.id,
      email: newUser.email,
    });

    // 返回用户信息
    return NextResponse.json({
      success: true,
      data: {
        token: accessToken,
        refreshToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
          membershipLevel: newUser.membershipLevel,
          membershipExpireAt: newUser.membershipExpireAt,
          dailyUsageCount: newUser.dailyUsageCount,
          monthlyUsageCount: newUser.monthlyUsageCount,
          storageUsed: newUser.storageUsed,
          createdAt: newUser.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    await authManager.logSecurityEvent({
      userId: null,
      action: 'LOGIN',
      details: JSON.stringify({ error: String(error) }),
      ipAddress: getClientIp(request),
      status: 'FAILED',
    });

    return NextResponse.json(
      { success: false, error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
