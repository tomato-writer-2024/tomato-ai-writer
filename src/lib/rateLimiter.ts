/**
 * API请求限流器
 * 防止API滥用和DDoS攻击
 */

interface RateLimitConfig {
  windowMs: number;      // 时间窗口（毫秒）
  maxRequests: number;   // 最大请求数
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

/**
 * 请求限流器类
 */
class RateLimiter {
  private limits: Map<string, RateLimitInfo>;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.limits = new Map();

    // 每分钟清理一次过期的记录
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * 检查是否允许请求
   *
   * @param identifier 请求标识符（IP地址或用户ID）
   * @param config 限流配置
   * @returns 是否允许请求
   */
  check(identifier: string, config: RateLimitConfig): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // 获取或创建该标识符的限流信息
    let info = this.limits.get(identifier);

    if (!info) {
      info = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      this.limits.set(identifier, info);
    }

    // 检查时间窗口是否已过期
    if (now >= info.resetTime) {
      info.count = 0;
      info.resetTime = now + config.windowMs;
    }

    // 增加请求计数
    info.count++;

    // 更新限流信息
    this.limits.set(identifier, info);

    // 计算剩余请求数
    const remaining = Math.max(0, config.maxRequests - info.count);
    const allowed = info.count <= config.maxRequests;

    return {
      allowed,
      remaining,
      resetTime: info.resetTime,
    };
  }

  /**
   * 清理过期的限流记录
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.limits.forEach((info, key) => {
      if (now >= info.resetTime) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.limits.delete(key);
    });
  }

  /**
   * 重置指定标识符的限流
   */
  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  /**
   * 获取当前统计信息
   */
  getStats(): {
    totalIdentifiers: number;
    identifiers: Array<{ identifier: string; count: number; resetTime: number }>;
  } {
    const now = Date.now();
    const identifiers: Array<{ identifier: string; count: number; resetTime: number }> = [];

    this.limits.forEach((info, identifier) => {
      identifiers.push({
        identifier: identifier.substring(0, 10) + '...', // 脱敏处理
        count: info.count,
        resetTime: info.resetTime - now,
      });
    });

    return {
      totalIdentifiers: this.limits.size,
      identifiers: identifiers.slice(0, 10), // 只返回前10个
    };
  }

  /**
   * 清理所有限流记录
   */
  clear(): void {
    this.limits.clear();
  }
}

// 创建全局单例实例
export const rateLimiter = new RateLimiter();

/**
 * 预定义的限流配置
 */
export const RATE_LIMIT_CONFIGS = {
  // 严格限流：用于敏感操作（如登录、注册）
  STRICT: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5,
  },
  // 标准限流：用于常规API
  STANDARD: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 100,
  },
  // 宽松限流：用于读取操作
  LENIENT: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 60,
  },
  // API密钥限流
  API_KEY: {
    windowMs: 24 * 60 * 60 * 1000, // 24小时
    maxRequests: 10000,
  },
} as const;

/**
 * 限流中间件（用于Next.js API Routes）
 *
 * @param request Next.js请求对象
 * @param config 限流配置
 * @returns 限流检查结果
 */
export async function checkRateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<{ allowed: boolean; error?: string; remaining?: number; resetTime?: number }> {
  // 从请求中获取IP地址
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded ? forwarded.split(',')[0].trim() : (realIp || 'unknown');

  // 检查限流
  const result = rateLimiter.check(ip, config);

  if (!result.allowed) {
    const resetMinutes = Math.ceil((result.resetTime - Date.now()) / 1000 / 60);

    return {
      allowed: false,
      error: `请求过于频繁，请在${resetMinutes}分钟后重试`,
      remaining: result.remaining,
      resetTime: result.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: result.remaining,
    resetTime: result.resetTime,
  };
}
