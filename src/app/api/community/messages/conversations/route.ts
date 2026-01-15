import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { privateMessageManager } from '@/storage/database/privateMessageManager';
import { userManager } from '@/storage/database';

/**
 * 获取用户的对话列表
 * GET /api/community/messages/conversations?skip=0&limit=20
 */
export async function GET(request: NextRequest) {
	try {
		const { user, error } = await extractUserFromRequest(request);

		if (error || !user) {
			return NextResponse.json({ error: '未授权访问' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const skip = parseInt(searchParams.get('skip') || '0');
		const limit = parseInt(searchParams.get('limit') || '20');

		const conversations = await privateMessageManager.getUserConversations(user.id, { skip, limit });

		// 获取对话中对方用户的信息
		const conversationsWithUsers = await Promise.all(
			conversations.map(async (conv) => {
				const otherUserId = conv.user1Id === user.id ? conv.user2Id : conv.user1Id;
				const otherUser = await userManager.getUserById(otherUserId);

				return {
					...conv,
					otherUser: otherUser ? {
						id: otherUser.id,
						username: otherUser.username,
						email: otherUser.email,
						avatarUrl: otherUser.avatarUrl,
					} : null,
					unreadCount: conv.user1Id === user.id ? conv.user1UnreadCount : conv.user2UnreadCount,
				};
			})
		);

		return NextResponse.json({
			success: true,
			data: conversationsWithUsers,
		});
	} catch (error) {
		console.error('获取对话列表失败:', error);
		return NextResponse.json(
			{ error: '获取对话列表失败' },
			{ status: 500 }
		);
	}
}

/**
 * 创建新对话
 * POST /api/community/messages/conversations
 */
export async function POST(request: NextRequest) {
	try {
		const { user, error } = await extractUserFromRequest(request);

		if (error || !user) {
			return NextResponse.json({ error: '未授权访问' }, { status: 401 });
		}

		const body = await request.json();
		const { userId: otherUserId } = body;

		if (!otherUserId) {
			return NextResponse.json(
				{ error: '缺少userId参数' },
				{ status: 400 }
			);
		}

		// 不能给自己发消息
		if (otherUserId === user.id) {
			return NextResponse.json(
				{ error: '不能给自己发消息' },
				{ status: 400 }
			);
		}

		// 检查对方用户是否存在
		const otherUser = await userManager.getUserById(otherUserId);
		if (!otherUser) {
			return NextResponse.json(
				{ error: '用户不存在' },
				{ status: 404 }
			);
		}

		// 获取或创建对话
		const conversation = await privateMessageManager.getOrCreateConversation(user.id, otherUserId);

		return NextResponse.json({
			success: true,
			data: conversation,
		});
	} catch (error) {
		console.error('创建对话失败:', error);
		return NextResponse.json(
			{ error: '创建对话失败' },
			{ status: 500 }
		);
	}
}
