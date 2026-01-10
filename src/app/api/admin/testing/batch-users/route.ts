import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getDb } from 'coze-coding-dev-sdk';
import { hashPassword } from '@/lib/auth';

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

		// 验证超级管理员身份
		try {
			const userIdEscaped = payload.userId.replace(/'/g, "''");
			const result = await db.execute(`
				SELECT id, is_super_admin FROM users
				WHERE id = '${userIdEscaped}' AND is_super_admin = true
				LIMIT 1
			`);

			if (!result || !result.rows || result.rows.length === 0) {
				return NextResponse.json(
					{ error: '无权访问此资源' },
					{ status: 403 }
				);
			}
		} catch (e) {
			console.error('验证管理员身份失败:', e);
			return NextResponse.json(
				{ error: '验证管理员身份失败' },
				{ status: 500 }
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
		const now = new Date().toISOString();
		const timestamp = Date.now();

		for (let i = 0; i < count; i++) {
			const userId = generateUUID();
			const email = `test_user_${timestamp}_${i}@test.com`;
			const username = `测试用户${timestamp}_${i}`;

			try {
				// 根据索引分配会员等级
				let membershipLevel = 'FREE';
				if (i % 10 === 0) {
					membershipLevel = 'PREMIUM';
				} else if (i % 5 === 0) {
					membershipLevel = 'VIP';
				}

				const userIdEscaped = userId.replace(/'/g, "''");
				const emailEscaped = email.replace(/'/g, "''");
				const usernameEscaped = username.replace(/'/g, "''");
				const passwordHashEscaped = passwordHash.replace(/'/g, "''");

				const result = await db.execute(`
					INSERT INTO users (
						id, email, username, password_hash, role, membership_level,
						is_super_admin, is_active, is_banned, daily_usage_count,
						monthly_usage_count, storage_used, created_at, updated_at
					) VALUES (
						'${userIdEscaped}', '${emailEscaped}', '${usernameEscaped}', '${passwordHashEscaped}',
						'${membershipLevel}', '${membershipLevel}', false, true, false, 0, 0, 0,
						'${now}', '${now}'
					)
					RETURNING id, email, username, membership_level
				`);

				if (result && result.rows && result.rows.length > 0) {
					createdUsers.push({
						id: result.rows[0].id,
						email: result.rows[0].email,
						username: result.rows[0].username,
						membershipLevel: result.rows[0].membership_level,
					});
				}

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

		// 验证超级管理员身份
		try {
			const userIdEscaped = payload.userId.replace(/'/g, "''");
			const result = await db.execute(`
				SELECT id, is_super_admin FROM users
				WHERE id = '${userIdEscaped}' AND is_super_admin = true
				LIMIT 1
			`);

			if (!result || !result.rows || result.rows.length === 0) {
				return NextResponse.json(
					{ error: '无权访问此资源' },
					{ status: 403 }
				);
			}
		} catch (e) {
			console.error('验证管理员身份失败:', e);
			return NextResponse.json(
				{ error: '验证管理员身份失败' },
				{ status: 500 }
			);
		}

		// 统计所有用户
		try {
			const allUsersResult = await db.execute(`
				SELECT COUNT(*) as total FROM users
			`);

			// 统计测试用户
			const testUsersResult = await db.execute(`
				SELECT COUNT(*) as total FROM users WHERE email LIKE '%@test.com'
			`);

			// 按会员等级统计测试用户
			const membershipStatsResult = await db.execute(`
				SELECT membership_level, COUNT(*) as count
				FROM users
				WHERE email LIKE '%@test.com'
				GROUP BY membership_level
			`);

			// 按状态统计测试用户
			const statusStatsResult = await db.execute(`
				SELECT is_active, is_banned, COUNT(*) as count
				FROM users
				WHERE email LIKE '%@test.com'
				GROUP BY is_active, is_banned
			`);

			const allUsersCount = allUsersResult.rows[0]?.total || 0;
			const testUsersCount = testUsersResult.rows[0]?.total || 0;

			const stats = {
				totalUsers: allUsersCount,
				testUsers: testUsersCount,
				byMembership: {
					FREE: 0,
					VIP: 0,
					PREMIUM: 0,
				},
				byStatus: {
					active: 0,
					banned: 0,
				},
			};

			// 填充会员等级统计
			for (const row of membershipStatsResult.rows || []) {
				const typedRow = row as any;
				const membershipLevel = typedRow.membership_level as keyof typeof stats.byMembership;
				if (stats.byMembership[membershipLevel] !== undefined) {
					stats.byMembership[membershipLevel] = typedRow.count;
				}
			}

			// 填充状态统计
			for (const row of statusStatsResult.rows || []) {
				const typedRow = row as any;
				if (typedRow.is_banned) {
					stats.byStatus.banned += typedRow.count;
				} else if (typedRow.is_active) {
					stats.byStatus.active += typedRow.count;
				}
			}

			return NextResponse.json({
				success: true,
				stats,
			});
		} catch (e) {
			console.error('获取用户统计失败:', e);
			return NextResponse.json(
				{ error: '获取用户统计失败' },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('获取测试用户统计失败:', error);
		return NextResponse.json(
			{ error: '获取测试用户统计失败' },
			{ status: 500 }
		);
	}
}
