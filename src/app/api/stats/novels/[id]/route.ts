import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest, verifyDataOwnership } from '@/lib/auth';
import { contentStatsManager, novelManager } from '@/storage/database';

/**
 * 获取单个小说的统计数据
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		// 获取小说
		const novel = await novelManager.getNovelById(id);
		if (!novel) {
			return NextResponse.json(
				{ error: '小说不存在' },
				{ status: 404 }
			);
		}

		// 验证数据所有权
		const hasAccess = await verifyDataOwnership(user.id, novel.userId, user.role);
		if (!hasAccess) {
			return NextResponse.json(
				{ error: '无权访问此小说' },
				{ status: 403 }
			);
		}

		// 获取小说的综合统计
		const novelStats = await contentStatsManager.getNovelOverallStats(id);

		// 获取章节统计
		// const chapterStats = await chapterManager.getNovelChapterStats(id);

		return NextResponse.json({
			success: true,
			data: {
				novelId: id,
				novelTitle: novel.title,
				stats: {
					totalWords: novelStats.totalWords,
					totalChapters: novelStats.totalChapters,
					averageQualityScore: novelStats.averageQualityScore,
					averageCompletionRate: novelStats.averageCompletionRate,
					totalShuangdian: novelStats.totalShuangdian,
				},
			},
		});
	} catch (error) {
		console.error('获取小说统计失败:', error);
		return NextResponse.json(
			{ error: '获取小说统计失败' },
			{ status: 500 }
		);
	}
}
