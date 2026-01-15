import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { notificationManager } from '@/storage/database';

/**
 * 标记通知为已读
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		// 获取通知
		const notification = await notificationManager.getNotificationById(id);
		if (!notification) {
			return NextResponse.json(
				{ success: false, error: '通知不存在' },
				{ status: 404 }
			);
		}

		// 验证通知所有权
		if (notification.userId !== user.id) {
			return NextResponse.json(
				{ success: false, error: '无权操作此通知' },
				{ status: 403 }
			);
		}

		// 标记为已读
		await notificationManager.markAsRead(id);

		return NextResponse.json({
			success: true,
			data: {
				message: '通知已标记为已读',
			},
		});
	} catch (error) {
		console.error('标记通知为已读失败:', error);
		return NextResponse.json(
			{ success: false, error: '标记通知为已读失败' },
			{ status: 500 }
		);
	}
}
