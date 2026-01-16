/**
 * 超级管理员登录问题自动修复脚本
 *
 * 功能：
 * 1. 检查超级管理员状态
 * 2. 重置超级管理员密码
 * 3. 验证登录功能
 * 4. 生成诊断报告
 */

import { getDb } from 'coze-coding-dev-sdk';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

interface DiagnosticResult {
	step: string;
	success: boolean;
	message: string;
	data?: any;
}

const diagnosticResults: DiagnosticResult[] = [];

function addResult(step: string, success: boolean, message: string, data?: any) {
	diagnosticResults.push({ step, success, message, data });
	console.log(`[${success ? '✅' : '❌'}] ${step}: ${message}`);
}

async function main() {
	console.log('===== 超级管理员登录问题自动修复 =====\n');

	try {
		const db = await getDb();

		// 步骤 1：检查数据库连接
		console.log('步骤 1: 检查数据库连接...');
		try {
			const result = await db.execute('SELECT 1 as test');
			addResult('数据库连接', true, '数据库连接正常');
		} catch (error: any) {
			addResult('数据库连接', false, `数据库连接失败: ${error.message}`);
			process.exit(1);
		}

		// 步骤 2：检查 users 表结构
		console.log('\n步骤 2: 检查 users 表结构...');
		try {
			const structureResult = await db.execute(`
				SELECT column_name, data_type
				FROM information_schema.columns
				WHERE table_name = 'users' AND column_name = 'is_super_admin'
			`);

			if (structureResult.rows.length > 0) {
				addResult('is_super_admin 字段', true, 'is_super_admin 字段存在');
			} else {
				addResult('is_super_admin 字段', false, 'is_super_admin 字段不存在');
				await db.execute(`
					ALTER TABLE users
					ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false
				`);
				addResult('is_super_admin 字段修复', true, '已添加 is_super_admin 字段');
			}
		} catch (error: any) {
			addResult('检查表结构', false, `检查失败: ${error.message}`);
		}

		// 步骤 3：检查超级管理员用户
		console.log('\n步骤 3: 检查超级管理员用户...');
		try {
			const superAdminResult = await db.execute(`
				SELECT id, email, username, is_super_admin, role, is_active, is_banned
				FROM users
				WHERE is_super_admin = true OR role = 'ADMIN'
				ORDER BY created_at DESC
			`);

			if (superAdminResult.rows.length > 0) {
				addResult('超级管理员用户', true, `找到 ${superAdminResult.rows.length} 个超级管理员账户`, {
					users: superAdminResult.rows.map((u: any) => ({
						email: u.email,
						username: u.username,
						isSuperAdmin: u.is_super_admin,
						role: u.role,
						isActive: u.is_active,
					})),
				});
			} else {
				addResult('超级管理员用户', false, '没有找到超级管理员账户');
			}
		} catch (error: any) {
			addResult('检查超级管理员', false, `检查失败: ${error.message}`);
		}

		// 步骤 4：重置 admin@tomato-ai.com 密码
		console.log('\n步骤 4: 重置超级管理员密码...');
		try {
			const newPassword = 'Admin123456';
			const passwordHash = await hashPassword(newPassword);

			const updateResult = await db.execute(`
				UPDATE users
				SET
					password_hash = '${passwordHash}',
					is_super_admin = true,
					role = 'ADMIN',
					membership_level = 'PREMIUM',
					is_active = true,
					is_banned = false,
					updated_at = NOW()
				WHERE email = 'admin@tomato-ai.com'
				RETURNING id, email, username, is_super_admin, role, is_active, is_banned
			`);

			if (updateResult.rows.length > 0) {
				const user = updateResult.rows[0];
				addResult('重置密码', true, `已重置密码: ${user.email}`, {
					email: user.email,
					username: user.username,
					isSuperAdmin: user.is_super_admin,
					role: user.role,
					isActive: user.is_active,
				});
			} else {
				// 用户不存在，创建新用户
				console.log('  用户不存在，创建新超级管理员...');
				const userId = crypto.randomUUID();
				const now = new Date().toISOString();

				const insertResult = await db.execute(`
					INSERT INTO users (
						id, email, username, password_hash, role, membership_level,
						is_super_admin, is_active, is_banned,
						daily_usage_count, monthly_usage_count, storage_used,
						created_at, updated_at
					) VALUES (
						'${userId}',
						'admin@tomato-ai.com',
						'超级管理员',
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
					) RETURNING id, email, username, is_super_admin, role
				`);

				addResult('创建超级管理员', true, '已创建新的超级管理员账户', {
					email: 'admin@tomato-ai.com',
					username: '超级管理员',
				});
			}
		} catch (error: any) {
			addResult('重置密码', false, `重置失败: ${error.message}`);
		}

		// 步骤 5：验证数据库状态
		console.log('\n步骤 5: 验证数据库状态...');
		try {
			const verifyResult = await db.execute(`
				SELECT
					id, email, username, is_super_admin, role, membership_level,
					is_active, is_banned, created_at
				FROM users
				WHERE email = 'admin@tomato-ai.com'
				LIMIT 1
			`);

			if (verifyResult.rows.length > 0) {
				const user = verifyResult.rows[0];
				const isHealthy =
					user.is_super_admin === true &&
					user.role === 'ADMIN' &&
					user.membership_level === 'PREMIUM' &&
					user.is_active === true &&
					user.is_banned === false;

				if (isHealthy) {
					addResult('验证数据库状态', true, '超级管理员状态正常', {
						email: user.email,
						username: user.username,
						isSuperAdmin: user.is_super_admin,
						role: user.role,
						membershipLevel: user.membership_level,
						isActive: user.is_active,
						isBanned: user.is_banned,
					});
				} else {
					addResult('验证数据库状态', false, '超级管理员状态异常', {
						email: user.email,
						isSuperAdmin: user.is_super_admin,
						role: user.role,
						isActive: user.is_active,
						isBanned: user.is_banned,
					});
				}
			} else {
				addResult('验证数据库状态', false, '找不到 admin@tomato-ai.com 用户');
			}
		} catch (error: any) {
			addResult('验证数据库状态', false, `验证失败: ${error.message}`);
		}

		// 步骤 6：生成诊断报告
		console.log('\n步骤 6: 生成诊断报告...\n');
		console.log('='.repeat(60));
		console.log('诊断报告');
		console.log('='.repeat(60));

		const successSteps = diagnosticResults.filter(r => r.success);
		const failedSteps = diagnosticResults.filter(r => !r.success);

		console.log(`\n总步骤数: ${diagnosticResults.length}`);
		console.log(`成功: ${successSteps.length}`);
		console.log(`失败: ${failedSteps.length}`);

		if (failedSteps.length === 0) {
			console.log('\n✅ 所有检查通过！');
		} else {
			console.log('\n❌ 发现以下问题：');
			failedSteps.forEach(r => {
				console.log(`  - ${r.step}: ${r.message}`);
			});
		}

		// 显示登录凭据
		console.log('\n' + '='.repeat(60));
		console.log('登录凭据');
		console.log('='.repeat(60));
		console.log('\n超级管理员登录信息：');
		console.log(`  URL: http://localhost:5000/admin/login`);
		console.log(`  邮箱: admin@tomato-ai.com`);
		console.log(`  密码: Admin123456`);
		console.log('\n提示：登录成功后会自动跳转到管理后台');

		// 保存诊断报告到文件
		const reportPath = '/workspace/projects/diagnostic-report.json';
		const fs = require('fs');
		fs.writeFileSync(
			reportPath,
			JSON.stringify(
				{
					timestamp: new Date().toISOString(),
					totalSteps: diagnosticResults.length,
					successCount: successSteps.length,
					failedCount: failedSteps.length,
					results: diagnosticResults,
				},
				null,
				2
			)
		);
		console.log(`\n诊断报告已保存到: ${reportPath}`);

		console.log('\n' + '='.repeat(60));
		console.log('修复完成');
		console.log('='.repeat(60));
	} catch (error) {
		console.error('\n修复过程出错:', error);
		process.exit(1);
	}
}

main();
