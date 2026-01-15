import { eq, and, desc, asc, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { posts, postLikes, postComments, insertPostSchema, updatePostSchema } from "./shared/schema";
import type { Post, InsertPost, UpdatePost } from "./shared/schema";

/**
 * 社区管理器
 */
export class CommunityManager {
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
	 * 根据ID获取帖子
	 */
	async getPostById(id: string): Promise<Post | null> {
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
	}): Promise<{ posts: Post[]; total: number }> {
		const { skip = 0, limit = 20, category, sort = 'latest', search } = options || {};
		const db = await getDb();

		// 构建查询条件
		const conditions: any[] = [];

		if (category) {
			conditions.push(eq(posts.category, category));
		}

		if (search) {
			conditions.push(sql`(${posts.title} ILIKE ${`%${search}%`} OR ${posts.content} ILIKE ${`%${search}%`})`);
		}

		// 构建排序
		let orderBy;
		switch (sort) {
			case 'hot':
				// 热门：浏览量 + 点赞数*2 + 评论数*3
				orderBy = desc(sql`${posts.viewCount} + ${posts.likeCount} * 2 + ${posts.commentCount}`);
				break;
			case 'popular':
				// 热度：点赞数
				orderBy = desc(posts.likeCount);
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

		// 获取总数（简化处理，不实现完整计数）
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
	 * 删除帖子
	 */
	async deletePost(id: string): Promise<boolean> {
		const db = await getDb();
		await db.delete(posts).where(eq(posts.id, id));
		return true;
	}

	/**
	 * 点赞帖子
	 */
	async likePost(userId: string, postId: string): Promise<void> {
		const db = await getDb();

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
		const [result] = await db
			.select({ count: postLikes.id })
			.from(postLikes)
			.where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));

		return !!result;
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
	async getCommentsByPostId(postId: string): Promise<any[]> {
		const db = await getDb();
		const comments = await db
			.select()
			.from(postComments)
			.where(eq(postComments.postId, postId))
			.orderBy(asc(postComments.createdAt));

		return comments;
	}
}

// 导出单例
export const communityManager = new CommunityManager();
