import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { followManager } from '@/storage/database/followManager';

/**
 * 获取关注动态（时间线）
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
		const page = parseInt(searchParams.get('page') || '1', 10);
		const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

		// 获取关注动态
		const result = await followManager.getFollowingFeed(user.id, page, pageSize);

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error: any) {
		console.error('获取关注动态失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '获取关注动态失败' },
			{ status: 500 }
		);
	}
}
