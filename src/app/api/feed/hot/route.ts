import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { followManager } from '@/storage/database/followManager';

/**
 * 获取热门动态
 */
export async function GET(request: NextRequest) {
	try {
		// 验证用户身份（可选）
		const { user } = await extractUserFromRequest(request);

		// 获取查询参数
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1', 10);
		const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
		const timeRange = (searchParams.get('timeRange') || '7d') as '24h' | '7d' | '30d' | 'all';

		// 获取热门动态
		const result = await followManager.getHotFeed(page, pageSize, timeRange);

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error: any) {
		console.error('获取热门动态失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '获取热门动态失败' },
			{ status: 500 }
		);
	}
}
