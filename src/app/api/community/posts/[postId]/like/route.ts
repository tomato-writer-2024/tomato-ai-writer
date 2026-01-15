import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { communityManager, notificationManager } from '@/storage/database';

/**
 * 获取帖子的点赞数和当前用户是否点赞
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ postId: string }> }
) {
	try {
		const { postId } = await params;

		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		// 获取帖子
		const post = await communityManager.getPostById(postId);
		if (!post) {
			return NextResponse.json(
				{ success: false, error: '帖子不存在' },
				{ status: 404 }
			);
		}

		// 判断当前用户是否点赞
		const isLiked = await communityManager.hasUserLikedPost(user.id, postId);

		return NextResponse.json({
			success: true,
			data: {
				likeCount: post.likeCount,
				isLiked,
			},
		});
	} catch (error) {
		console.error('获取点赞信息失败:', error);
		return NextResponse.json(
			{ success: false, error: '获取点赞信息失败' },
			{ status: 500 }
		);
	}
}

/**
 * 点赞或取消点赞帖子
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ postId: string }> }
) {
	try {
		const { postId } = await params;

		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		// 获取帖子
		const post = await communityManager.getPostById(postId);
		if (!post) {
			return NextResponse.json(
				{ success: false, error: '帖子不存在' },
				{ status: 404 }
			);
		}

		// 判断是否已点赞
		const hasLiked = await communityManager.hasUserLikedPost(user.id, postId);

		if (hasLiked) {
			// 取消点赞
			await communityManager.unlikePost(user.id, postId);

			return NextResponse.json({
				success: true,
				data: {
					action: 'unliked',
					likeCount: post.likeCount - 1,
				},
			});
		} else {
			// 点赞
			await communityManager.likePost(user.id, postId);

			// 如果点赞的不是自己的帖子，发送通知
			if (post.userId !== user.id) {
				await notificationManager.createCommunityNotification(
					post.userId,
					'like',
					`${user.username || user.email} 赞了你的帖子《${post.title}》`,
					`/community/posts/${postId}`
				);
			}

			return NextResponse.json({
				success: true,
				data: {
					action: 'liked',
					likeCount: post.likeCount + 1,
				},
			});
		}
	} catch (error) {
		console.error('点赞操作失败:', error);
		return NextResponse.json(
			{ success: false, error: '点赞操作失败' },
			{ status: 500 }
		);
	}
}
