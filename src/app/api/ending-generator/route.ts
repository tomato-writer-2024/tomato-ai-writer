import { NextRequest, NextResponse } from 'next/server';
import { ENDING_TYPES } from '@/lib/endingGenerator';
import { generateCreativeWritingStream } from '@/lib/llmClient';
import { getSystemPromptForFeature } from '@/lib/tomatoNovelPrompts';

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

    const systemPrompt = getSystemPromptForFeature('ending-generator');
    const userPrompt = `请为以下番茄小说设计结局方案（符合Top3爆款标准）：

小说标题：${novelTitle}
题材：${storyGenre}
主题：${storyTheme}
主角：${mainCharacters?.map((c: any) => c.name).join('、') || '未提供'}
当前情节进度：${currentPlot || '未提供'}
偏好结局类型：${preferredEndingType || '未指定'}

【创作要求】
- 确保结局符合番茄小说快节奏、强代入感的特征
- 结局要有强烈的情感冲击力，让读者意犹未尽
- 主题升华，体现番茄小说爽文的核心价值
- 伏笔回收完整，避免逻辑漏洞
- 为读者留下追读动力（推荐其他作品或期待续作）

请生成3-5个不同类型的结局方案，每个方案包含：
1. 结局类型和简要描述
2. 核心事件清单（按时间顺序，节奏紧凑）
3. 主要角色的最终命运（符合人物成长线）
4. 主题的升华和表达（体现爽文价值）
5. 情感冲击力评分（目标：90分+）
6. 读者满意度预测（目标：9.8分+）
7. 创新性评分（目标：85分+）
8. 实施难度评估
9. 需要提前埋设的伏笔
10. 读者预期反应（完读率、推荐、付费）

【质量目标】
- 编辑视角评分：9.8分+（主题升华、情感冲击、完整性）
- 读者视角评分：9.8分+（爽感、代入、追读动力）
- 完读率：90%+

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
