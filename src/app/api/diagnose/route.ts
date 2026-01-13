import { NextResponse } from 'next/server';
import { Pool } from 'pg';

/**
 * 诊断 Supabase Connection Pooling 配置
 */
export async function GET(request: Request) {
  const diagnostics = [];

  console.log('===== Supabase Connection Pooling 诊断 =====');

  // 诊断1：尝试连接到 Direct Connection（IPv6）
  try {
    console.log('诊断1：测试 Direct Connection (IPv6)');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:Tomato2024!%40%23%24@db.jtibmdmfvusjlhiuqyrn.supabase.co:5432/postgres?sslmode=no-verify',
      connectionTimeoutMillis: 5000,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    await client.release();
    await pool.end();

    diagnostics.push({
      test: 'Direct Connection (IPv6)',
      status: '成功',
      message: 'IPv6 连接正常（但这在沙箱环境中不可用）',
      version: result.rows[0].version.substring(0, 100),
    });
  } catch (error: any) {
    diagnostics.push({
      test: 'Direct Connection (IPv6)',
      status: '失败',
      error: error.message,
      hint: '这是预期的，因为沙箱环境不支持 IPv6',
    });
  }

  // 诊断2：测试 Connection Pooling (port 6543)
  try {
    console.log('诊断2：测试 Connection Pooling (port 6543)');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify',
      connectionTimeoutMillis: 5000,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    await client.release();
    await pool.end();

    diagnostics.push({
      test: 'Connection Pooling (port 6543)',
      status: '成功',
      message: 'Connection Pooling 工作正常',
      version: result.rows[0].version.substring(0, 100),
    });
  } catch (error: any) {
    const hint = error.code === 'XX000'
      ? 'Connection Pooling 未启用或未生效。请在 Supabase Dashboard 中启用 Connection Pooling 并等待 2-3 分钟。'
      : error.code === 'SELF_SIGNED_CERT_IN_CHAIN'
      ? 'SSL 证书问题（已用 sslmode=no-verify 解决）'
      : '其他错误';

    diagnostics.push({
      test: 'Connection Pooling (port 6543)',
      status: '失败',
      error: error.message,
      code: error.code,
      hint,
    });
  }

  // 诊断3：测试 Session Pooling (port 5432 with pooler)
  try {
    console.log('诊断3：测试 Session Pooling (port 5432)');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=no-verify',
      connectionTimeoutMillis: 5000,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    await client.release();
    await pool.end();

    diagnostics.push({
      test: 'Session Pooling (port 5432)',
      status: '成功',
      message: 'Session Pooling 工作正常',
      version: result.rows[0].version.substring(0, 100),
    });
  } catch (error: any) {
    const hint = error.code === 'XX000'
      ? 'Session Pooling 未启用。可能需要使用 Connection Pooling (port 6543)。'
      : error.code === 'SELF_SIGNED_CERT_IN_CHAIN'
      ? 'SSL 证书问题（已用 sslmode=no-verify 解决）'
      : '其他错误';

    diagnostics.push({
      test: 'Session Pooling (port 5432)',
      status: '失败',
      error: error.message,
      code: error.code,
      hint,
    });
  }

  // 生成建议
  const recommendations = [];
  const poolingSuccess = diagnostics.find((d: any) => d.test.includes('Connection Pooling') && d.status === '成功');
  const sessionSuccess = diagnostics.find((d: any) => d.test.includes('Session Pooling') && d.status === '成功');

  if (poolingSuccess) {
    recommendations.push({
      type: '推荐',
      message: '使用 Connection Pooling (port 6543)，支持 Transaction 模式',
      connectionString: 'postgresql://postgres:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify',
    });
  } else if (sessionSuccess) {
    recommendations.push({
      type: '推荐',
      message: '使用 Session Pooling (port 5432)',
      connectionString: 'postgresql://postgres:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=no-verify',
    });
  } else {
    recommendations.push({
      type: '紧急',
      message: '请在 Supabase Dashboard 中启用 Connection Pooling',
      steps: [
        '1. 进入项目 Settings → Database',
        '2. 找到 Connection pooling 部分',
        '3. 点击 Enable 启用',
        '4. 等待 2-3 分钟让配置生效',
        '5. 重新运行此诊断测试',
      ],
    });
    recommendations.push({
      type: '临时方案',
      message: '使用 Mock 模式让系统先运行起来',
      steps: [
        '1. Mock 模式已实现，可以使用',
        '2. 后续启用 Connection Pooling 后可切换到真实数据库',
      ],
    });
  }

  return NextResponse.json({
    success: poolingSuccess !== undefined || sessionSuccess !== undefined,
    diagnostics,
    recommendations,
    nextSteps: poolingSuccess || sessionSuccess
      ? ['数据库连接成功，可以创建超级管理员账户']
      : ['启用 Supabase Connection Pooling', '等待配置生效（2-3分钟）', '重新运行诊断'],
  });
}
