import { eq, and, SQL, desc, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { securityLogs, insertSecurityLogSchema } from "./shared/schema";
import type { SecurityLog, InsertSecurityLog } from "./shared/schema";

/**
 * 安全日志管理器
 */
export class SecurityLogManager {
	/**
	 * 创建安全日志
	 */
	async createSecurityLog(data: InsertSecurityLog): Promise<SecurityLog> {
		const db = await getDb();
		const validated = insertSecurityLogSchema.parse(data);
		const [log] = await db.insert(securityLogs).values(validated).returning();
		return log;
	}

	/**
	 * 获取安全日志列表
	 */
	async getSecurityLogs(options: {
		skip?: number;
		limit?: number;
		filters?: Partial<Pick<SecurityLog, 'userId' | 'action' | 'status'>>;
	} = {}): Promise<SecurityLog[]> {
		const { skip = 0, limit = 100, filters = {} } = options;
		const db = await getDb();

		const conditions: SQL[] = [];

		// 精确条件
		if (filters.userId !== undefined && filters.userId !== null) {
			conditions.push(eq(securityLogs.userId, filters.userId));
		}
		if (filters.action !== undefined) {
			conditions.push(eq(securityLogs.action, filters.action));
		}
		if (filters.status !== undefined) {
			conditions.push(eq(securityLogs.status, filters.status));
		}

		let query = db.select().from(securityLogs) as any;
		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		return query.orderBy(desc(securityLogs.createdAt)).limit(limit).offset(skip) as unknown as SecurityLog[];
	}

	/**
	 * 根据ID获取安全日志
	 */
	async getSecurityLogById(id: string): Promise<SecurityLog | null> {
		const db = await getDb();
		const [log] = await db.select().from(securityLogs).where(eq(securityLogs.id, id));
		return log || null;
	}

	/**
	 * 获取用户的安全日志
	 */
	async getLogsByUserId(userId: string, options?: {
		skip?: number;
		limit?: number;
	}): Promise<SecurityLog[]> {
		return this.getSecurityLogs({
			...options,
			filters: { userId },
		});
	}

	/**
	 * 记录登录成功
	 */
	async logLoginSuccess(userId: string, ipAddress?: string, details?: any): Promise<SecurityLog> {
		return this.createSecurityLog({
			userId,
			action: 'LOGIN',
			details,
			ipAddress,
			status: 'SUCCESS',
		});
	}

	/**
	 * 记录登录失败
	 */
	async logLoginFailure(userId: string | undefined, ipAddress?: string, details?: any): Promise<SecurityLog> {
		return this.createSecurityLog({
			userId,
			action: 'LOGIN',
			details,
			ipAddress,
			status: 'FAILURE',
		});
	}

	/**
	 * 记录登出
	 */
	async logLogout(userId: string, ipAddress?: string, details?: any): Promise<SecurityLog> {
		return this.createSecurityLog({
			userId,
			action: 'LOGOUT',
			details,
			ipAddress,
			status: 'SUCCESS',
		});
	}

	/**
	 * 记录密码修改
	 */
	async logPasswordChange(userId: string, ipAddress?: string, details?: any): Promise<SecurityLog> {
		return this.createSecurityLog({
			userId,
			action: 'PASSWORD_CHANGE',
			details,
			ipAddress,
			status: 'SUCCESS',
		});
	}

	/**
	 * 记录资料修改
	 */
	async logProfileUpdate(userId: string, ipAddress?: string, details?: any): Promise<SecurityLog> {
		return this.createSecurityLog({
			userId,
			action: 'PROFILE_UPDATE',
			details,
			ipAddress,
			status: 'SUCCESS',
		});
	}

	/**
	 * 记录会员升级
	 */
	async logMembershipUpgrade(userId: string, ipAddress?: string, details?: any): Promise<SecurityLog> {
		return this.createSecurityLog({
			userId,
			action: 'MEMBERSHIP_UPGRADE',
			details,
			ipAddress,
			status: 'SUCCESS',
		});
	}

	/**
	 * 记录异常访问
	 */
	async logSuspiciousActivity(userId: string | undefined, ipAddress?: string, details?: any): Promise<SecurityLog> {
		return this.createSecurityLog({
			userId,
			action: 'SUSPICIOUS_ACTIVITY',
			details,
			ipAddress,
			status: 'WARNING',
		});
	}

	/**
	 * 获取用户登录历史
	 */
	async getUserLoginHistory(userId: string, limit: number = 20): Promise<SecurityLog[]> {
		return this.getSecurityLogs({
			filters: {
				userId,
				action: 'LOGIN',
				status: 'SUCCESS',
			},
			limit,
		});
	}

	/**
	 * 检查是否有多次登录失败
	 */
	async checkFailedLoginAttempts(userId?: string, ipAddress?: string, minutes: number = 30): Promise<number> {
		const db = await getDb();
		const since = new Date();
		since.setMinutes(since.getMinutes() - minutes);

		const conditions: SQL[] = [
			eq(securityLogs.action, 'LOGIN'),
			eq(securityLogs.status, 'FAILURE'),
			sql`${securityLogs.createdAt} >= ${since}`,
		];

		if (userId !== undefined) {
			conditions.push(eq(securityLogs.userId, userId));
		}

		if (ipAddress !== undefined) {
			conditions.push(eq(securityLogs.ipAddress, ipAddress));
		}

		const logs = await db
			.select()
			.from(securityLogs)
			.where(and(...conditions));

		return logs.length;
	}
}

export const securityLogManager = new SecurityLogManager();
