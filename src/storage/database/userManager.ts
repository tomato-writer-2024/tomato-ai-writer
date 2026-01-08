import { eq, and, SQL, like, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { users, insertUserSchema, updateUserSchema } from "./shared/schema";
import type { User, InsertUser, UpdateUser } from "./shared/schema";

/**
 * 用户管理器
 */
export class UserManager {
	/**
	 * 创建用户
	 */
	async createUser(data: InsertUser): Promise<User> {
		const db = await getDb();
		const validated = insertUserSchema.parse(data);
		const [user] = await db.insert(users).values(validated).returning();
		return user;
	}

	/**
	 * 获取用户列表
	 */
	async getUsers(options: {
		skip?: number;
		limit?: number;
		filters?: Partial<Pick<User, 'id' | 'username' | 'email' | 'membershipLevel' | 'isActive' | 'isBanned'>>;
		searchQuery?: string;
	} = {}): Promise<User[]> {
		const { skip = 0, limit = 100, filters = {}, searchQuery } = options;
		const db = await getDb();

		const conditions: SQL[] = [];

		// 精确条件
		if (filters.id !== undefined) {
			conditions.push(eq(users.id, filters.id));
		}
		if (filters.username !== undefined && filters.username !== null) {
			conditions.push(eq(users.username, filters.username));
		}
		if (filters.email !== undefined) {
			conditions.push(eq(users.email, filters.email));
		}
		if (filters.membershipLevel !== undefined) {
			conditions.push(eq(users.membershipLevel, filters.membershipLevel));
		}
		if (filters.isActive !== undefined) {
			conditions.push(eq(users.isActive, filters.isActive));
		}
		if (filters.isBanned !== undefined) {
			conditions.push(eq(users.isBanned, filters.isBanned));
		}

		// 搜索查询（模糊匹配用户名和邮箱）
		if (searchQuery) {
			conditions.push(
				sql`(${like(users.username, `%${searchQuery}%`)} OR ${like(users.email, `%${searchQuery}%`)})`
			);
		}

		const query = db.select().from(users);
		if (conditions.length > 0) {
			query.where(and(...conditions));
		}

		return query.limit(limit).offset(skip);
	}

	/**
	 * 根据ID获取用户
	 */
	async getUserById(id: string): Promise<User | null> {
		const db = await getDb();
		const [user] = await db.select().from(users).where(eq(users.id, id));
		return user || null;
	}

	/**
	 * 根据邮箱获取用户
	 */
	async getUserByEmail(email: string): Promise<User | null> {
		const db = await getDb();
		const [user] = await db.select().from(users).where(eq(users.email, email));
		return user || null;
	}

	/**
	 * 更新用户
	 */
	async updateUser(id: string, data: UpdateUser): Promise<User | null> {
		const db = await getDb();
		const validated = updateUserSchema.parse(data);
		const [user] = await db
			.update(users)
			.set({ ...validated, updatedAt: new Date().toISOString() })
			.where(eq(users.id, id))
			.returning();
		return user || null;
	}

	/**
	 * 删除用户（软删除）
	 */
	async deleteUser(id: string): Promise<boolean> {
		const db = await getDb();
		const result = await db
			.update(users)
			.set({ isActive: false, updatedAt: new Date().toISOString() })
			.where(eq(users.id, id));
		return (result.rowCount ?? 0) > 0;
	}

	/**
	 * 增加每日使用次数
	 */
	async incrementDailyUsage(userId: string): Promise<void> {
		const db = await getDb();
		await db
			.update(users)
			.set({
				dailyUsageCount: sql`${users.dailyUsageCount} + 1`,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(users.id, userId));
	}

	/**
	 * 增加每月使用次数
	 */
	async incrementMonthlyUsage(userId: string): Promise<void> {
		const db = await getDb();
		await db
			.update(users)
			.set({
				monthlyUsageCount: sql`${users.monthlyUsageCount} + 1`,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(users.id, userId));
	}

	/**
	 * 更新存储使用量
	 */
	async updateStorageUsed(userId: string, sizeDelta: number): Promise<void> {
		const db = await getDb();
		await db
			.update(users)
			.set({
				storageUsed: sql`${users.storageUsed} + ${sizeDelta}`,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(users.id, userId));
	}

	/**
	 * 重置每日使用次数
	 */
	async resetDailyUsage(userId: string): Promise<void> {
		const db = await getDb();
		await db
			.update(users)
			.set({
				dailyUsageCount: 0,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(users.id, userId));
	}

	/**
	 * 重置每月使用次数
	 */
	async resetMonthlyUsage(userId: string): Promise<void> {
		const db = await getDb();
		await db
			.update(users)
			.set({
				monthlyUsageCount: 0,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(users.id, userId));
	}

	/**
	 * 检查会员是否过期
	 */
	async checkMembershipExpiry(userId: string): Promise<boolean> {
		const user = await this.getUserById(userId);
		if (!user || user.membershipLevel === 'FREE') {
			return false;
		}
		if (!user.membershipExpireAt) {
			return true; // 永久会员
		}
		return new Date(user.membershipExpireAt) < new Date();
	}

	/**
	 * 升级会员
	 */
	async upgradeMembership(userId: string, level: string, expireAt: Date | null): Promise<User | null> {
		return this.updateUser(userId, {
			membershipLevel: level as any,
			membershipExpireAt: expireAt ? expireAt.toISOString() : null,
		});
	}

	/**
	 * 更新最后登录时间
	 */
	async updateLastLogin(userId: string): Promise<void> {
		const db = await getDb();
		await db
			.update(users)
			.set({
				lastLoginAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})
			.where(eq(users.id, userId));
	}

	/**
	 * 封禁用户
	 */
	async banUser(userId: string, reason?: string): Promise<User | null> {
		return this.updateUser(userId, {
			isBanned: true,
			banReason: reason,
		});
	}

	/**
	 * 解封用户
	 */
	async unbanUser(userId: string): Promise<User | null> {
		return this.updateUser(userId, {
			isBanned: false,
			banReason: null,
		});
	}
}

export const userManager = new UserManager();
