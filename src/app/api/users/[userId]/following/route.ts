import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { followManager } from '@/storage/database/followManager';

/**
 * 获取用户的关注列表
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const { userId } = await params;

		// 验证用户身份（可选）
		const { user } = await extractUserFromRequest(request);

		// 获取查询参数
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1', 10);
		const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

		// 获取关注列表
		const result = await followManager.getFollowing(userId, page, pageSize);

		// 如果是当前用户，添加当前用户是否关注每个用户的标记
		if (user && user.id === userId) {
			// 不需要额外处理，因为查询的是自己的关注列表
		}

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error: any) {
		console.error('获取关注列表失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '获取关注列表失败' },
			{ status: 500 }
		);
	}
}
