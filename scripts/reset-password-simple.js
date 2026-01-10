#!/usr/bin/env node

/**
 * 密码重置工具 - 简化版
 *
 * 用法：
 * node scripts/reset-password-simple.js <邮箱> <新密码>
 *
 * 示例：
 * node scripts/reset-password-simple.js 208343256@qq.com NewPass@2025
 */

const bcrypt = require('bcryptjs');
const { getDb } = require('coze-coding-dev-sdk');

async function resetPassword(email, newPassword) {
  try {
    console.log(`\n========== 密码重置工具 ==========\n`);
    console.log(`目标邮箱: ${email}`);
    console.log(`新密码: ${newPassword}`);
    console.log(`\n--------------------------------\n`);

    // 连接数据库
    console.log('连接数据库...');
    const db = await getDb();

    // 查询用户
    console.log('查询用户...');
    const result = await db.execute(
      `SELECT id, email, username, role, membership_level, is_super_admin
       FROM users
       WHERE email = '${email}'`
    );

    if (result.rows.length === 0) {
      console.error(`❌ 错误: 用户不存在 - ${email}`);
      process.exit(1);
    }

    const user = result.rows[0];

    console.log('✓ 找到用户:');
    console.log(`  ID: ${user.id}`);
    console.log(`  用户名: ${user.username}`);
    console.log(`  邮箱: ${user.email}`);
    console.log(`  角色: ${user.role}`);
    console.log(`  会员等级: ${user.membership_level}`);
    console.log(`  超级管理员: ${user.is_super_admin ? '是' : '否'}`);

    // 哈希新密码
    console.log('\n哈希新密码...');
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // 更新密码
    console.log('更新密码...');
    await db.execute(
      `UPDATE users
       SET password_hash = '${passwordHash}', updated_at = '${new Date().toISOString()}'
       WHERE id = '${user.id}'`
    );

    console.log('\n✅ 密码重置成功！');
    console.log(`\n用户 ${email} 的新密码已设置为: ${newPassword}`);
    console.log(`\n====================================\n`);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// 检查命令行参数
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('\n密码重置工具\n');
  console.log('用法:');
  console.log('  node scripts/reset-password-simple.js <邮箱> <新密码>\n');
  console.log('示例:');
  console.log('  node scripts/reset-password-simple.js 208343256@qq.com NewPass@2025\n');
  process.exit(1);
}

const [email, newPassword] = args;

// 执行重置
resetPassword(email, newPassword);
