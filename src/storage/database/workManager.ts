import { eq, and, SQL, desc, sql as pgSql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  works,
  insertWorkSchema,
  updateWorkSchema,
  type Work,
  type InsertWork,
  type UpdateWork,
} from "./shared/schema";

/**
 * 创作内容管理器
 */
export class WorkManager {
  /**
   * 创建作品
   */
  async createWork(data: InsertWork): Promise<Work> {
    const db = await getDb();
    const validated = insertWorkSchema.parse(data);
    const [work] = await db.insert(works).values(validated).returning();
    return work;
  }

  /**
   * 通过ID获取作品
   */
  async getWorkById(id: string): Promise<Work | null> {
    const db = await getDb();
    const [work] = await db.select().from(works).where(eq(works.id, id));
    return work || null;
  }

  /**
   * 获取用户的作品列表
   */
  async getWorksByUserId(userId: string, options: {
    skip?: number;
    limit?: number;
    includeDeleted?: boolean;
  } = {}): Promise<Work[]> {
    const {
      skip = 0,
      limit = 100,
      includeDeleted = false,
    } = options;
    const db = await getDb();

    if (!includeDeleted) {
      return db
        .select()
        .from(works)
        .where(and(eq(works.userId, userId), eq(works.isDeleted, false)))
        .orderBy(desc(works.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(works)
      .where(eq(works.userId, userId))
      .orderBy(desc(works.createdAt))
      .limit(limit)
      .offset(skip);
  }

  /**
   * 获取所有作品列表（管理员）
   */
  async getAllWorks(options: {
    skip?: number;
    limit?: number;
    filters?: {
      userId?: string;
      title?: string;
      isDeleted?: boolean;
    };
  } = {}): Promise<Work[]> {
    const {
      skip = 0,
      limit = 100,
      filters = {},
    } = options;
    const db = await getDb();

    const conditions: SQL[] = [];

    if (filters.userId !== undefined) {
      conditions.push(eq(works.userId, filters.userId));
    }
    if (filters.title !== undefined) {
      conditions.push(eq(works.title, filters.title));
    }
    if (filters.isDeleted !== undefined) {
      conditions.push(eq(works.isDeleted, filters.isDeleted));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(works)
        .where(and(...conditions))
        .orderBy(desc(works.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(works)
      .orderBy(desc(works.createdAt))
      .limit(limit)
      .offset(skip);
  }

  /**
   * 更新作品
   */
  async updateWork(id: string, data: UpdateWork): Promise<Work | null> {
    const db = await getDb();
    const validated = updateWorkSchema.parse(data);
    const [work] = await db
      .update(works)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(works.id, id))
      .returning();
    return work || null;
  }

  /**
   * 软删除作品
   */
  async deleteWork(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db
      .update(works)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(works.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * 永久删除作品
   */
  async permanentDeleteWork(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.delete(works).where(eq(works.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * 恢复已删除的作品
   */
  async restoreWork(id: string): Promise<Work | null> {
    const db = await getDb();
    const [work] = await db
      .update(works)
      .set({ isDeleted: false, updatedAt: new Date() })
      .where(eq(works.id, id))
      .returning();
    return work || null;
  }

  /**
   * 统计用户的作品数量
   */
  async countUserWorks(userId: string, includeDeleted = false): Promise<number> {
    const db = await getDb();
    if (!includeDeleted) {
      const [result] = await db
        .select({ count: pgSql`count(*)` })
        .from(works)
        .where(and(eq(works.userId, userId), eq(works.isDeleted, false)));
      return Number(result?.count || 0);
    }

    const [result] = await db
      .select({ count: pgSql`count(*)` })
      .from(works)
      .where(eq(works.userId, userId));
    return Number(result?.count || 0);
  }

  /**
   * 统计所有作品数量
   */
  async countAllWorks(filters?: {
    userId?: string;
    isDeleted?: boolean;
  }): Promise<number> {
    const db = await getDb();
    let query = db.select({ count: pgSql`count(*)` }).from(works);
    const conditions: SQL[] = [];

    if (filters?.userId !== undefined) {
      conditions.push(eq(works.userId, filters.userId));
    }
    if (filters?.isDeleted !== undefined) {
      conditions.push(eq(works.isDeleted, filters.isDeleted));
    }

    if (conditions.length > 0) {
      const [result] = await db
        .select({ count: pgSql`count(*)` })
        .from(works)
        .where(and(...conditions));
      return Number(result?.count || 0);
    }

    const [result] = await db
      .select({ count: pgSql`count(*)` })
      .from(works);
    return Number(result?.count || 0);
  }

  /**
   * 搜索作品
   */
  async searchWorks(keyword: string, options: {
    skip?: number;
    limit?: number;
    userId?: string;
  } = {}): Promise<Work[]> {
    const {
      skip = 0,
      limit = 100,
      userId,
    } = options;
    const db = await getDb();

    if (userId) {
      return db
        .select()
        .from(works)
        .where(and(eq(works.userId, userId), eq(works.isDeleted, false)))
        .orderBy(desc(works.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(works)
      .where(eq(works.isDeleted, false))
      .orderBy(desc(works.createdAt))
      .limit(limit)
      .offset(skip);
  }
}

export const workManager = new WorkManager();
