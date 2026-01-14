/**
 * 数据库连接管理
 * 基于环境变量配置数据库连接
 * 支持两种配置方式：
 * 1. DATABASE_URL（推荐）：postgresql://username:password@host:port/database
 * 2. 单独的环境变量：DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 */
import { Pool, PoolConfig, QueryResult } from 'pg';

let pool: Pool | null = null;

/**
 * 解析DATABASE_URL为连接配置
 */
function parseDatabaseUrl(url: string): PoolConfig {
  const match = url.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  
  return {
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
    user: match[1],
    password: match[2],
  };
}

/**
 * 获取数据库连接池
 */
export function getPool(): Pool {
  if (!pool) {
    let config: PoolConfig;

    // 优先使用DATABASE_URL
    if (process.env.DATABASE_URL) {
      config = parseDatabaseUrl(process.env.DATABASE_URL);
    } else {
      // 回退到单独的环境变量
      config = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'fanqie_ai',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
      };
    }

    config.max = config.max || 10;
    config.idleTimeoutMillis = config.idleTimeoutMillis || 30000;
    config.connectionTimeoutMillis = config.connectionTimeoutMillis || 10000; // 增加到10秒，适应Netlify Functions冷启动

    pool = new Pool(config);

    // 监听连接错误
    pool.on('error', (err) => {
      console.error('数据库连接池错误:', err);
    });

    console.log('数据库连接池已创建:', {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
    });
  }

  return pool;
}

/**
 * 重试函数
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`数据库操作失败 (尝试 ${i + 1}/${maxRetries}):`, error);

      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`等待 ${delay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * 导出数据库实例，方便在API路由中使用
 */
export const db = {
  query: async (text: string, params?: any[]): Promise<QueryResult> => {
    const pool = getPool();
    const start = Date.now();

    return retryWithBackoff(async () => {
      try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
      } catch (error) {
        console.error('Query error', { text, params, error });
        throw error;
      }
    }, 3, 1000);
  },
};

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
    console.error('数据库连接测试测试失败:', error);
    return false;
  }
}
