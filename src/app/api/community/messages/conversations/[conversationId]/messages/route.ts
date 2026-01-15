import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { privateMessageManager } from '@/storage/database/privateMessageManager';

/**
 * 获取对话的消息列表
 * GET /api/community/messages/conversations/[conversationId]/messages?skip=0&limit=50
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ conversationId: string }> }
) {
	const { conversationId } = await params;

	try {
		const { user, error } = await extractUserFromRequest(request);

		if (error || !user) {
			return NextResponse.json({ error: '未授权访问' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const skip = parseInt(searchParams.get('skip') || '0');
		const limit = parseInt(searchParams.get('limit') || '50');

		const messages = await privateMessageManager.getConversationMessages(
			conversationId,
			user.id,
			{ skip, limit }
		);

		return NextResponse.json({
			success: true,
			data: messages,
		});
	} catch (error) {
		console.error('获取消息列表失败:', error);
		if (error instanceof Error && error.message === '对话不存在') {
			return NextResponse.json({ error: error.message }, { status: 404 });
		}
		if (error instanceof Error && error.message === '无权访问此对话') {
			return NextResponse.json({ error: error.message }, { status: 403 });
		}
		return NextResponse.json(
			{ error: '获取消息列表失败' },
			{ status: 500 }
		);
	}
}
