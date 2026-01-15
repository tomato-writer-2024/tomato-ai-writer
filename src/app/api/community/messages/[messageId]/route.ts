import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { privateMessageManager } from '@/storage/database/privateMessageManager';

/**
 * 删除消息
 * DELETE /api/community/messages/[messageId]
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ messageId: string }> }
) {
	const { messageId } = await params;

	try {
		const { user, error } = await extractUserFromRequest(request);

		if (error || !user) {
			return NextResponse.json({ error: '未授权访问' }, { status: 401 });
		}

		await privateMessageManager.deleteMessage(messageId, user.id);

		return NextResponse.json({
			success: true,
			message: '消息已删除',
		});
	} catch (error) {
		console.error('删除消息失败:', error);
		if (error instanceof Error && error.message === '消息不存在') {
			return NextResponse.json({ error: error.message }, { status: 404 });
		}
		if (error instanceof Error && error.message === '无权操作此消息') {
			return NextResponse.json({ error: error.message }, { status: 403 });
		}
		return NextResponse.json(
			{ error: '删除消息失败' },
			{ status: 500 }
		);
	}
}
