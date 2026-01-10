import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';
import { userManager } from '@/storage/database';

/**
 * 获取用户列表
 * GET /api/user/list?skip=0&limit=50&searchQuery=xxx
 */
export async function GET(request: NextRequest) {
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

		// 检查是否为管理员
		const [user] = await db
			.select()
			.from(users)
			.where(and(eq(users.id, payload.userId), eq(users.isSuperAdmin, true)))
			.limit(1);

		if (!user) {
			return NextResponse.json(
				{ error: '无权访问此资源' },
				{ status: 403 }
			);
		}

		// 获取查询参数
		const { searchParams } = new URL(request.url);
		const skip = parseInt(searchParams.get('skip') || '0');
		const limit = parseInt(searchParams.get('limit') || '50');
		const searchQuery = searchParams.get('searchQuery') || '';

		// 使用userManager获取用户列表
		const allUsers = await userManager.getUsers({
			skip,
			limit: limit + 100, // 获取更多数据以支持分页
			searchQuery,
		});

		const userList = allUsers.slice(skip, skip + limit);

		// 返回结果（不包含密码）
		const safeUsers = userList.map(u => {
			const { passwordHash, ...userWithoutPassword } = u;
			return userWithoutPassword;
		});

		return NextResponse.json({
			success: true,
			users: safeUsers,
			total: allUsers.length,
			skip,
			limit,
		});
	} catch (error) {
		console.error('获取用户列表失败:', error);
		return NextResponse.json(
			{ error: '获取用户列表失败' },
			{ status: 500 }
		);
	}
}
