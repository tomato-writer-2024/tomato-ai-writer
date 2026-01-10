import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { hashPassword } from '@/lib/auth';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * 更新超级管理员信息
 * POST /api/admin/superadmin/update
 */
export async function POST(request: NextRequest) {
	try {
		// 验证管理员身份
		const authHeader = request.headers.get('authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return NextResponse.json(
				{ error: '未提供认证token' },
				{ status: 401 }
			);
		}

		const token = authHeader.substring(7);
		const payload = verifyToken(token);

		if (!payload || !payload.userId) {
			return NextResponse.json(
				{ error: '无效的token' },
				{ status: 401 }
			);
		}

		const db = await getDb();
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.id, payload.userId))
			.limit(1);

		if (!user || !user.isSuperAdmin) {
			return NextResponse.json(
				{ error: '无权访问此资源' },
				{ status: 403 }
			);
		}

		// 获取更新数据
		const body = await request.json();
		const { targetUserId, updates } = body;

		// 如果没有指定targetUserId，则更新当前管理员
		const targetId = targetUserId || payload.userId;

		// 如果要更新密码
		if (updates.password) {
			updates.passwordHash = await hashPassword(updates.password);
			delete updates.password;
		}

		// 更新用户信息
		const [updatedUser] = await db
			.update(users)
			.set({
				...updates,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(users.id, targetId))
			.returning();

		// 返回更新后的信息
		const { passwordHash: _, ...userWithoutPassword } = updatedUser;

		return NextResponse.json({
			success: true,
			user: userWithoutPassword,
			message: '更新成功',
		});
	} catch (error) {
		console.error('更新超级管理员失败:', error);
		return NextResponse.json(
			{ error: '更新失败' },
			{ status: 500 }
		);
	}
}
