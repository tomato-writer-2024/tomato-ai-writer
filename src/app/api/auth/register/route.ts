import { NextRequest, NextResponse } from 'next/server';
import { userManager, authManager } from '@/storage/database';
import { getDb } from 'coze-coding-dev-sdk';
import {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  getClientIp,
  checkUserQuota,
} from '@/lib/auth';
import { UserRole, MembershipLevel } from '@/lib/types/user';
import { withMiddleware } from '@/lib/apiMiddleware';
import { RATE_LIMIT_CONFIGS } from '@/lib/rateLimiter';

// 在服务端使用crypto
let crypto: any;
if (typeof window === 'undefined') {
  crypto = require('crypto');
}

/**
 * 用户注册API
 */
async function handler(request: NextRequest) {
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

    // 检查邮箱是否已注册（使用原生SQL避免Drizzle查询问题）
    const db = await getDb();
    const existingUserResult = await db.execute(
      `SELECT id, email, username FROM users WHERE email = '${email}'`
    );

    if (existingUserResult.rows.length > 0) {
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
    const now = new Date().toISOString();
    const userId = crypto.randomUUID();

    // 创建用户（使用原生SQL避免Drizzle ORM问题）
    await db.execute(
      `INSERT INTO users (
        id, email, password_hash, username, role, membership_level,
        membership_expire_at, daily_usage_count, monthly_usage_count, storage_used,
        is_active, is_banned, is_super_admin, created_at, updated_at
      )
      VALUES (
        '${userId}',
        '${email}',
        '${passwordHash}',
        '${username || email.split('@')[0]}',
        '${UserRole.FREE}',
        '${MembershipLevel.FREE}',
        NULL,
        0,
        0,
        0,
        true,
        false,
        false,
        '${now}',
        '${now}'
      )`
    );

    // 查询新创建的用户
    const newUserResult = await db.execute(
      `SELECT id, email, username, role, membership_level, membership_expire_at, daily_usage_count, monthly_usage_count, storage_used, created_at
       FROM users WHERE id = '${userId}'`
    );

    if (newUserResult.rows.length === 0) {
      throw new Error('Failed to retrieve created user');
    }

    const newUser = newUserResult.rows[0];

    // 记录注册事件
    await authManager.logSecurityEvent({
      userId: String(newUser.id),
      action: 'LOGIN',
      details: JSON.stringify({ email, action: 'User registered' }),
      ipAddress: getClientIp(request),
      status: 'SUCCESS',
    });

    // 生成token
    const accessToken = generateAccessToken({
      userId: String(newUser.id),
      email: String(newUser.email),
      role: newUser.role as UserRole,
      membershipLevel: newUser.membershipLevel as MembershipLevel,
    });

    const refreshToken = generateRefreshToken({
      userId: String(newUser.id),
      email: String(newUser.email),
    });

    // 返回用户信息
    return NextResponse.json({
      success: true,
      data: {
        token: accessToken,
        refreshToken,
        user: {
          id: String(newUser.id),
          email: String(newUser.email),
          username: String(newUser.username),
          role: newUser.role,
          membershipLevel: newUser.membershipLevel,
          membershipExpireAt: newUser.membership_expire_at,
          dailyUsageCount: Number(newUser.daily_usage_count),
          monthlyUsageCount: Number(newUser.monthly_usage_count),
          storageUsed: Number(newUser.storage_used),
          createdAt: newUser.created_at,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });

    try {
      await authManager.logSecurityEvent({
        userId: null,
        action: 'LOGIN',
        details: JSON.stringify({ error: String(error) }),
        ipAddress: getClientIp(request),
        status: 'FAILED',
      });
    } catch (logError) {
      console.error('Failed to log security event:', logError);
    }

    return NextResponse.json(
      { success: false, error: '注册失败，请稍后重试: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// 使用中间件包装：严格限流 + 禁用CSRF保护（公开API不需要CSRF保护）
export const POST = withMiddleware(handler, {
	rateLimit: RATE_LIMIT_CONFIGS.STRICT,
	enableCsrf: false, // 注册API是公开的，不需要CSRF保护
});
