import { NextRequest, NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { UserRole, MembershipLevel } from '@/lib/types/user';
import jwt from 'jsonwebtoken';

/**
 * Token生成诊断API
 * POST /api/debug/generate-token
 */
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] ===== Token生成诊断开始 =====`);

  try {
    const { email, password } = await request.json();

    if (email && password) {
      // 测试登录场景
      const testPayload = {
        userId: 'test-user-id',
        email: email,
        role: 'SUPER_ADMIN' as UserRole,
        membershipLevel: 'ENTERPRISE' as MembershipLevel,
      };

      console.log(`[${requestId}] 生成测试token，payload:`, testPayload);

      // 生成access token
      const accessToken = generateAccessToken(testPayload);

      // 生成refresh token
      const refreshToken = generateRefreshToken({
        userId: testPayload.userId,
        email: testPayload.email,
      });

      // 解码token以检查
      let decodedAccess, decodedRefresh;

      try {
        decodedAccess = jwt.decode(accessToken) as jwt.JwtPayload;
        decodedRefresh = jwt.decode(refreshToken) as jwt.JwtPayload;
      } catch (e) {
        console.error(`[${requestId}] Token解码失败:`, e);
      }

      const now = Math.floor(Date.now() / 1000);

      console.log(`[${requestId}] Token生成结果:`, {
        accessLength: accessToken.length,
        refreshLength: refreshToken.length,
        decodedAccess: {
          userId: (decodedAccess as any)?.userId,
          email: (decodedAccess as any)?.email,
          iat: decodedAccess?.iat,
          exp: decodedAccess?.exp,
          expiresInSeconds: decodedAccess?.exp && decodedAccess.iat ? decodedAccess.exp - decodedAccess.iat : undefined,
          expiresInDays: decodedAccess?.exp && decodedAccess.iat ? (decodedAccess.exp - decodedAccess.iat) / 86400 : undefined,
          isExpired: (decodedAccess?.exp || 0) < now,
          timeUntilExpire: decodedAccess?.exp ? decodedAccess.exp - now : null,
        },
        decodedRefresh: {
          userId: (decodedRefresh as any)?.userId,
          email: (decodedRefresh as any)?.email,
          iat: decodedRefresh?.iat,
          exp: decodedRefresh?.exp,
          expiresInSeconds: decodedRefresh?.exp && decodedRefresh.iat ? decodedRefresh.exp - decodedRefresh.iat : undefined,
          expiresInDays: decodedRefresh?.exp && decodedRefresh.iat ? (decodedRefresh.exp - decodedRefresh.iat) / 86400 : undefined,
        },
        currentTime: now,
      });

      return NextResponse.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          analysis: {
            access: {
              decoded: decodedAccess,
              iat: decodedAccess?.iat,
              exp: decodedAccess?.exp,
              expiresIn: decodedAccess?.exp && decodedAccess.iat ? decodedAccess.exp - decodedAccess.iat : null,
              expiresInDays: decodedAccess?.exp && decodedAccess.iat ? (decodedAccess.exp - decodedAccess.iat) / 86400 : null,
              isExpired: (decodedAccess?.exp || 0) < now,
              timeUntilExpire: decodedAccess?.exp ? decodedAccess.exp - now : null,
            },
            refresh: {
              decoded: decodedRefresh,
              iat: decodedRefresh?.iat,
              exp: decodedRefresh?.exp,
              expiresIn: decodedRefresh?.exp && decodedRefresh.iat ? decodedRefresh.exp - decodedRefresh.iat : null,
              expiresInDays: decodedRefresh?.exp && decodedRefresh.iat ? (decodedRefresh.exp - decodedRefresh.iat) / 86400 : null,
            },
            currentTime: now,
            currentDateTime: new Date(now * 1000).toISOString(),
          },
        },
      });
    }

    // 简单测试
    console.log(`[${requestId}] 执行简单token生成测试`);

    const testPayload = {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'SUPER_ADMIN' as UserRole,
      membershipLevel: 'ENTERPRISE' as MembershipLevel,
    };

    const testToken = generateAccessToken(testPayload);
    const decoded = jwt.decode(testToken) as jwt.JwtPayload;

    return NextResponse.json({
      success: true,
      data: {
        payload: testPayload,
        token: testToken,
        decoded: decoded ? { ...decoded } : null,
      },
    });
  } catch (error) {
    console.error(`[${requestId}] Token生成诊断失败:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/debug/generate-token
 * 返回诊断信息
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/debug/generate-token',
    method: 'POST',
    description: 'Token生成诊断API',
    usage: {
      simple: 'POST without body - generates a test token',
      login: 'POST with {email, password} - simulates login token generation',
    },
  });
}
