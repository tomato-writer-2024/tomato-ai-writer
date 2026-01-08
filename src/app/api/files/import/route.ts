import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { readFileContent } from '@/lib/fileUtils';
import { uploadFile } from '@/lib/storageService';

/**
 * 文档导入API
 *
 * 支持导入的格式：
 * - Word文档 (.docx)
 * - PDF文档 (.pdf)
 * - 文本文件 (.txt)
 *
 * 用途：将外部文档导入到编辑器中
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
				{ error: '请选择要导入的文件' },
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

		// 读取文件内容
		const content = await readFileContent(file);

		// 可选：保存文件到对象存储（用于后续查看）
		const timestamp = Date.now();
		const fileName = file.name;
		const newFileName = `${user.id}_import_${timestamp}_${fileName}`;

		try {
			const arrayBuffer = await file.arrayBuffer();
			const fileBuffer = Buffer.from(arrayBuffer);

			await uploadFile({
				fileName: newFileName,
				fileContent: fileBuffer,
				contentType: file.type,
			});
		} catch (storageError) {
			// 存储失败不影响导入，只记录错误
			console.warn('保存导入文件到存储失败:', storageError);
		}

		return NextResponse.json({
			success: true,
			data: {
				content,
				fileName: file.name,
				fileSize: file.size,
				charCount: content.length,
			},
		});
	} catch (error) {
		console.error('文档导入失败:', error);
		const errorMessage = error instanceof Error ? error.message : '文档导入失败，请稍后重试';
		return NextResponse.json(
			{ error: errorMessage },
			{ status: 500 }
		);
	}
}
