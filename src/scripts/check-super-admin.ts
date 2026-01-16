/**
 * 检查超级管理员状态脚本
 */

import { getDb } from 'coze-coding-dev-sdk';

async function main() {
	console.log('===== 检查超级管理员状态 =====');

	try {
		const db = await getDb();

		// 1. 检查 users 表结构
		console.log('\n1. 检查 users 表结构...');
		const structureResult = await db.execute(`
			SELECT column_name, data_type, is_nullable, column_default
			FROM information_schema.columns
			WHERE table_name = 'users'
			ORDER BY ordinal_position
		`);

		console.log('users 表字段:');
		structureResult.rows.forEach((row: any) => {
			console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
		});

		// 2. 检查 is_super_admin 字段是否存在
		const hasSuperAdminField = structureResult.rows.some(
			(row: any) => row.column_name === 'is_super_admin' || row.column_name === 'isSuperAdmin'
		);
		console.log(`\nis_super_admin 字段存在: ${hasSuperAdminField}`);

		// 3. 检查所有用户
		console.log('\n2. 检查所有用户...');
		const usersResult = await db.execute(`
			SELECT id, email, username, is_super_admin, is_active, is_banned, role
			FROM users
			ORDER BY created_at DESC
		`);

		console.log(`\n总用户数: ${usersResult.rows.length}`);
		console.log('用户列表:');
		usersResult.rows.forEach((user: any) => {
			console.log(`  - ${user.email}`);
			console.log(`    ID: ${user.id}`);
			console.log(`    用户名: ${user.username}`);
			console.log(`    is_super_admin: ${user.is_super_admin}`);
			console.log(`    is_active: ${user.is_active}`);
			console.log(`    is_banned: ${user.is_banned}`);
			console.log(`    role: ${user.role}`);
		});

		// 4. 检查是否有超级管理员
		console.log('\n3. 检查超级管理员...');
		const superAdminResult = await db.execute(`
			SELECT * FROM users WHERE is_super_admin = true OR is_super_admin = 'true'
		`);

		if (superAdminResult.rows.length > 0) {
			console.log(`找到 ${superAdminResult.rows.length} 个超级管理员:`);
			superAdminResult.rows.forEach((admin: any) => {
				console.log(`  - ${admin.email} (${admin.username})`);
			});
		} else {
			console.log('❌ 没有找到超级管理员!');
			console.log('建议创建超级管理员账户');
		}

		// 5. 检查 admin@tomato-ai.com 用户
		console.log('\n4. 检查 admin@tomato-ai.com 用户...');
		const adminResult = await db.execute(`
			SELECT * FROM users WHERE email = 'admin@tomato-ai.com'
		`);

		if (adminResult.rows.length > 0) {
			const admin = adminResult.rows[0];
			console.log('找到 admin@tomato-ai.com 用户:');
			console.log(`  ID: ${admin.id}`);
			console.log(`  is_super_admin: ${admin.is_super_admin}`);
			console.log(`  role: ${admin.role}`);
		} else {
			console.log('❌ 没有找到 admin@tomato-ai.com 用户');
		}

	} catch (error) {
		console.error('检查失败:', error);
		process.exit(1);
	}
}

main();
