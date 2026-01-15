import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getDb } from 'coze-coding-dev-sdk';

/**
 * 批量删除用户
 * POST /api/admin/users/batch-delete
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

		// 获取请求参数
		const body = await request.json();
		const { userIds } = body;

		if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
			return NextResponse.json(
				{ error: '缺少userIds参数或参数格式不正确' },
				{ status: 400 }
			);
		}

		// 批量删除用户（软删除）
		let deletedCount = 0;
		const failedUserIds: string[] = [];

		for (const userId of userIds) {
			try {
				const userIdEscaped = userId.replace(/'/g, "''");

				// 检查用户是否存在且不是超级管理员
				const result = await db.execute(`
					SELECT id, is_super_admin FROM users WHERE id = '${userIdEscaped}' LIMIT 1
				`);

				if (!result || !result.rows || result.rows.length === 0) {
					failedUserIds.push(userId);
					continue;
				}

				// 不能删除超级管理员
				if (result.rows[0].is_super_admin) {
					failedUserIds.push(userId);
					continue;
				}

				// 软删除用户
				const updateResult = await db.execute(`
					UPDATE users
					SET is_active = false, updated_at = NOW()
					WHERE id = '${userIdEscaped}'
					RETURNING 1 as row_count
				`);

				if (updateResult.rows && updateResult.rows.length > 0 && (updateResult.rows[0] as any).row_count > 0) {
					deletedCount++;
				} else {
					failedUserIds.push(userId);
				}
			} catch (e) {
				console.error(`删除用户 ${userId} 失败:`, e);
				failedUserIds.push(userId);
			}
		}

		return NextResponse.json({
			success: true,
			message: `成功删除 ${deletedCount} 个用户`,
			data: {
				deletedCount,
				failedCount: failedUserIds.length,
				failedUserIds,
			},
		});
	} catch (error) {
		console.error('批量删除用户失败:', error);
		return NextResponse.json(
			{ error: '批量删除用户失败' },
			{ status: 500 }
		);
	}
}
