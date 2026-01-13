import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';

/**
 * 超级管理员初始化API
 * 用于在生产环境中创建初始超级管理员账户
 * 使用原生 PostgreSQL 连接，避免 SDK 问题
 *
 * 使用方法：
 * GET /api/init-admin?email=admin@example.com&password=admin123
 *
 * 注意：此API应该只使用一次，创建完成后应删除或禁用
 */
export async function GET(request: Request) {
  console.log('===== 超级管理员初始化请求开始 =====');

  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email') || 'admin@tomato-ai.com';
    const password = url.searchParams.get('password') || 'Admin@123456';
    const username = url.searchParams.get('username') || '超级管理员';

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

      // 哈希密码
      const passwordHash = await hashPassword(password);

      // 生成 UUID
      const adminId = randomUUID();
      const now = new Date();
      const membershipExpireAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1年后

      // 创建管理员
      await client.query(
        `INSERT INTO users (
          id, email, password_hash, username, role, membership_level,
          membership_expire_at, is_super_admin, created_at, updated_at,
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
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
            '请确保DATABASE_URL和JWT_SECRET已正确配置',
          ],
        },
        { status: 201 }
      );
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error('超级管理员初始化失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: '超级管理员创建失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
