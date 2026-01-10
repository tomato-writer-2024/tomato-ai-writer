/**
 * CSRF保护工具
 * 用于防止跨站请求伪造攻击
 */

import crypto from 'crypto';

/**
 * CSRF令牌存储（内存存储）
 * 生产环境应使用Redis或数据库
 */
interface CsrfTokenInfo {
  token: string;
  expiresAt: number;
  userId?: string;
}

class CsrfProtection {
  private tokens: Map<string, CsrfTokenInfo>;
  private secret: string;
  private tokenExpiry: number; // 令牌有效期（毫秒）
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.tokens = new Map();
    this.secret = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
    this.tokenExpiry = 2 * 60 * 60 * 1000; // 2小时
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // 每5分钟清理一次
  }

  /**
   * 生成CSRF令牌
   *
   * @param userId 用户ID（可选）
   * @param expiry 令牌有效期（毫秒），默认2小时
   * @returns CSRF令牌
   */
  generateToken(userId?: string, expiry: number = this.tokenExpiry): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + expiry;

    this.tokens.set(token, {
      token,
      expiresAt,
      userId,
    });

    return token;
  }

  /**
   * 验证CSRF令牌
   *
   * @param token 要验证的令牌
   * @param userId 用户ID（可选，用于验证令牌是否属于该用户）
   * @returns 是否验证通过
   */
  verifyToken(token: string, userId?: string): boolean {
    const tokenInfo = this.tokens.get(token);

    if (!tokenInfo) {
      return false;
    }

    // 检查令牌是否过期
    if (Date.now() > tokenInfo.expiresAt) {
      this.tokens.delete(token);
      return false;
    }

    // 检查用户ID是否匹配（如果提供）
    if (userId && tokenInfo.userId && tokenInfo.userId !== userId) {
      return false;
    }

    return true;
  }

  /**
   * 使令牌失效
   *
   * @param token 要失效的令牌
   */
  revokeToken(token: string): void {
    this.tokens.delete(token);
  }

  /**
   * 使用户的所有令牌失效
   *
   * @param userId 用户ID
   */
  revokeUserTokens(userId: string): void {
    const tokensToDelete: string[] = [];

    this.tokens.forEach((info, token) => {
      if (info.userId === userId) {
        tokensToDelete.push(token);
      }
    });

    tokensToDelete.forEach((token) => {
      this.tokens.delete(token);
    });
  }

  /**
   * 清理过期的令牌
   */
  private cleanup(): void {
    const now = Date.now();
    const tokensToDelete: string[] = [];

    this.tokens.forEach((info, token) => {
      if (now > info.expiresAt) {
        tokensToDelete.push(token);
      }
    });

    tokensToDelete.forEach((token) => {
      this.tokens.delete(token);
    });
  }

  /**
   * 生成CSRF令牌的加密签名
   * 可选：用于将令牌嵌入到隐藏字段中
   */
  generateSignedToken(userId?: string): { token: string; signature: string } {
    const token = this.generateToken(userId);
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(token)
      .digest('hex');

    return { token, signature };
  }

  /**
   * 验证带签名的CSRF令牌
   */
  verifySignedToken(token: string, signature: string, userId?: string): boolean {
    // 验证签名
    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(token)
      .digest('hex');

    if (signature !== expectedSignature) {
      return false;
    }

    // 验证令牌
    return this.verifyToken(token, userId);
  }

  /**
   * 获取统计信息
   */
  getStats(): { totalTokens: number; expiredTokens: number } {
    const now = Date.now();
    let expiredCount = 0;

    this.tokens.forEach((info) => {
      if (now > info.expiresAt) {
        expiredCount++;
      }
    });

    return {
      totalTokens: this.tokens.size,
      expiredTokens: expiredCount,
    };
  }
}

// 创建全局单例实例
export const csrfProtection = new CsrfProtection();

/**
 * 从请求中提取CSRF令牌
 * 支持从Header或Cookie中提取
 */
export function extractCsrfToken(request: Request): string | null {
  // 从Header中提取
  const headerToken = request.headers.get('x-csrf-token');
  if (headerToken) {
    return headerToken;
  }

  // 从Cookie中提取
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    return cookies['csrf_token'] || null;
  }

  return null;
}

/**
 * 检查请求是否需要CSRF保护
 * 某些请求类型（如GET、HEAD、OPTIONS）通常不需要CSRF保护
 */
export function requiresCsrfProtection(request: Request): boolean {
  const method = request.method.toUpperCase();
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  return !safeMethods.includes(method);
}

/**
 * CSRF验证中间件（用于Next.js API Routes）
 *
 * @param request Next.js请求对象
 * @param userId 用户ID（可选）
 * @returns 验证结果
 */
export async function verifyCsrfToken(
  request: Request,
  userId?: string
): Promise<{ valid: boolean; error?: string }> {
  // 检查是否需要CSRF保护
  if (!requiresCsrfProtection(request)) {
    return { valid: true };
  }

  // 提取令牌
  const token = extractCsrfToken(request);

  if (!token) {
    return {
      valid: false,
      error: '缺少CSRF令牌',
    };
  }

  // 验证令牌
  const isValid = csrfProtection.verifyToken(token, userId);

  if (!isValid) {
    return {
      valid: false,
      error: 'CSRF令牌无效或已过期',
    };
  }

  return { valid: true };
}
