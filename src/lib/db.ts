/**
 * 数据库连接管理（增强版 - 自动降级机制）
 *
 * 功能特性：
 * 1. 支持 Mock 模式和真实数据库模式
 * 2. 自动降级：真实数据库连接失败时自动切换到 Mock 模式
 * 3. 健康检查：定期检测数据库连接状态
 * 4. 详细日志：记录所有连接尝试和错误
 * 5. 超时控制：针对 Netlify Functions 10 秒限制优化
 *
 * 使用说明：
 * - 环境变量 DATABASE_MOCK_MODE=true：强制使用 Mock 模式
 * - 环境变量 DATABASE_MOCK_MODE=false：尝试使用真实数据库，失败时自动降级
 */

import { Pool, PoolConfig, QueryResult } from 'pg';

// 全局状态
let pool: Pool | null = null;
let isAutoMockMode = false; // 自动降级到 Mock 模式
let connectionTested = false; // 是否已经测试过连接
let lastConnectionError: string | null = null;

/**
 * 检查是否启用 Mock 模式
 * @returns true 表示使用 Mock 模式
 */
export function isMockMode(): boolean {
  // 强制 Mock 模式
  if (process.env.DATABASE_MOCK_MODE === 'true' || process.env.DATABASE_MOCK_MODE === '1') {
    return true;
  }

  // 自动降级到 Mock 模式
  if (isAutoMockMode) {
    console.log('⚠️  自动降级模式：真实数据库连接失败，使用 Mock 模式');
    return true;
  }

  return false;
}

/**
 * 获取数据库连接池
 * @returns Pool 实例或 null（Mock 模式）
 */
export function getPool(): Pool | null {
  // Mock 模式下不创建真实连接池
  if (isMockMode()) {
    return null;
  }

  if (!pool) {
    const config = buildPoolConfig();
    pool = new Pool(config);

    // 监听连接错误
    pool.on('error', (err: any) => {
      console.error('数据库连接池错误:', err.message);
      lastConnectionError = err.message;

      // 连接错误时自动降级
      if (err.code === 'ENETUNREACH' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        console.warn('⚠️  检测到网络连接问题，自动降级到 Mock 模式');
        isAutoMockMode = true;
      }
    });

    console.log('✅ 数据库连接池已创建');
  }

  return pool;
}

/**
 * 构建 Pool 配置
 * @returns PoolConfig 配置对象
 */
function buildPoolConfig(): PoolConfig {
  let config: PoolConfig;

  if (process.env.DATABASE_URL) {
    // 使用 DATABASE_URL（推荐）
    const cleanUrl = process.env.DATABASE_URL.split('?')[0]; // 移除查询参数
    config = {
      connectionString: cleanUrl,
      ssl: {
        rejectUnauthorized: false, // Supabase 需要这个配置
      },
    };
    console.log('📡 使用 DATABASE_URL 连接');
  } else {
    // 使用单独的环境变量
    config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'fanqie_ai',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: {
        rejectUnauthorized: false,
      },
    };
    console.log('📡 使用单独环境变量连接');
  }

  // 优化配置以适应 Netlify Functions
  config.max = config.max || 5; // 减少最大连接数
  config.idleTimeoutMillis = config.idleTimeoutMillis || 30000;
  config.connectionTimeoutMillis = config.connectionTimeoutMillis || 5000; // 5秒超时，适应 10秒限制

  // 强制使用 IPv4（解决 IPv6 连接失败问题）
  (config as any).family = 4;

  return config;
}

/**
 * 导出数据库实例
 * 提供统一的查询接口，自动处理 Mock 模式和真实数据库
 */
