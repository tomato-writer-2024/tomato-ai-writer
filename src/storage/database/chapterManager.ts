import { eq, and, SQL, desc, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { chapters, insertChapterSchema, updateChapterSchema } from "./shared/schema";
import type { Chapter, InsertChapter, UpdateChapter } from "./shared/schema";

/**
 * 章节管理器
 */
export class ChapterManager {
	/**
	 * 创建章节
	 */
	async createChapter(data: InsertChapter): Promise<Chapter> {
		const db = await getDb();
		const validated = insertChapterSchema.parse(data);
		const [chapter] = await db.insert(chapters).values(validated).returning();
		return chapter;
	}

	/**
	 * 获取章节列表
	 */
	async getChapters(options: {
		skip?: number;
		limit?: number;
		filters?: Partial<Pick<Chapter, 'novelId' | 'userId' | 'chapterNum' | 'isPublished'>>;
	} = {}): Promise<Chapter[]> {
		const { skip = 0, limit = 100, filters = {} } = options;
		const db = await getDb();

		const conditions: SQL[] = [];

		// 精确条件
		if (filters.novelId !== undefined) {
			conditions.push(eq(chapters.novelId, filters.novelId));
		}
		if (filters.userId !== undefined) {
			conditions.push(eq(chapters.userId, filters.userId));
		}
		if (filters.chapterNum !== undefined) {
			conditions.push(eq(chapters.chapterNum, filters.chapterNum));
		}
		if (filters.isPublished !== undefined) {
			conditions.push(eq(chapters.isPublished, filters.isPublished));
		}

		// 添加软删除过滤
		conditions.push(eq(chapters.isDeleted, false));

		let query = db.select().from(chapters);
		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		return query.orderBy(chapters.chapterNum).limit(limit).offset(skip);
	}

	/**
	 * 根据ID获取章节
	 */
	async getChapterById(id: string): Promise<Chapter | null> {
		const db = await getDb();
		const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
		return chapter || null;
	}

	/**
	 * 获取小说的所有章节
	 */
	async getChaptersByNovelId(novelId: string): Promise<Chapter[]> {
		return this.getChapters({
			filters: { novelId },
		});
	}

	/**
	 * 获取指定章节号的章节
	 */
	async getChapterByNum(novelId: string, chapterNum: number): Promise<Chapter | null> {
		const db = await getDb();
		const [chapter] = await db
			.select()
			.from(chapters)
			.where(
				and(
					eq(chapters.novelId, novelId),
					eq(chapters.chapterNum, chapterNum),
					eq(chapters.isDeleted, false)
				)
			);
		return chapter || null;
	}

	/**
	 * 获取下一章
	 */
	async getNextChapter(novelId: string, currentChapterNum: number): Promise<Chapter | null> {
		const db = await getDb();
		const [chapter] = await db
			.select()
			.from(chapters)
			.where(
				and(
					eq(chapters.novelId, novelId),
					sql`${chapters.chapterNum} > ${currentChapterNum}`,
					eq(chapters.isDeleted, false)
				)
			)
			.orderBy(chapters.chapterNum)
			.limit(1);
		return chapter || null;
	}

	/**
	 * 获取上一章
	 */
	async getPrevChapter(novelId: string, currentChapterNum: number): Promise<Chapter | null> {
		const db = await getDb();
		const [chapter] = await db
			.select()
			.from(chapters)
			.where(
				and(
					eq(chapters.novelId, novelId),
					sql`${chapters.chapterNum} < ${currentChapterNum}`,
					eq(chapters.isDeleted, false)
				)
			)
			.orderBy(desc(chapters.chapterNum))
			.limit(1);
		return chapter || null;
	}

	/**
	 * 更新章节
	 */
	async updateChapter(id: string, data: UpdateChapter): Promise<Chapter | null> {
		const db = await getDb();
		const validated = updateChapterSchema.parse(data);
		const [chapter] = await db
			.update(chapters)
			.set({ ...validated, updatedAt: new Date().toISOString() })
			.where(eq(chapters.id, id))
			.returning();
		return chapter || null;
	}

	/**
	 * 删除章节（软删除）
	 */
	async deleteChapter(id: string): Promise<boolean> {
		const db = await getDb();
		const result = await db
			.update(chapters)
			.set({
				isDeleted: true,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(chapters.id, id));
		return (result.rowCount ?? 0) > 0;
	}

	/**
	 * 更新章节字数
	 */
	async updateWordCount(id: string, wordCount: number): Promise<Chapter | null> {
		const db = await getDb();
		const [chapter] = await db
			.update(chapters)
			.set({
				wordCount,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(chapters.id, id))
			.returning();
		return chapter || null;
	}

	/**
	 * 更新章节质量评分
	 */
	async updateQualityScore(id: string, score: number): Promise<Chapter | null> {
		const db = await getDb();
		const [chapter] = await db
			.update(chapters)
			.set({
				qualityScore: score,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(chapters.id, id))
			.returning();
		return chapter || null;
	}

	/**
	 * 更新章节完读率
	 */
	async updateCompletionRate(id: string, rate: number): Promise<Chapter | null> {
		const db = await getDb();
		const [chapter] = await db
			.update(chapters)
			.set({
				completionRate: rate,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(chapters.id, id))
			.returning();
		return chapter || null;
	}

	/**
	 * 更新爽点数量
	 */
	async updateShuangdianCount(id: string, count: number): Promise<Chapter | null> {
		const db = await getDb();
		const [chapter] = await db
			.update(chapters)
			.set({
				shuangdianCount: count,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(chapters.id, id))
			.returning();
		return chapter || null;
	}

	/**
	 * 发布/取消发布章节
	 */
	async togglePublish(id: string, isPublished: boolean): Promise<Chapter | null> {
		return this.updateChapter(id, { isPublished });
	}

	/**
	 * 获取小说统计信息
	 */
	async getNovelChapterStats(novelId: string): Promise<{
		totalChapters: number;
		totalWords: number;
		averageQualityScore: number;
		averageCompletionRate: number;
		totalShuangdian: number;
	}> {
		const novelChapters = await this.getChaptersByNovelId(novelId);

		return {
			totalChapters: novelChapters.length,
			totalWords: novelChapters.reduce((sum, c) => sum + (c.wordCount || 0), 0),
			averageQualityScore: novelChapters.length > 0
				? novelChapters.reduce((sum, c) => sum + (c.qualityScore || 0), 0) / novelChapters.length
				: 0,
			averageCompletionRate: novelChapters.length > 0
				? novelChapters.reduce((sum, c) => sum + (c.completionRate || 0), 0) / novelChapters.length
				: 0,
			totalShuangdian: novelChapters.reduce((sum, c) => sum + (c.shuangdianCount || 0), 0),
		};
	}
}

export const chapterManager = new ChapterManager();
