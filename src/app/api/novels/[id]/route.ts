import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest, verifyDataOwnership } from '@/lib/auth';
import { novelManager } from '@/storage/database';

/**
 * 获取单个小说
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

		return NextResponse.json({
			success: true,
			data: novel,
		});
	} catch (error) {
		console.error('获取小说失败:', error);
		return NextResponse.json(
			{ error: '获取小说失败' },
			{ status: 500 }
		);
	}
}

/**
 * 更新小说
 */
export async function PUT(
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
				{ error: '无权修改此小说' },
				{ status: 403 }
			);
		}

		const body = await request.json();
		const { title, description, genre, status, type, tags, isPublished, coverUrl } = body;

		// 更新小说
		const updatedNovel = await novelManager.updateNovel(id, {
			title: title || undefined,
			description: description !== undefined ? description : undefined,
			genre: genre !== undefined ? genre : undefined,
			status: status !== undefined ? status : undefined,
			type: type !== undefined ? type : undefined,
			tags: tags !== undefined ? tags : undefined,
			isPublished: isPublished !== undefined ? isPublished : undefined,
			coverUrl: coverUrl !== undefined ? coverUrl : undefined,
		});

		return NextResponse.json({
			success: true,
			data: updatedNovel,
		});
	} catch (error) {
		console.error('更新小说失败:', error);
		return NextResponse.json(
			{ error: '更新小说失败' },
			{ status: 500 }
		);
	}
}

/**
 * 删除小说
 */
export async function DELETE(
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
				{ error: '无权删除此小说' },
				{ status: 403 }
			);
		}

		// 删除小说（软删除）
		const success = await novelManager.deleteNovel(id);
		if (!success) {
			return NextResponse.json(
				{ error: '删除小说失败' },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			message: '小说已删除',
		});
	} catch (error) {
		console.error('删除小说失败:', error);
		return NextResponse.json(
			{ error: '删除小说失败' },
			{ status: 500 }
		);
	}
}
