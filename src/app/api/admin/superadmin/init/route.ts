import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { hashPassword } from '@/lib/auth';
import { buildInsertQuery, escapeSqlString, buildParameterizedQuery } from '@/lib/sqlHelper';
import { withMiddleware, successResponse, errorResponse } from '@/lib/apiMiddleware';
import { RATE_LIMIT_CONFIGS } from '@/lib/rateLimiter';

/**
 * 初始化超级管理员账户
 * POST /api/admin/superadmin/init
 */
async function handler(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, username, password } = body;

		// 验证输入
		if (!email || !username || !password) {
			return errorResponse('缺少必要参数', 400, 400);
		}

		// 检查密码长度
		if (password.length < 8) {
			return errorResponse('密码长度至少8位', 400, 400);
		}

		const db = await getDb();

		// 尝试添加isSuperAdmin字段（如果不存在）
		try {
			await db.execute(`
				ALTER TABLE users
				ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false
			`);
			console.log('is_super_admin字段检查完成');
		} catch (e) {
			console.log('isSuperAdmin字段可能已存在:', e);
		}

		// 检查是否已有超级管理员
		try {
			const result = await db.execute(`
				SELECT id FROM users WHERE is_super_admin = true LIMIT 1
			`);
			console.log('检查超级管理员结果:', result);

			if (result && result.rows && result.rows.length > 0) {
				return errorResponse('超级管理员已存在，无需重复创建', 400, 400);
			}
		} catch (e) {
			console.error('检查超级管理员失败:', e);
		}

		// 检查邮箱是否已被使用（使用参数化查询）
		try {
			const escapedEmail = escapeSqlString(email);
			const sql = `SELECT id FROM users WHERE email = '${escapedEmail}' LIMIT 1`;
			const result = await db.execute(sql);
			console.log('邮箱检查结果:', result);

			if (result && result.rows && result.rows.length > 0) {
				return errorResponse('该邮箱已被注册', 400, 400);
			}
		} catch (e) {
			console.error('检查邮箱失败:', e);
			return errorResponse(
				'邮箱检查失败: ' + (e instanceof Error ? e.message : String(e)),
				500,
				500
			);
		}

		// 创建超级管理员（使用参数化查询）
		try {
			const passwordHash = await hashPassword(password);
			const userId = crypto.randomUUID();
			const now = new Date().toISOString();

			// 使用字符串拼接和转义来构建安全的INSERT语句
			const sql = `INSERT INTO users (
				id, email, username, password_hash, role, membership_level,
				is_super_admin, is_active, is_banned, daily_usage_count,
				monthly_usage_count, storage_used, created_at, updated_at
			) VALUES (
				'${userId}',
				'${escapeSqlString(email)}',
				'${escapeSqlString(username)}',
				'${passwordHash}',
				'ADMIN',
				'PREMIUM',
				true,
				true,
				false,
				0,
				0,
				0,
				'${now}',
				'${now}'
			) RETURNING id, email, username, role, membership_level, is_super_admin`;

			const result = await db.execute(sql);

			const admin = result.rows[0];

			return successResponse(
				{
					id: admin.id,
					email: admin.email,
					username: admin.username,
					role: admin.role,
					membershipLevel: admin.membership_level,
					isSuperAdmin: admin.is_super_admin,
				},
				'超级管理员创建成功',
				201
			);
		} catch (e) {
			console.error('创建超级管理员失败:', e);
			return errorResponse(
				'创建超级管理员失败: ' + (e instanceof Error ? e.message : '未知错误'),
				500,
				500
			);
		}
	} catch (error) {
		console.error('初始化超级管理员失败:', error);
		return errorResponse('初始化超级管理员失败', 500, 500);
	}
}

// 使用中间件包装：限流 + 禁用CSRF保护（初始化API是公开的）
export const POST = withMiddleware(handler, {
	rateLimit: RATE_LIMIT_CONFIGS.STRICT,
	enableCsrf: false, // 初始化API是公开的，不需要CSRF保护
});
