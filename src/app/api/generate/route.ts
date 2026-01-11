import { NextRequest, NextResponse } from 'next/server';
import { generateContentStream, GenerationConfig } from '@/lib/contentGenerator';

export async function POST(request: NextRequest) {
  try {
    const { type, prompt, chapterNum, context, characters, outline, wordCount = 2000 } = await request.json();

    // 验证必要参数
    if (!prompt || !context) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 构建生成配置（优化目标：90%+完读率）
    const config: GenerationConfig = {
      wordCount: wordCount || 2000,
      chapterTitle: prompt,
      genre: '爽文', // 默认爽文类型
      characters: characters || '',
      setting: context,
      outline: outline || '',
      targetReadCompletionRate: 0.90, // 目标完读率90%
      shuangdianDensity: 1.2, // 每500字1.2个爽点
      pacing: 'fast', // 快节奏
      tone: 'light', // 轻松基调
      style: 'internet', // 网文风格
    };

    // 使用高性能流式生成
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // 流式生成内容
          for await (const chunk of generateContentStream(config)) {
            controller.enqueue(encoder.encode(chunk));
          }

          // 生成完成标记
          controller.enqueue(encoder.encode('\n\n[DONE]'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Content-Generation': 'v2.0-optimized',
      },
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { success: false, error: '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
