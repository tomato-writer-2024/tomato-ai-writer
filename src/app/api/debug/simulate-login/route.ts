import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { Pool } from 'pg';

/**
 * 模拟完整登录流程的调试API
 * POST /api/debug/simulate-login
 */
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] ===== 模拟登录流程开始 =====`);

  try {
    const { email, password } = await request.json();
    console.log(`[${requestId}] 请求参数:`, { email, hasPassword: !!password });

    // 创建数据库连接（和login-simple完全相同）
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    try {
      // 查询用户
      console.log(`[${requestId}] 查询用户...`);
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: '用户不存在' }, { status: 401 });
      }

      const user = result.rows[0];
      console.log(`[${requestId}] 找到用户:`, {
        id: user.id,
        email: user.email,
        role: user.role,
        membershipLevel: user.membership_level,
      });

      // 验证密码
      const isPasswordValid = await verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        return NextResponse.json({ error: '密码错误' }, { status: 401 });
      }

      console.log(`[${requestId}] 密码验证成功`);

      // ========== 关键部分：生成token ==========
      console.log(`[${requestId}] 开始生成access token...`);
      console.log(`[${requestId}] Token payload:`, {
        userId: user.id,
        email: user.email,
        role: user.role,
        membershipLevel: user.membership_level,
      });

      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        membershipLevel: user.membership_level,
      });

      console.log(`[${requestId}] Access token已生成`);
      console.log(`[${requestId}] Token length: ${accessToken.length}`);

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      console.log(`[${requestId}] Refresh token已生成`);

      // 解码token
      const jwt = require('jsonwebtoken');
      const decodedAccess = jwt.decode(accessToken);
      const decodedRefresh = jwt.decode(refreshToken);

      console.log(`[${requestId}] 解码后的access token:`, {
        userId: decodedAccess?.userId,
        email: decodedAccess?.email,
        role: decodedAccess?.role,
        iat: decodedAccess?.iat,
        exp: decodedAccess?.exp,
        expiresIn: decodedAccess?.exp - decodedAccess?.iat,
      });

      console.log(`[${requestId}] 解码后的refresh token:`, {
        userId: decodedRefresh?.userId,
        iat: decodedRefresh?.iat,
        exp: decodedRefresh?.exp,
        expiresIn: decodedRefresh?.exp - decodedRefresh?.iat,
      });

      // 检查token是否有效
      if (decodedAccess?.iat === decodedAccess?.exp) {
        console.error(`[${requestId}] ❌ 错误：Access token立即过期（iat=exp）`);
        return NextResponse.json({
          success: false,
          error: 'Access token立即过期',
          analysis: {
            problem: 'iat和exp相同',
            iat: decodedAccess.iat,
            exp: decodedAccess.exp,
            token: accessToken,
          },
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            membershipLevel: user.membership_level,
          },
          token: accessToken,
          refreshToken: refreshToken,
          analysis: {
            access: {
              iat: decodedAccess?.iat,
              exp: decodedAccess?.exp,
              expiresIn: decodedAccess?.exp - decodedAccess?.iat,
              expiresInDays: (decodedAccess?.exp - decodedAccess?.iat) / 86400,
            },
            refresh: {
              iat: decodedRefresh?.iat,
              exp: decodedRefresh?.exp,
              expiresIn: decodedRefresh?.exp - decodedRefresh?.iat,
              expiresInDays: (decodedRefresh?.exp - decodedRefresh?.iat) / 86400,
            },
          },
        },
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error(`[${requestId}] 模拟登录失败:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

/**
 * GET /api/debug/simulate-login
 * 返回接口信息
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/debug/simulate-login',
    method: 'POST',
    description: '模拟完整登录流程（包含数据库查询和token生成）',
    parameters: {
      email: '用户邮箱',
      password: '用户密码',
    },
  });
}
