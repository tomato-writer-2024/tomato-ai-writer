import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { hashPassword, generateAccessToken, generateRefreshToken, getClientIp } from '@/lib/auth';
import { UserRole, MembershipLevel } from '@/lib/types/user';

/**
 * 用户注册API（直接数据库版本）
 *
 * 使用 getPool() 直接操作数据库，确保数据一致性
 */
async function handler(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] ===== 注册请求开始（直接数据库版本） =====`);

  try {
    const pool = getPool();
    if (!pool) {
      return NextResponse.json(
        { success: false, error: '数据库连接池未创建' },
        { status: 500 }
      );
    }

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

    // 检查邮箱是否已注册
    console.log(`[${requestId}] 检查邮箱是否已注册: ${email}`);
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log(`[${requestId}] 邮箱已被注册: ${email}`);
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 检查用户名是否已被使用
    const existingUsername = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUsername.rows.length > 0) {
      console.log(`[${requestId}] 用户名已被使用: ${username}`);
      return NextResponse.json(
        { success: false, error: '该用户名已被使用' },
        { status: 409 }
      );
    }

    // 哈希密码
    console.log(`[${requestId}] 哈希密码...`);
    const passwordHash = await hashPassword(password);

    // 创建用户
    console.log(`[${requestId}] 创建用户...`);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const result = await pool.query(
      `INSERT INTO users (
        id, email, username, password_hash,
        role, membership_level, is_active, is_banned,
        daily_usage_count, monthly_usage_count, storage_used
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, email, username, role, membership_level, created_at`,
      [
        userId,
        email,
        username,
        passwordHash,
        UserRole.FREE,
        MembershipLevel.FREE,
        true,
        false,
        0,
        0,
        0
      ]
    );

    const user = result.rows[0];
    console.log(`[${requestId}] 用户创建成功:`, {
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // 生成token
    console.log(`[${requestId}] 生成token...`);
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

    // 返回用户信息
    const response = NextResponse.json(
      {
        success: true,
        data: {
          token: accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            membershipLevel: user.membership_level,
            membershipExpireAt: null,
            dailyUsageCount: 0,
            monthlyUsageCount: 0,
            storageUsed: 0,
            createdAt: user.created_at,
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

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '注册失败',
      },
      { status: 500 }
    );
  }
}

export { handler as POST };
