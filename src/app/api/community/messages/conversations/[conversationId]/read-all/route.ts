import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { privateMessageManager } from '@/storage/database/privateMessageManager';

/**
 * 标记对话中所有消息为已读
 * POST /api/community/messages/conversations/[conversationId]/read-all
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ conversationId: string }> }
) {
	const { conversationId } = await params;

	try {
		const { user, error } = await extractUserFromRequest(request);

		if (error || !user) {
			return NextResponse.json({ error: '未授权访问' }, { status: 401 });
		}

		await privateMessageManager.markConversationAsRead(conversationId, user.id);

		return NextResponse.json({
			success: true,
			message: '对话中的所有消息已标记为已读',
		});
	} catch (error) {
		console.error('标记对话已读失败:', error);
		if (error instanceof Error && error.message === '对话不存在') {
			return NextResponse.json({ error: error.message }, { status: 404 });
		}
		if (error instanceof Error && error.message === '无权访问此对话') {
			return NextResponse.json({ error: error.message }, { status: 403 });
		}
		return NextResponse.json(
			{ error: '标记对话已读失败' },
			{ status: 500 }
		);
	}
}
