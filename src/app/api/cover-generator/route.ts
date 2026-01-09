import { NextRequest, NextResponse } from 'next/server';
import { CoverStyle } from '@/lib/coverDescriptionGenerator';
import { generateCreativeWritingStream } from '@/lib/llmClient';

// GET /api/cover-generator/styles - 获取所有封面风格
export async function GET() {
  try {
    const styles: string[] = [
      'realistic',
      'illustration',
      'anime',
      'minimalist',
      'abstract',
      'digital-art',
      'concept-art',
      '3d-render',
      'watercolor',
      'ink-painting'
    ];

    return NextResponse.json({
      success: true,
      data: styles
    });
  } catch (error) {
    console.error('获取封面风格失败:', error);
    return NextResponse.json(
      { success: false, error: '获取封面风格失败' },
      { status: 500 }
    );
  }
}

// POST /api/cover-generator/generate - 生成封面描述
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      novelTitle,
      genre,
      mainCharacters,
      keyElements,
      theme,
      mood,
      preferredStyle,
      targetAudience
    } = body;

    const systemPrompt = '你是一个专业的小说封面设计助手，擅长创作吸引眼球的封面视觉描述。';
    const userPrompt = `请为以下小说设计封面视觉描述：

小说标题：${novelTitle}
题材：${genre}
主要角色：${mainCharacters?.map((c: any) => c.name).join('、') || '未提供'}
关键元素：${keyElements?.join('、') || '未提供'}
主题：${theme || '未提供'}
氛围：${mood || '未提供'}
偏好风格：${preferredStyle || '未指定'}
目标读者：${targetAudience || '未提供'}

请生成包含以下内容的封面描述：

1. 整体风格定义
2. 核心视觉元素（3-5个主要元素）
3. 配色方案
4. 构图设计
5. 画面氛围
6. 视觉亮点

确保封面符合题材、吸引目标读者、传达核心主题、具有视觉冲击力。请以Markdown格式输出，结构清晰。`;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = generateCreativeWritingStream(systemPrompt, userPrompt);

          for await (const chunk of generator) {
            const text = chunk || '';
            controller.enqueue(encoder.encode(text));
          }

          controller.enqueue(encoder.encode('[DONE]'));
          controller.close();
        } catch (error) {
          console.error('生成封面描述失败:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('生成封面描述失败:', error);
    return NextResponse.json(
      { success: false, error: '生成封面描述失败' },
      { status: 500 }
    );
  }
}
