import { getDb } from '@/storage/database';
import { follows, users, posts, postLikes, postFavorites } from './shared/schema';
import { and, eq, desc, or, sql, exists, not } from 'drizzle-orm';
import type { Follow, InsertFollow } from './shared/schema';

export class FollowManager {
	/**
	 * 创建关注关系
	 */
	async createFollow(followerId: string, followingId: string): Promise<Follow> {
		const db = await getDb();

		// 检查是否已关注
		const existing = await this.getFollow(followerId, followingId);
		if (existing) {
			throw new Error('已关注该用户');
		}

		// 不能关注自己
		if (followerId === followingId) {
			throw new Error('不能关注自己');
		}

		// 检查被关注者是否存在
		const followingUser = await db.select().from(users).where(eq(users.id, followingId)).limit(1);
		if (!followingUser.length) {
			throw new Error('用户不存在');
		}

		const [follow] = await db
			.insert(follows)
			.values({
				followerId,
				followingId,
			})
			.returning();

		return follow;
	}

	/**
	 * 删除关注关系
	 */
	async deleteFollow(followerId: string, followingId: string): Promise<void> {
		const db = await getDb();
		await db
			.delete(follows)
			.where(
				and(
					eq(follows.followerId, followerId),
					eq(follows.followingId, followingId)
				)
			);
	}

	/**
	 * 获取关注关系
	 */
	async getFollow(followerId: string, followingId: string): Promise<Follow | null> {
		const db = await getDb();
		const [follow] = await db
			.select()
			.from(follows)
			.where(
				and(
					eq(follows.followerId, followerId),
					eq(follows.followingId, followingId)
				)
			)
			.limit(1);

		return follow || null;
	}

	/**
	 * 检查是否关注
	 */
	async isFollowing(followerId: string, followingId: string): Promise<boolean> {
		const follow = await this.getFollow(followerId, followingId);
		return !!follow;
	}

	/**
	 * 获取用户的关注列表（我关注的人）
	 */
	async getFollowing(
		userId: string,
		page: number = 1,
		pageSize: number = 20
	): Promise<{ following: any[]; total: number }> {
		const db = await getDb();
		const offset = (page - 1) * pageSize;

		// 获取总数
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(follows)
			.where(eq(follows.followerId, userId));

		// 获取关注列表
		const following = await db
			.select({
				id: follows.id,
				followingId: follows.followingId,
				createdAt: follows.createdAt,
				user: {
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
					membershipLevel: users.membershipLevel,
				},
			})
			.from(follows)
			.innerJoin(users, eq(follows.followingId, users.id))
			.where(eq(follows.followerId, userId))
			.orderBy(desc(follows.createdAt))
			.limit(pageSize)
			.offset(offset);

		return { following, total: Number(count) };
	}

	/**
	 * 获取用户的粉丝列表（关注我的人）
	 */
	async getFollowers(
		userId: string,
		page: number = 1,
		pageSize: number = 20
	): Promise<{ followers: any[]; total: number }> {
		const db = await getDb();
		const offset = (page - 1) * pageSize;

		// 获取总数
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(follows)
			.where(eq(follows.followingId, userId));

		// 获取粉丝列表
		const followers = await db
			.select({
				id: follows.id,
				followerId: follows.followerId,
				createdAt: follows.createdAt,
				user: {
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
					membershipLevel: users.membershipLevel,
				},
			})
			.from(follows)
			.innerJoin(users, eq(follows.followerId, users.id))
			.where(eq(follows.followingId, userId))
			.orderBy(desc(follows.createdAt))
			.limit(pageSize)
			.offset(offset);

		return { followers, total: Number(count) };
	}

	/**
	 * 获取关注数和粉丝数
	 */
	async getFollowStats(userId: string): Promise<{ followingCount: number; followerCount: number }> {
		const db = await getDb();
		// 获取关注数
		const [{ followingCount }] = await db
			.select({ followingCount: sql<number>`count(*)` })
			.from(follows)
			.where(eq(follows.followerId, userId));

		// 获取粉丝数
		const [{ followerCount }] = await db
			.select({ followerCount: sql<number>`count(*)` })
			.from(follows)
			.where(eq(follows.followingId, userId));

		return {
			followingCount: Number(followingCount),
			followerCount: Number(followerCount),
		};
	}

