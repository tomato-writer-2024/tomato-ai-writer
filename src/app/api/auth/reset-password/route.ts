import { NextRequest, NextResponse } from 'next/server';
import { userManager, authManager } from '@/storage/database';
import { hashPassword, verifyResetToken, generateAccessToken, generateRefreshToken, getClientIp } from '@/lib/auth';
import { UserRole, MembershipLevel } from '@/lib/types/user';
import { users } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { getDb } from 'coze-coding-dev-sdk';

/**
 * 重置密码API
 *
 * 验证重置token并更新用户密码
 */
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    // 验证参数
    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
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

    // 验证并解码token
    const decoded = verifyResetToken(token);

    if (!decoded) {
      await authManager.logSecurityEvent({
        userId: null,
        action: 'PASSWORD_RESET',
        details: JSON.stringify({ reason: 'Invalid reset token' }),
        ipAddress: getClientIp(request),
        status: 'FAILED',
      });

      return NextResponse.json(
        { success: false, error: '重置链接无效或已过期' },
        { status: 401 }
      );
    }

    // 获取用户信息
    const user = await userManager.getUserById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 验证邮箱是否匹配
    if (user.email !== decoded.email) {
      return NextResponse.json(
        { success: false, error: '邮箱不匹配' },
        { status: 400 }
      );
    }

    // 哈希新密码
    const passwordHash = await hashPassword(password);

    // 直接使用SQL更新密码（updateUserSchema不允许更新passwordHash）
    const db = await getDb();
    await db.update(users)
      .set({ 
        passwordHash,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, user.id));

    // 记录安全事件
    await authManager.logSecurityEvent({
      userId: user.id,
      action: 'PASSWORD_RESET',
      details: JSON.stringify({ email: user.email, action: 'Password reset successfully' }),
      ipAddress: getClientIp(request),
      status: 'SUCCESS',
    });

    // 生成新的token
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

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '密码重置成功',
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
        },
      },
    });
  } catch (error) {
    console.error('Reset password error:', error);

    // 记录失败事件
    await authManager.logSecurityEvent({
      userId: null,
      action: 'PASSWORD_RESET',
      details: JSON.stringify({ error: String(error) }),
      ipAddress: getClientIp(request),
      status: 'FAILED',
    });

    return NextResponse.json(
      { success: false, error: '重置失败，请稍后重试' },
      { status: 500 }
    );
  }
}
