import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';
import { hashPassword } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

// 生成UUID的辅助函数
function generateUUID(): string {
	return crypto.randomUUID();
}

/**
 * 批量生成测试用户
 * POST /api/admin/testing/batch-users
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

		// 获取参数
		const body = await request.json();
		const { count = 1000 } = body;

		if (count < 1 || count > 10000) {
			return NextResponse.json(
				{ error: '用户数量必须在1-10000之间' },
				{ status: 400 }
			);
		}

		// 批量生成用户
		const createdUsers = [];
		const passwordHash = await hashPassword('Test123456'); // 统一测试密码

		for (let i = 0; i < count; i++) {
			const userId = generateUUID();
			const email = `test_user_${Date.now()}_${i}@test.com`;
			const username = `测试用户${Date.now()}_${i}`;

			try {
				const [user] = await db
					.insert(users)
					.values({
						id: userId,
						email,
						username,
						passwordHash,
						role: 'FREE',
						membershipLevel: i % 5 === 0 ? 'VIP' : (i % 10 === 0 ? 'PREMIUM' : 'FREE'),
						dailyUsageCount: 0,
						monthlyUsageCount: 0,
						storageUsed: 0,
						isActive: true,
						isBanned: false,
						isSuperAdmin: false,
					})
					.returning();

				createdUsers.push({
					id: user.id,
					email: user.email,
					username: user.username,
					membershipLevel: user.membershipLevel,
				});

				// 每100个提交一次进度
				if (createdUsers.length % 100 === 0) {
					console.log(`已创建 ${createdUsers.length} 个用户`);
				}
			} catch (error) {
				console.error(`创建用户 ${email} 失败:`, error);
			}
		}

		return NextResponse.json({
			success: true,
			total: count,
			created: createdUsers.length,
			users: createdUsers,
			message: `成功创建 ${createdUsers.length} 个测试用户`,
		});
	} catch (error) {
		console.error('批量生成用户失败:', error);
		return NextResponse.json(
			{ error: '批量生成用户失败' },
			{ status: 500 }
		);
	}
}

/**
 * 获取测试用户统计
 * GET /api/admin/testing/batch-users
 */
export async function GET(request: NextRequest) {
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

		// 统计测试用户
		const allUsers = await db.select().from(users);
		const testUsers = allUsers.filter(u => u.email.includes('@test.com'));

		const stats = {
			totalUsers: allUsers.length,
			testUsers: testUsers.length,
			byMembership: {
				FREE: testUsers.filter(u => u.membershipLevel === 'FREE').length,
				VIP: testUsers.filter(u => u.membershipLevel === 'VIP').length,
				PREMIUM: testUsers.filter(u => u.membershipLevel === 'PREMIUM').length,
			},
			byStatus: {
				active: testUsers.filter(u => u.isActive).length,
				banned: testUsers.filter(u => u.isBanned).length,
			},
		};

		return NextResponse.json({
			success: true,
			stats,
		});
	} catch (error) {
		console.error('获取测试用户统计失败:', error);
		return NextResponse.json(
			{ error: '获取统计失败' },
			{ status: 500 }
		);
	}
}
