import { NextRequest, NextResponse } from 'next/server';
import { userManager, authManager } from '@/storage/database';
import {
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
  getClientIp,
} from '@/lib/auth';
import { UserRole, MembershipLevel } from '@/lib/types/user';
import { RATE_LIMIT_CONFIGS } from '@/lib/rateLimiter';
import { runMiddleware } from '@/lib/apiMiddleware';
import { randomUUID } from 'crypto';

/**
 * 用户注册API
 */
async function handler(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] ===== 注册请求开始 =====`);

  try {
    const clientIp = getClientIp(request);
    const { username, email, password, confirmPassword } = await request.json();

    console.log(`[${requestId}] 请求参数:`, {
      username,
      email,
      hasPassword: !!password,
      hasConfirmPassword: !!confirmPassword,
    });

    // 验证输入
    if (!username || !email || !password) {
      console.log(`[${requestId}] 参数验证失败: 字段为空`);
      return NextResponse.json(
        { success: false, error: '所有字段都是必填的' },
        { status: 400 }
      );
    }

    // 验证用户名长度
    if (username.length < 2 || username.length > 30) {
      console.log(`[${requestId}] 用户名长度不正确: ${username.length}`);
      return NextResponse.json(
        { success: false, error: '用户名长度应为2-30个字符' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`[${requestId}] 邮箱格式不正确: ${email}`);
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      console.log(`[${requestId}] 密码长度不足: ${password.length}`);
      return NextResponse.json(
        { success: false, error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // 验证确认密码
    if (password !== confirmPassword) {
      console.log(`[${requestId}] 确认密码不匹配`);
      return NextResponse.json(
        { success: false, error: '两次输入的密码不一致' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已注册（使用userManager的参数化查询）
    console.log(`[${requestId}] 检查邮箱是否已注册: ${email}`);
    const existingUser = await userManager.getUserByEmail(email);

    if (existingUser) {
      console.log(`[${requestId}] 邮箱已被注册: ${email}`);

      await authManager.logSecurityEvent({
        userId: null,
        action: 'REGISTER',
        details: JSON.stringify({ email, reason: 'Email already registered' }),
        ipAddress: clientIp,
        status: 'FAILED',
      });

      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 检查用户名是否已被使用
    const existingUsername = await userManager.getUserByUsername(username);
    if (existingUsername) {
      console.log(`[${requestId}] 用户名已被使用: ${username}`);

      return NextResponse.json(
        { success: false, error: '该用户名已被使用' },
        { status: 409 }
      );
    }

    // 哈希密码
    console.log(`[${requestId}] 哈希密码...`);
    const passwordHash = await hashPassword(password);

    // 创建用户（使用userManager，安全防SQL注入）
    console.log(`[${requestId}] 创建用户...`);
    const newUser = await userManager.createUser({
      email,
      passwordHash,
      username,
      role: UserRole.FREE,
      membershipLevel: MembershipLevel.FREE,
    });

    console.log(`[${requestId}] 用户创建成功:`, {
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

    // 记录注册事件
    await authManager.logSecurityEvent({
      userId: newUser.id,
      action: 'REGISTER',
      details: JSON.stringify({ email, action: 'User registered' }),
      ipAddress: clientIp,
      status: 'SUCCESS',
    });

    // 生成token
    console.log(`[${requestId}] 生成token...`);
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

    console.log(`[${requestId}] Token生成成功`);

    // 返回用户信息
    const response = NextResponse.json(
      {
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
      },
      { status: 201 }
    );

    console.log(`[${requestId}] ===== 注册请求完成 =====`);
    return response;
  } catch (error) {
    console.error(`[${requestId}] 注册请求失败:`, error);
    console.error(`[${requestId}] 错误详情:`, {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });

    try {
      await authManager.logSecurityEvent({
        userId: null,
        action: 'REGISTER',
        details: JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        }),
        ipAddress: getClientIp(request),
        status: 'FAILED',
      });
    } catch (logError) {
      console.error(`[${requestId}] 记录安全事件失败:`, logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: '注册失败，请稍后重试',
        details: process.env.NODE_ENV === 'development'
          ? error instanceof Error
            ? error.message
            : String(error)
          : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/register
 * 用户注册
 */
export async function POST(request: NextRequest) {
  // 执行中间件检查
  const middlewareResult = await runMiddleware(request, {
    rateLimit: RATE_LIMIT_CONFIGS.STRICT,
  });

  if (middlewareResult) {
    return middlewareResult;
  }

  return handler(request);
}

/**
 * GET /api/auth/register
 * 返回注册接口信息
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/auth/register',
    method: 'POST',
    description: '用户注册接口',
    parameters: {
      username: '用户名（2-30个字符）',
      email: '用户邮箱',
      password: '用户密码（至少6位）',
      confirmPassword: '确认密码',
    },
    response: {
      success: 'boolean',
      data: {
        token: '访问令牌',
        refreshToken: '刷新令牌',
        user: '用户信息',
      },
    },
  });
}
