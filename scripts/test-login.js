#!/usr/bin/env node

/**
 * 测试登录流程
 */

const bcrypt = require('bcryptjs');
const { getDb } = require('coze-coding-dev-sdk');

async function testLogin(email, password) {
  try {
    console.log(`\n========== 测试登录流程 ==========\n`);
    console.log(`邮箱: ${email}`);
    console.log(`密码: ${password}`);
    console.log(`\n--------------------------------\n`);

    // 连接数据库
    const db = await getDb();

    // 查找用户
    console.log('1. 查找用户...');
    const result = await db.execute(
      `SELECT * FROM users WHERE email = '${email}'`
    );

    if (result.rows.length === 0) {
      console.log('❌ 用户不存在');
      return;
    }

    const user = result.rows[0];
    console.log(`✓ 找到用户: ${user.username} (${user.email})`);
    console.log(`  is_active: ${user.is_active}`);
    console.log(`  is_banned: ${user.is_banned}`);
    console.log(`  role: ${user.role}`);

    // 验证密码
    console.log('\n2. 验证密码...');
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log(`✓ 密码验证: ${isPasswordValid ? '成功' : '失败'}`);

    // 检查用户状态
    console.log('\n3. 检查用户状态...');
    if (!user.is_active || user.is_banned) {
      console.log(`❌ 用户状态异常: is_active=${user.is_active}, is_banned=${user.is_banned}`);
      return;
    }
    console.log('✓ 用户状态正常');

    // 检查最近的登录尝试
    console.log('\n4. 检查最近登录尝试...');
    const recentLogs = await db.execute(
      `SELECT * FROM security_logs
       WHERE user_id = '${user.id}' AND action = 'LOGIN'
       ORDER BY created_at DESC
       LIMIT 10`
    );

    console.log(`找到 ${recentLogs.rows.length} 条登录记录:`);
    recentLogs.rows.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.created_at} - ${log.status} - ${log.ip_address || 'N/A'}`);
    });

    console.log('\n✅ 登录流程测试完成！');
    console.log('\n====================================\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  }
}

const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.log('\n用法: node scripts/test-login.js <邮箱> <密码>\n');
  process.exit(1);
}

testLogin(email, password);
