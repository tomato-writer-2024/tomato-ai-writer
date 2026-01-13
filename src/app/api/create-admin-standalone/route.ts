import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

/**
 * 独立创建管理员API
 * 不依赖任何其他模块，直接使用 pg 和 bcryptjs
 *
 * 使用方法：
 * GET /api/create-admin-standalone?email=admin@example.com&password=admin123
 */
export async function GET(request: Request) {
  console.log('===== 独立创建管理员API开始 =====');

  try {
    // 手动解析 URL 参数
    const rawUrl = request.url;
    const urlParts = rawUrl.split('?');
    let email = 'admin@tomato-ai.com';
    let password = 'Admin@123456';
    let username = '超级管理员';

    if (urlParts.length > 1) {
      const params = new URLSearchParams(urlParts[1]);
      if (params.has('email')) email = params.get('email')!;
      if (params.has('password')) password = params.get('password')!;
      if (params.has('username')) username = params.get('username')!;
    }

    console.log('初始化参数:', {
      email,
      username,
      hasPassword: !!password,
    });

    // 创建数据库连接池
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
    });

    const client = await pool.connect();

    try {
      // 检查是否已存在管理员
      const existingResult = await client.query(
        'SELECT id, email, username, role FROM users WHERE email = $1',
        [email]
      );

      if (existingResult.rows.length > 0) {
        const existing = existingResult.rows[0];
        console.log('管理员已存在:', existing.id);

        return NextResponse.json(
          {
            success: false,
            error: '管理员账户已存在',
            data: {
              id: existing.id,
              email: existing.email,
              username: existing.username,
              role: existing.role,
            },
          },
          { status: 400 }
        );
      }

      // 使用 bcryptjs 哈希密码
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // 生成 UUID（使用数据库函数）
      const idResult = await client.query('SELECT gen_random_uuid() as id');
      const adminId = idResult.rows[0].id;

      const now = new Date();
      const membershipExpireAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1年后

      // 创建管理员
      await client.query(
        `INSERT INTO users (
          id, email, password_hash, username, role, membership_level,
          membership_expire_at, is_super_admin, created_at, updated_at,
          is_active, daily_usage_count, monthly_usage_count, storage_used
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          adminId,
          email,
          passwordHash,
          username,
          'DEVELOPER',
          'PREMIUM',
          membershipExpireAt,
          true,
          now,
          now,
          true,
          0,
          0,
          0,
        ]
      );

      console.log('超级管理员创建成功:', adminId);

      // 返回管理员信息（不包含密码）
      return NextResponse.json(
        {
          success: true,
          message: '超级管理员创建成功',
          data: {
            id: adminId,
            email,
            username,
            role: 'DEVELOPER',
            membershipLevel: 'PREMIUM',
            membershipExpireAt: membershipExpireAt.toISOString(),
          },
          warnings: [
            '请立即修改默认密码',
            '请删除或禁用此API路由',
          ],
        },
        { status: 201 }
      );
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error('超级管理员创建失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: '超级管理员创建失败',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
