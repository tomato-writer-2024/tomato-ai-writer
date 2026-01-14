#!/usr/bin/env npx tsx
/**
 * 直接创建管理员账号（不通过 getPool）
 */

import pg from 'pg';
import { hashPassword } from '@/lib/auth.js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;
const ADMIN_EMAIL = '208343256@qq.com';
const ADMIN_USERNAME = '管理员';
const ADMIN_PASSWORD = 'TomatoAdmin@2024';

async function createAdminAccount() {
  console.log('='.repeat(80));
  console.log('创建管理员账号');
  console.log('='.repeat(80));
  console.log();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('步骤 1: 测试数据库连接...');
    const client = await pool.connect();
    console.log('✅ 数据库连接成功');
    console.log();

    // 检查用户是否已存在
    console.log('步骤 2: 检查用户是否已存在...');
    const existingUser = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (existingUser.rows.length > 0) {
      console.log('✅ 用户已存在');
      console.log();
      console.log('更新用户信息...');
      const passwordHash = await hashPassword(ADMIN_PASSWORD);

      await client.query(
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
    } else {
      console.log('用户不存在，创建新用户...');

      const passwordHash = await hashPassword(ADMIN_PASSWORD);
      const userId = randomUUID();
      const now = new Date();

      await client.query(
        `INSERT INTO users (
          id, email, password_hash, username, role, is_super_admin,
          membership_level, membership_expire_at, daily_usage_count,
          monthly_usage_count, storage_used, created_at, updated_at,
          is_active, is_banned, wechat_open_id, wechat_union_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )`,
        [
          userId,
          ADMIN_EMAIL,
          passwordHash,
          ADMIN_USERNAME,
          'SUPER_ADMIN',
          true,
          'ENTERPRISE',
          new Date('2027-12-31'),
          0,
          0,
          0,
          now,
          now,
          true,
          false,
          null,
          null
        ]
      );

      console.log('✅ 用户创建成功');
    }

    console.log();
    console.log('步骤 3: 验证创建结果...');
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    const user = result.rows[0];
    console.log();
    console.log('='.repeat(80));
    console.log('管理员账号信息:');
    console.log('='.repeat(80));
    console.log(`邮箱: ${user.email}`);
    console.log(`用户名: ${user.username}`);
    console.log(`角色: ${user.role}`);
    console.log(`是否超级管理员: ${user.is_super_admin}`);
    console.log(`会员等级: ${user.membership_level}`);
    console.log(`会员到期时间: ${user.membership_expire_at}`);
    console.log(`用户ID: ${user.id}`);
    console.log();
    console.log('登录信息:');
    console.log('-'.repeat(80));
    console.log(`登录地址: http://localhost:5000/login`);
    console.log(`邮箱: ${ADMIN_EMAIL}`);
    console.log(`密码: ${ADMIN_PASSWORD}`);
    console.log('='.repeat(80));

    client.release();

  } catch (error) {
    console.error('\n❌ 创建失败:', error);
    console.error('\n请检查:');
    console.error('1. 数据库连接配置是否正确');
    console.error('2. 数据库表结构是否已创建');
    console.error('3. 环境变量是否正确加载');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdminAccount()
  .then(() => {
    console.log('\n✅ 创建完成!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 未捕获的错误:', error);
    process.exit(1);
  });
