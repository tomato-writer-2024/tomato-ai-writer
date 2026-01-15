import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { followManager } from '@/storage/database/followManager';

/**
 * 获取推荐用户
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
		const limit = parseInt(searchParams.get('limit') || '10', 10);

		// 获取推荐用户
		const result = await followManager.getRecommendedUsers(user.id, limit);

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error: any) {
		console.error('获取推荐用户失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '获取推荐用户失败' },
			{ status: 500 }
		);
	}
}
