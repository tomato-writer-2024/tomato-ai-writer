#!/usr/bin/env npx tsx
/**
 * 直接使用 pg 检查用户（不通过 getPool）
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;
const ADMIN_EMAIL = '208343256@qq.com';

async function directCheckUser() {
  console.log('='.repeat(80));
  console.log('直接检查用户（不使用 getPool）');
  console.log('='.repeat(80));
  console.log();

  console.log('环境变量检查:');
  console.log(`  DATABASE_URL: ${!!process.env.DATABASE_URL}`);
  console.log(`  DATABASE_MOCK_MODE: ${process.env.DATABASE_MOCK_MODE}`);
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

    console.log('步骤 2: 查询所有用户...');
    const allUsers = await client.query(
      'SELECT email, username, role FROM users ORDER BY created_at DESC'
    );

    console.log(`共找到 ${allUsers.rows.length} 个用户:`);
    allUsers.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.username}, ${user.role})`);
    });
    console.log();

    console.log('步骤 3: 查询目标用户...');
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (result.rows.length === 0) {
      console.log(`❌ 用户 ${ADMIN_EMAIL} 不存在`);
      console.log('\n建议操作:');
      console.log('1. 使用注册 API 创建该用户');
      console.log('2. 使用 SQL 直接插入用户记录');
    } else {
      console.log('✅ 用户存在');
      console.log('用户信息:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    }

    client.release();

  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await pool.end();
  }
}

directCheckUser();
