const { getDb } = require('coze-coding-dev-sdk');

async function setSuperAdmin(email) {
	try {
		const db = await getDb();
		const emailEscaped = email.replace(/'/g, "''");

		// 检查用户是否存在
		const result = await db.execute(`
			SELECT id, email, username, is_super_admin FROM users WHERE email = '${emailEscaped}'
		`);

		if (!result.rows || result.rows.length === 0) {
			console.error('用户不存在:', email);
			process.exit(1);
		}

		const user = result.rows[0];
		console.log('找到用户:', user);

		if (user.is_super_admin) {
			console.log('用户已经是超级管理员了');
			process.exit(0);
		}

		// 更新用户为超级管理员
		const updateResult = await db.execute(`
			UPDATE users
			SET is_super_admin = true, role = 'ADMIN', membership_level = 'PREMIUM', updated_at = NOW()
			WHERE email = '${emailEscaped}'
			RETURNING id, email, username, is_super_admin
		`);

		const updatedUser = updateResult.rows[0];
		console.log('成功设置超级管理员:', updatedUser);
		process.exit(0);
	} catch (error) {
		console.error('设置超级管理员失败:', error);
		process.exit(1);
	}
}

// 从命令行参数获取邮箱
const email = process.argv[2];
if (!email) {
	console.error('请提供用户邮箱地址');
	console.log('使用方法: node scripts/set-superadmin.js <email>');
	process.exit(1);
}

setSuperAdmin(email);
