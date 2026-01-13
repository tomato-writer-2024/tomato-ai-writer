import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { contentStatsManager, novelManager, chapterManager, userManager } from '@/storage/database';

/**
 * 获取用户综合统计数据
 */
export async function GET(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		// 获取查询参数
		const { searchParams } = new URL(request.url);
		const days = parseInt(searchParams.get('days') || '30');

		// 获取写作趋势数据
		let writingTrend: Array<{ date: string; wordCount: number; chapterCount: number }>;
		try {
			writingTrend = await contentStatsManager.getUserWritingTrend(user.id, days);
		} catch (e) {
			console.error('获取写作趋势失败:', e);
			writingTrend = [];
		}

		// 获取用户综合统计
		let overallStats;
		try {
			overallStats = await contentStatsManager.getUserOverallStats(user.id);
		} catch (e) {
			console.error('获取综合统计失败:', e);
			overallStats = {
				totalWords: 0,
				totalChapters: 0,
				averageQualityScore: 0,
				averageCompletionRate: 0,
				totalShuangdian: 0,
				totalReadTime: 0,
			};
		}

		// 获取小说统计
		let novelStats;
		try {
			novelStats = await novelManager.getNovelStats(user.id);
		} catch (e) {
			console.error('获取小说统计失败:', e);
			novelStats = {
				totalNovels: 0,
				totalWords: 0,
				publishedNovels: 0,
				totalChapters: 0,
				averageRating: 0,
			};
		}

		// 获取用户信息
		let userInfo;
		try {
			userInfo = await userManager.getUserById(user.id);
		} catch (e) {
			console.error('获取用户信息失败:', e);
			userInfo = user;
		}

		// 组装返回数据
		const response = {
			success: true,
			data: {
				// 写作趋势
				writingTrend,

				// 综合统计
				overall: {
					totalWords: overallStats.totalWords,
					totalChapters: overallStats.totalChapters,
					averageQualityScore: overallStats.averageQualityScore,
					averageCompletionRate: overallStats.averageCompletionRate,
					totalShuangdian: overallStats.totalShuangdian,
					totalReadTime: overallStats.totalReadTime,
				},

				// 小说统计
				novels: {
					totalNovels: novelStats.totalNovels,
					totalWords: novelStats.totalWords,
					publishedNovels: novelStats.publishedNovels,
					totalChapters: novelStats.totalChapters,
					averageRating: novelStats.averageRating,
				},

				// 会员统计
				membership: {
					level: userInfo?.membershipLevel || 'FREE',
					expireAt: userInfo?.membershipExpireAt,
					dailyUsageCount: userInfo?.dailyUsageCount,
					monthlyUsageCount: userInfo?.monthlyUsageCount,
					storageUsed: userInfo?.storageUsed,
				},
			},
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error('获取统计数据失败:', error);
		return NextResponse.json(
			{ error: '获取统计数据失败', details: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		);
	}
}
