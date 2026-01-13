import { Pool } from 'pg';

async function testConnection() {
  console.log('开始测试数据库连接...\n');

  // 测试多种组合
  const configs = [
    {
      name: '方案1：原始域名 + 端口5432 + sslmode=no-verify',
      connectionString: 'postgresql://postgres.jtibmdmfvusjlhiuqyrn:Tomato2024!%40%23%24@db.jtibmdmfvusjlhiuqyrn.supabase.co:5432/postgres?sslmode=no-verify',
    },
    {
      name: '方案2：原始域名 + 端口5432 + sslmode=require',
      connectionString: 'postgresql://postgres.jtibmdmfvusjlhiuqyrn:Tomato2024!%40%23%24@db.jtibmdmfvusjlhiuqyrn.supabase.co:5432/postgres?sslmode=require',
    },
    {
      name: '方案3：Connection Pooling + 端口6543 + sslmode=no-verify',
      connectionString: 'postgresql://postgres.jtibmdmfvusjlhiuqyrn:Tomato2024!%40%23%24@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify',
    },
  ];

  for (const config of configs) {
    try {
      console.log(`\n${config.name}`);
      const pool = new Pool({
        connectionString: config.connectionString,
        connectionTimeoutMillis: 10000,
      });
      const client = await pool.connect();
      console.log('✅ 连接成功！');
      const result = await client.query('SELECT version()');
      console.log('PostgreSQL版本:', result.rows[0].version.substring(0, 80));
      await client.release();
      await pool.end();
      console.log('连接已关闭');
      return { success: true, connectionString: config.connectionString };
    } catch (error) {
      console.error('❌ 连接失败:', error.message);
    }
  }

  return { success: false };
}

testConnection();
