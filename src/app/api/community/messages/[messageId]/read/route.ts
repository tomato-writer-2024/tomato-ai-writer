import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { privateMessageManager } from '@/storage/database/privateMessageManager';

/**
 * 标记消息为已读
 * POST /api/community/messages/[messageId]/read
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ messageId: string }> }
) {
	const { messageId } = await params;

	try {
		const { user, error } = await extractUserFromRequest(request);

		if (error || !user) {
			return NextResponse.json({ error: '未授权访问' }, { status: 401 });
		}

		await privateMessageManager.markAsRead(messageId, user.id);

		return NextResponse.json({
			success: true,
			message: '消息已标记为已读',
		});
	} catch (error) {
		console.error('标记消息已读失败:', error);
		if (error instanceof Error && error.message === '消息不存在或无权操作') {
			return NextResponse.json({ error: error.message }, { status: 404 });
		}
		return NextResponse.json(
			{ error: '标记消息已读失败' },
			{ status: 500 }
		);
	}
}
