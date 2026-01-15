import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { getDb } from '@/storage/database';
import { users, posts, follows } from '@/storage/database/shared/schema';
import { eq, sql, desc, and } from 'drizzle-orm';

/**
 * 获取用户资料
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const { userId } = await params;
		const db = await getDb();

		// 验证用户身份（可选）
		const { user } = await extractUserFromRequest(request);

		// 获取用户信息
		const [userInfo] = await db
			.select({
				id: users.id,
				username: users.username,
				email: users.email,
				avatarUrl: users.avatarUrl,
				role: users.role,
				membershipLevel: users.membershipLevel,
				location: users.location,
				phone: users.phone,
				createdAt: users.createdAt,
				lastLoginAt: users.lastLoginAt,
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!userInfo) {
			return NextResponse.json(
				{ success: false, error: '用户不存在' },
				{ status: 404 }
			);
		}

		// 获取统计数据
		// 帖子数
		const postCountResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(posts)
			.where(
				and(
					eq(posts.userId, userId),
					eq(posts.isDeleted, false)
				)
			);
		const postCount = Number(postCountResult[0]?.count || 0);

		// 关注数
		const followingCountResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(follows)
			.where(eq(follows.followerId, userId));
		const followingCount = Number(followingCountResult[0]?.count || 0);

		// 粉丝数
		const followerCountResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(follows)
			.where(eq(follows.followingId, userId));
		const followerCount = Number(followerCountResult[0]?.count || 0);

		// 获取最新帖子
		const recentPosts = await db
			.select({
				id: posts.id,
				title: posts.title,
				content: posts.content,
				category: posts.category,
				viewCount: posts.viewCount,
				likeCount: posts.likeCount,
				commentCount: posts.commentCount,
				createdAt: posts.createdAt,
			})
			.from(posts)
			.where(
				and(
					eq(posts.userId, userId),
					eq(posts.isDeleted, false),
					eq(posts.isApproved, true)
				)
			)
			.orderBy(desc(posts.createdAt))
			.limit(5);

		// 判断当前用户是否关注该用户
		let isFollowing = false;
		if (user && user.id !== userId) {
			const [follow] = await db
				.select()
				.from(follows)
				.where(
					and(
						eq(follows.followerId, user.id),
						eq(follows.followingId, userId)
					)
				)
				.limit(1);
			isFollowing = !!follow;
		}

		return NextResponse.json({
			success: true,
			data: {
				user: {
					...userInfo,
					email: user?.id === userId ? userInfo.email : undefined, // 只有本人或自己可以看到邮箱
					stats: {
						postCount: Number(postCount),
						followingCount: Number(followingCount),
						followerCount: Number(followerCount),
					},
					isFollowing,
					recentPosts,
				},
			},
		});
	} catch (error: any) {
		console.error('获取用户资料失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '获取用户资料失败' },
			{ status: 500 }
		);
	}
}
