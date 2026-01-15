import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { communityManager } from '@/storage/database';

/**
 * 获取帖子详情
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ postId: string }> }
) {
	try {
		const { postId } = await params;

		// 验证用户身份（可选，用于判断是否点赞）
		const { user } = await extractUserFromRequest(request);

		// 获取帖子详情
		const post = await communityManager.getPostById(postId);

		if (!post) {
			return NextResponse.json(
				{ success: false, error: '帖子不存在' },
				{ status: 404 }
			);
		}

		// 获取帖子评论
		const comments = await communityManager.getCommentsByPostId(postId);

		// 判断当前用户是否点赞
		let isLiked = false;
		if (user) {
			isLiked = await communityManager.hasUserLikedPost(user.id, postId);
		}

		// 增加浏览量
		await communityManager.incrementViewCount(postId);

		return NextResponse.json({
			success: true,
			data: {
				...post,
				comments,
				isLiked,
			},
		});
	} catch (error) {
		console.error('获取帖子详情失败:', error);
		return NextResponse.json(
			{ success: false, error: '获取帖子详情失败' },
			{ status: 500 }
		);
	}
}

/**
 * 更新帖子
 */
export async function PATCH(
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

		const body = await request.json();
		const { title, content, category, tags } = body;

		// 获取帖子
		const post = await communityManager.getPostById(postId);
		if (!post) {
			return NextResponse.json(
				{ success: false, error: '帖子不存在' },
				{ status: 404 }
			);
		}

		// 验证帖子所有权
		if (post.userId !== user.id && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
			return NextResponse.json(
				{ success: false, error: '无权修改此帖子' },
				{ status: 403 }
			);
		}

		// 更新帖子
		const updatedPost = await communityManager.updatePost(postId, {
			title,
			content,
			category,
			tags,
		});

		return NextResponse.json({
			success: true,
			data: updatedPost,
		});
	} catch (error) {
		console.error('更新帖子失败:', error);
		return NextResponse.json(
			{ success: false, error: '更新帖子失败' },
			{ status: 500 }
		);
	}
}

/**
 * 删除帖子
 */
export async function DELETE(
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

		// 验证帖子所有权
		if (post.userId !== user.id && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
			return NextResponse.json(
				{ success: false, error: '无权删除此帖子' },
				{ status: 403 }
			);
		}

		// 删除帖子
		await communityManager.deletePost(postId);

		return NextResponse.json({
			success: true,
			data: { message: '帖子已删除' },
		});
	} catch (error) {
		console.error('删除帖子失败:', error);
		return NextResponse.json(
			{ success: false, error: '删除帖子失败' },
			{ status: 500 }
		);
	}
}
