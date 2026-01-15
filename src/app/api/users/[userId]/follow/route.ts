import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { followManager } from '@/storage/database/followManager';

/**
 * 关注用户
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const { userId } = await params;

		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		// 关注用户
		const follow = await followManager.createFollow(user.id, userId);

		return NextResponse.json({
			success: true,
			data: follow,
			message: '关注成功',
		});
	} catch (error: any) {
		console.error('关注失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '关注失败' },
			{ status: 400 }
		);
	}
}

/**
 * 取消关注
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const { userId } = await params;

		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		// 取消关注
		await followManager.deleteFollow(user.id, userId);

		return NextResponse.json({
			success: true,
			data: { message: '已取消关注' },
		});
	} catch (error: any) {
		console.error('取消关注失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '取消关注失败' },
			{ status: 500 }
		);
	}
}
