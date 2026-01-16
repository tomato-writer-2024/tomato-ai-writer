/**
 * 重置超级管理员密码脚本
 */

import { getDb } from 'coze-coding-dev-sdk';
import { hashPassword } from '@/lib/auth';

async function main() {
	const adminEmail = process.argv[2] || 'admin@tomato-ai.com';
	const newPassword = process.argv[3] || 'Admin123456';

	console.log('===== 重置超级管理员密码 =====');
	console.log(`邮箱: ${adminEmail}`);
	console.log(`新密码: ${newPassword}`);

	try {
		const db = await getDb();

		// 检查用户是否存在
		const checkResult = await db.execute(`
			SELECT id, email, username, is_super_admin FROM users
			WHERE email = '${adminEmail}'
		`);

		if (checkResult.rows.length === 0) {
			console.log('❌ 用户不存在');
			process.exit(1);
		}

		const user = checkResult.rows[0];
		console.log(`找到用户: ${user.username} (${user.is_super_admin ? '超级管理员' : '普通用户'})`);

		// 生成密码哈希
		const passwordHash = await hashPassword(newPassword);
		console.log(`密码哈希已生成，长度: ${passwordHash.length}`);

		// 更新密码
		const updateResult = await db.execute(`
			UPDATE users
			SET password_hash = '${passwordHash}', updated_at = NOW()
			WHERE email = '${adminEmail}'
			RETURNING id, email, username
		`);

		console.log('✅ 密码重置成功');
		console.log(`用户: ${updateResult.rows[0].username}`);
		console.log(`邮箱: ${updateResult.rows[0].email}`);
		console.log('');
		console.log('现在可以使用以下凭据登录:');
		console.log(`  邮箱: ${adminEmail}`);
		console.log(`  密码: ${newPassword}`);

	} catch (error) {
		console.error('重置密码失败:', error);
		process.exit(1);
	}
}

main();
