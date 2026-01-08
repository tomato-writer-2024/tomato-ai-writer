import { eq, and, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  usageLogs,
  securityLogs,
  insertUsageLogSchema,
  insertSecurityLogSchema,
  type InsertUsageLog,
  type InsertSecurityLog,
} from "./shared/schema";

/**
 * 认证和日志管理器
 */
export class AuthManager {
  /**
   * 记录使用日志
   */
  async logUsage(data: InsertUsageLog): Promise<void> {
    const db = await getDb();
    const validated = insertUsageLogSchema.parse(data);
    await db.insert(usageLogs).values(validated);
  }

  /**
   * 获取用户的使用日志
   */
  async getUserUsageLogs(userId: string, options: {
    skip?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    action?: string;
  } = {}): Promise<any[]> {
    const {
      skip = 0,
      limit = 100,
      startDate,
      endDate,
      action,
    } = options;
    const db = await getDb();

    const results = await db
      .select()
      .from(usageLogs)
      .where(eq(usageLogs.userId, userId))
      .orderBy(desc(usageLogs.createdAt))
      .limit(limit)
      .offset(skip);

    return results;
  }

  /**
   * 记录安全日志
   */
  async logSecurityEvent(data: InsertSecurityLog): Promise<void> {
    const db = await getDb();
    const validated = insertSecurityLogSchema.parse(data);
    await db.insert(securityLogs).values(validated);
  }

  /**
   * 获取用户的安全日志
   */
  async getUserSecurityLogs(userId: string, options: {
    skip?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    action?: string;
  } = {}): Promise<any[]> {
    const {
      skip = 0,
      limit = 100,
      startDate,
      endDate,
      action,
    } = options;
    const db = await getDb();

    const results = await db
      .select()
      .from(securityLogs)
      .where(eq(securityLogs.userId, userId))
      .orderBy(desc(securityLogs.createdAt))
      .limit(limit)
      .offset(skip);

    return results;
  }

  /**
   * 获取所有安全日志（管理员）
   */
  async getAllSecurityLogs(options: {
    skip?: number;
    limit?: number;
    filters?: {
      userId?: string;
      action?: string;
      status?: string;
    };
  } = {}): Promise<any[]> {
    const {
      skip = 0,
      limit = 100,
      filters = {},
    } = options;
    const db = await getDb();

    let results: any[] = [];

    if (filters.userId) {
      results = await db
        .select()
        .from(securityLogs)
        .where(eq(securityLogs.userId, filters.userId))
        .orderBy(desc(securityLogs.createdAt))
        .limit(limit)
        .offset(skip);
    } else {
      results = await db
        .select()
        .from(securityLogs)
        .orderBy(desc(securityLogs.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return results;
  }

  /**
   * 统计用户的使用次数
   */
  async countUserUsage(userId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    action?: string;
  }): Promise<number> {
    const db = await getDb();
    // 简化实现，实际应该使用更精确的查询
    let query = db
      .select({ count: usageLogs.id })
      .from(usageLogs)
      .where(eq(usageLogs.userId, userId));

    const results = await query;
    return results.length;
  }

  /**
   * 检测异常登录行为
   */
  async detectAbnormalLogin(userId: string, ipAddress: string): Promise<{
    isAbnormal: boolean;
    reason?: string;
  }> {
    const db = await getDb();

    // 获取最近1小时的登录尝试
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAttempts = await db
      .select()
      .from(securityLogs)
      .where(eq(securityLogs.userId, userId));

    // 检查是否有大量失败的登录尝试
    const failedAttempts = recentAttempts.filter(
      (log) => log.status === "FAILED" && new Date(log.createdAt) > oneHourAgo
    );

    if (failedAttempts.length >= 5) {
      return {
        isAbnormal: true,
        reason: `检测到大量失败登录尝试（${failedAttempts.length}次）`,
      };
    }

    return { isAbnormal: false };
  }
}

export const authManager = new AuthManager();
