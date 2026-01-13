import { Pool } from 'pg';

/**
 * 详细的数据库连接测试
 */
export async function testDatabaseConnection() {
  const results = [];

  console.log('===== 详细数据库连接测试 =====');
  console.log('当前连接字符串:', process.env.DATABASE_URL);

  // 解析连接字符串
  const connectionString = process.env.DATABASE_URL || '';
  const url = new URL(connectionString);
  console.log('用户名:', url.username);
  console.log('密码:', url.password ? '***已设置***' : '未设置');
  console.log('主机:', url.hostname);
  console.log('端口:', url.port);
  console.log('数据库:', url.pathname.substring(1));
  console.log('查询参数:', url.search);

  // 测试1：不使用 pgBouncer
  try {
    console.log('\n测试1：移除 pgbouncer 参数');
    const url1 = new URL(connectionString);
    url1.searchParams.delete('pgbouncer');
    const connString1 = url1.toString();
    console.log('连接字符串:', connString1.replace(url1.password, '***'));

    const pool1 = new Pool({
      connectionString: connString1,
      connectionTimeoutMillis: 10000,
    });

    const client1 = await pool1.connect();
    const result1 = await client1.query('SELECT version(), current_user, current_database()');
    await client1.release();
    await pool1.end();

    results.push({
      test: '测试1：不使用 pgBouncer',
      success: true,
      version: result1.rows[0].version.substring(0, 50),
      user: result1.rows[0].current_user,
      database: result1.rows[0].current_database,
    });
  } catch (error: any) {
    console.error('测试1失败:', error.message);
    console.error('错误代码:', error.code);
    console.error('错误详情:', error);

    results.push({
      test: '测试1：不使用 pgBouncer',
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  // 测试2：使用 pgBouncer (Transaction mode)
  try {
    console.log('\n测试2：使用 pgBouncer (Transaction mode)');
    const pool2 = new Pool({
      connectionString: connectionString,
      connectionTimeoutMillis: 10000,
    });

    const client2 = await pool2.connect();
    const result2 = await client2.query('SELECT version(), current_user, current_database()');
    await client2.release();
    await pool2.end();

    results.push({
      test: '测试2：使用 pgBouncer',
      success: true,
      version: result2.rows[0].version.substring(0, 50),
      user: result2.rows[0].current_user,
      database: result2.rows[0].current_database,
    });
  } catch (error: any) {
    console.error('测试2失败:', error.message);
    console.error('错误代码:', error.code);
    console.error('错误详情:', error);

    results.push({
      test: '测试2：使用 pgBouncer',
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  // 测试3：尝试不同的 SSL 模式
  try {
    console.log('\n测试3：尝试 sslmode=require');
    const url3 = new URL(connectionString);
    url3.searchParams.set('sslmode', 'require');
    const connString3 = url3.toString();

    const pool3 = new Pool({
      connectionString: connString3,
      connectionTimeoutMillis: 10000,
    });

    const client3 = await pool3.connect();
    const result3 = await client3.query('SELECT version(), current_user, current_database()');
    await client3.release();
    await pool3.end();

    results.push({
      test: '测试3：sslmode=require',
      success: true,
      version: result3.rows[0].version.substring(0, 50),
      user: result3.rows[0].current_user,
      database: result3.rows[0].current_database,
    });
  } catch (error: any) {
    console.error('测试3失败:', error.message);
    console.error('错误代码:', error.code);
    console.error('错误详情:', error);

    results.push({
      test: '测试3：sslmode=require',
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  return results;
}
