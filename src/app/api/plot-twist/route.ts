import { NextRequest, NextResponse } from 'next/server';
import { TWIST_TYPES } from '@/lib/plotTwistGenerator';
import { generateCreativeWritingStream } from '@/lib/llmClient';
import { getSystemPromptForFeature } from '@/lib/tomatoNovelPrompts';

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

    const systemPrompt = getSystemPromptForFeature('plot-twist');
    const userPrompt = `请为以下番茄小说情节设计${twistType ? '指定类型的' : '多类型的'}情节反转（符合Top3爆款标准）：

当前情节：${currentPlot}
小说背景：${novelContext || '未提供'}
${twistType ? `反转类型：${TWIST_TYPES[twistType as keyof typeof TWIST_TYPES]?.description}` : ''}

【创作要求】
- 确保反转符合番茄小说快节奏、强代入感的特征
- 反转要能制造爽点（打脸、装逼、震惊等）
- 为后续情节发展提供新的动力
- 提升完读率和追读动力

请生成：
1. 3-5个不同类型的反转建议（每个包含：反转类型、具体描述、影响等级）
2. 每个反转需要的伏笔建议（提前埋设，确保逻辑自洽）
3. 实施难度评估（技术难度、逻辑难度）
4. 读者预期反应预测（震惊、期待、追读动力）
5. 风险等级评估（对完读率的影响）

【质量目标】
- 编辑视角评分：9.8分+（创新性、逻辑性、推动情节）
- 读者视角评分：9.8分+（爽感、期待、追读动力）
- 完读率提升：90%+

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
