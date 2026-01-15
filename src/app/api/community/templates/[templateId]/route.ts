import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';

/**
 * 更新自定义模板
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ templateId: string }> }
) {
	try {
		const { templateId } = await params;

		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		const body = await request.json();
		const { name, category, genre, prompt, parameters, tags } = body;

		// TODO: 更新数据库中的模板
		// 这里暂时返回模拟数据
		const template = {
			id: templateId,
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
			message: '模板更新成功',
		});
	} catch (error: any) {
		console.error('更新模板失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '更新模板失败' },
			{ status: 500 }
		);
	}
}

/**
 * 删除自定义模板
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ templateId: string }> }
) {
	try {
		const { templateId } = await params;

		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		// TODO: 从数据库删除模板
		// 这里暂时返回成功

		return NextResponse.json({
			success: true,
			data: { message: '模板删除成功' },
		});
	} catch (error: any) {
		console.error('删除模板失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '删除模板失败' },
			{ status: 500 }
		);
	}
}
