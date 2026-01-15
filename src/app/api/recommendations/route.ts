import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { getDb } from 'coze-coding-dev-sdk';
import { posts, postLikes, postFavorites } from '@/storage/database/shared/schema';
import { desc, sql, eq, and } from 'drizzle-orm';

/**
 * 获取个性化推荐内容
 * GET /api/recommendations?limit=10
 */
export async function GET(request: NextRequest) {
	try {
		const { user, error } = await extractUserFromRequest(request);

		if (error || !user) {
			return NextResponse.json({ error: '未授权访问' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '10');

		const db = await getDb();

		// 获取用户点赞的帖子
		const likedPosts = await db
			.select()
			.from(postLikes)
			.where(eq(postLikes.userId, user.id));

		const likedPostIds = likedPosts.map(lp => lp.postId);

		// 获取用户收藏的帖子
		const favoritePosts = await db
			.select()
			.from(postFavorites)
			.where(eq(postFavorites.userId, user.id));

		const favoritePostIds = favoritePosts.map(fp => fp.postId);

		// 如果用户没有点赞或收藏，推荐热门帖子
		if (likedPostIds.length === 0 && favoritePostIds.length === 0) {
			const hotPosts = await db
				.select()
				.from(posts)
				.where(
					and(
						eq(posts.isApproved, true),
						eq(posts.isHidden, false),
						eq(posts.isDeleted, false)
					)
				)
				.orderBy(desc(
					sql`${posts.likeCount} * 1.5 + ${posts.viewCount} * 0.5 + ${posts.commentCount} * 1`
				))
				.limit(limit);

			return NextResponse.json({
				success: true,
				data: {
					posts: hotPosts,
					reason: '热门推荐',
				},
			});
		}

		// 获取用户喜欢的帖子的分类和标签
		const userPosts = await db
			.select()
			.from(posts)
			.where(
				sql`${posts.id} = ANY(${likedPostIds}) OR ${posts.id} = ANY(${favoritePostIds})`
			);

		// 统计用户喜欢的分类
		const categoryCount: Record<string, number> = {};
		const tagCount: Record<string, number> = {};

		for (const post of userPosts) {
			categoryCount[post.category] = (categoryCount[post.category] || 0) + 1;
			if (post.tags) {
				// tags是varchar类型，需要解析
				try {
					const tagsArray = typeof post.tags === 'string'
						? post.tags.split(',').map(t => t.trim())
						: [];
					for (const tag of tagsArray) {
						tagCount[tag] = (tagCount[tag] || 0) + 1;
					}
				} catch (e) {
					// 忽略解析错误
				}
			}
		}

		// 获取用户最感兴趣的分类和标签
		const topCategories = Object.entries(categoryCount)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 3)
			.map(([cat]) => cat);

		const topTags = Object.keys(tagCount)
			.sort((a, b) => (tagCount[b] || 0) - (tagCount[a] || 0))
			.slice(0, 5);

		// 基于用户兴趣推荐帖子
		let recommendedPosts;
		if (topCategories.length > 0) {
			recommendedPosts = await db
				.select()
				.from(posts)
				.where(
					and(
						eq(posts.isApproved, true),
						eq(posts.isHidden, false),
						eq(posts.isDeleted, false),
						sql`${posts.category} = ANY(${topCategories})`
					)
				)
				.orderBy(desc(
					sql`${posts.likeCount} * 1.0 + ${posts.viewCount} * 0.5 + ${posts.commentCount} * 1.0`
				))
				.limit(limit);
		} else {
			recommendedPosts = await db
				.select()
				.from(posts)
				.where(
					and(
						eq(posts.isApproved, true),
						eq(posts.isHidden, false),
						eq(posts.isDeleted, false)
					)
				)
				.orderBy(desc(
					sql`${posts.likeCount} * 1.0 + ${posts.viewCount} * 0.5 + ${posts.commentCount} * 1.0`
				))
				.limit(limit);
		}

		return NextResponse.json({
			success: true,
			data: {
				posts: recommendedPosts,
				reason: '基于你的兴趣推荐',
				interests: {
					categories: topCategories,
					tags: topTags,
				},
			},
		});
	} catch (error) {
		console.error('获取推荐内容失败:', error);
		return NextResponse.json(
			{ error: '获取推荐内容失败' },
			{ status: 500 }
		);
	}
}
