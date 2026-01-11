/**
 * 数据库连接管理
 * 基于环境变量配置数据库连接
 */
import { Pool, PoolConfig } from 'pg';

let pool: Pool | null = null;

/**
 * 获取数据库连接池
 */
export function getPool(): Pool {
  if (!pool) {
    const config: PoolConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'fanqie_ai',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    pool = new Pool(config);

    // 监听连接错误
    pool.on('error', (err) => {
      console.error('数据库连接池错误:', err);
    });
  }

  return pool;
}

/**
 * 关闭数据库连接池
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * 测试数据库连接
 */
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return false;
  }
}
