import { NextRequest, NextResponse } from 'next/server';
import { generateAccessToken } from '@/lib/auth';
import { UserRole, MembershipLevel } from '@/lib/types/user';
import jwt from 'jsonwebtoken';

/**
 * 测试登录API中的token生成
 * POST /api/debug/test-login-token
 */
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] ===== 测试登录token生成开始 =====`);

  try {
    const { email, password } = await request.json();

    // 模拟登录API中的token生成
    const payload = {
      userId: '8e819829-1743-4a44-94d3-6250fa883cb8',
      email: email || '208343256@qq.com',
      role: 'SUPER_ADMIN' as UserRole,
      membershipLevel: 'ENTERPRISE' as MembershipLevel,
    };

    console.log(`[${requestId}] Token payload:`, payload);

    // 直接调用generateAccessToken（和登录API完全相同的方式）
    const accessToken = generateAccessToken(payload);

    console.log(`[${requestId}] Token已生成:`, {
      tokenLength: accessToken.length,
      tokenStart: accessToken.substring(0, 50) + '...',
    });

    // 解码token
    const decoded = jwt.decode(accessToken) as any;
    console.log(`[${requestId}] 解码后的token:`, {
      userId: decoded?.userId,
      email: decoded?.email,
      role: decoded?.role,
      iat: decoded?.iat,
      exp: decoded?.exp,
    });

    // 检查expiresIn
    if (decoded?.iat && decoded?.exp) {
      const expiresIn = decoded.exp - decoded.iat;
      const expiresInDays = expiresIn / 86400;
      const now = Math.floor(Date.now() / 1000);

      console.log(`[${requestId}] Token有效期:`, {
        expiresIn,
        expiresInDays,
        isExpired: decoded.exp < now,
        timeUntilExpire: decoded.exp - now,
      });

      if (expiresIn === 0) {
        console.error(`[${requestId}] ❌ 错误：Token立即过期（iat=exp）`);
        return NextResponse.json({
          success: false,
          error: 'Token立即过期',
          decoded: decoded,
          analysis: {
            iat: decoded.iat,
            exp: decoded.exp,
            expiresIn: expiresIn,
            problem: 'iat和exp相同，token立即过期',
          },
        });
      }
    }

    // 验证token
    try {
      const verified = jwt.verify(accessToken, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as any;
      console.log(`[${requestId}] Token验证成功:`, {
        userId: verified.userId,
        role: verified.role,
      });
    } catch (error: any) {
      console.error(`[${requestId}] Token验证失败:`, error);
      return NextResponse.json({
        success: false,
        error: 'Token验证失败',
        verificationError: error.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        token: accessToken,
        decoded: decoded,
        analysis: {
          iat: decoded?.iat,
          exp: decoded?.exp,
          expiresIn: decoded?.exp - decoded?.iat,
          expiresInDays: (decoded?.exp - decoded?.iat) / 86400,
          currentTimestamp: Math.floor(Date.now() / 1000),
        },
      },
    });
  } catch (error) {
    console.error(`[${requestId}] 测试失败:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

/**
 * GET /api/debug/test-login-token
 * 返回测试信息
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/debug/test-login-token',
    method: 'POST',
    description: '测试登录API中的token生成功能',
    usage: 'POST with {email, password} to simulate login token generation',
  });
}
