import { NextRequest, NextResponse } from 'next/server';
import {
  AuthorStyle,
  StyleAnalysis,
  FAMOUS_AUTHOR_STYLES
} from '@/lib/styleSimulator';
import { generateCreativeWritingStream, generateReasoningStream } from '@/lib/llmClient';
import { getSystemPromptForFeature } from '@/lib/tomatoNovelPrompts';

// GET /api/style-simulator/styles - 获取所有可用风格
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: FAMOUS_AUTHOR_STYLES
    });
  } catch (error) {
    console.error('获取风格列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取风格列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/style-simulator - 处理所有POST请求
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: '缺少action参数' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'analyze':
        return handleAnalyze(params);
      case 'match':
        return handleMatch(params);
      case 'suggest':
        return handleSuggest(params);
      case 'generate':
        return handleGenerate(params);
      default:
        return NextResponse.json(
          { success: false, error: '未知的action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

async function handleAnalyze(params: any) {
  try {
    const { content } = params;

    if (!content) {
      return NextResponse.json(
        { success: false, error: '缺少内容' },
        { status: 400 }
      );
    }

    // 使用LLM分析风格（番茄小说风格）
    const systemPrompt = getSystemPromptForFeature('style-simulator');
    const userPrompt = `请分析以下番茄小说文本的风格特征（符合Top3爆款标准）：

${content}

【分析要求】
- 从番茄小说快节奏、强代入感的角度分析风格特征
- 考虑爽文常用词（震惊、碾压、轰爆、恐怖、逆天、绝世、无敌、至尊、巅峰、惊人）
- 评估是否符合番茄小说读者的阅读习惯

请分析：
1. 句子特征（长度、结构、流畅度）
2. 词汇特征（词汇水平、修辞手法、网感）
3. 叙事特征（视角、节奏、描写水平）
4. 情感特征（基调、幽默度、严肃度）
5. 主题特征（主题、象征）
6. 爽文特征（爽点密度、悬念设置、代入感）

【质量目标】
- 准确率：95%+
- 番茄小说风格匹配度：90%+
- 读者喜好度：9.8分+

请以JSON格式输出，结构清晰，易于理解。`;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = generateReasoningStream(systemPrompt, userPrompt);

          for await (const chunk of generator) {
            const text = chunk || '';
            controller.enqueue(encoder.encode(text));
          }

          controller.enqueue(encoder.encode('[DONE]'));
          controller.close();
        } catch (error) {
          console.error('分析文本风格失败:', error);
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
    console.error('分析文本风格失败:', error);
    return NextResponse.json(
      { success: false, error: '分析文本风格失败' },
      { status: 500 }
    );
  }
}

async function handleMatch(params: any) {
  try {
    const { content, genre } = params;

    if (!content) {
      return NextResponse.json(
        { success: false, error: '缺少内容' },
        { status: 400 }
      );
    }

    // 使用LLM匹配风格（番茄小说风格）
    const systemPrompt = getSystemPromptForFeature('style-simulator');
    const userPrompt = `请将以下番茄小说文本与知名作者风格匹配（符合Top3爆款标准）：

内容：${content}
题材：${genre}

【匹配要求】
- 从番茄小说平台Top3爆款小说作者角度匹配
- 考虑爽文风格、快节奏、强代入感等特征
- 评估是否符合番茄小说读者的阅读习惯

请分析：
1. 最匹配的3个番茄小说Top3爆款作者风格
2. 每个风格的相似度评分（0-100分）
3. 匹配的特征说明（句子、词汇、叙事、情感等维度）
4. 风格建议（如何优化以达到Top3爆款标准）

【质量目标】
- 匹配准确率：95%+
- 番茄小说风格匹配度：90%+
- 读者喜好度：9.8分+

请以JSON格式输出，结构清晰，易于参考。`;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = generateReasoningStream(systemPrompt, userPrompt);

          for await (const chunk of generator) {
            const text = chunk || '';
            controller.enqueue(encoder.encode(text));
          }

          controller.enqueue(encoder.encode('[DONE]'));
          controller.close();
        } catch (error) {
          console.error('匹配最佳风格失败:', error);
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
    console.error('匹配最佳风格失败:', error);
    return NextResponse.json(
      { success: false, error: '匹配最佳风格失败' },
      { status: 500 }
    );
  }
}

async function handleSuggest(params: any) {
  try {
    const { content, targetStyle } = params;

    if (!content) {
      return NextResponse.json(
        { success: false, error: '缺少内容' },
        { status: 400 }
      );
    }

    // 使用LLM生成改进建议（番茄小说风格）
    const systemPrompt = getSystemPromptForFeature('style-simulator');
    const userPrompt = `请为以下番茄小说文本提供风格改进建议（符合Top3爆款标准）：

内容：${content}
目标风格：${targetStyle}

【改进要求】
- 以番茄小说Top3爆款小说为标杆提供改进建议
- 增强爽点密度、悬念设置、代入感等关键要素
- 优化语言风格，使其更符合番茄小说读者的阅读习惯
- 具体到句子层面，提供修改前后的对比示例

【质量目标】
- 改进建议的准确率：95%+
- 番茄小说风格匹配度：90%+
- 读者喜好度：9.8分+

请以JSON格式输出，结构清晰，易于操作。`;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = generateReasoningStream(systemPrompt, userPrompt);

          for await (const chunk of generator) {
            const text = chunk || '';
            controller.enqueue(encoder.encode(text));
          }

          controller.enqueue(encoder.encode('[DONE]'));
          controller.close();
        } catch (error) {
          console.error('生成改进建议失败:', error);
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
    console.error('生成改进建议失败:', error);
    return NextResponse.json(
      { success: false, error: '生成改进建议失败' },
      { status: 500 }
    );
  }
}

async function handleGenerate(params: any) {
  try {
    const { content, authorStyle, intensity } = params;

    if (!content || !authorStyle) {
      return NextResponse.json(
        { success: false, error: '缺少内容或风格参数' },
        { status: 400 }
      );
    }

    // 使用LLM生成风格化文本（番茄小说风格）
    const systemPrompt = getSystemPromptForFeature('style-simulator');
    const userPrompt = `请将以下番茄小说文本改写为${authorStyle}风格（符合Top3爆款标准）：

原文：${content}
风格强度：${intensity || '中等'}

【改写要求】
- 以番茄小说Top3爆款小说为目标风格进行改写
- 保持原文核心爽点和情节
- 增强爽点密度、悬念设置、代入感
- 优化语言风格，使其更符合番茄小说读者的阅读习惯
- 保持节奏明快，不拖沓

【质量目标】
- 改写准确率：95%+
- 番茄小说风格匹配度：90%+
- 读者喜好度：9.8分+

请流式输出改写后的文本，保持原有的情节和爽点。`;

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
          console.error('应用风格失败:', error);
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
    console.error('应用风格失败:', error);
    return NextResponse.json(
      { success: false, error: '应用风格失败' },
      { status: 500 }
    );
  }
}
