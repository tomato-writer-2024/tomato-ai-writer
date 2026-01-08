import { eq, and, SQL, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { contentStats, insertContentStatsSchema } from "./shared/schema";
import type { ContentStats, InsertContentStats } from "./shared/schema";

/**
 * 内容统计管理器
 */
export class ContentStatsManager {
	/**
	 * 创建内容统计记录
	 */
	async createContentStats(data: InsertContentStats): Promise<ContentStats> {
		const db = await getDb();
		const validated = insertContentStatsSchema.parse(data);
		const [stats] = await db.insert(contentStats).values(validated).returning();
		return stats;
	}

	/**
	 * 获取内容统计列表
	 */
	async getContentStats(options: {
		skip?: number;
		limit?: number;
		filters?: Partial<Pick<ContentStats, 'userId' | 'novelId' | 'chapterId'>>;
	} = {}): Promise<ContentStats[]> {
		const { skip = 0, limit = 100, filters = {} } = options;
		const db = await getDb();

		const conditions: SQL[] = [];

		// 精确条件
		if (filters.userId !== undefined) {
			conditions.push(eq(contentStats.userId, filters.userId));
		}
		if (filters.novelId !== undefined && filters.novelId !== null) {
			conditions.push(eq(contentStats.novelId, filters.novelId));
		}
		if (filters.chapterId !== undefined && filters.chapterId !== null) {
			conditions.push(eq(contentStats.chapterId, filters.chapterId));
		}

		let query = db.select().from(contentStats);
		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		return query.orderBy(desc(contentStats.createdAt)).limit(limit).offset(skip);
	}

	/**
	 * 根据ID获取内容统计
	 */
	async getContentStatsById(id: string): Promise<ContentStats | null> {
		const db = await getDb();
		const [stats] = await db.select().from(contentStats).where(eq(contentStats.id, id));
		return stats || null;
	}

	/**
	 * 获取章节统计
	 */
	async getStatsByChapterId(chapterId: string): Promise<ContentStats | null> {
		const db = await getDb();
		const [stats] = await db
			.select()
			.from(contentStats)
			.where(eq(contentStats.chapterId, chapterId));
		return stats || null;
	}

	/**
	 * 获取小说的所有统计
	 */
	async getStatsByNovelId(novelId: string): Promise<ContentStats[]> {
		return this.getContentStats({
			filters: { novelId },
		});
	}

	/**
	 * 获取用户的所有统计
	 */
	async getStatsByUserId(userId: string, options?: {
		skip?: number;
		limit?: number;
	}): Promise<ContentStats[]> {
		return this.getContentStats({
			...options,
			filters: { userId },
		});
	}

	/**
	 * 获取用户写作趋势统计
	 */
	async getUserWritingTrend(userId: string, days: number = 30): Promise<{
		date: string;
		wordCount: number;
		qualityScore: number;
		chapterCount: number;
	}[]> {
		const db = await getDb();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const stats = await db
			.select()
			.from(contentStats)
			.where(
				and(
					eq(contentStats.userId, userId),
					sql`${contentStats.createdAt} >= ${startDate}`
				)
			)
			.orderBy(contentStats.createdAt);

		// 按日期分组统计
	 const dailyStats = new Map<string, {
			wordCount: number;
			qualityScore: number;
			chapterCount: number;
		}>();

		stats.forEach(stat => {
			const date = new Date(stat.createdAt).toISOString().split('T')[0];
			const existing = dailyStats.get(date) || {
				wordCount: 0,
				qualityScore: 0,
				chapterCount: 0,
			};

			existing.wordCount += stat.wordCount;
			existing.qualityScore += (stat.qualityScore || 0);
			existing.chapterCount += stat.chapterId ? 1 : 0;

			dailyStats.set(date, existing);
		});

		// 转换为数组并计算平均值
		return Array.from(dailyStats.entries())
			.map(([date, data]) => ({
				date,
				wordCount: data.wordCount,
				qualityScore: data.chapterCount > 0 ? Math.round(data.qualityScore / data.chapterCount) : 0,
				chapterCount: data.chapterCount,
			}))
			.sort((a, b) => a.date.localeCompare(b.date));
	}

	/**
	 * 获取用户综合统计
	 */
	async getUserOverallStats(userId: string): Promise<{
		totalWords: number;
		totalChapters: number;
		averageQualityScore: number;
		averageCompletionRate: number;
		totalShuangdian: number;
		totalReadTime: number; // 预估阅读时间（秒）
	}> {
		const stats = await this.getStatsByUserId(userId);

		return {
			totalWords: stats.reduce((sum, s) => sum + s.wordCount, 0),
			totalChapters: stats.filter(s => s.chapterId).length,
			averageQualityScore: stats.length > 0
				? Math.round(stats.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / stats.length)
				: 0,
			averageCompletionRate: stats.length > 0
				? Math.round(stats.reduce((sum, s) => sum + (s.completionRate || 0), 0) / stats.length)
				: 0,
			totalShuangdian: stats.reduce((sum, s) => sum + (s.shuangdianCount || 0), 0),
			totalReadTime: stats.reduce((sum, s) => sum + (s.estimatedReadTime || 0), 0),
		};
	}

	/**
	 * 获取小说综合统计
	 */
	async getNovelOverallStats(novelId: string): Promise<{
		totalWords: number;
		totalChapters: number;
		averageQualityScore: number;
		averageCompletionRate: number;
		totalShuangdian: number;
	}> {
		const stats = await this.getStatsByNovelId(novelId);

		return {
			totalWords: stats.reduce((sum, s) => sum + s.wordCount, 0),
			totalChapters: stats.filter(s => s.chapterId).length,
			averageQualityScore: stats.length > 0
				? Math.round(stats.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / stats.length)
				: 0,
			averageCompletionRate: stats.length > 0
				? Math.round(stats.reduce((sum, s) => sum + (s.completionRate || 0), 0) / stats.length)
				: 0,
			totalShuangdian: stats.reduce((sum, s) => sum + (s.shuangdianCount || 0), 0),
		};
	}
}

export const contentStatsManager = new ContentStatsManager();
