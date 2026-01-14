import { NextRequest, NextResponse } from 'next/server';
import {
  userManager,
  authManager,
  mockUserManager,
  mockAuthManager,
  initMockDb,
} from '@/storage/database';
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  getClientIp,
  getUserAgent,
} from '@/lib/auth';
import { UserRole, MembershipLevel } from '@/lib/types/user';
import { RATE_LIMIT_CONFIGS } from '@/lib/rateLimiter';
import { runMiddleware } from '@/lib/apiMiddleware';
import { isMockMode } from '@/lib/db';

/**
 * 用户登录API
 */
async function handler(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] ===== 登录请求开始 =====`);

  // 根据Mock模式选择Manager
  const isMock = isMockMode();
  const userManagerInstance = isMock ? mockUserManager : userManager;
  const authManagerInstance = isMock ? mockAuthManager : authManager;

  // Mock模式下初始化数据库
  if (isMock) {
    await initMockDb();
    console.log(`[${requestId}] Mock模式已启用`);
  }

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

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`[${requestId}] 邮箱格式不正确: ${email}`);
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 查找用户（支持Mock模式和数据库模式）
    console.log(`[${requestId}] 查找用户: ${email}`);

    const user = await userManagerInstance.getUserByEmail(email);
    const isMockUser = isMock;

    if (!user) {
      console.log(`[${requestId}] 用户不存在: ${email}`);

      // 记录失败的登录尝试（仅在非Mock模式下）
      await authManagerInstance.logSecurityEvent({
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

    if (!user) {
      console.log(`[${requestId}] 用户不存在: ${email}`);

      // 记录失败的登录尝试（仅在非Mock模式下）
      if (!isMockUser) {
        await authManager.logSecurityEvent({
          userId: null,
          action: 'LOGIN',
          details: JSON.stringify({ email, reason: 'User not found' }),
          ipAddress: clientIp,
          status: 'FAILED',
        });
      }

      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    console.log(`[${requestId}] 找到用户:`, {
      userId: user.id,
      email: user.email,
      role: user.role,
      membershipLevel: user.membershipLevel,
      isActive: user.isActive,
      isBanned: user.isBanned,
    });

    // 验证密码
    console.log(`[${requestId}] 验证密码...`);
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      console.log(`[${requestId}] 密码验证失败`);

      // 记录失败的登录尝试
      await authManagerInstance.logSecurityEvent({
        userId: user.id,
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
    if (!user.isActive || user.isBanned) {
      console.log(`[${requestId}] 用户状态异常:`, {
        isActive: user.isActive,
        isBanned: user.isBanned,
        banReason: user.banReason,
      });

      await authManagerInstance.logSecurityEvent({
        userId: user.id,
        action: 'LOGIN',
        details: JSON.stringify({
          email,
          reason: `User is ${!user.isActive ? 'inactive' : 'banned'}`,
        }),
        ipAddress: clientIp,
        status: 'FAILED',
      });

      return NextResponse.json(
        { success: false, error: `账号已被封禁：${user.banReason || '未知原因'}` },
        { status: 403 }
      );
    }

    // 检测异常登录行为
    const abnormalCheck = await authManagerInstance.detectAbnormalLogin(user.id, clientIp);

    if (abnormalCheck.isAbnormal) {
      console.log(`[${requestId}] 检测到异常登录:`, abnormalCheck);

      await authManagerInstance.logSecurityEvent({
        userId: user.id,
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
    await userManagerInstance.updateLastLogin(user.id);

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

    console.log(`[${requestId}] Token生成成功`);

    // 记录成功的登录
    await authManagerInstance.logSecurityEvent({
      userId: user.id,
      action: 'LOGIN',
      details: JSON.stringify({ email }),
      ipAddress: clientIp,
      status: 'SUCCESS',
    });

    // 返回响应
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            membershipLevel: user.membershipLevel,
            membershipExpireAt: user.membershipExpireAt,
            isActive: user.isActive,
          },
          token: accessToken,
          refreshToken: refreshToken,
        },
      },
      { status: 200 }
    );

    console.log(`[${requestId}] ===== 登录请求完成 =====`);
    return response;
  } catch (error) {
    console.error(`[${requestId}] 登录请求失败:`, error);

    return NextResponse.json(
      { success: false, error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/login
 * 用户登录
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
 * GET /api/auth/login
 * 返回登录接口信息
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/auth/login',
    method: 'POST',
    description: '用户登录接口',
    parameters: {
      email: '用户邮箱',
      password: '用户密码',
    },
    response: {
      success: 'boolean',
      data: {
        user: '用户信息',
        token: '访问令牌',
        refreshToken: '刷新令牌',
      },
    },
  });
}
