import { NextRequest, NextResponse } from 'next/server';
import { ENDING_TYPES } from '@/lib/endingGenerator';
import { generateCreativeWritingStream } from '@/lib/llmClient';

// GET /api/ending-generator/types - 获取所有结局类型
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: ENDING_TYPES
    });
  } catch (error) {
    console.error('获取结局类型失败:', error);
    return NextResponse.json(
      { success: false, error: '获取结局类型失败' },
      { status: 500 }
    );
  }
}

// POST /api/ending-generator/generate - 生成结局方案
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      novelTitle,
      storyGenre,
      storyTheme,
      mainCharacters,
      currentPlot,
      preferredEndingType
    } = body;

    const systemPrompt = '你是一个专业的小说结局创作助手，擅长设计令人满意又难忘的结局。';
    const userPrompt = `请为以下小说设计结局方案：

小说标题：${novelTitle}
题材：${storyGenre}
主题：${storyTheme}
主角：${mainCharacters?.map((c: any) => c.name).join('、') || '未提供'}
当前情节进度：${currentPlot || '未提供'}
偏好结局类型：${preferredEndingType || '未指定'}

请生成3-5个不同类型的结局方案，每个方案包含：
1. 结局类型和简要描述
2. 核心事件清单（按时间顺序）
3. 主要角色的最终命运
4. 主题的升华和表达
5. 情感冲击力评分
6. 读者满意度预测
7. 创新性评分
8. 实施难度评估
9. 需要提前埋设的伏笔
10. 读者预期反应

确保结局逻辑合理、情感真挚、主题深刻、符合人物性格。请以Markdown格式输出，结构清晰。`;

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
          console.error('生成结局方案失败:', error);
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
    console.error('生成结局方案失败:', error);
    return NextResponse.json(
      { success: false, error: '生成结局方案失败' },
      { status: 500 }
    );
  }
}
