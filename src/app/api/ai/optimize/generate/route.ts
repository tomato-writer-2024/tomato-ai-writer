import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { aiOptimizer } from '@/lib/aiOptimizer';

/**
 * 使用模板生成内容（AI优化器）
 */
export async function POST(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ success: false, error }, { status: 401 });
		}

		const body = await request.json();
		const { templateId, parameters, stream = false } = body;

		// 验证必要参数
		if (!templateId) {
			return NextResponse.json(
				{ success: false, error: '缺少模板ID' },
				{ status: 400 }
			);
		}

		// 如果启用流式输出
		if (stream) {
			const encoder = new TextEncoder();

			const stream = new ReadableStream({
				async start(controller) {
					try {
						let fullContent = '';

						await aiOptimizer.generateFromTemplate(
							templateId,
							parameters,
							(chunk) => {
								// 实时发送内容
								controller.enqueue(
									encoder.encode(
										JSON.stringify({
											type: 'chunk',
											content: chunk,
										}) + '\n'
									)
								);
								fullContent += chunk;
							}
						);

						// 发送完成信号
						controller.enqueue(
							encoder.encode(
								JSON.stringify({
									type: 'done',
									content: fullContent,
								}) + '\n'
							)
						);

						controller.close();
					} catch (error: any) {
						controller.enqueue(
							encoder.encode(
								JSON.stringify({
									type: 'error',
									error: error.message,
								}) + '\n'
							)
						);
						controller.close();
					}
				},
			});

			return new NextResponse(stream, {
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					'Connection': 'keep-alive',
				},
			});
		} else {
			// 非流式输出
			const content = await aiOptimizer.generateFromTemplate(templateId, parameters);

			return NextResponse.json({
				success: true,
				data: {
					content,
					templateId,
				},
			});
		}
	} catch (error: any) {
		console.error('模板生成失败:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '模板生成失败' },
			{ status: 500 }
		);
	}
}
