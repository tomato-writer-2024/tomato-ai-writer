import { eq, and, SQL, like, sql, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { novels, insertNovelSchema, updateNovelSchema } from "./shared/schema";
import type { Novel, InsertNovel, UpdateNovel } from "./shared/schema";

/**
 * 小说管理器
 */
export class NovelManager {
	/**
	 * 创建小说
	 */
	async createNovel(data: InsertNovel): Promise<Novel> {
		const db = await getDb();
		const validated = insertNovelSchema.parse(data);
		const [novel] = await db.insert(novels).values(validated).returning();
		return novel;
	}

	/**
	 * 获取小说列表
	 */
	async getNovels(options: {
		skip?: number;
		limit?: number;
		filters?: Partial<Pick<Novel, 'userId' | 'genre' | 'status' | 'type' | 'isPublished'>>;
		searchQuery?: string;
		orderBy?: 'createdAt' | 'updatedAt' | 'wordCount' | 'averageRating' | 'completionRate';
		orderDirection?: 'asc' | 'desc';
	} = {}): Promise<Novel[]> {
		const { skip = 0, limit = 100, filters = {}, searchQuery, orderBy = 'createdAt', orderDirection = 'desc' } = options;
		const db = await getDb();

		const conditions: SQL[] = [];

		// 精确条件
		if (filters.userId !== undefined) {
			conditions.push(eq(novels.userId, filters.userId));
		}
		if (filters.genre !== undefined && filters.genre !== null) {
			conditions.push(eq(novels.genre, filters.genre));
		}
		if (filters.status !== undefined && filters.status !== null) {
			conditions.push(eq(novels.status, filters.status));
		}
		if (filters.type !== undefined && filters.type !== null) {
			conditions.push(eq(novels.type, filters.type));
		}
		if (filters.isPublished !== undefined && filters.isPublished !== null) {
			conditions.push(eq(novels.isPublished, filters.isPublished));
		}

		// 搜索查询（模糊匹配标题）
		if (searchQuery) {
			conditions.push(like(novels.title, `%${searchQuery}%`));
		}

		// 添加软删除过滤
		conditions.push(eq(novels.isDeleted, false));

		let query = db.select().from(novels);
		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		// 排序
		const orderColumn = novels[orderBy as keyof typeof novels] as any;
		if (orderDirection === 'desc') {
			query = query.orderBy(desc(orderColumn));
		} else {
			query = query.orderBy(orderColumn);
		}

		return query.limit(limit).offset(skip);
	}

	/**
	 * 根据ID获取小说
	 */
	async getNovelById(id: string): Promise<Novel | null> {
		const db = await getDb();
		const [novel] = await db.select().from(novels).where(eq(novels.id, id));
		return novel || null;
	}

	/**
	 * 获取用户的小说列表
	 */
	async getNovelsByUserId(userId: string, options?: {
		skip?: number;
		limit?: number;
	}): Promise<Novel[]> {
		return this.getNovels({
			...options,
			filters: { userId },
			orderBy: 'updatedAt',
			orderDirection: 'desc',
		});
	}

	/**
	 * 更新小说
	 */
	async updateNovel(id: string, data: UpdateNovel): Promise<Novel | null> {
		const db = await getDb();
		const validated = updateNovelSchema.parse(data);
		const [novel] = await db
			.update(novels)
			.set({ ...validated, updatedAt: new Date().toISOString() })
			.where(eq(novels.id, id))
			.returning();
		return novel || null;
	}

	/**
	 * 删除小说（软删除）
	 */
	async deleteNovel(id: string): Promise<boolean> {
		const db = await getDb();
		const result = await db
			.update(novels)
			.set({
				isDeleted: true,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(novels.id, id));
		return (result.rowCount ?? 0) > 0;
	}

	/**
	 * 更新小说字数统计
	 */
	async updateWordCount(id: string, wordCount: number): Promise<Novel | null> {
		const db = await getDb();
		const [novel] = await db
			.update(novels)
			.set({
				wordCount,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(novels.id, id))
			.returning();
		return novel || null;
	}

	/**
	 * 更新章节统计
	 */
	async updateChapterCount(id: string, chapterCount: number): Promise<Novel | null> {
		const db = await getDb();
		const [novel] = await db
			.update(novels)
			.set({
				chapterCount,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(novels.id, id))
			.returning();
		return novel || null;
	}

	/**
	 * 更新小说评分
	 */
	async updateRating(id: string, rating: number): Promise<Novel | null> {
		const db = await getDb();
		const [novel] = await db
			.update(novels)
			.set({
				averageRating: rating.toFixed(1),
				updatedAt: new Date().toISOString(),
			})
			.where(eq(novels.id, id))
			.returning();
		return novel || null;
	}

	/**
	 * 更新小说完读率
	 */
	async updateCompletionRate(id: string, rate: number): Promise<Novel | null> {
		const db = await getDb();
		const [novel] = await db
			.update(novels)
			.set({
				completionRate: rate,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(novels.id, id))
			.returning();
		return novel || null;
	}

	/**
	 * 发布/取消发布小说
	 */
	async togglePublish(id: string, isPublished: boolean): Promise<Novel | null> {
		return this.updateNovel(id, { isPublished });
	}

	/**
	 * 获取统计信息
	 */
	async getNovelStats(userId: string): Promise<{
		totalNovels: number;
		totalWords: number;
		publishedNovels: number;
		totalChapters: number;
		averageRating: number;
	}> {
		const userNovels = await this.getNovelsByUserId(userId);
		const publishedNovels = userNovels.filter(n => n.isPublished);

		return {
			totalNovels: userNovels.length,
			totalWords: userNovels.reduce((sum, n) => sum + (n.wordCount || 0), 0),
			publishedNovels: publishedNovels.length,
			totalChapters: userNovels.reduce((sum, n) => sum + (n.chapterCount || 0), 0),
			averageRating: userNovels.length > 0
				? userNovels.reduce((sum, n) => sum + parseFloat(n.averageRating || '0'), 0) / userNovels.length
				: 0,
		};
	}
}

export const novelManager = new NovelManager();
