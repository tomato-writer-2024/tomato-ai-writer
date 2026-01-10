import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getDb } from 'coze-coding-dev-sdk';

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
		const { userId: targetUserId } = body;

		if (!targetUserId) {
			return NextResponse.json(
				{ error: '缺少userId参数' },
				{ status: 400 }
			);
		}

		// 检查用户是否存在
		try {
			const targetUserIdEscaped = targetUserId.replace(/'/g, "''");
			const result = await db.execute(`
				SELECT id, is_super_admin FROM users WHERE id = '${targetUserIdEscaped}' LIMIT 1
			`);

			if (!result || !result.rows || result.rows.length === 0) {
				return NextResponse.json(
					{ error: '用户不存在' },
					{ status: 404 }
				);
			}

			// 不能删除超级管理员
			if (result.rows[0].is_super_admin) {
				return NextResponse.json(
					{ error: '不能删除超级管理员' },
					{ status: 400 }
				);
			}

			// 软删除用户
			const updateResult = await db.execute(`
				UPDATE users
				SET is_active = false, updated_at = NOW()
				WHERE id = '${targetUserIdEscaped}'
				RETURNING 1 as row_count
			`);

			if (updateResult.rows && updateResult.rows.length > 0 && updateResult.rows[0].row_count > 0) {
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
		} catch (e) {
			console.error('删除用户失败:', e);
			return NextResponse.json(
				{ error: '删除用户失败: ' + (e instanceof Error ? e.message : '未知错误') },
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
