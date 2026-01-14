import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyPassword, generateAccessToken, generateRefreshToken, getClientIp } from '@/lib/auth';

/**
 * 直接数据库登录 API（绕过 SDK）
 */
async function handler(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);

  try {
    const clientIp = getClientIp(request);

    const { email, password } = await request.json();

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '邮箱和密码不能为空' },
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

    // 创建数据库连接
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    try {
      // 查询用户
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: '邮箱或密码错误' },
          { status: 401 }
        );
      }

      const user = result.rows[0];

      // 验证密码
      const isPasswordValid = await verifyPassword(password, user.password_hash);

      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: '邮箱或密码错误' },
          { status: 401 }
        );
      }

      // 检查用户状态
      if (!user.is_active || user.is_banned) {
        return NextResponse.json(
          { success: false, error: `账号已被封禁：${user.ban_reason || '未知原因'}` },
          { status: 403 }
        );
      }

      // 生成 token
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

      // 更新最后登录时间
      await pool.query(
        'UPDATE users SET last_login_at = NOW() WHERE id = $1',
        [user.id]
      );

      // 返回用户信息
      return NextResponse.json({
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
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error(`[${requestId}] 登录失败:`, error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

export { handler as POST };
