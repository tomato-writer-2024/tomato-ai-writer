#!/usr/bin/env npx tsx
/**
 * 更新管理员账号信息
 *
 * 使用方法：
 * npx tsx src/scripts/update-admin-account.ts
 */

import { getPool } from '@/lib/db.js';
import { hashPassword } from '@/lib/auth.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_EMAIL = '208343256@qq.com';
const ADMIN_USERNAME = '管理员';
const ADMIN_PASSWORD = 'TomatoAdmin@2024';

async function updateAdminAccount() {
  console.log('='.repeat(80));
  console.log('更新管理员账号');
  console.log('='.repeat(80));
  console.log();

  const pool = getPool();

  if (!pool) {
    console.log('❌ 数据库连接失败（可能处于 Mock 模式）');
    process.exit(1);
    return;
  }

  try {
    // 检查用户是否存在
    console.log('步骤 1: 检查用户是否存在...');
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (existingUser.rows.length === 0) {
      throw new Error('用户不存在');
    }

    const user = existingUser.rows[0];
    console.log(`✅ 用户存在: ${user.email}`);
    console.log(`   当前角色: ${user.role}`);
    console.log(`   当前用户名: ${user.username}`);
    console.log(`   是否超级管理员: ${user.is_super_admin}`);
    console.log();

    // 更新用户信息
    console.log('步骤 2: 更新用户信息...');

    const passwordHash = await hashPassword(ADMIN_PASSWORD);

    await pool.query(
      `UPDATE users
       SET username = $1,
           role = 'SUPER_ADMIN',
           is_super_admin = true,
           membership_level = 'ENTERPRISE',
           password_hash = $2,
           updated_at = NOW()
       WHERE email = $3`,
      [ADMIN_USERNAME, passwordHash, ADMIN_EMAIL]
    );

    console.log('✅ 用户信息更新成功');
    console.log();

    // 验证更新结果
    console.log('步骤 3: 验证更新结果...');
    const updatedUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    const userData = updatedUser.rows[0];
    console.log();
    console.log('='.repeat(80));
    console.log('管理员账号信息:');
    console.log('='.repeat(80));
    console.log(`邮箱: ${userData.email}`);
    console.log(`用户名: ${userData.username}`);
    console.log(`角色: ${userData.role}`);
    console.log(`是否超级管理员: ${userData.is_super_admin}`);
    console.log(`会员等级: ${userData.membership_level}`);
    console.log(`用户ID: ${userData.id}`);
    console.log();
    console.log('登录信息:');
    console.log('-'.repeat(80));
    console.log(`登录地址: http://localhost:5000/login`);
    console.log(`邮箱: ${ADMIN_EMAIL}`);
    console.log(`密码: ${ADMIN_PASSWORD}`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ 更新失败:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateAdminAccount()
  .then(() => {
    console.log('\n✅ 更新完成!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 未捕获的错误:', error);
    process.exit(1);
  });
