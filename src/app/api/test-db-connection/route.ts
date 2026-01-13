import { NextResponse } from 'next/server';
import { Pool } from 'pg';

/**
 * 测试数据库连接API
 * 尝试不同的连接方式，找到可用的连接字符串
 */
export async function GET(request: Request) {
  console.log('===== 数据库连接测试开始 =====');

  const results = [];

  // 方案1：原始连接字符串（IPv6）
  try {
    console.log('测试方案1：原始连接字符串（IPv6）');
    const pool1 = new Pool({
      connectionString: 'postgresql://postgres.jtibmdmfvusjlhiuqyrn:T0m4t0%242024%23@db.jtibmdmfvusjlhiuqyrn.supabase.co:5432/postgres',
      connectionTimeoutMillis: 3000,
    });
    const client1 = await pool1.connect();
    const result1 = await client1.query('SELECT version()');
    await client1.release();
    await pool1.end();
    results.push({
      method: '方案1：原始连接字符串（IPv6）',
      success: true,
      version: result1.rows[0].version.substring(0, 50) + '...',
    });
    console.log('方案1成功');
  } catch (error: any) {
    results.push({
      method: '方案1：原始连接字符串（IPv6）',
      success: false,
      error: error.message,
    });
    console.log('方案1失败:', error.message);
  }

  // 方案2：Connection Pooling（端口6543）
  try {
    console.log('测试方案2：Connection Pooling（端口6543）');
    const pool2 = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 3000,
    });
    const client2 = await pool2.connect();
    const result2 = await client2.query('SELECT version()');
    await client2.release();
    await pool2.end();
    results.push({
      method: '方案2：Connection Pooling（端口6543）',
      success: true,
      version: result2.rows[0].version.substring(0, 50) + '...',
    });
    console.log('方案2成功');
  } catch (error: any) {
    results.push({
      method: '方案2：Connection Pooling（端口6543）',
      success: false,
      error: error.message,
    });
    console.log('方案2失败:', error.message);
  }

  // 方案3：Direct Connection（端口5432，通过pooler域名）
  try {
    console.log('测试方案3：Direct Connection（端口5432，通过pooler域名）');
    const connectionString = process.env.DATABASE_URL?.replace(':6543', ':5432');
    const pool3 = new Pool({
      connectionString,
      connectionTimeoutMillis: 3000,
    });
    const client3 = await pool3.connect();
    const result3 = await client3.query('SELECT version()');
    await client3.release();
    await pool3.end();
    results.push({
      method: '方案3：Direct Connection（端口5432）',
      success: true,
      version: result3.rows[0].version.substring(0, 50) + '...',
    });
    console.log('方案3成功');
  } catch (error: any) {
    results.push({
      method: '方案3：Direct Connection（端口5432）',
      success: false,
      error: error.message,
    });
    console.log('方案3失败:', error.message);
  }

  // 找到成功的方案
  const successfulMethod = results.find((r: any) => r.success);

  return NextResponse.json(
    {
      success: !!successfulMethod,
      results,
      recommendation: successfulMethod
        ? `推荐使用：${successfulMethod.method}`
        : '所有方案都失败了，请检查Supabase连接字符串或使用Mock模式',
    },
    { status: 200 }
  );
}
