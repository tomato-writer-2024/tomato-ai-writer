import { eq, and, desc, asc, sql, SQL } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
	posts,
	postLikes,
	postComments,
	postFavorites,
	postReports,
	users,
	insertPostSchema,
	updatePostSchema,
	insertPostFavoritesSchema,
	insertPostReportsSchema,
} from "./shared/schema";
import type {
	Post,
	InsertPost,
	UpdatePost,
	PostFavorite,
	InsertPostFavorite,
	PostReport,
	InsertPostReport,
} from "./shared/schema";

/**
 * 增强的社区管理器 - 实现完整的社区功能
 */
export class EnhancedCommunityManager {
	/**
	 * 创建帖子
	 */
	async createPost(data: InsertPost): Promise<Post> {
		const db = await getDb();
		const validated = insertPostSchema.parse(data);
		const [post] = await db.insert(posts).values(validated).returning();
		return post;
	}

	/**
	 * 根据ID获取帖子（包含作者信息）
	 */
	async getPostById(id: string, includeAuthor: boolean = true): Promise<Post | null> {
		const db = await getDb();
		const [post] = await db.select().from(posts).where(eq(posts.id, id));
		return post || null;
	}

	/**
	 * 获取帖子列表
	 */
	async getPosts(options?: {
		skip?: number;
		limit?: number;
		category?: string;
		sort?: 'latest' | 'hot' | 'popular';
		search?: string;
		userId?: string;
		tags?: string[];
		includeHidden?: boolean;
	}): Promise<{ posts: Post[]; total: number }> {
		const { skip = 0, limit = 20, category, sort = 'latest', search, userId, tags, includeHidden = false } = options || {};
		const db = await getDb();

		// 构建查询条件
		const conditions: SQL[] = [eq(posts.isDeleted, false)];

		if (category && category !== 'all') {
			conditions.push(eq(posts.category, category));
		}

		if (search) {
			conditions.push(sql`(${posts.title} ILIKE ${`%${search}%`} OR ${posts.content} ILIKE ${`%${search}%`})`);
		}

		if (userId) {
			conditions.push(eq(posts.userId, userId));
		}

		if (!includeHidden) {
			conditions.push(eq(posts.isHidden, false));
			conditions.push(eq(posts.isApproved, true));
		}

		if (tags && tags.length > 0) {
			conditions.push(sql`${posts.tags} ? ${tags[0]}`); // 简化处理，只检查第一个标签
		}

		// 构建排序
		let orderBy;
		switch (sort) {
			case 'hot':
				// 热门：浏览量 + 点赞数*2 + 评论数*3 + 收藏数*4
				orderBy = desc(sql`${posts.viewCount} + ${posts.likeCount} * 2 + ${posts.commentCount} * 3 + ${posts.favoriteCount} * 4`);
				break;
			case 'popular':
				// 热度：点赞数 + 收藏数
				orderBy = desc(sql`${posts.likeCount} + ${posts.favoriteCount}`);
				break;
			case 'latest':
			default:
				// 最新：创建时间
				orderBy = desc(posts.createdAt);
				break;
		}

		// 获取帖子列表
		let query = db.select().from(posts) as any;
		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}
		query = query.orderBy(orderBy);
		query = query.limit(limit);
		query = query.offset(skip);

		const postsData = await query as Post[];

		// 获取总数（简化处理）
		const total = postsData.length;

