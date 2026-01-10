/**
 * 内存缓存系统
 * 用于提升API响应速度，减少重复计算和数据库查询
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.cache = new Map();
    this.cleanupInterval = null;

    // 每分钟清理一次过期缓存
    this.startCleanup();
  }

  /**
   * 启动清理任务
   */
  private startCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // 每分钟清理一次
  }

  /**
   * 清理过期缓存
   */
  private cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
    }
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒），默认1小时
   */
  public set<T>(key: string, value: T, ttl: number = 3600): void {
    const now = Date.now();
    const expiresAt = now + ttl * 1000;

    this.cache.set(key, {
      value,
      timestamp: now,
      expiresAt,
    });
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值，如果不存在或已过期则返回null
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();

    // 检查是否过期
    if (entry.expiresAt < now) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    const now = Date.now();

    if (entry.expiresAt < now) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 清空所有缓存
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * 获取所有缓存键
   */
  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取缓存统计信息
   */
  public getStats(): {
    size: number;
    keys: string[];
    entries: Array<{ key: string; timestamp: number; expiresAt: number; ttl: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      timestamp: entry.timestamp,
      expiresAt: entry.expiresAt,
      ttl: Math.max(0, Math.floor((entry.expiresAt - now) / 1000)),
    }));

    return {
      size: this.cache.size,
      keys: this.keys(),
      entries,
    };
  }

  /**
   * 获取或设置缓存（如果不存在则通过函数获取）
   */
  public async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);

    return value;
  }

  /**
   * 批量删除缓存（支持通配符）
   */
  public deletePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let deleted = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * 停止清理任务
   */
  public stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// 导出单例实例
export const cache = new MemoryCache();

/**
 * 缓存配置
 */
export const CACHE_CONFIG = {
  // 用户信息缓存
  user: {
    ttl: 300, // 5分钟
  },

  // 小说信息缓存
  novel: {
    ttl: 600, // 10分钟
  },

  // 章节信息缓存
  chapter: {
    ttl: 300, // 5分钟
  },

  // 双视角评分缓存
  rating: {
    ttl: 86400, // 24小时
  },

  // 提示词缓存
  prompt: {
    ttl: 3600, // 1小时
  },

  // 测试结果缓存
  testResult: {
    ttl: 3600, // 1小时
  },

  // API响应缓存
  apiResponse: {
    ttl: 60, // 1分钟
  },
};

/**
 * 生成缓存键
 */
export function generateCacheKey(
  prefix: string,
  parts: (string | number | null | undefined)[]
): string {
  const validParts = parts.filter(p => p !== null && p !== undefined) as (string | number)[];
  return `${prefix}:${validParts.join(':')}`;
}

/**
 * 缓存装饰器（用于异步函数）
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = 3600
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>): Promise<ReturnType<T>> {
      const key = keyGenerator(...args);
      const cached = cache.get<ReturnType<T>>(key);

      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(key, result, ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * 清理用户相关缓存
 */
export function clearUserCache(userId: string): void {
  const patterns = [
    `user:${userId}:*`,
    `novel:*:userId:${userId}`,
    `chapter:*:userId:${userId}`,
    `rating:*:userId:${userId}`,
  ];

  for (const pattern of patterns) {
    cache.deletePattern(pattern);
  }
}

/**
 * 清理小说相关缓存
 */
export function clearNovelCache(novelId: string): void {
  const patterns = [
    `novel:${novelId}:*`,
    `chapter:*:novelId:${novelId}`,
    `rating:*:novelId:${novelId}`,
  ];

  for (const pattern of patterns) {
    cache.deletePattern(pattern);
  }
}

/**
 * 清理章节相关缓存
 */
export function clearChapterCache(chapterId: string): void {
  const patterns = [
    `chapter:${chapterId}:*`,
    `rating:*:chapterId:${chapterId}`,
  ];

  for (const pattern of patterns) {
    cache.deletePattern(pattern);
  }
}

/**
 * 缓存命中率统计
 */
class CacheStats {
  private hits: number = 0;
  private misses: number = 0;

  public hit(): void {
    this.hits++;
  }

  public miss(): void {
    this.misses++;
  }

  public getHitRate(): number {
    const total = this.hits + this.misses;
    if (total === 0) {
      return 0;
    }
    return (this.hits / total) * 100;
  }

  public getStats(): { hits: number; misses: number; hitRate: number } {
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate(),
    };
  }

  public reset(): void {
    this.hits = 0;
    this.misses = 0;
  }
}

export const cacheStats = new CacheStats();

/**
 * 包装缓存操作，自动统计命中率
 */
export function cachedWithStats<T>(key: string, factory: () => T, ttl?: number): T {
  const cached = cache.get<T>(key);

  if (cached !== null) {
    cacheStats.hit();
    return cached;
  }

  cacheStats.miss();
  const result = factory();

  if (ttl !== undefined) {
    cache.set(key, result, ttl);
  } else {
    cache.set(key, result);
  }

  return result;
}
