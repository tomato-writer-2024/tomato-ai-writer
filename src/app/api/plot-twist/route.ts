import { NextRequest, NextResponse } from 'next/server';
import { TWIST_TYPES } from '@/lib/plotTwistGenerator';
import { generateCreativeWritingStream } from '@/lib/llmClient';

// GET /api/plot-twist/types - 获取所有反转类型
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: TWIST_TYPES
    });
  } catch (error) {
    console.error('获取反转类型失败:', error);
    return NextResponse.json(
      { success: false, error: '获取反转类型失败' },
      { status: 500 }
    );
  }
}

// POST /api/plot-twist/generate - 生成情节反转建议
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPlot, twistType, novelContext } = body;

    if (!currentPlot) {
      return NextResponse.json(
        { success: false, error: '缺少当前情节' },
        { status: 400 }
      );
    }

    const systemPrompt = '你是一个专业的小说情节创作助手，擅长设计令人惊喜又合理的情节反转。';
    const userPrompt = `请为以下情节设计${twistType ? '指定类型的' : '多类型的'}情节反转：

当前情节：${currentPlot}
小说背景：${novelContext || '未提供'}
${twistType ? `反转类型：${TWIST_TYPES[twistType as keyof typeof TWIST_TYPES]?.description}` : ''}

请生成：
1. 3-5个不同类型的反转建议（每个包含：反转类型、具体描述、影响等级）
2. 每个反转需要的伏笔建议
3. 实施难度评估
4. 读者预期反应预测
5. 风险等级评估

确保反转出乎意料又合乎逻辑、符合人物性格、推动剧情发展。请以Markdown格式输出，结构清晰，易于实施。`;

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
          console.error('生成情节反转失败:', error);
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
    console.error('生成情节反转失败:', error);
    return NextResponse.json(
      { success: false, error: '生成情节反转失败' },
      { status: 500 }
    );
  }
}
