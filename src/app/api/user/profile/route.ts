import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { userManager, novelManager, contentStatsManager } from '@/storage/database';
import { getAvatarUrl } from '@/lib/storageService';

/**
 * 获取用户资料
 */
export async function GET(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		// 获取头像URL
		let avatarUrl = '';
		if (user.avatarUrl) {
			avatarUrl = await getAvatarUrl(user.avatarUrl);
		}

		// 获取小说统计
		const novelStats = await novelManager.getNovelStats(user.id);

		// 获取内容统计
		const overallStats = await contentStatsManager.getUserOverallStats(user.id);

		// 计算平均评分（如果没有则使用默认值）
		const averageRating = novelStats.averageRating || overallStats.averageQualityScore / 10 || 0;

		// 返回用户信息（不包含敏感信息）
		const userProfile = {
			id: user.id,
			email: user.email,
			username: user.username,
			phone: user.phone || '',
			location: user.location || '',
			avatarUrl: avatarUrl || '',
			membership: user.membershipLevel || 'FREE',
			joinDate: user.createdAt,
			totalWords: novelStats.totalWords || 0,
			totalNovels: novelStats.totalNovels || 0,
			averageRating: averageRating,
		};

		return NextResponse.json({
			success: true,
			data: userProfile,
		});
	} catch (error) {
		console.error('获取用户资料失败:', error);
		return NextResponse.json(
			{ error: '获取用户资料失败' },
			{ status: 500 }
		);
	}
}

/**
 * 更新用户资料
 */
export async function PUT(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		const body = await request.json();
		const { username, phone, location } = body;

		// 更新用户资料
		const updatedUser = await userManager.updateUser(user.id, {
			username: username !== undefined ? username : undefined,
			phone: phone !== undefined ? phone : undefined,
			location: location !== undefined ? location : undefined,
		});

		if (!updatedUser) {
			return NextResponse.json(
				{ error: '更新用户资料失败' },
				{ status: 500 }
			);
		}

		// 获取头像URL
		let avatarUrl = '';
		if (updatedUser.avatarUrl) {
			avatarUrl = await getAvatarUrl(updatedUser.avatarUrl);
		}

		// 获取小说统计
		const novelStats = await novelManager.getNovelStats(user.id);

		// 获取内容统计
		const overallStats = await contentStatsManager.getUserOverallStats(user.id);

		// 计算平均评分
		const averageRating = novelStats.averageRating || overallStats.averageQualityScore / 10 || 0;

		// 返回更新后的用户信息
		const userProfile = {
			id: updatedUser.id,
			email: updatedUser.email,
			username: updatedUser.username,
			phone: updatedUser.phone || '',
			location: updatedUser.location || '',
			avatarUrl: avatarUrl || '',
			membership: updatedUser.membershipLevel || 'FREE',
			joinDate: updatedUser.createdAt,
			totalWords: novelStats.totalWords || 0,
			totalNovels: novelStats.totalNovels || 0,
			averageRating: averageRating,
		};

		return NextResponse.json({
			success: true,
			data: userProfile,
		});
	} catch (error) {
		console.error('更新用户资料失败:', error);
		return NextResponse.json(
			{ error: '更新用户资料失败' },
			{ status: 500 }
		);
	}
}
