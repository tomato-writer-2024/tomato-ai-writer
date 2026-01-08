import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { uploadFile } from '@/lib/storageService';

/**
 * 文件上传API
 *
 * 支持的文件类型：
 * - 图片：头像、作品封面 (jpg, jpeg, png, gif, webp)
 * - 文档：Word, PDF, TXT (docx, pdf, txt)
 *
 * 文件大小限制：10MB
 */
export async function POST(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		// 获取表单数据
		const formData = await request.formData();
		const file = formData.get('file') as File;

		// 验证文件是否存在
		if (!file) {
			return NextResponse.json(
				{ error: '请选择要上传的文件' },
				{ status: 400 }
			);
		}

		// 验证文件大小（限制为10MB）
		const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
		if (file.size > MAX_FILE_SIZE) {
			const sizeMB = (file.size / 1024 / 1024).toFixed(2);
			return NextResponse.json(
				{ error: `文件大小超过限制（当前：${sizeMB}MB，最大：10MB）` },
				{ status: 400 }
			);
		}

		// 验证文件类型
		const fileName = file.name.toLowerCase();
		const allowedExtensions = [
			// 图片
			'.jpg', '.jpeg', '.png', '.gif', '.webp',
			// 文档
			'.docx', '.pdf', '.txt',
		];

		const isAllowedExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

		if (!isAllowedExtension) {
			return NextResponse.json(
				{
					error: '不支持的文件格式。支持的格式：图片(jpg, jpeg, png, gif, webp)、文档(docx, pdf, txt)'
				},
				{ status: 400 }
			);
		}

		// 读取文件内容
		const arrayBuffer = await file.arrayBuffer();
		const fileBuffer = Buffer.from(arrayBuffer);

		// 生成文件名（添加用户ID前缀以确保唯一性）
		const timestamp = Date.now();
		const fileExt = fileName.substring(fileName.lastIndexOf('.'));
		const newFileName = `${user.id}_${timestamp}_${file.name}`;

		// 上传到对象存储
		const fileKey = await uploadFile({
			fileName: newFileName,
			fileContent: fileBuffer,
			contentType: file.type,
		});

		return NextResponse.json({
			success: true,
			data: {
				key: fileKey,
				fileName: file.name,
				fileSize: file.size,
				contentType: file.type,
			},
		});
	} catch (error) {
		console.error('文件上传失败:', error);
		return NextResponse.json(
			{ error: '文件上传失败，请稍后重试' },
			{ status: 500 }
		);
	}
}
