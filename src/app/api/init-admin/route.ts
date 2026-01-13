import { NextResponse } from 'next/server';
import { userManager } from '@/storage/database';
import { hashPassword } from '@/lib/auth';
import { randomUUID } from 'crypto';
import { UserRole, MembershipLevel } from '@/lib/types/user';

/**
 * 超级管理员初始化API
 * 用于在生产环境中创建初始超级管理员账户
 *
 * 使用方法：
 * GET /api/init-admin?email=admin@example.com&password=admin123
 *
 * 注意：此API应该只使用一次，创建完成后应删除或禁用
 */
export async function GET(request: Request) {
  console.log('===== 超级管理员初始化请求开始 =====');

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'admin@tomato-ai.com';
    const password = searchParams.get('password') || 'Admin@123456';
    const username = searchParams.get('username') || '超级管理员';

    console.log('初始化参数:', {
      email,
      username,
      hasPassword: !!password,
    });

    // 检查是否已存在管理员
    const existingAdmin = await userManager.getUserByEmail(email);
    if (existingAdmin) {
      console.log('管理员已存在:', existingAdmin.id);

      return NextResponse.json(
        {
          success: false,
          error: '管理员账户已存在',
          data: {
            id: existingAdmin.id,
            email: existingAdmin.email,
            username: existingAdmin.username,
            role: existingAdmin.role,
          },
        },
        { status: 400 }
      );
    }

    // 哈希密码
    const passwordHash = await hashPassword(password);

    // 创建管理员
    const admin = await userManager.createUser({
      email,
      passwordHash,
      username,
      role: UserRole.FREE, // 使用FREE角色，通过isSuperAdmin标识
      membershipLevel: MembershipLevel.PREMIUM,
    });

    // 设置为超级管理员（需要直接更新数据库）
    const db = await (await import('@/storage/database')).getDb();
    await db.execute(`
      UPDATE users
      SET is_super_admin = true,
          role = 'DEVELOPER',
          membership_expire_at = NOW() + INTERVAL '1 year'
      WHERE id = '${admin.id}'
    `);

    console.log('超级管理员创建成功:', admin.id);

    // 返回管理员信息（不包含密码）
    return NextResponse.json(
      {
        success: true,
        message: '超级管理员创建成功',
        data: {
          id: admin.id,
          email: admin.email,
          username: admin.username,
          role: 'DEVELOPER',
          membershipLevel: 'PREMIUM',
          membershipExpireAt: admin.membershipExpireAt,
        },
        warnings: [
          '请立即修改默认密码',
          '请删除或禁用此API路由',
          '请确保DATABASE_URL和JWT_SECRET已正确配置',
        ],
      },
      { status: 201 }
    );
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
