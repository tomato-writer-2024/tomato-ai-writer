import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

/**
 * 验证超级管理员身份
 * POST /api/admin/superadmin/verify
 */
export async function POST(request: NextRequest) {
	try {
		// 获取token
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

		// 查询用户信息
		const db = await getDb();
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.id, payload.userId))
			.limit(1);

		if (!user) {
			return NextResponse.json(
				{ error: '用户不存在' },
				{ status: 404 }
			);
		}

		// 验证是否为超级管理员
		if (!user.isSuperAdmin) {
			return NextResponse.json(
				{ error: '无权访问此资源' },
				{ status: 403 }
			);
		}

		// 返回管理员信息
		const { passwordHash: _, ...adminWithoutPassword } = user;

		return NextResponse.json({
			success: true,
			admin: adminWithoutPassword,
		});
	} catch (error) {
		console.error('验证超级管理员失败:', error);
		return NextResponse.json(
			{ error: '验证失败' },
			{ status: 500 }
		);
	}
}
