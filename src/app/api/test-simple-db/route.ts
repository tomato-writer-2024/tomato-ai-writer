import { NextResponse } from 'next/server';
import { Pool } from 'pg';

/**
 * 简单的数据库连接测试
 */
export async function GET(request: Request) {
  const results = [];

  console.log('===== 简单数据库连接测试 =====');

  // 测试1：使用用户提供的格式，但通过pooler域名，不使用pgbouncer
  try {
    console.log('测试1：pooler域名:5432，不使用pgbouncer');
    const connectionString = 'postgresql://postgres:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=no-verify';
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 10000,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT version(), current_user');
    console.log('版本:', result.rows[0].version.substring(0, 50));
    console.log('当前用户:', result.rows[0].current_user);

    await client.release();
    await pool.end();

    results.push({
      method: 'pooler:5432，不使用pgbouncer',
      success: true,
      version: result.rows[0].version.substring(0, 100),
      user: result.rows[0].current_user,
    });
  } catch (error: any) {
    console.error('测试1失败:', error.message, error.code);
    results.push({
      method: 'pooler:5432，不使用pgbouncer',
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  // 测试2：使用 Session mode (pgbouncer=true，但端口6543)
  try {
    console.log('测试2：pooler:6543，pgbouncer=true (Transaction mode)');
    const connectionString = 'postgresql://postgres:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify';
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 10000,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT version(), current_user');
    console.log('版本:', result.rows[0].version.substring(0, 50));
    console.log('当前用户:', result.rows[0].current_user);

    await client.release();
    await pool.end();

    results.push({
      method: 'pooler:6543，pgbouncer=true (Transaction mode)',
      success: true,
      version: result.rows[0].version.substring(0, 100),
      user: result.rows[0].current_user,
    });
  } catch (error: any) {
    console.error('测试2失败:', error.message, error.code);
    results.push({
      method: 'pooler:6543，pgbouncer=true (Transaction mode)',
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  // 测试3：尝试使用 postgres.jtibmdmfvusjlhiuqyrn 用户名
  try {
    console.log('测试3：pooler:6543，用户名 postgres.jtibmdmfvusjlhiuqyrn');
    const connectionString = 'postgresql://postgres.jtibmdmfvusjlhiuqyrn:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify';
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 10000,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT version(), current_user');
    console.log('版本:', result.rows[0].version.substring(0, 50));
    console.log('当前用户:', result.rows[0].current_user);

    await client.release();
    await pool.end();

    results.push({
      method: 'pooler:6543，用户名 postgres.jtibmdmfvusjlhiuqyrn',
      success: true,
      version: result.rows[0].version.substring(0, 100),
      user: result.rows[0].current_user,
    });
  } catch (error: any) {
    console.error('测试3失败:', error.message, error.code);
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
