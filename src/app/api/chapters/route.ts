import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { chapterManager } from '@/storage/database';

/**
 * 获取章节列表
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
		const skip = parseInt(searchParams.get('skip') || '0');
		const limit = parseInt(searchParams.get('limit') || '100');
		const novelId = searchParams.get('novelId');

		if (!novelId) {
			return NextResponse.json(
				{ error: '小说ID不能为空' },
				{ status: 400 }
			);
		}

		// 获取章节列表
		const chapters = await chapterManager.getChapters({
			skip,
			limit,
			filters: {
				novelId,
				userId: user.id,
			},
		});

		return NextResponse.json({
			success: true,
			data: chapters,
		});
	} catch (error) {
		console.error('获取章节列表失败:', error);
		return NextResponse.json(
			{ error: '获取章节列表失败' },
			{ status: 500 }
		);
	}
}

/**
 * 创建章节
 */
export async function POST(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		const body = await request.json();
		const { novelId, chapterNum, title, content, wordCount } = body;

		// 验证必要字段
		if (!novelId || !chapterNum || !title || !content) {
			return NextResponse.json(
				{ error: '小说ID、章节号、标题和内容不能为空' },
				{ status: 400 }
			);
		}

		// 创建章节
		const chapter = await chapterManager.createChapter({
			novelId,
			userId: user.id,
			chapterNum,
			title: title.trim(),
			content,
			wordCount: wordCount || content.length,
			isPublished: false,
		});

		return NextResponse.json({
			success: true,
			data: chapter,
		});
	} catch (error) {
		console.error('创建章节失败:', error);
		return NextResponse.json(
			{ error: '创建章节失败' },
			{ status: 500 }
		);
	}
}
