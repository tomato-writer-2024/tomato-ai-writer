import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { notificationManager } from '@/storage/database';

/**
 * 获取用户的通知列表
 */
export async function GET(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		// 获取查询参数
		const { searchParams } = new URL(request.url);
		const skip = parseInt(searchParams.get('skip') || '0');
		const limit = parseInt(searchParams.get('limit') || '20');
		const unreadOnly = searchParams.get('unreadOnly') === 'true';

		// 获取通知列表
		const notifications = await notificationManager.getUserNotifications(
			user.id,
			{ skip, limit, unreadOnly }
		);

		// 获取未读数量
		const unreadCount = await notificationManager.getUnreadCount(user.id);

		return NextResponse.json({
			success: true,
			data: {
				notifications,
				unreadCount,
			},
		});
	} catch (error) {
		console.error('获取通知列表失败:', error);
		return NextResponse.json(
			{ success: false, error: '获取通知列表失败' },
			{ status: 500 }
		);
	}
}

/**
 * 创建通知（内部API，用于系统自动发送通知）
 */
export async function POST(request: NextRequest) {
	try {
		// 验证用户身份（仅管理员可以创建通知）
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		// 检查管理员权限
		if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
			return NextResponse.json(
				{ success: false, error: '权限不足' },
				{ status: 403 }
			);
		}

		const body = await request.json();
		const { userId, type, title, content, link } = body;

		// 验证必要参数
		if (!userId || !type || !title || !content) {
			return NextResponse.json(
				{ success: false, error: '缺少必要参数' },
				{ status: 400 }
			);
		}

		// 创建通知
		const notification = await notificationManager.createNotification({
			userId,
			type,
			title,
			content,
			link,
		});

		return NextResponse.json({
			success: true,
			data: notification,
		});
	} catch (error) {
		console.error('创建通知失败:', error);
		return NextResponse.json(
			{ success: false, error: '创建通知失败' },
			{ status: 500 }
		);
	}
}
