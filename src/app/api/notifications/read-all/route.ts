import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { notificationManager } from '@/storage/database';

/**
 * 标记所有通知为已读
 */
export async function POST(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		// 标记所有通知为已读
		const updatedCount = await notificationManager.markAllAsRead(user.id);

		return NextResponse.json({
			success: true,
			data: {
				message: `已标记 ${updatedCount} 条通知为已读`,
				count: updatedCount,
			},
		});
	} catch (error) {
		console.error('标记所有通知为已读失败:', error);
		return NextResponse.json(
			{ success: false, error: '标记所有通知为已读失败' },
			{ status: 500 }
		);
	}
}
