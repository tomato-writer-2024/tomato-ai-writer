import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { aiOptimizer } from '@/lib/aiOptimizer';

/**
 * 检测内容质量（AI优化器）
 */
export async function POST(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		const body = await request.json();
		const { content, genre } = body;

		// 验证必要参数
		if (!content) {
			return NextResponse.json(
				{ success: false, error: '缺少内容' },
				{ status: 400 }
			);
		}

		// 检测质量
		const qualityResult = await aiOptimizer.detectQuality(content, genre);

		return NextResponse.json({
			success: true,
			data: qualityResult,
		});
	} catch (error: any) {
		console.error('质量检测失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '质量检测失败' },
			{ status: 500 }
		);
	}
}
