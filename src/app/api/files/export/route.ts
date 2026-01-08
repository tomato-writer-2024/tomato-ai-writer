import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { exportAsWord, exportAsTxt } from '@/lib/fileUtils';
import { uploadFile, generatePresignedUrl } from '@/lib/storageService';

/**
 * 文档导出API
 *
 * 支持导出的格式：
 * - Word文档 (.docx)
 * - 文本文件 (.txt)
 *
 * 用途：将编辑器中的内容导出为文档文件
 */
export async function POST(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		const { content, format, filename } = await request.json();

		// 验证必要参数
		if (!content || content.trim().length === 0) {
			return NextResponse.json(
				{ error: '没有内容可导出' },
				{ status: 400 }
			);
		}

		if (!format || !['word', 'txt'].includes(format)) {
			return NextResponse.json(
				{ error: '不支持的导出格式。支持的格式：word, txt' },
				{ status: 400 }
			);
		}

		// 生成文件名
		const defaultFilename = `export_${Date.now()}.${format === 'word' ? 'docx' : 'txt'}`;
		const exportFilename = filename || defaultFilename;

		// 导出文件
		let fileBuffer: Buffer;
		let contentType: string;

		if (format === 'word') {
			const docx = await import('docx');
			const { Document, Packer, Paragraph, TextRun } = docx;

			// 处理内容：将连续换行符转换为段落
			const paragraphs = content
				.split('\n\n')
				.filter((text: string) => text.trim().length > 0)
				.map((text: string) => new Paragraph({
					children: [new TextRun(text)],
					spacing: {
						after: 200,
					},
				}));

			const doc = new Document({
				sections: [{
					properties: {},
					children: paragraphs,
				}],
			});

			const blob = await Packer.toBlob(doc);
			fileBuffer = Buffer.from(await blob.arrayBuffer());
			contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
		} else {
			// TXT格式
			fileBuffer = Buffer.from(content, 'utf-8');
			contentType = 'text/plain';
		}

		// 上传到对象存储
		const storageFilename = `${user.id}_export_${Date.now()}_${exportFilename}`;
		const fileKey = await uploadFile({
			fileName: storageFilename,
			fileContent: fileBuffer,
			contentType,
		});

		// 生成下载URL
		const downloadUrl = await generatePresignedUrl({
			key: fileKey,
			expireTime: 3600, // 1小时
		});

		return NextResponse.json({
			success: true,
			data: {
				url: downloadUrl,
				filename: exportFilename,
				fileSize: fileBuffer.length,
				format,
			},
		});
	} catch (error) {
		console.error('文档导出失败:', error);
		const errorMessage = error instanceof Error ? error.message : '文档导出失败，请稍后重试';
		return NextResponse.json(
			{ error: errorMessage },
			{ status: 500 }
		);
	}
}
