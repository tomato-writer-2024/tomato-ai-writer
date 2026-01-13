import { NextResponse } from 'next/server';
import { Pool } from 'pg';

/**
 * 测试新密码的数据库连接
 */
export async function GET(request: Request) {
  const results = [];

  console.log('===== 测试新密码数据库连接 =====');

  // 新密码: Tomato2024!@#$ -> URL编码: Tomato2024!%40%23%24

  // 测试1：pooler:5432（Session mode，强制SSL）
  try {
    console.log('测试1：pooler:5432，Session mode，强制SSL');
    const connectionString = 'postgresql://postgres:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require';
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 10000,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT version(), current_user, current_database()');
    console.log('✅ 测试1成功！版本:', result.rows[0].version.substring(0, 50));
    console.log('用户:', result.rows[0].current_user);

    await client.release();
    await pool.end();

    results.push({
      method: 'pooler:5432，Session mode，sslmode=require',
      success: true,
      version: result.rows[0].version.substring(0, 100),
      user: result.rows[0].current_user,
      database: result.rows[0].current_database,
    });
  } catch (error: any) {
    console.error('测试1失败:', error.message, error.code);
    results.push({
      method: 'pooler:5432，Session mode，sslmode=require',
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  // 测试2：pooler:5432，no-verify（绕过SSL验证）
  try {
    console.log('测试2：pooler:5432，Session mode，sslmode=no-verify');
    const connectionString = 'postgresql://postgres:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=no-verify';
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 10000,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT version(), current_user, current_database()');
    console.log('✅ 测试2成功！版本:', result.rows[0].version.substring(0, 50));
    console.log('用户:', result.rows[0].current_user);

    await client.release();
    await pool.end();

    results.push({
      method: 'pooler:5432，Session mode，sslmode=no-verify',
      success: true,
      version: result.rows[0].version.substring(0, 100),
      user: result.rows[0].current_user,
      database: result.rows[0].current_database,
    });
  } catch (error: any) {
    console.error('测试2失败:', error.message, error.code);
    results.push({
      method: 'pooler:5432，Session mode，sslmode=no-verify',
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  // 测试3：pooler:6543（Transaction mode）
  try {
    console.log('测试3：pooler:6543，Transaction mode，sslmode=no-verify');
    const connectionString = 'postgresql://postgres:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify';
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 10000,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT version(), current_user, current_database()');
    console.log('✅ 测试3成功！版本:', result.rows[0].version.substring(0, 50));
    console.log('用户:', result.rows[0].current_user);

    await client.release();
    await pool.end();

    results.push({
      method: 'pooler:6543，Transaction mode，sslmode=no-verify',
      success: true,
      version: result.rows[0].version.substring(0, 100),
      user: result.rows[0].current_user,
      database: result.rows[0].current_database,
    });
  } catch (error: any) {
    console.error('测试3失败:', error.message, error.code);
    results.push({
      method: 'pooler:6543，Transaction mode，sslmode=no-verify',
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  // 测试4：尝试项目专属用户名 postgres.jtibmdmfvusjlhiuqyrn
  try {
    console.log('测试4：pooler:6543，用户名 postgres.jtibmdmfvusjlhiuqyrn，sslmode=no-verify');
    const connectionString = 'postgresql://postgres.jtibmdmfvusjlhiuqyrn:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify';
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 10000,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT version(), current_user, current_database()');
    console.log('✅ 测试4成功！版本:', result.rows[0].version.substring(0, 50));
    console.log('用户:', result.rows[0].current_user);

    await client.release();
    await pool.end();

    results.push({
      method: 'pooler:6543，用户名 postgres.jtibmdmfvusjlhiuqyrn',
      success: true,
      version: result.rows[0].version.substring(0, 100),
      user: result.rows[0].current_user,
      database: result.rows[0].current_database,
    });
  } catch (error: any) {
    console.error('测试4失败:', error.message, error.code);
    results.push({
      method: 'pooler:6543，用户名 postgres.jtibmdmfvusjlhiuqyrn',
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  return NextResponse.json({
    success: results.some((r: any) => r.success),
    results,
  });
}
