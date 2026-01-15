import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { privateMessageManager } from '@/storage/database/privateMessageManager';

/**
 * 获取用户的未读消息数量
 * GET /api/community/messages/unread
 */
export async function GET(request: NextRequest) {
	try {
		const { user, error } = await extractUserFromRequest(request);

		if (error || !user) {
			return NextResponse.json({ error: '未授权访问' }, { status: 401 });
		}

		const unreadCount = await privateMessageManager.getUnreadCount(user.id);

		return NextResponse.json({
			success: true,
			data: {
				unreadCount,
			},
		});
	} catch (error) {
		console.error('获取未读消息数量失败:', error);
		return NextResponse.json(
			{ error: '获取未读消息数量失败' },
			{ status: 500 }
		);
	}
}
