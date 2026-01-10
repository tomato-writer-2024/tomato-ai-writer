#!/usr/bin/env node

/**
 * 密码重置工具
 *
 * 用法：
 * node scripts/reset-password.js <邮箱> <新密码>
 *
 * 示例：
 * node scripts/reset-password.js 208343256@qq.com newpassword123
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
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      console.error(`❌ 错误: 用户不存在 - ${email}`);
      process.exit(1);
    }

    console.log('✓ 找到用户:');
    console.log(`  ID: ${user.id}`);
    console.log(`  用户名: ${user.username}`);
    console.log(`  邮箱: ${user.email}`);
    console.log(`  角色: ${user.role}`);
    console.log(`  会员等级: ${user.membershipLevel}`);
    console.log(`  超级管理员: ${user.isSuperAdmin ? '是' : '否'}`);

    // 哈希新密码
    console.log('\n哈希新密码...');
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // 更新密码
    console.log('更新密码...');
    await db.update(users)
      .set({
        passwordHash,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, user.id));

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
  console.log('  node scripts/reset-password.js <邮箱> <新密码>\n');
  console.log('示例:');
  console.log('  node scripts/reset-password.js 208343256@qq.com newpassword123\n');
  process.exit(1);
}

const [email, newPassword] = args;

// 执行重置
resetPassword(email, newPassword);
