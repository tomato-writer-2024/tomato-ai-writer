#!/usr/bin/env node

/**
 * 创建用户工具
 *
 * 用法：
 * node scripts/create-user.js <邮箱> <用户名> <密码>
 *
 * 示例：
 * node scripts/create-user.js 208343256@qq.com 张三 Pass@2025
 */

const bcrypt = require('bcryptjs');
const { getDb } = require('coze-coding-dev-sdk');
const crypto = require('crypto');

async function createUser(email, username, password) {
  try {
    console.log(`\n========== 创建用户工具 ==========\n`);
    console.log(`邮箱: ${email}`);
    console.log(`用户名: ${username}`);
    console.log(`密码: ${password}`);
    console.log(`\n--------------------------------\n`);

    // 连接数据库
    console.log('连接数据库...');
    const db = await getDb();

    // 检查用户是否已存在
    console.log('检查用户是否已存在...');
    const existing = await db.execute(
      `SELECT id, email FROM users WHERE email = '${email}'`
    );

    if (existing.rows.length > 0) {
      console.error(`❌ 错误: 用户已存在 - ${email}`);
      console.log(`用户ID: ${existing.rows[0].id}`);
      process.exit(1);
    }

    // 生成UUID
    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);

    console.log('创建用户...');
    await db.execute(
      `INSERT INTO users (id, email, password_hash, username, role, membership_level, is_active, is_banned, is_super_admin, daily_usage_count, monthly_usage_count, storage_used, created_at, updated_at)
       VALUES ('${userId}', '${email}', '${passwordHash}', '${username}', 'FREE', 'FREE', true, false, false, 0, 0, 0, '${new Date().toISOString()}', '${new Date().toISOString()}')`
    );

    console.log('\n✅ 用户创建成功！');
    console.log(`\n用户信息:`);
    console.log(`  ID: ${userId}`);
    console.log(`  邮箱: ${email}`);
    console.log(`  用户名: ${username}`);
    console.log(`  密码: ${password}`);
    console.log(`  角色: FREE`);
    console.log(`  会员等级: FREE`);
    console.log(`\n====================================\n`);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// 检查命令行参数
const args = process.argv.slice(2);

if (args.length !== 3) {
  console.log('\n创建用户工具\n');
  console.log('用法:');
  console.log('  node scripts/create-user.js <邮箱> <用户名> <密码>\n');
  console.log('示例:');
  console.log('  node scripts/create-user.js 208343256@qq.com 张三 Pass@2025\n');
  process.exit(1);
}

const [email, username, password] = args;

// 执行创建
createUser(email, username, password);
