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
		const writingTrend = await contentStatsManager.getUserWritingTrend(user.id, days);

		// 获取用户综合统计
		const overallStats = await contentStatsManager.getUserOverallStats(user.id);

		// 获取小说统计
		const novelStats = await novelManager.getNovelStats(user.id);

		// 获取用户信息
		const userInfo = await userManager.getUserById(user.id);

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
					level: user.membershipLevel,
					expireAt: user.membershipExpireAt,
					dailyUsageCount: user.dailyUsageCount,
					monthlyUsageCount: user.monthlyUsageCount,
					storageUsed: user.storageUsed,
				},
			},
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error('获取统计数据失败:', error);
		return NextResponse.json(
			{ error: '获取统计数据失败' },
			{ status: 500 }
		);
	}
}