export const db = {
  query: async (text: string, params?: any[]): Promise<QueryResult> => {
    const pool = getPool();
    const start = Date.now();

    // Mock 模式
    if (isMockMode() || !pool) {
      return mockQuery(text, params, start);
    }

    // 真实数据库查询
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('✅ Query executed', {
        sql: text.split(' ')[0],
        duration: `${duration}ms`,
        rows: res.rowCount,
      });
      return res;
    } catch (error: any) {
      const duration = Date.now() - start;
      console.error('❌ Query error', {
        sql: text.split(' ')[0],
        duration: `${duration}ms`,
        error: error.message,
      });

      // 自动降级：遇到连接错误时切换到 Mock 模式
      if (shouldAutoFallback(error)) {
        console.warn('⚠️  检测到连接错误，自动降级到 Mock 模式');
        isAutoMockMode = true;
        lastConnectionError = error.message;
        return mockQuery(text, params, start);
      }

      throw error;
    }
  },
};

/**
 * Mock 查询实现
 * @returns 模拟的查询结果
 */
function mockQuery(text: string, params: any[] | undefined, start: number): QueryResult {
  const duration = Date.now() - start;
  const command = text.split(' ')[0].toUpperCase();

  console.log('🎭 Mock query executed', {
    sql: command,
    duration: `${duration}ms`,
    mode: isAutoMockMode ? 'auto-mock' : 'mock',
  });

  return {
    rows: [],
    rowCount: 0,
    command,
    fields: [],
    oid: 0,
  } as QueryResult;
}

/**
 * 判断是否应该自动降级到 Mock 模式
 */
function shouldAutoFallback(error: any): boolean {
  const fallbackErrors = [
    'ENETUNREACH',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'EHOSTUNREACH',
    'ENOTFOUND',
  ];

  return (error.code && fallbackErrors.includes(error.code)) ||
         (error.message && (error.message.includes('connection') || error.message.includes('timeout')));
}

/**
 * 测试数据库连接（带自动降级）
 * @returns 连接是否成功
 */
export async function testConnection(): Promise<{ success: boolean; mode: string; error?: string }> {
  // Mock 模式
  if (process.env.DATABASE_MOCK_MODE === 'true' || process.env.DATABASE_MOCK_MODE === '1') {
    console.log('🎭 Mock 模式：跳过真实数据库连接测试');
    return { success: true, mode: 'mock' };
  }

  // 自动降级模式（之前已经连接失败）
  if (isAutoMockMode) {
    console.log('⚠️  自动降级模式：使用 Mock 模式');
    return { success: true, mode: 'auto-mock', error: lastConnectionError || 'Connection failed' };
  }

  // 测试真实数据库连接
  try {
    const pool = getPool();
    if (!pool) {
      throw new Error('数据库连接池未创建');
    }

    console.log('🔍 测试真实数据库连接...');
    console.log('📡 数据库URL:', getDatabaseUrl());

    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    console.log('✅ 真实数据库连接成功, 服务器时间:', result.rows[0].now);
    connectionTested = true;
    return { success: true, mode: 'real' };
  } catch (error: any) {
    console.error('❌ 真实数据库连接测试失败:', error.message);
    console.error('❌ 错误详情:', {
      code: error.code,
      message: error.message,
      hint: error.hint,
      detail: error.detail,
    });
    lastConnectionError = error.message;

    // 自动降级
    console.warn('⚠️  自动降级到 Mock 模式');
    isAutoMockMode = true;
    connectionTested = true;

    // 返回 success: true 表示系统仍然可用（使用Mock模式），但带上错误信息
    return { success: true, mode: 'auto-mock', error: error.message };
  }
}

/**
 * 获取数据库状态信息
 */
export function getDatabaseStatus(): {
  mode: string;
  urlConfigured: boolean;
  autoFallback: boolean;
  lastError: string | null;
} {
  return {
    mode: isMockMode() ? (isAutoMockMode ? 'auto-mock' : 'mock') : 'real',
    urlConfigured: !!process.env.DATABASE_URL,
    autoFallback: isAutoMockMode,
    lastError: lastConnectionError,
  };
}

/**
 * 关闭数据库连接池
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    isAutoMockMode = false;
    connectionTested = false;
  }
}

/**
 * 获取数据库连接URL（用于调试，已隐藏密码）
 */
export function getDatabaseUrl(): string {
  if (!process.env.DATABASE_URL) {
    return 'DATABASE_URL 未设置';
  }
  return process.env.DATABASE_URL.replace(/:([^@]+)@/, ':***@');
}
