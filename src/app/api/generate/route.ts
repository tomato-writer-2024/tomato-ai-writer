import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, LLMMessage } from '@/lib/llmClient';
import {
  CHAPTER_WRITING_PROMPTS,
  CONTINUE_WRITING_PROMPTS,
  POLISH_PROMPTS,
  GOLDEN_START_PROMPTS,
  replacePromptVariables,
} from '@/lib/prompts';

// GET /api/generate - 获取可用的生成模式
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      modes: {
        write: {
          name: '章节撰写',
          templates: CHAPTER_WRITING_PROMPTS.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
          })),
        },
        continue: {
          name: '智能续写',
          templates: CONTINUE_WRITING_PROMPTS.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
          })),
        },
        polish: {
          name: '精修润色',
          templates: POLISH_PROMPTS.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
          })),
        },
        start: {
          name: '黄金开头',
          templates: GOLDEN_START_PROMPTS.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
          })),
        },
      },
      qualityStandards: {
        目标评分: '9.8分+',
        目标排名: '各题材Top3',
        节奏锚点: '每500字1个',
        情节密度: '每2000字1个冲突',
        爽点密度: '每1000字1个爽点',
        对话占比: '40%-45%',
        首章完读率: '60%+',
      },
    },
  });
}

// POST /api/generate - AI内容生成
export async function POST(request: NextRequest) {
  try {
    // 解析请求参数
    const body = await request.json();
    const {
      mode = 'write', // write | continue | polish | start
      prompt = '',
      wordCount = 2500,
      storyContext = '',
      characterInfo = '',
      plotOutline = '',
      previousContent = '',
      chapterTitle = '',
      currentContent = '',
      promptTemplate,
    } = body;

    // 验证必要参数
    if (!prompt.trim()) {
      return NextResponse.json(
        { success: false, error: '请输入生成提示' },
        { status: 400 }
      );
    }

    // 选择提示词模板
    let selectedPrompt = '';
    let promptVariables: Record<string, string | number> = {
      prompt,
      wordCount,
      storyContext,
      characterInfo,
      plotOutline,
      previousContent,
      chapterTitle,
      currentContent,
    };

    switch (mode) {
      case 'write':
        // 章节撰写模式
        const writeTemplate = promptTemplate
          ? CHAPTER_WRITING_PROMPTS.find((p) => p.id === promptTemplate)
          : CHAPTER_WRITING_PROMPTS[0];
        selectedPrompt = writeTemplate?.prompt || CHAPTER_WRITING_PROMPTS[0].prompt;
        break;

      case 'continue':
        // 智能续写模式
        const continueTemplate = promptTemplate
          ? CONTINUE_WRITING_PROMPTS.find((p) => p.id === promptTemplate)
          : CONTINUE_WRITING_PROMPTS[0];
        selectedPrompt = continueTemplate?.prompt || CONTINUE_WRITING_PROMPTS[0].prompt;
        break;

      case 'polish':
        // 精修润色模式
        const polishTemplate = promptTemplate
          ? POLISH_PROMPTS.find((p) => p.id === promptTemplate)
          : POLISH_PROMPTS[0];
        selectedPrompt = polishTemplate?.prompt || POLISH_PROMPTS[0].prompt;
        break;

      case 'start':
        // 黄金开头模式
        const startTemplate = promptTemplate
          ? GOLDEN_START_PROMPTS.find((p) => p.id === promptTemplate)
          : GOLDEN_START_PROMPTS[0];
        selectedPrompt = startTemplate?.prompt || GOLDEN_START_PROMPTS[0].prompt;
        break;

      default:
        return NextResponse.json(
          { success: false, error: '不支持的生成模式' },
          { status: 400 }
        );
    }

    // 替换提示词变量
    const finalPrompt = replacePromptVariables(selectedPrompt, promptVariables);

    // 创建LLM客户端
    const llmClient = new LLMClient();

    // 构建消息
    const messages: LLMMessage[] = [
      { role: 'user', content: finalPrompt },
    ];

    // 创建流式响应
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 使用流式调用
          const streamGenerator = llmClient.chatStream(messages, {
            temperature: 0.9, // 高温输出，增强创意
          });

          for await (const chunk of streamGenerator) {
            controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('流式生成错误:', error);
          const errorMessage =
            error instanceof Error ? error.message : '生成失败';
          controller.enqueue(encoder.encode(`data: [ERROR] ${errorMessage}\n\n`));
          controller.close();
        }
      },
    });

    // 返回SSE流式响应
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('生成API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '生成失败',
      },
      { status: 500 }
    );
  }
}
