import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { content, context, characters } = await request.json();

    // 构建系统提示词
    const systemPrompt = `你是一位专业的番茄小说创作助手，擅长智能续写。

## 续写原则：
1. **逻辑连贯**：确保续写内容与前文逻辑连贯，不出现前后矛盾
2. **设定一致**：检查续写内容是否与前文设定冲突（角色能力、世界观等）
3. **伏笔跟踪**：根据前文伏笔，在合适时机进行铺垫或回收
4. **爽点导向**：续写方向应包含爽点（打脸、逆袭、装逼等）
5. **角色一致**：确保角色对话和行为符合其性格设定
6. **风格统一**：保持与前文相同的语言风格和叙事节奏
7. **钩子设计**：每段续写结尾要留下钩子，吸引继续阅读

## 输出要求：
- 自然承接前文情节，不突兀
- 保持故事节奏流畅
- 提供多个可能的续写方向（打脸、逆袭、装逼等）
- 控制续写长度在800-1200字
- 直接返回续写内容，不要包含任何分析或说明文字`;

    // 构建用户提示词
    const userPrompt = `请根据以下信息进行智能续写：

【前文内容】
${content}

【故事背景】
${context || '无'}

【角色信息】
${characters || '无'}

请续写下一部分内容，保持与前文风格和逻辑的一致性。`;

    // 初始化LLM客户端
    const config = new Config();
    const client = new LLMClient(config);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    // 使用流式输出
    const stream = client.stream(messages, {
      model: 'doubao-seed-1-6-251015',
      temperature: 1.0,
      streaming: true,
    });

    // 创建可读流
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
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
      },
    });
  } catch (error) {
    console.error('Continue error:', error);
    return NextResponse.json(
      { success: false, error: '续写失败，请稍后重试' },
      { status: 500 }
    );
  }
}
