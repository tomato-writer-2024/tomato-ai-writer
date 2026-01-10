#!/usr/bin/env node

/**
 * 列出所有用户
 */

const { getDb } = require('coze-coding-dev-sdk');

async function listUsers() {
  try {
    console.log(`\n========== 所有用户列表 ==========\n`);

    // 连接数据库
    const db = await getDb();

    // 查询所有用户
    console.log('查询用户...');
    const result = await db.execute(
      `SELECT id, email, username, role, membership_level, is_super_admin, is_active, is_banned, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 50`
    );

    if (result.rows.length === 0) {
      console.log('数据库中没有用户\n');
      process.exit(0);
    }

    console.log(`找到 ${result.rows.length} 个用户:\n`);

    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. 邮箱: ${user.email}`);
      console.log(`   用户名: ${user.username || '未设置'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   角色: ${user.role}`);
      console.log(`   会员等级: ${user.membership_level}`);
      console.log(`   超级管理员: ${user.is_super_admin ? '是' : '否'}`);
      console.log(`   状态: ${user.is_active ? '激活' : '未激活'} ${user.is_banned ? '(已封禁)' : ''}`);
      console.log(`   注册时间: ${user.created_at}`);
      console.log(`\n${'─'.repeat(60)}\n`);
    });

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  }
}

listUsers();
