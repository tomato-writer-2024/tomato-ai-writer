import { NextRequest, NextResponse } from 'next/server';
import {
  userManager,
} from '@/storage/database';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  getClientIp,
  getUserAgent,
} from '@/lib/auth';
import { UserRole, MembershipLevel } from '@/lib/types/user';

/**
 * 用户登录API
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await userManager.getUserByEmail(email);

    if (!user) {
      // 记录失败的登录尝试
      await authManager.logSecurityEvent({
        userId: null,
        action: 'LOGIN',
        details: JSON.stringify({ email, reason: 'User not found' }),
        ipAddress: getClientIp(request),
        status: 'FAILED',
      });

      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      // 记录失败的登录尝试
      await authManager.logSecurityEvent({
        userId: user.id,
        action: 'LOGIN',
        details: JSON.stringify({ email, reason: 'Invalid password' }),
        ipAddress: getClientIp(request),
        status: 'FAILED',
      });

      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 检查用户状态
    if (!user.isActive || user.isBanned) {
      await authManager.logSecurityEvent({
        userId: user.id,
        action: 'LOGIN',
        details: JSON.stringify({ email, reason: 'User is banned or inactive' }),
        ipAddress: getClientIp(request),
        status: 'FAILED',
      });

      return NextResponse.json(
        { success: false, error: `账号已被封禁：${user.banReason || '未知原因'}` },
        { status: 403 }
      );
    }

    // 检测异常登录行为
    const abnormalCheck = await authManager.detectAbnormalLogin(user.id, getClientIp(request));
    if (abnormalCheck.isAbnormal) {
      await authManager.logSecurityEvent({
        userId: user.id,
        action: 'LOGIN',
        details: JSON.stringify({ email, reason: abnormalCheck.reason }),
        ipAddress: getClientIp(request),
        status: 'FAILED',
      });

      return NextResponse.json(
        { success: false, error: abnormalCheck.reason },
        { status: 403 }
      );
    }

    // 更新最后登录时间
    await userManager.updateLastLogin(user.id);

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

    // 记录成功的登录
    await authManager.logSecurityEvent({
      userId: user.id,
      action: 'LOGIN',
      details: JSON.stringify({ email }),
      ipAddress: getClientIp(request),
      status: 'SUCCESS',
    });

    // 返回用户信息（不包含敏感信息）
    return NextResponse.json({
      success: true,
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
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    await authManager.logSecurityEvent({
      userId: null,
      action: 'LOGIN',
      details: JSON.stringify({ error: String(error) }),
      ipAddress: getClientIp(request),
      status: 'FAILED',
    });

    return NextResponse.json(
      { success: false, error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
