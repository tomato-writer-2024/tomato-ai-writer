import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';

/**
 * 获取自定义模板列表
 */
export async function GET(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		// TODO: 从数据库获取自定义模板
		// 这里暂时返回空列表
		return NextResponse.json({
			success: true,
			data: {
				templates: [],
				total: 0,
			},
		});
	} catch (error: any) {
		console.error('获取模板列表失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '获取模板列表失败' },
			{ status: 500 }
		);
	}
}

/**
 * 创建自定义模板
 */
export async function POST(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		const body = await request.json();
		const { name, category, genre, prompt, parameters, tags } = body;

		// 验证必要参数
		if (!name || !category || !prompt) {
			return NextResponse.json(
				{ success: false, error: '缺少必要参数' },
				{ status: 400 }
			);
		}

		// TODO: 保存到数据库
		// 这里暂时返回模拟数据
		const template = {
			id: `custom-${Date.now()}`,
			name,
			category,
			genre: genre || '通用',
			prompt,
			parameters: parameters || [],
			tags: tags || [],
			userId: user.id,
			usageCount: 0,
			createdAt: new Date().toISOString(),
		};

		return NextResponse.json({
			success: true,
			data: template,
			message: '模板创建成功',
		});
	} catch (error: any) {
		console.error('创建模板失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '创建模板失败' },
			{ status: 500 }
		);
	}
}
