import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';
import { hashPassword } from '@/lib/auth';
import { eq, sql } from 'drizzle-orm';

/**
 * 初始化超级管理员账户
 * POST /api/admin/superadmin/init
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, username, password } = body;

		// 验证输入
		if (!email || !username || !password) {
			return NextResponse.json(
				{ error: '缺少必要参数' },
				{ status: 400 }
			);
		}

		// 检查是否已有超级管理员
		const db = await getDb();

		// 尝试添加isSuperAdmin字段（如果不存在）
		try {
			await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false`);
		} catch (e) {
			console.log('isSuperAdmin字段可能已存在');
		}

		const [existingAdmin] = await db
			.select()
			.from(users)
			.where(eq(users.isSuperAdmin, true))
			.limit(1);

		if (existingAdmin) {
			return NextResponse.json(
				{ error: '超级管理员已存在，无需重复创建' },
				{ status: 400 }
			);
		}

		// 检查邮箱是否已被使用
		const [existingUser] = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (existingUser) {
			return NextResponse.json(
				{ error: '该邮箱已被注册' },
				{ status: 400 }
			);
		}

		// 创建超级管理员
		const passwordHash = await hashPassword(password);
		const [admin] = await db
			.insert(users)
			.values({
				email,
				username,
				passwordHash,
				role: 'ADMIN',
				membershipLevel: 'PREMIUM',
				isSuperAdmin: true,
			})
			.returning();

		// 返回管理员信息（不包含密码）
		const { passwordHash: _, ...adminWithoutPassword } = admin;

		return NextResponse.json({
			success: true,
			admin: adminWithoutPassword,
			message: '超级管理员创建成功',
		});
	} catch (error) {
		console.error('创建超级管理员失败:', error);
		return NextResponse.json(
			{ error: '创建超级管理员失败' },
			{ status: 500 }
		);
	}
}
