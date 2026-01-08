import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { readFile, generatePresignedUrl } from '@/lib/storageService';

/**
 * 文件下载API
 *
 * 通过文件key生成签名URL或直接返回文件内容
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ key: string }> }
) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		const { key } = await params;

		// 生成签名URL（有效期1小时）
		const signedUrl = await generatePresignedUrl({
			key: decodeURIComponent(key),
			expireTime: 3600, // 1小时
		});

		// 重定向到签名URL
		return NextResponse.redirect(signedUrl);
	} catch (error) {
		console.error('生成下载链接失败:', error);
		return NextResponse.json(
			{ error: '生成下载链接失败，请稍后重试' },
			{ status: 500 }
		);
	}
}
