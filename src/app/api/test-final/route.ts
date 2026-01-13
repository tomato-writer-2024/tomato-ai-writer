import { NextResponse } from 'next/server';
import { Pool } from 'pg';

/**
 * 最终数据库连接测试
 */
export async function GET(request: Request) {
  const results = [];

  console.log('===== 最终数据库连接测试 =====');

  // 密码: Tomato2024!@#$ -> URL编码: Tomato2024!%40%23%24

  // 测试组合
  const testCases = [
    {
      name: 'pooler:5432，不使用pgbouncer，sslmode=no-verify',
      conn: 'postgresql://postgres:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=no-verify',
    },
    {
      name: 'pooler:5432，pgbouncer=true，sslmode=no-verify',
      conn: 'postgresql://postgres:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=no-verify',
    },
    {
      name: 'pooler:6543，pgbouncer=true，sslmode=no-verify',
      conn: 'postgresql://postgres:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify',
    },
    {
      name: 'pooler:6543，不使用pgbouncer，sslmode=no-verify',
      conn: 'postgresql://postgres:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=no-verify',
    },
    {
      name: 'pooler:5432，用户名postgres.jtibmdmfvusjlhiuqyrn，不使用pgbouncer，sslmode=no-verify',
      conn: 'postgresql://postgres.jtibmdmfvusjlhiuqyrn:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=no-verify',
    },
    {
      name: 'pooler:6543，用户名postgres.jtibmdmfvusjlhiuqyrn，pgbouncer=true，sslmode=no-verify',
      conn: 'postgresql://postgres.jtibmdmfvusjlhiuqyrn:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify',
    },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`测试: ${testCase.name}`);
      const pool = new Pool({
        connectionString: testCase.conn,
        connectionTimeoutMillis: 10000,
      });

      const client = await pool.connect();
      const result = await client.query('SELECT version(), current_user, current_database()');
      console.log(`✅ ${testCase.name} 成功！`);

      await client.release();
      await pool.end();

      results.push({
        method: testCase.name,
        success: true,
        version: result.rows[0].version.substring(0, 100),
        user: result.rows[0].current_user,
        database: result.rows[0].current_database,
      });
    } catch (error: any) {
      console.error(`❌ ${testCase.name} 失败:`, error.message, error.code);
      results.push({
        method: testCase.name,
        success: false,
        error: error.message,
        code: error.code,
      });
    }
  }

  // 找到成功的连接方式
  const successfulMethod = results.find((r: any) => r.success);

  return NextResponse.json({
    success: !!successfulMethod,
    results,
    recommendation: successfulMethod
      ? `推荐使用: ${successfulMethod.method}`
      : '所有测试都失败。请检查:\n1. Supabase Connection Pooling 是否已启用\n2. 密码是否正确\n3. 等待一段时间让 Connection Pooling 生效',
  });
}
