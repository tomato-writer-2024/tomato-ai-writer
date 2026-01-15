import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { privateMessageManager } from '@/storage/database/privateMessageManager';

/**
 * 删除对话
 * DELETE /api/community/messages/conversations/[conversationId]
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ conversationId: string }> }
) {
	const { conversationId } = await params;

	try {
		const { user, error } = await extractUserFromRequest(request);

		if (error || !user) {
			return NextResponse.json({ error: '未授权访问' }, { status: 401 });
		}

		await privateMessageManager.deleteConversation(conversationId, user.id);

		return NextResponse.json({
			success: true,
			message: '对话已删除',
		});
	} catch (error) {
		console.error('删除对话失败:', error);
		if (error instanceof Error && error.message === '对话不存在') {
			return NextResponse.json({ error: error.message }, { status: 404 });
		}
		if (error instanceof Error && error.message === '无权访问此对话') {
			return NextResponse.json({ error: error.message }, { status: 403 });
		}
		return NextResponse.json(
			{ error: '删除对话失败' },
			{ status: 500 }
		);
	}
}
