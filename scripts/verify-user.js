#!/usr/bin/env node

/**
 * 用户验证和登录助手
 * 用于帮助用户找回或验证登录凭据
 */

const { getDb } = require('coze-coding-dev-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function verifyUser(email) {
  try {
    console.log(`\n========== 用户验证工具 ==========\n`);
    console.log(`目标邮箱: ${email}`);
    console.log(`\n--------------------------------\n`);

    // 连接数据库
    const db = await getDb();

    // 查询用户
    const result = await db.execute(
      `SELECT * FROM users WHERE email = '${email}'`
    );

    if (result.rows.length === 0) {
      console.log(`❌ 用户不存在: ${email}\n`);
      console.log('建议：');
      console.log('1. 检查邮箱是否正确');
      console.log('2. 如果用户尚未注册，请联系管理员创建账号\n');
      return;
    }

    const user = result.rows[0];

    console.log('✓ 找到用户信息:\n');
    console.log(`  ID: ${user.id}`);
    console.log(`  邮箱: ${user.email}`);
    console.log(`  用户名: ${user.username}`);
    console.log(`  角色: ${user.role}`);
    console.log(`  会员等级: ${user.membership_level}`);
    console.log(`  超级管理员: ${user.is_super_admin ? '是' : '否'}`);
    console.log(`  账号状态: ${user.is_active ? '激活' : '未激活'} ${user.is_banned ? '(已封禁)' : ''}`);
    console.log(`  注册时间: ${user.created_at}`);
    console.log(`  最后登录: ${user.last_login_at || '从未登录'}`);

    // 检查最近的登录记录
    const logs = await db.execute(
      `SELECT * FROM security_logs
       WHERE user_id = '${user.id}' AND action = 'LOGIN'
       ORDER BY created_at DESC
       LIMIT 5`
    );

    if (logs.rows.length > 0) {
      console.log(`\n  最近登录记录:`);
      logs.rows.forEach((log, index) => {
        console.log(`    ${index + 1}. ${log.created_at} - ${log.status} (${log.ip_address || 'N/A'})`);
      });
    }

    console.log(`\n====================================\n`);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.log('\n用户验证工具\n');
  console.log('用法:');
  console.log('  node scripts/verify-user.js <邮箱>\n');
  console.log('示例:');
  console.log('  node scripts/verify-user.js 208343256@qq.com\n');
  process.exit(1);
}

verifyUser(email);
