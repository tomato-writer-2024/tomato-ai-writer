import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * 删除用户
 * POST /api/admin/users/delete
 */
export async function POST(request: NextRequest) {
	try {
		// 验证token
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

		// 检查是否为超级管理员
		const [admin] = await db
			.select()
			.from(users)
			.where(and(eq(users.id, payload.userId), eq(users.isSuperAdmin, true)))
			.limit(1);

		if (!admin) {
			return NextResponse.json(
				{ error: '无权访问此资源' },
				{ status: 403 }
			);
		}

		// 获取请求参数
		const body = await request.json();
		const { userId } = body;

		if (!userId) {
			return NextResponse.json(
				{ error: '缺少userId参数' },
				{ status: 400 }
			);
		}

		// 不能删除超级管理员
		const [targetUser] = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!targetUser) {
			return NextResponse.json(
				{ error: '用户不存在' },
				{ status: 404 }
			);
		}

		if (targetUser.isSuperAdmin) {
			return NextResponse.json(
				{ error: '不能删除超级管理员' },
				{ status: 400 }
			);
		}

		// 软删除用户
		const result = await db
			.update(users)
			.set({
				isActive: false,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(users.id, userId));

		if ((result.rowCount ?? 0) > 0) {
			return NextResponse.json({
				success: true,
				message: '用户已删除',
			});
		} else {
			return NextResponse.json(
				{ error: '删除失败' },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('删除用户失败:', error);
		return NextResponse.json(
			{ error: '删除用户失败' },
			{ status: 500 }
		);
	}
}