		return { posts: postsData, total };
	}

	/**
	 * 更新帖子
	 */
	async updatePost(id: string, data: UpdatePost): Promise<Post | null> {
		const db = await getDb();
		const validated = updatePostSchema.parse(data);
		const [post] = await db
			.update(posts)
			.set({ ...validated, updatedAt: new Date().toISOString() })
			.where(eq(posts.id, id))
			.returning();

		return post || null;
	}

	/**
	 * 删除帖子（软删除）
	 */
	async deletePost(id: string): Promise<boolean> {
		const db = await getDb();
		await db.update(posts).set({ isDeleted: true }).where(eq(posts.id, id));
		return true;
	}

	/**
	 * 点赞帖子
	 */
	async likePost(userId: string, postId: string): Promise<void> {
		const db = await getDb();

		// 检查是否已点赞
		const existing = await db
			.select()
			.from(postLikes)
			.where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));

		if (existing.length > 0) {
			throw new Error('已经点赞过了');
		}

		// 创建点赞记录
		await db.insert(postLikes).values({
			id: sql`gen_random_uuid()`,
			userId,
			postId,
			createdAt: new Date().toISOString(),
		});

		// 增加帖子的点赞数
		await db
			.update(posts)
			.set({ likeCount: sql`${posts.likeCount} + 1` })
			.where(eq(posts.id, postId));
	}

	/**
	 * 取消点赞帖子
	 */
	async unlikePost(userId: string, postId: string): Promise<void> {
		const db = await getDb();

		// 删除点赞记录
		await db.delete(postLikes).where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));

		// 减少帖子的点赞数
		await db
			.update(posts)
			.set({ likeCount: sql`${posts.likeCount} - 1` })
			.where(eq(posts.id, postId));
	}

	/**
	 * 检查用户是否点赞了帖子
	 */
	async hasUserLikedPost(userId: string, postId: string): Promise<boolean> {
		const db = await getDb();
		const results = await db
			.select()
			.from(postLikes)
			.where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));

		return results.length > 0;
	}

	/**
	 * 收藏帖子
	 */
	async favoritePost(userId: string, postId: string): Promise<void> {
		const db = await getDb();

		// 检查是否已收藏
		const existing = await db
			.select()
			.from(postFavorites)
			.where(and(eq(postFavorites.userId, userId), eq(postFavorites.postId, postId)));

		if (existing.length > 0) {
			throw new Error('已经收藏过了');
		}

		// 创建收藏记录
		await db.insert(postFavorites).values({
			id: sql`gen_random_uuid()`,
			userId,
			postId,
			createdAt: new Date().toISOString(),
		});

		// 增加帖子的收藏数
		await db
			.update(posts)
			.set({ favoriteCount: sql`${posts.favoriteCount} + 1` })
			.where(eq(posts.id, postId));
	}

	/**
	 * 取消收藏帖子
	 */
	async unfavoritePost(userId: string, postId: string): Promise<void> {
		const db = await getDb();

		// 删除收藏记录
		await db.delete(postFavorites).where(and(eq(postFavorites.userId, userId), eq(postFavorites.postId, postId)));

		// 减少帖子的收藏数
		await db
			.update(posts)
			.set({ favoriteCount: sql`${posts.favoriteCount} - 1` })
			.where(eq(posts.id, postId));
	}

	/**
	 * 检查用户是否收藏了帖子
	 */
	async hasUserFavoritedPost(userId: string, postId: string): Promise<boolean> {
		const db = await getDb();
		const results = await db
			.select()
			.from(postFavorites)
			.where(and(eq(postFavorites.userId, userId), eq(postFavorites.postId, postId)));

		return results.length > 0;
	}

	/**
	 * 获取用户的收藏列表
	 */
	async getUserFavorites(userId: string, options?: {
		skip?: number;
		limit?: number;
	}): Promise<Post[]> {
		const { skip = 0, limit = 20 } = options || {};
		const db = await getDb();

		const results = await db
			.select({
				id: posts.id,
				userId: posts.userId,
				title: posts.title,
				content: posts.content,
				category: posts.category,
				tags: posts.tags,
				viewCount: posts.viewCount,
				likeCount: posts.likeCount,
				commentCount: posts.commentCount,
				favoriteCount: posts.favoriteCount,
				isPinned: posts.isPinned,
				isLocked: posts.isLocked,
				isApproved: posts.isApproved,
				createdAt: posts.createdAt,
				updatedAt: posts.updatedAt,
				isDeleted: posts.isDeleted,
			})
			.from(postFavorites)
			.innerJoin(posts, eq(postFavorites.postId, posts.id))
			.where(and(eq(postFavorites.userId, userId), eq(posts.isDeleted, false)))
			.orderBy(desc(postFavorites.createdAt))
			.limit(limit)
			.offset(skip);

		return results as unknown as Post[];
	}

	/**
	 * 举报帖子
	 */
	async reportPost(data: InsertPostReport): Promise<PostReport> {
		const db = await getDb();
		const validated = insertPostReportsSchema.parse(data);
		const [report] = await db.insert(postReports).values(validated).returning();

		// 增加帖子的举报数
		await db
			.update(posts)
			.set({ reportCount: sql`${posts.reportCount} + 1` })
			.where(eq(posts.id, data.postId));

		return report;
	}

	/**
	 * 获取帖子的举报列表
	 */
	async getPostReports(postId: string): Promise<PostReport[]> {
		const db = await getDb();
		return db
			.select()
			.from(postReports)
			.where(eq(postReports.postId, postId))
			.orderBy(desc(postReports.createdAt));
	}

	/**
	 * 获取所有待处理举报（管理员）
	 */
	async getPendingReports(options?: {
		skip?: number;
		limit?: number;
	}): Promise<PostReport[]> {
		const { skip = 0, limit = 50 } = options || {};
		const db = await getDb();
		return db
			.select()
			.from(postReports)
			.where(eq(postReports.status, 'pending'))
			.orderBy(desc(postReports.createdAt))
			.limit(limit)
			.offset(skip);
	}

	/**
	 * 审核帖子（管理员）
	 */
	async reviewPost(
		postId: string,
		reviewerId: string,
		approved: boolean,
		notes?: string
	): Promise<Post | null> {
		const db = await getDb();

		const [post] = await db
			.update(posts)
			.set({
				isApproved: approved,
				isHidden: !approved, // 审核不通过则隐藏
				reviewedBy: reviewerId,
				reviewedAt: new Date().toISOString(),
				reviewNotes: notes,
			})
			.where(eq(posts.id, postId))
			.returning();

		return post || null;
	}

	/**
	 * 处理举报（管理员）
	 */
	async resolveReport(
		reportId: string,
		adminId: string,
		action: 'none' | 'warning' | 'hidden' | 'deleted' | 'banned',
		notes?: string
	): Promise<PostReport | null> {
		const db = await getDb();

		// 获取举报信息
		const [report] = await db.select().from(postReports).where(eq(postReports.id, reportId));
		if (!report) {
			return null;
		}

		// 更新举报状态
		const [updatedReport] = await db
			.update(postReports)
			.set({
				status: 'resolved',
				reviewedBy: adminId,
				reviewedAt: new Date().toISOString(),
				action,
				notes,
			})
			.where(eq(postReports.id, reportId))
			.returning();

		// 对帖子采取行动
		if (action === 'hidden') {
			await db.update(posts).set({ isHidden: true }).where(eq(posts.id, report.postId));
		} else if (action === 'deleted') {
			await db.update(posts).set({ isDeleted: true }).where(eq(posts.id, report.postId));
		}

		return updatedReport || null;
	}

	/**
	 * 增加帖子浏览量
	 */
	async incrementViewCount(postId: string): Promise<void> {
		const db = await getDb();
		await db
			.update(posts)
			.set({ viewCount: sql`${posts.viewCount} + 1` })
			.where(eq(posts.id, postId));
	}

	/**
	 * 增加帖子评论数
	 */
	async incrementCommentCount(postId: string): Promise<void> {
		const db = await getDb();
		await db
			.update(posts)
			.set({ commentCount: sql`${posts.commentCount} + 1` })
			.where(eq(posts.id, postId));
	}

	/**
	 * 减少帖子评论数
	 */
	async decrementCommentCount(postId: string): Promise<void> {
		const db = await getDb();
		await db
			.update(posts)
			.set({ commentCount: sql`${posts.commentCount} - 1` })
			.where(eq(posts.id, postId));
	}

	/**
	 * 获取帖子的评论列表
	 */
	async getCommentsByPostId(postId: string, options?: {
		skip?: number;
		limit?: number;
	}): Promise<any[]> {
		const { skip = 0, limit = 50 } = options || {};
		const db = await getDb();
		return db
			.select()
			.from(postComments)
			.where(and(eq(postComments.postId, postId), eq(postComments.isDeleted, false)))
			.orderBy(asc(postComments.createdAt))
			.limit(limit)
			.offset(skip);
	}

	/**
	 * 创建评论
	 */
	async createComment(data: {
		userId: string;
		postId: string;
		parentId?: string;
		content: string;
	}): Promise<any> {
		const db = await getDb();
		const [comment] = await db
			.insert(postComments)
			.values({
				id: sql`gen_random_uuid()`,
				userId: data.userId,
				postId: data.postId,
				parentId: data.parentId,
				content: data.content,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})
			.returning();

		// 增加帖子评论数
		await this.incrementCommentCount(data.postId);

		return comment;
	}

	/**
	 * 删除评论
	 */
	async deleteComment(commentId: string): Promise<boolean> {
		const db = await getDb();
		const [comment] = await db
			.select()
			.from(postComments)
			.where(eq(postComments.id, commentId));

		if (comment) {
			await db
				.update(postComments)
				.set({ isDeleted: true })
				.where(eq(postComments.id, commentId));

			// 减少帖子评论数
			await this.decrementCommentCount(comment.postId);
		}

		return true;
	}

	/**
	 * 置顶帖子（管理员）
	 */
	async pinPost(postId: string): Promise<Post | null> {
		const db = await getDb();
		const [post] = await db
			.update(posts)
			.set({ isPinned: true })
			.where(eq(posts.id, postId))
			.returning();

		return post || null;
	}

	/**
	 * 取消置顶（管理员）
	 */
	async unpinPost(postId: string): Promise<Post | null> {
		const db = await getDb();
		const [post] = await db
			.update(posts)
			.set({ isPinned: false })
			.where(eq(posts.id, postId))
			.returning();

		return post || null;
	}

	/**
	 * 锁定帖子（管理员）
	 */
	async lockPost(postId: string): Promise<Post | null> {
		const db = await getDb();
		const [post] = await db
			.update(posts)
			.set({ isLocked: true })
			.where(eq(posts.id, postId))
			.returning();

		return post || null;
	}

	/**
	 * 解锁帖子（管理员）
	 */
	async unlockPost(postId: string): Promise<Post | null> {
		const db = await getDb();
		const [post] = await db
			.update(posts)
			.set({ isLocked: false })
			.where(eq(posts.id, postId))
			.returning();

		return post || null;
	}

	/**
	 * 获取热门标签
	 */
	async getPopularTags(limit: number = 20): Promise<{ tag: string; count: number }[]> {
		const db = await getDb();
		const allPosts = await db.select({ tags: posts.tags }).from(posts).where(eq(posts.isDeleted, false));

		const tagCount = new Map<string, number>();
		allPosts.forEach(post => {
			const tags = Array.isArray(post.tags) ? post.tags : [];
			tags.forEach(tag => {
				tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
			});
		});

		return Array.from(tagCount.entries())
			.map(([tag, count]) => ({ tag, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, limit);
	}
}

// 导出单例实例
export const enhancedCommunityManager = new EnhancedCommunityManager();
