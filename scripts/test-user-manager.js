#!/usr/bin/env node

/**
 * 测试 userManager
 */

const { userManager } = require('../src/storage/database');
const bcrypt = require('bcryptjs');

async function testUserManager() {
  try {
    console.log('\n========== 测试 UserManager ==========\n');

    const email = '208343256@qq.com';
    const password = 'Pass@2025';

    console.log('1. 调用 userManager.getUserByEmail...');
    const user = await userManager.getUserByEmail(email);

    if (!user) {
      console.log('❌ 用户未找到');
    } else {
      console.log('✓ 找到用户:');
      console.log('  ID:', user.id);
      console.log('  邮箱:', user.email);
      console.log('  用户名:', user.username);
      console.log('  is_active:', user.isActive);
      console.log('  is_banned:', user.isBanned);
      console.log('  role:', user.role);

      console.log('\n2. 验证密码...');
      const isValid = await bcrypt.compare(password, user.passwordHash);
      console.log('✓ 密码验证:', isValid ? '成功' : '失败');
    }

    console.log('\n====================================\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testUserManager();