	/**
	 * 获取关注动态（时间线）
	 * 包括：关注用户的帖子、点赞、收藏
	 */
	async getFollowingFeed(
		userId: string,
		page: number = 1,
		pageSize: number = 20
	): Promise<{ feed: any[]; total: number }> {
		const db = await getDb();
		const offset = (page - 1) * pageSize;

		// 构建关注用户的帖子查询
		const followingPostsSubquery = db
			.select()
			.from(posts)
			.where(
				and(
					eq(posts.isApproved, true),
					eq(posts.isHidden, false),
					eq(posts.isDeleted, false),
					exists(
						db
							.select({ id: follows.id })
							.from(follows)
							.where(
								and(
									eq(follows.followerId, userId),
									eq(follows.followingId, posts.userId)
								)
							)
					)
				)
			)
			.as('following_posts');

		// 获取关注用户的帖子
		const feedPosts = await db
			.select({
				type: sql<string>`'post'`,
				id: posts.id,
				userId: posts.userId,
				postId: posts.id,
				title: posts.title,
				content: posts.content,
				category: posts.category,
				tags: posts.tags,
				viewCount: posts.viewCount,
				likeCount: posts.likeCount,
				commentCount: posts.commentCount,
				createdAt: posts.createdAt,
				author: {
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
				},
			})
			.from(followingPostsSubquery)
			.innerJoin(users, eq(posts.userId, users.id))
			.orderBy(desc(posts.createdAt))
			.limit(pageSize)
			.offset(offset);

		return { feed: feedPosts, total: feedPosts.length };
	}

	/**
	 * 获取热门动态
	 * 基于浏览量、点赞数、评论数综合排序
	 */
	async getHotFeed(
		page: number = 1,
		pageSize: number = 20,
		timeRange: '24h' | '7d' | '30d' | 'all' = '7d'
	): Promise<{ feed: any[]; total: number }> {
		const db = await getDb();
		const offset = (page - 1) * pageSize;

		// 计算时间范围
		const now = new Date();
		let startTime: Date;
		switch (timeRange) {
			case '24h':
				startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
				break;
			case '7d':
				startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case '30d':
				startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			default:
				startTime = new Date(0);
		}

		// 计算热度分数：浏览量*1 + 点赞数*3 + 评论数*5
		const hotScore = sql<number>`view_count * 1 + like_count * 3 + comment_count * 5`;

		const feed = await db
			.select({
				type: sql<string>`'post'`,
				id: posts.id,
				userId: posts.userId,
				postId: posts.id,
				title: posts.title,
				content: posts.content,
				category: posts.category,
				tags: posts.tags,
				viewCount: posts.viewCount,
				likeCount: posts.likeCount,
				commentCount: posts.commentCount,
				hotScore,
				createdAt: posts.createdAt,
				author: {
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
				},
			})
			.from(posts)
			.innerJoin(users, eq(posts.userId, users.id))
			.where(
				and(
					eq(posts.isApproved, true),
					eq(posts.isHidden, false),
					eq(posts.isDeleted, false),
					sql`${posts.createdAt} >= ${startTime}`
				)
			)
			.orderBy(desc(hotScore))
			.limit(pageSize)
			.offset(offset);

		// 获取总数
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)` })
			.from(posts)
			.where(
				and(
					eq(posts.isApproved, true),
					eq(posts.isHidden, false),
					eq(posts.isDeleted, false),
					sql`${posts.createdAt} >= ${startTime}`
				)
			);

		return { feed, total: Number(count) };
	}

	/**
	 * 获取推荐用户
	 * 基于共同关注、活跃度等推荐
	 */
	async getRecommendedUsers(
		userId: string,
		limit: number = 10
	): Promise<{ users: any[] }> {
		const db = await getDb();
		// 获取用户关注的用户ID列表
		const followingUsers = await db
			.select({ followingId: follows.followingId })
			.from(follows)
			.where(eq(follows.followerId, userId));

		const followingIds = followingUsers.map((f: any) => f.followingId);

		// 推荐未关注且不是自己的活跃用户
		const recommendedUsers = await db
			.select({
				id: users.id,
				username: users.username,
				avatarUrl: users.avatarUrl,
				membershipLevel: users.membershipLevel,
				createdAt: users.createdAt,
				isFollowing: exists(
					db
						.select({ id: follows.id })
						.from(follows)
						.where(
							and(
								eq(follows.followerId, userId),
								eq(follows.followingId, users.id)
							)
						)
				),
			})
			.from(users)
			.where(
				and(
					eq(users.isActive, true),
					eq(users.isBanned, false),
					not(eq(users.id, userId)),
					// 排除已关注用户
					followingIds.length > 0
						? sql`${users.id} NOT IN ${followingIds}`
						: undefined
				)
			)
			.orderBy(desc(users.createdAt))
			.limit(limit);

		// 过滤掉已关注的用户
		const filteredUsers = recommendedUsers.filter((u: any) => !u.isFollowing);

		return { users: filteredUsers };
	}
}

export const followManager = new FollowManager();
