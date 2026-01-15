import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { aiOptimizer } from '@/lib/aiOptimizer';

/**
 * 获取写作模板列表
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
		const category = searchParams.get('category');
		const genre = searchParams.get('genre');

		// 获取模板列表
		const templates = aiOptimizer.getTemplates(category || undefined, genre || undefined);

		return NextResponse.json({
			success: true,
			data: templates,
		});
	} catch (error: any) {
		console.error('获取模板列表失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '获取模板列表失败' },
			{ status: 500 }
		);
	}
}
