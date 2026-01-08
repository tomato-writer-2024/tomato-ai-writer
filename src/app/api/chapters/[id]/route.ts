import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest, verifyDataOwnership } from '@/lib/auth';
import { chapterManager } from '@/storage/database';

/**
 * 获取单个章节
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

		// 获取章节
		const chapter = await chapterManager.getChapterById(id);
		if (!chapter) {
			return NextResponse.json(
				{ error: '章节不存在' },
				{ status: 404 }
			);
		}

		// 验证数据所有权
		const hasAccess = await verifyDataOwnership(user.id, chapter.userId, user.role);
		if (!hasAccess) {
			return NextResponse.json(
				{ error: '无权访问此章节' },
				{ status: 403 }
			);
		}

		return NextResponse.json({
			success: true,
			data: chapter,
		});
	} catch (error) {
		console.error('获取章节失败:', error);
		return NextResponse.json(
			{ error: '获取章节失败' },
			{ status: 500 }
		);
	}
}

/**
 * 更新章节
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

		// 获取章节
		const chapter = await chapterManager.getChapterById(id);
		if (!chapter) {
			return NextResponse.json(
				{ error: '章节不存在' },
				{ status: 404 }
			);
		}

		// 验证数据所有权
		const hasAccess = await verifyDataOwnership(user.id, chapter.userId, user.role);
		if (!hasAccess) {
			return NextResponse.json(
				{ error: '无权修改此章节' },
				{ status: 403 }
			);
		}

		const body = await request.json();
		const { title, content, wordCount, qualityScore, completionRate, shuangdianCount, isPublished } = body;

		// 更新章节
		const updatedChapter = await chapterManager.updateChapter(id, {
			title: title !== undefined ? title : undefined,
			content: content !== undefined ? content : undefined,
			wordCount: wordCount !== undefined ? wordCount : undefined,
			qualityScore: qualityScore !== undefined ? qualityScore : undefined,
			completionRate: completionRate !== undefined ? completionRate : undefined,
			shuangdianCount: shuangdianCount !== undefined ? shuangdianCount : undefined,
			isPublished: isPublished !== undefined ? isPublished : undefined,
		});

		return NextResponse.json({
			success: true,
			data: updatedChapter,
		});
	} catch (error) {
		console.error('更新章节失败:', error);
		return NextResponse.json(
			{ error: '更新章节失败' },
			{ status: 500 }
		);
	}
}

/**
 * 删除章节
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

		// 获取章节
		const chapter = await chapterManager.getChapterById(id);
		if (!chapter) {
			return NextResponse.json(
				{ error: '章节不存在' },
				{ status: 404 }
			);
		}

		// 验证数据所有权
		const hasAccess = await verifyDataOwnership(user.id, chapter.userId, user.role);
		if (!hasAccess) {
			return NextResponse.json(
				{ error: '无权删除此章节' },
				{ status: 403 }
			);
		}

		// 删除章节（软删除）
		const success = await chapterManager.deleteChapter(id);
		if (!success) {
			return NextResponse.json(
				{ error: '删除章节失败' },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			message: '章节已删除',
		});
	} catch (error) {
		console.error('删除章节失败:', error);
		return NextResponse.json(
			{ error: '删除章节失败' },
			{ status: 500 }
		);
	}
}
