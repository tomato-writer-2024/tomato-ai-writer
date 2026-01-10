import { NextRequest, NextResponse } from 'next/server';
import {
  userManager,
  authManager,
} from '@/storage/database';
import { getDb } from 'coze-coding-dev-sdk';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  getClientIp,
  getUserAgent,
} from '@/lib/auth';
import { UserRole, MembershipLevel } from '@/lib/types/user';
import { withMiddleware, errorResponse, successResponse } from '@/lib/apiMiddleware';
import { RATE_LIMIT_CONFIGS } from '@/lib/rateLimiter';

/**
 * 用户登录API
 */
async function handler(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] ===== 登录请求开始 =====`);

  try {
    const userAgent = getUserAgent(request);
    const clientIp = getClientIp(request);

    console.log(`[${requestId}] 客户端信息:`, {
      ip: clientIp,
      userAgent: userAgent.substring(0, 100),
      headers: {
        contentType: request.headers.get('content-type'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
      },
    });

    const { email, password } = await request.json();

    console.log(`[${requestId}] 请求参数:`, {
      email,
      hasPassword: !!password,
    });

    // 验证输入
    if (!email || !password) {
      console.log(`[${requestId}] 参数验证失败: 邮箱或密码为空`);
      return NextResponse.json(
        { success: false, error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    // 查找用户（使用参数化查询）
    console.log(`[${requestId}] 查找用户: ${email}`);
    const db = await getDb();
    const userResult = await db.execute(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log(`[${requestId}] 用户不存在: ${email}`);

      // 记录失败的登录尝试
      await authManager.logSecurityEvent({
        userId: null,
        action: 'LOGIN',
        details: JSON.stringify({ email, reason: 'User not found' }),
        ipAddress: clientIp,
        status: 'FAILED',
      });

      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    console.log(`[${requestId}] 找到用户:`, {
      userId: user.id,
      email: user.email,
      allKeys: Object.keys(user),
      passwordHashExists: 'password_hash' in user,
      passwordHashValue: user.password_hash,
      passwordHashCamelExists: 'passwordHash' in user,
      passwordHashCamelValue: user.passwordHash,
      isActive: user.is_active,
      isBanned: user.is_banned,
      isSuperAdmin: user.is_super_admin,
    });

    console.log(`[${requestId}] 找到用户:`, {
      userId: user.id,
      email: user.email,
      isActive: user.is_active,
      isBanned: user.is_banned,
      isSuperAdmin: user.is_super_admin,
    });

    // 验证密码
    console.log(`[${requestId}] 验证密码...`);
    const passwordHash = user.password_hash as string;
    const isPasswordValid = await verifyPassword(password, passwordHash);

    if (!isPasswordValid) {
      console.log(`[${requestId}] 密码验证失败`);

      // 记录失败的登录尝试
      await authManager.logSecurityEvent({
        userId: String(user.id),
        action: 'LOGIN',
        details: JSON.stringify({ email, reason: 'Invalid password' }),
        ipAddress: clientIp,
        status: 'FAILED',
      });

      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    console.log(`[${requestId}] 密码验证成功`);

    // 检查用户状态
    const isActive = user.is_active as boolean;
    const isBanned = user.is_banned as boolean;
    const banReason = user.ban_reason as string | null | undefined;

    if (!isActive || isBanned) {
      console.log(`[${requestId}] 用户状态异常:`, {
        isActive: isActive,
        isBanned: isBanned,
        banReason: banReason,
      });

      await authManager.logSecurityEvent({
        userId: String(user.id),
        action: 'LOGIN',
        details: JSON.stringify({ email, reason: 'User is banned or inactive' }),
        ipAddress: clientIp,
        status: 'FAILED',
      });

      return NextResponse.json(
        { success: false, error: `账号已被封禁：${banReason || '未知原因'}` },
        { status: 403 }
      );
    }

    // 检测异常登录行为
    console.log(`[${requestId}] 检测异常登录行为...`);
    const abnormalCheck = await authManager.detectAbnormalLogin(String(user.id), clientIp);

    if (abnormalCheck.isAbnormal) {
      console.log(`[${requestId}] 检测到异常登录:`, abnormalCheck);

      await authManager.logSecurityEvent({
        userId: String(user.id),
        action: 'LOGIN',
        details: JSON.stringify({ email, reason: abnormalCheck.reason }),
        ipAddress: clientIp,
        status: 'FAILED',
      });

      return NextResponse.json(
        { success: false, error: abnormalCheck.reason },
        { status: 403 }
      );
    }

    console.log(`[${requestId}] 登录检查通过，生成token...`);

    // 更新最后登录时间
    await userManager.updateLastLogin(String(user.id));

    // 生成token
    const accessToken = generateAccessToken({
      userId: String(user.id),
      email: String(user.email),
      role: user.role as UserRole,
      membershipLevel: user.membershipLevel as MembershipLevel,
    });

    const refreshToken = generateRefreshToken({
      userId: String(user.id),
      email: String(user.email),
    });

    console.log(`[${requestId}] Token生成成功`);

    // 记录成功的登录
    await authManager.logSecurityEvent({
      userId: String(user.id),
      action: 'LOGIN',
      details: JSON.stringify({ email }),
      ipAddress: clientIp,
      status: 'SUCCESS',
    });

    console.log(`[${requestId}] ===== 登录成功 =====`);

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
    console.error(`[${requestId}] 登录错误:`, error);
    console.error(`[${requestId}] 错误详情:`, {
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
      console.error(`[${requestId}] 记录安全日志失败:`, logError);
    }

    return errorResponse(
      '登录失败，请稍后重试: ' + (error instanceof Error ? error.message : String(error)),
      500,
      500
    );
  }
}

// 使用中间件包装：严格限流 + CSRF保护
export const POST = withMiddleware(handler, {
	rateLimit: RATE_LIMIT_CONFIGS.STRICT,
	enableCsrf: true,
});
