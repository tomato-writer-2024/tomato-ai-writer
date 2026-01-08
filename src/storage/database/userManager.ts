import { eq, and, SQL, desc, sql as pgSql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  users,
  insertUserSchema,
  updateUserSchema,
  type User,
  type InsertUser,
  type UpdateUser,
} from "./shared/schema";

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
   * 通过ID获取用户
   */
  async getUserById(id: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  /**
   * 通过邮箱获取用户
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  /**
   * 获取用户列表（带筛选和分页）
   */
  async getUsers(options: {
    skip?: number;
    limit?: number;
    filters?: Partial<Pick<User, "role" | "membershipLevel" | "isActive" | "isBanned">>;
    sortBy?: "createdAt" | "lastLoginAt";
    sortOrder?: "asc" | "desc";
  } = {}): Promise<User[]> {
    const {
      skip = 0,
      limit = 100,
      filters = {},
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;
    const db = await getDb();

    const conditions: SQL[] = [];

    if (filters.role !== undefined) {
      conditions.push(eq(users.role, filters.role));
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

    if (conditions.length > 0) {
      const results = await db
        .select()
        .from(users)
        .where(and(...conditions))
        .orderBy(sortOrder === "desc" ? desc(users[sortBy]) : users[sortBy])
        .limit(limit)
        .offset(skip);
      return results;
    }

    return db
      .select()
      .from(users)
      .orderBy(sortOrder === "desc" ? desc(users[sortBy]) : users[sortBy])
      .limit(limit)
      .offset(skip);
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, data: UpdateUser): Promise<User | null> {
    const db = await getDb();
    const validated = updateUserSchema.parse(data);
    const [user] = await db
      .update(users)
      .set({ ...validated, updatedAt: new Date() })
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
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * 封禁用户
   */
  async banUser(id: string, reason: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db
      .update(users)
      .set({
        isBanned: true,
        banReason: reason,
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  /**
   * 解封用户
   */
  async unbanUser(id: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db
      .update(users)
      .set({
        isBanned: false,
        banReason: null,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  /**
   * 更新用户会员等级
   */
  async updateMembership(
    id: string,
    level: string,
    expireAt?: Date | null
  ): Promise<User | null> {
    const db = await getDb();
    const [user] = await db
      .update(users)
      .set({
        membershipLevel: level,
        membershipExpireAt: expireAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  /**
   * 更新用户使用计数
   */
  async incrementUsage(
    id: string,
    type: "daily" | "monthly"
  ): Promise<User | null> {
    const db = await getDb();
    const updateData: any = { updatedAt: new Date() };
    if (type === "daily") {
      updateData.dailyUsageCount = pgSql`${users.dailyUsageCount} + 1`;
    } else {
      updateData.monthlyUsageCount = pgSql`${users.monthlyUsageCount} + 1`;
    }
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  /**
   * 重置用户使用计数
   */
  async resetUsage(
    id: string,
    type: "daily" | "monthly"
  ): Promise<User | null> {
    const db = await getDb();
    const updateData: any = { updatedAt: new Date() };
    if (type === "daily") {
      updateData.dailyUsageCount = 0;
    } else {
      updateData.monthlyUsageCount = 0;
    }
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  /**
   * 更新用户存储使用量
   */
  async updateStorageUsed(
    id: string,
    storageUsed: number
  ): Promise<User | null> {
    const db = await getDb();
    const [user] = await db
      .update(users)
      .set({ storageUsed, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  /**
   * 更新最后登录时间
   */
  async updateLastLogin(id: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  /**
   * 统计用户数量
   */
  async countUsers(filters?: {
    role?: string;
    membershipLevel?: string;
    isActive?: boolean;
    isBanned?: boolean;
  }): Promise<number> {
    const db = await getDb();
    const conditions: SQL[] = [];

    if (filters?.role !== undefined) {
      conditions.push(eq(users.role, filters.role));
    }
    if (filters?.membershipLevel !== undefined) {
      conditions.push(eq(users.membershipLevel, filters.membershipLevel));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(users.isActive, filters.isActive));
    }
    if (filters?.isBanned !== undefined) {
      conditions.push(eq(users.isBanned, filters.isBanned));
    }

    if (conditions.length > 0) {
      const [result] = await db
        .select({ count: pgSql`count(*)` })
        .from(users)
        .where(and(...conditions));
      return Number(result?.count || 0);
    }

    const [result] = await db
      .select({ count: pgSql`count(*)` })
      .from(users);
    return Number(result?.count || 0);
  }
}

export const userManager = new UserManager();
