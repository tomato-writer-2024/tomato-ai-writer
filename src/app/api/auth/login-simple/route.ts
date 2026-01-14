import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyPassword, generateAccessToken, generateRefreshToken, getClientIp } from '@/lib/auth';

/**
 * 简化版登录API（不使用中间件，用于调试）
 * POST /api/auth/login-simple
 */
async function handler(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] ===== 简化登录请求开始 =====`);

  try {
    const clientIp = getClientIp(request);
    console.log(`[${requestId}] 客户端IP: ${clientIp}`);

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

    // 创建数据库连接
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    try {
      console.log(`[${requestId}] 正在查询用户...`);
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      console.log(`[${requestId}] 查询结果:`, {
        rowCount: result.rowCount,
      });

      if (result.rows.length === 0) {
        console.log(`[${requestId}] 用户不存在: ${email}`);
        return NextResponse.json(
          { success: false, error: '邮箱或密码错误' },
          { status: 401 }
        );
      }

      const user = result.rows[0];
      console.log(`[${requestId}] 找到用户:`, {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.is_active,
        isBanned: user.is_banned,
        isSuperAdmin: user.is_super_admin,
      });

      // 验证密码
      console.log(`[${requestId}] 正在验证密码...`);
      const isPasswordValid = await verifyPassword(password, user.password_hash);

      if (!isPasswordValid) {
        console.log(`[${requestId}] 密码验证失败`);
        return NextResponse.json(
          { success: false, error: '邮箱或密码错误' },
          { status: 401 }
        );
      }

      console.log(`[${requestId}] 密码验证成功`);

      // 检查用户状态
      if (!user.is_active || user.is_banned) {
        console.log(`[${requestId}] 用户状态异常:`, {
          isActive: user.is_active,
          isBanned: user.is_banned,
        });
        return NextResponse.json(
          { success: false, error: `账号已被封禁` },
          { status: 403 }
        );
      }

      // 生成token
      console.log(`[${requestId}] 正在生成token...`);
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        membershipLevel: user.membership_level,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      console.log(`[${requestId}] Token生成成功`);

      // 更新最后登录时间
      await pool.query(
        'UPDATE users SET last_login_at = NOW() WHERE id = $1',
        [user.id]
      );

      // 返回用户信息
      const response = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            membershipLevel: user.membership_level,
            membershipExpireAt: user.membership_expire_at,
            isActive: user.is_active,
            isBanned: user.is_banned,
            isSuperAdmin: user.is_super_admin,
          },
          token: accessToken,
          refreshToken: refreshToken,
        },
      };

      console.log(`[${requestId}] 登录成功，准备返回响应`);
      console.log(`[${requestId}] ===== 简化登录请求完成 =====`);

      return NextResponse.json(response, { status: 200 });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error(`[${requestId}] 登录请求失败:`, error);
    console.error(`[${requestId}] 错误详情:`, {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { success: false, error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

export { handler as POST };

/**
 * GET /api/auth/login-simple
 * 返回接口信息
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/auth/login-simple',
    method: 'POST',
    description: '简化版登录接口（不使用中间件，用于调试）',
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
