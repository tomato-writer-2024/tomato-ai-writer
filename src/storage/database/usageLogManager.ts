import { eq, and, SQL, desc, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { usageLogs, insertUsageLogSchema } from "./shared/schema";
import type { UsageLog, InsertUsageLog } from "./shared/schema";

/**
 * 使用日志管理器
 */
export class UsageLogManager {
	/**
	 * 创建使用日志
	 */
	async createUsageLog(data: InsertUsageLog): Promise<UsageLog> {
		const db = await getDb();
		const validated = insertUsageLogSchema.parse(data);
		const [log] = await db.insert(usageLogs).values(validated).returning();
		return log;
	}

	/**
	 * 获取使用日志列表
	 */
	async getUsageLogs(options: {
		skip?: number;
		limit?: number;
		filters?: Partial<Pick<UsageLog, 'userId' | 'action' | 'workId'>>;
	} = {}): Promise<UsageLog[]> {
		const { skip = 0, limit = 100, filters = {} } = options;
		const db = await getDb();

		const conditions: SQL[] = [];

		// 精确条件
		if (filters.userId !== undefined) {
			conditions.push(eq(usageLogs.userId, filters.userId));
		}
		if (filters.action !== undefined) {
			conditions.push(eq(usageLogs.action, filters.action));
		}
		if (filters.workId !== undefined && filters.workId !== null) {
			conditions.push(eq(usageLogs.workId, filters.workId));
		}

		let query = db.select().from(usageLogs);
		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		return query.orderBy(desc(usageLogs.createdAt)).limit(limit).offset(skip);
	}

	/**
	 * 根据ID获取日志
	 */
	async getUsageLogById(id: string): Promise<UsageLog | null> {
		const db = await getDb();
		const [log] = await db.select().from(usageLogs).where(eq(usageLogs.id, id));
		return log || null;
	}

	/**
	 * 获取用户的使用日志
	 */
	async getLogsByUserId(userId: string, options?: {
		skip?: number;
		limit?: number;
		action?: string;
	}): Promise<UsageLog[]> {
		return this.getUsageLogs({
			...options,
			filters: {
				userId,
				...(options?.action ? { action: options.action } : {}),
			},
		});
	}

	/**
	 * 获取用户今日使用统计
	 */
	async getUserDailyStats(userId: string): Promise<{
		totalActions: number;
		actionCounts: Record<string, number>;
	}> {
		const db = await getDb();
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const logs = await db
			.select()
			.from(usageLogs)
			.where(
				and(
					eq(usageLogs.userId, userId),
					sql`${usageLogs.createdAt} >= ${today}`
				)
			);

		const actionCounts: Record<string, number> = {};
		logs.forEach(log => {
			actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
		});

		return {
			totalActions: logs.length,
			actionCounts,
		};
	}

	/**
	 * 获取用户本月使用统计
	 */
	async getUserMonthlyStats(userId: string): Promise<{
		totalActions: number;
		actionCounts: Record<string, number>;
	}> {
		const db = await getDb();
		const monthStart = new Date();
		monthStart.setDate(1);
		monthStart.setHours(0, 0, 0, 0);

		const logs = await db
			.select()
			.from(usageLogs)
			.where(
				and(
					eq(usageLogs.userId, userId),
					sql`${usageLogs.createdAt} >= ${monthStart}`
				)
			);

		const actionCounts: Record<string, number> = {};
		logs.forEach(log => {
			actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
		});

		return {
			totalActions: logs.length,
			actionCounts,
		};
	}

	/**
	 * 记录AI生成操作
	 */
	async logAIGeneration(userId: string, workId: string | undefined, metadata?: any): Promise<UsageLog> {
		return this.createUsageLog({
			userId,
			action: 'AI_GENERATION',
			workId,
			metadata,
		});
	}

	/**
	 * 记录文件导入操作
	 */
	async logFileImport(userId: string, workId: string | undefined, metadata?: any): Promise<UsageLog> {
		return this.createUsageLog({
			userId,
			action: 'FILE_IMPORT',
			workId,
			metadata,
		});
	}

	/**
	 * 记录文件导出操作
	 */
	async logFileExport(userId: string, workId: string | undefined, metadata?: any): Promise<UsageLog> {
		return this.createUsageLog({
			userId,
			action: 'FILE_EXPORT',
			workId,
			metadata,
		});
	}

	/**
	 * 记录会员升级操作
	 */
	async logMembershipUpgrade(userId: string, metadata?: any): Promise<UsageLog> {
		return this.createUsageLog({
			userId,
			action: 'MEMBERSHIP_UPGRADE',
			metadata,
		});
	}
}

export const usageLogManager = new UsageLogManager();
