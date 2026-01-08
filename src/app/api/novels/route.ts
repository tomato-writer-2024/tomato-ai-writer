import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { novelManager } from '@/storage/database';

/**
 * 获取小说列表
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
		const limit = parseInt(searchParams.get('limit') || '20');
		const genre = searchParams.get('genre') || undefined;
		const status = searchParams.get('status') || undefined;
		const type = searchParams.get('type') || undefined;
		const search = searchParams.get('search') || undefined;

		// 获取用户的小说列表
		const novels = await novelManager.getNovels({
			skip,
			limit,
			filters: {
				userId: user.id,
				genre: genre || undefined,
				status: status || undefined,
				type: type || undefined,
			},
			searchQuery: search || undefined,
			orderBy: 'updatedAt',
			orderDirection: 'desc',
		});

		// 获取统计信息
		const stats = await novelManager.getNovelStats(user.id);

		return NextResponse.json({
			success: true,
			data: novels,
			stats,
		});
	} catch (error) {
		console.error('获取小说列表失败:', error);
		return NextResponse.json(
			{ error: '获取小说列表失败' },
			{ status: 500 }
		);
	}
}

/**
 * 创建小说
 */
export async function POST(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		const body = await request.json();
		const { title, description, genre, status, type, tags } = body;

		// 验证必要字段
		if (!title || title.trim().length === 0) {
			return NextResponse.json(
				{ error: '小说标题不能为空' },
				{ status: 400 }
			);
		}

		// 创建小说
		const novel = await novelManager.createNovel({
			userId: user.id,
			title: title.trim(),
			description: description || '',
			genre: genre || '都市',
			status: status || '连载中',
			type: type || '爽文',
			tags: tags || '',
			isPublished: false,
		});

		return NextResponse.json({
			success: true,
			data: novel,
		});
	} catch (error) {
		console.error('创建小说失败:', error);
		return NextResponse.json(
			{ error: '创建小说失败' },
			{ status: 500 }
		);
	}
}
