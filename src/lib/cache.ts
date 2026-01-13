/**
 * 缓存策略实现
 *
 * 实现多层缓存策略：
 * 1. 内存缓存（开发环境）
 * 2. Redis缓存（生产环境，需要配置）
 * 3. 浏览器缓存（通过HTTP头）
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, value: T, ttl: number = 60 * 1000): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// 内存缓存实例（开发环境使用）
const memoryCache = new MemoryCache();

// 每小时清理一次过期缓存
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup();
  }, 60 * 60 * 1000);
}

/**
 * Redis缓存配置（生产环境使用）
 */
interface RedisCacheConfig {
  enabled: boolean;
  url?: string;
  password?: string;
  maxRetries?: number;
}

/**
 * 缓存策略配置
 */
export const CACHE_CONFIG = {
  // 不同类型数据的默认TTL（毫秒）
  TTL: {
    // 用户信息：5分钟
    USER_INFO: 5 * 60 * 1000,
    // 小说详情：10分钟
    NOVEL_DETAILS: 10 * 60 * 1000,
    // 章节内容：30分钟
    CHAPTER_CONTENT: 30 * 60 * 1000,
    // 素材库：1小时
    MATERIALS: 60 * 60 * 1000,
    // 统计数据：5分钟
    STATS: 5 * 60 * 1000,
    // 系统配置：1小时
    SYSTEM_CONFIG: 60 * 60 * 1000,
    // 默认：1分钟
    DEFAULT: 60 * 1000,
  },

  // 缓存键前缀
  KEYS: {
    USER: 'user',
    NOVEL: 'novel',
    CHAPTER: 'chapter',
    MATERIAL: 'material',
    STATS: 'stats',
    SYSTEM: 'system',
  },
} as const;

/**
 * 生成缓存键
 */
export function generateCacheKey(prefix: string, parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

/**
 * 获取缓存
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    // 开发环境使用内存缓存
    if (process.env.NODE_ENV === 'development') {
      return memoryCache.get<T>(key);
    }

    // 生产环境使用Redis（如果已配置）
    if (process.env.REDIS_URL) {
      // TODO: 集成Redis客户端
      // const redis = await getRedisClient();
      // const value = await redis.get(key);
      // return value ? JSON.parse(value) : null;
    }

    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * 设置缓存
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = CACHE_CONFIG.TTL.DEFAULT
): Promise<void> {
  try {
    // 开发环境使用内存缓存
    if (process.env.NODE_ENV === 'development') {
      memoryCache.set(key, value, ttl);
      return;
    }

    // 生产环境使用Redis（如果已配置）
    if (process.env.REDIS_URL) {
      // TODO: 集成Redis客户端
      // const redis = await getRedisClient();
      // await redis.setex(key, Math.floor(ttl / 1000), JSON.stringify(value));
      return;
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * 删除缓存
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    // 开发环境使用内存缓存
    if (process.env.NODE_ENV === 'development') {
      memoryCache.delete(key);
      return;
    }

    // 生产环境使用Redis（如果已配置）
    if (process.env.REDIS_URL) {
      // TODO: 集成Redis客户端
      // const redis = await getRedisClient();
      // await redis.del(key);
      return;
    }
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * 清空缓存（按前缀）
 */
export async function clearCache(prefix: string): Promise<void> {
  try {
    // 开发环境使用内存缓存
    if (process.env.NODE_ENV === 'development') {
      // 遍历所有缓存键，删除匹配前缀的
      const keys = Array.from((memoryCache as any).cache.keys()) as string[];
      for (const key of keys) {
        if (key.startsWith(prefix)) {
          memoryCache.delete(key);
        }
      }
      return;
    }

    // 生产环境使用Redis（如果已配置）
    if (process.env.REDIS_URL) {
      // TODO: 集成Redis客户端
      // const redis = await getRedisClient();
      // const keys = await redis.keys(`${prefix}*`);
      // if (keys.length > 0) {
      //   await redis.del(...keys);
      // }
      return;
    }
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

/**
 * 带缓存的函数装饰器
 */
export function withCache<T>(
  keyPrefix: string,
  ttl: number = CACHE_CONFIG.TTL.DEFAULT
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 生成缓存键
      const key = generateCacheKey(
        keyPrefix,
        [propertyKey, ...args.map(arg => JSON.stringify(arg))]
      );

      // 尝试从缓存获取
      const cached = await getCache<T>(key);
      if (cached) {
        return cached;
      }

      // 执行原函数
      const result = await originalMethod.apply(this, args);

      // 缓存结果
      await setCache(key, result, ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * API响应缓存中间件
 */
export function withApiCache(ttl: number = CACHE_CONFIG.TTL.DEFAULT) {
  return async (
    request: Request,
    handler: () => Promise<Response>
  ): Promise<Response> => {
    // 只缓存GET请求
    if (request.method !== 'GET') {
      return handler();
    }

    // 生成缓存键
    const url = new URL(request.url);
    const key = generateCacheKey('api', [
      url.pathname,
      url.searchParams.toString(),
    ]);

    // 尝试从缓存获取
    const cached = await getCache<{ response: Response; data: any }>(key);
    if (cached) {
      // 返回缓存的响应，添加缓存头
      return new Response(JSON.stringify(cached.data), {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'Cache-Control': `public, max-age=${Math.floor(ttl / 1000)}`,
        },
      });
    }

    // 执行handler
    const response = await handler();

    // 只缓存成功的响应
    if (response.ok) {
      const data = await response.clone().json();
      await setCache(key, { response, data }, ttl);

      // 添加缓存头
      const headers = new Headers(response.headers);
      headers.set('X-Cache', 'MISS');
      headers.set('Cache-Control', `public, max-age=${Math.floor(ttl / 1000)}`);

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers,
      });
    }

    return response;
  };
}

export { memoryCache };
