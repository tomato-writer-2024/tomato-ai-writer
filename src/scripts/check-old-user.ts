#!/usr/bin/env npx tsx
/**
 * 检查旧用户 ID 是否在数据库中
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;
const OLD_USER_ID = '28412432-23ba-401f-a314-0a9d16d5f232';
const ADMIN_EMAIL = '208343256@qq.com';

async function checkOldUser() {
  console.log('='.repeat(80));
  console.log('检查旧用户 ID');
  console.log('='.repeat(80));
  console.log();

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    const client = await pool.connect();

    console.log('查询所有用户...');
    const allUsers = await client.query(
      'SELECT id, email, username, role FROM users ORDER BY created_at DESC'
    );

    console.log(`共找到 ${allUsers.rows.length} 个用户:`);
    allUsers.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.username}, ${user.role})`);
      console.log(`    ID: ${user.id}`);
    });
    console.log();

    console.log('查询旧用户 ID...');
    const oldUser = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [OLD_USER_ID]
    );

    if (oldUser.rows.length > 0) {
      console.log('✅ 旧用户 ID 存在于数据库中');
      console.log('用户信息:');
      console.log(JSON.stringify(oldUser.rows[0], null, 2));
    } else {
      console.log('❌ 旧用户 ID 不存在于数据库中');
    }

    console.log();
    console.log('查询管理员邮箱...');
    const adminUser = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (adminUser.rows.length > 0) {
      console.log('✅ 管理员邮箱存在');
      console.log('用户信息:');
      console.log(JSON.stringify(adminUser.rows[0], null, 2));
    } else {
      console.log('❌ 管理员邮箱不存在');
    }

    client.release();

  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await pool.end();
  }
}

checkOldUser();
