import { NextRequest, NextResponse } from 'next/server';
import {
  AuthorStyle,
  StyleAnalysis,
  FAMOUS_AUTHOR_STYLES
} from '@/lib/styleSimulator';
import { generateCreativeWritingStream, generateReasoningStream } from '@/lib/llmClient';
import { getSystemPromptForFeature } from '@/lib/tomatoNovelPrompts';

// GET /api/style-simulator/styles - 获取所有可用风格
export async function getStyles() {
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

// POST /api/style-simulator/analyze - 分析文本风格
export async function analyzeTextStyle(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

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

// POST /api/style-simulator/match - 匹配最佳风格
export async function matchBestStyle(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, genre } = body;

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

// POST /api/style-simulator/suggest - 风格改进建议
export async function suggestImprovements(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, targetStyle } = body;

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
- 融入爽文常用词（震惊、碾压、轰爆、恐怖、逆天、绝世、无敌、至尊、巅峰、惊人）

请提供：
1. 当前风格特征（与Top3爆款标准的差距）
2. 改进建议（3-5个，针对爽点密度、悬念、代入感等）
3. 具体修改示例（修改前 vs 修改后）
4. 改进原因（说明如何提升读者体验和完读率）

【质量目标】
- 改进成功率：95%+
- 爽点密度提升：每1000字至少1个爽点
- 读者喜好度：9.8分+
- 完读率：90%+

请以JSON格式输出，结构清晰，易于实施。`;

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
          console.error('生成风格改进建议失败:', error);
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
    console.error('生成风格改进建议失败:', error);
    return NextResponse.json(
      { success: false, error: '生成风格改进建议失败' },
      { status: 500 }
    );
  }
}

// POST /api/style-simulator/apply - 应用作者风格
export async function applyStyle(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, authorStyle, intensity } = body;

    if (!content || !authorStyle) {
      return NextResponse.json(
        { success: false, error: '缺少内容或风格' },
        { status: 400 }
      );
    }

    // 使用LLM应用风格
    const style = FAMOUS_AUTHOR_STYLES.find(s => s.id === authorStyle);

    if (!style) {
      return NextResponse.json(
        { success: false, error: '未找到指定风格' },
        { status: 404 }
      );
    }

    const systemPrompt = `你是一个专业的文风模拟助手。请按照以下作者的风格改写用户提供的文本：
作者：${style.name}
时代：${style.era}
题材：${style.genre}
风格特征：${JSON.stringify(style.characteristics, null, 2)}

改写时请注意：
1. 句子长度和结构
2. 词汇选择和修辞手法
3. 叙事视角和节奏
4. 情感基调和主题表达
5. 保持原意和情节不变

应用强度：${intensity || 80}%（100%为完全模仿，50%为适度借鉴）`;

    const userPrompt = `请按照${style.name}的风格改写以下文本：

${content}

请直接输出改写后的文本，不要添加任何解释。`;

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

// POST /api/style-simulator/custom - 自定义风格
export async function createCustomStyle(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, sampleText, preferences } = body;

    if (!name || !sampleText) {
      return NextResponse.json(
        { success: false, error: '缺少风格名称或示例文本' },
        { status: 400 }
      );
    }

    // 使用LLM分析示例文本提取风格特征
    const systemPrompt = '你是一个专业的风格分析助手。请分析示例文本的风格特征。';
    const userPrompt = `请分析以下文本的风格特征：

示例文本：${sampleText}

请输出JSON格式的风格特征分析。`;

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
          console.error('创建自定义风格失败:', error);
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
    console.error('创建自定义风格失败:', error);
    return NextResponse.json(
      { success: false, error: '创建自定义风格失败' },
      { status: 500 }
    );
  }
}

// POST /api/style-simulator/compare - 风格对比
export async function compareStyles(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, styleA, styleB } = body;

    if (!content || !styleA || !styleB) {
      return NextResponse.json(
        { success: false, error: '缺少参数' },
        { status: 400 }
      );
    }

    const systemPrompt = '你是一个专业的文风分析助手。请对比两种不同风格在同一内容上的表现。';
    const userPrompt = `请对比以下两种风格对同一内容的改写效果：

原文：
${content}

风格A：${styleA}
风格B：${styleB}

请分析：
1. 两种风格的主要差异（句子、词汇、节奏、情感等）
2. 各自的优缺点
3. 适用场景建议
4. 改进建议

请以结构化的Markdown格式输出。`;

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
          console.error('对比风格失败:', error);
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
    console.error('对比风格失败:', error);
    return NextResponse.json(
      { success: false, error: '对比风格失败' },
      { status: 500 }
    );
  }
}
