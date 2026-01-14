/**
 * 数据库连接管理
 * 基于环境变量配置数据库连接
 * 支持两种配置方式：
 * 1. DATABASE_URL（推荐）：postgresql://username:password@host:port/database
 * 2. 单独的环境变量：DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 *
 * Mock模式：如果 DATABASE_MOCK_MODE=true，使用本地文件系统模拟数据库
 */
import { Pool, PoolConfig, QueryResult } from 'pg';
import fs from 'fs/promises';
import path from 'path';

let pool: Pool | null = null;

/**
 * 检查是否启用Mock模式
 */
export function isMockMode(): boolean {
  return process.env.DATABASE_MOCK_MODE === 'true' || process.env.DATABASE_MOCK_MODE === '1';
}

/**
 * 解析DATABASE_URL为连接配置
 */
function parseDatabaseUrl(url: string): PoolConfig {
  console.log('解析DATABASE_URL:', url.replace(/:([^@]+)@/, ':***@')); // 隐藏密码

  // 尝试匹配标准格式：postgresql://user:password@host:port/database
  const match = url.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid DATABASE_URL format. Expected: postgresql://user:password@host:port/database, Got: ${url}`);
  }

  const config: PoolConfig = {
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
    user: match[1],
    password: match[2],
  };

  console.log('解析结果:', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
  });

  return config;
}

/**
 * 获取数据库连接池
 */
export function getPool(): Pool | null {
  // Mock模式下不创建真实连接池
  if (isMockMode()) {
    console.log('Mock模式已启用，跳过真实数据库连接');
    return null;
  }

  if (!pool) {
    let config: PoolConfig;

    // 优先使用DATABASE_URL
    if (process.env.DATABASE_URL) {
      config = {
        connectionString: process.env.DATABASE_URL,
      };
      console.log('使用 DATABASE_URL 连接');
    } else {
      // 回退到单独的环境变量
      config = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'fanqie_ai',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
      };
      console.log('使用单独环境变量连接');
    }

    config.max = config.max || 10;
    config.idleTimeoutMillis = config.idleTimeoutMillis || 30000;
    config.connectionTimeoutMillis = config.connectionTimeoutMillis || 10000; // 增加到10秒，适应Netlify Functions冷启动

    pool = new Pool(config);

    // 监听连接错误
    pool.on('error', (err) => {
      console.error('数据库连接池错误:', err);
    });

    console.log('数据库连接池已创建');
  }

  return pool;
}

/**
 * 导出数据库实例，方便在API路由中使用
 */
export const db = {
  query: async (text: string, params?: any[]): Promise<QueryResult> => {
    const pool = getPool();
    const start = Date.now();

    // Mock模式下返回空结果
    if (isMockMode() || !pool) {
      console.log('Mock模式: 模拟查询执行', { text, params });
      return {
        rows: [],
        rowCount: 0,
        command: text.split(' ')[0],
        fields: [],
        oid: 0,
      } as QueryResult;
    }

    // Netlify Functions 免费版限制 10 秒，不使用重试机制
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Query error', { text, params, error });
      throw error;
    }
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
  // Mock模式下返回true
  if (isMockMode()) {
    console.log('Mock模式: 数据库连接测试跳过');
    return true;
  }

  try {
    const pool = getPool();
    if (!pool) {
      console.error('数据库连接池未创建');
      return false;
    }

    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('数据库连接测试成功');
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return false;
  }
}

/**
 * 获取数据库连接URL（用于调试）
 */
export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || 'DATABASE_URL 未设置';
}
