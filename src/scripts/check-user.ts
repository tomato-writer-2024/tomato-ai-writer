#!/usr/bin/env npx tsx
/**
 * 检查用户是否存在
 */

import { getPool } from '@/lib/db.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const ADMIN_EMAIL = '208343256@qq.com';

async function checkUser() {
  console.log('检查用户:', ADMIN_EMAIL);

  const pool = getPool();

  if (!pool) {
    console.log('❌ 数据库连接失败（可能处于 Mock 模式）');
    return;
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (result.rows.length === 0) {
      console.log('❌ 用户不存在');
      console.log('\n所有用户:');
      const allUsers = await pool.query('SELECT email, username, role FROM users');
      allUsers.rows.forEach(user => {
        console.log(`  - ${user.email} (${user.username}, ${user.role})`);
      });
    } else {
      console.log('✅ 用户存在');
      console.log('用户信息:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    }
  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await pool.end();
  }
}

checkUser();
