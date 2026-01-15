import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { communityManager } from '@/storage/database';

/**
 * 获取帖子列表
 */
export async function GET(request: NextRequest) {
	try {
		// 获取查询参数
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const category = searchParams.get('category') as string | null;
		const sort = searchParams.get('sort') as 'latest' | 'hot' | 'popular' || 'latest'; // latest, hot, popular
		const search = searchParams.get('search') as string | null;

		// 获取帖子列表
		const result = await communityManager.getPosts({
			skip: (page - 1) * limit,
			limit,
			category: (category === 'all' || !category) ? undefined : category,
			sort: sort as any,
			search: (search === null || search === undefined) ? undefined : search,
		});

		return NextResponse.json({
			success: true,
			data: result.posts,
			pagination: {
				page,
				limit,
				total: result.total,
			},
		});
	} catch (error) {
		console.error('获取帖子列表失败:', error);
		return NextResponse.json(
			{ success: false, error: '获取帖子列表失败' },
			{ status: 500 }
		);
	}
}

/**
 * 创建新帖子
 */
export async function POST(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		const body = await request.json();
		const { title, content, category, tags } = body;

		// 验证必要参数
		if (!title || !content || !category) {
			return NextResponse.json(
				{ success: false, error: '缺少必要参数' },
				{ status: 400 }
			);
		}

		// 创建帖子
		const post = await communityManager.createPost({
			userId: user.id,
			title,
			content,
			category,
			tags: tags || [],
		});

		return NextResponse.json({
			success: true,
			data: post,
		});
	} catch (error) {
		console.error('创建帖子失败:', error);
		return NextResponse.json(
			{ success: false, error: '创建帖子失败' },
			{ status: 500 }
		);
	}
}
