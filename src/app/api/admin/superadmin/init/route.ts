import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { hashPassword } from '@/lib/auth';

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

		// 检查密码长度
		if (password.length < 8) {
			return NextResponse.json(
				{ error: '密码长度至少8位' },
				{ status: 400 }
			);
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
				return NextResponse.json(
					{ error: '超级管理员已存在，无需重复创建' },
					{ status: 400 }
				);
			}
		} catch (e) {
			console.error('检查超级管理员失败:', e);
		}

		// 检查邮箱是否已被使用
		try {
			const emailEscaped = email.replace(/'/g, "''"); // 转义单引号防止SQL注入
			console.log(`开始检查邮箱: ${emailEscaped}`);
			const result = await db.execute(`
				SELECT id FROM users WHERE email = '${emailEscaped}' LIMIT 1
			`);
			console.log('邮箱检查结果:', result);

			if (result && result.rows && result.rows.length > 0) {
				return NextResponse.json(
					{ error: '该邮箱已被注册' },
					{ status: 400 }
				);
			}
		} catch (e) {
			console.error('检查邮箱失败:', e);
			return NextResponse.json(
				{ error: '邮箱检查失败: ' + (e instanceof Error ? e.message : String(e)) },
				{ status: 500 }
			);
		}

		// 创建超级管理员
		try {
			const passwordHash = await hashPassword(password);
			const userId = crypto.randomUUID();
			const now = new Date().toISOString();

			// 转义字符串以防止SQL注入
			const emailEscaped = email.replace(/'/g, "''");
			const usernameEscaped = username.replace(/'/g, "''");
			const passwordHashEscaped = passwordHash.replace(/'/g, "''");

			const [result] = await db.execute(`
				INSERT INTO users (
					id, email, username, password_hash, role, membership_level,
					is_super_admin, is_active, is_banned, daily_usage_count,
					monthly_usage_count, storage_used, created_at, updated_at
				) VALUES (
					'${userId}', '${emailEscaped}', '${usernameEscaped}', '${passwordHashEscaped}',
					'ADMIN', 'PREMIUM', true, true, false, 0, 0, 0,
					'${now}', '${now}'
				) RETURNING id, email, username, role, membership_level, is_super_admin
			`);

			const admin = result.rows[0];

			return NextResponse.json({
				success: true,
				admin: {
					id: admin.id,
					email: admin.email,
					username: admin.username,
					role: admin.role,
					membershipLevel: admin.membership_level,
					isSuperAdmin: admin.is_super_admin,
				},
				message: '超级管理员创建成功',
			});
		} catch (e) {
			console.error('创建超级管理员失败:', e);
			return NextResponse.json(
				{ error: '创建超级管理员失败: ' + (e instanceof Error ? e.message : '未知错误') },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('初始化超级管理员失败:', error);
		return NextResponse.json(
			{ error: '初始化超级管理员失败' },
			{ status: 500 }
		);
	}
}
