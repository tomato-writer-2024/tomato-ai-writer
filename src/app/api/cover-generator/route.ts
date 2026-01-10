import { NextRequest, NextResponse } from 'next/server';
import { CoverStyle } from '@/lib/coverDescriptionGenerator';
import { generateCreativeWritingStream } from '@/lib/llmClient';
import { getSystemPromptForFeature } from '@/lib/tomatoNovelPrompts';

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

    const systemPrompt = getSystemPromptForFeature('cover-generator');
    const userPrompt = `请为以下番茄小说设计封面视觉描述（符合Top3爆款标准）：

小说标题：${novelTitle}
题材：${genre}
主要角色：${mainCharacters?.map((c: any) => c.name).join('、') || '未提供'}
关键元素：${keyElements?.join('、') || '未提供'}
主题：${theme || '未提供'}
氛围：${mood || '未提供'}
偏好风格：${preferredStyle || '未指定'}
目标读者：${targetAudience || '未提供'}

【创作要求】
- 确保封面符合番茄小说Top3爆款小说封面的特征
- 视觉冲击力强，黄金3秒内抓住读者注意力
- 体现核心元素（主角、金手指、爽点类型）
- 符合题材特点，吸引目标读者
- 适合AI绘画工具生成（Midjourney/Stable Diffusion）

请生成包含以下内容的封面描述：

1. 整体风格定义（符合题材特征）
2. 核心视觉元素（3-5个主要元素，体现卖点）
3. 配色方案（主色+辅色+点缀色，符合题材氛围）
4. 构图设计（布局、视角、焦点，黄金比例）
5. 画面氛围（情绪、基调，体现爽文特征）
6. 视觉亮点（最吸引眼球的地方，增强点击率）
7. AI绘画提示词（适合Midjourney/Stable Diffusion，详细精准）
8. 替代方案（2-3个可选风格）

【质量目标】
- 视觉冲击力：90分+
- 卖点传达度：95%+
- 目标读者吸引力：9.8分+
- 预期点击率：提升30%+
- AI绘画成功率：95%+

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
