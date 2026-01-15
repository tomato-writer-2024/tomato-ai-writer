import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { privateMessageManager } from '@/storage/database/privateMessageManager';
import { userManager } from '@/storage/database';

/**
 * 发送私信
 * POST /api/community/messages/send
 */
export async function POST(request: NextRequest) {
	try {
		const { user, error } = await extractUserFromRequest(request);

		if (error || !user) {
			return NextResponse.json({ error: '未授权访问' }, { status: 401 });
		}

		const body = await request.json();
		const { receiverId, content } = body;

		if (!receiverId || !content) {
			return NextResponse.json(
				{ error: '缺少receiverId或content参数' },
				{ status: 400 }
			);
		}

		// 内容长度限制
		if (content.length > 2000) {
			return NextResponse.json(
				{ error: '消息内容不能超过2000字' },
				{ status: 400 }
			);
		}

		// 不能给自己发消息
		if (receiverId === user.id) {
			return NextResponse.json(
				{ error: '不能给自己发消息' },
				{ status: 400 }
			);
		}

		// 检查对方用户是否存在
		const receiver = await userManager.getUserById(receiverId);
		if (!receiver) {
			return NextResponse.json(
				{ error: '用户不存在' },
				{ status: 404 }
			);
		}

		// 获取或创建对话
		const conversation = await privateMessageManager.getOrCreateConversation(
			user.id,
			receiverId
		);

		// 发送消息
		const message = await privateMessageManager.sendMessage({
			conversationId: conversation.id,
			senderId: user.id,
			receiverId,
			content,
		});

		return NextResponse.json({
			success: true,
			data: {
				...message,
				sender: {
					id: user.id,
					username: user.username,
					email: user.email,
					avatarUrl: user.avatarUrl,
				},
				receiver: {
					id: receiver.id,
					username: receiver.username,
					email: receiver.email,
					avatarUrl: receiver.avatarUrl,
				},
			},
		});
	} catch (error) {
		console.error('发送消息失败:', error);
		return NextResponse.json(
			{ error: '发送消息失败' },
			{ status: 500 }
		);
	}
}
