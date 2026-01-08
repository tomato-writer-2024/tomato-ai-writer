import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    // 构建系统提示词
    const systemPrompt = `你是一位专业的小说编辑，精通番茄小说的润色技巧。

## 润色原则：
1. **网感增强**：将书面语转化为番茄风格的口语化表达
2. **爽点放大**：为普通情节增加细节描写，提升爽点冲击力
3. **情绪渲染**：通过环境描写和心理活动，增强情节的情绪感染力
4. **对比强化**：通过对比手法，突出主角的强大和对手的弱小
5. **冗余修剪**：识别并删除非必要的环境描写和心理活动
6. **节奏优化**：调整情节推进速度，确保剧情紧凑
7. **句式优化**：将长句拆分为短句，提升阅读流畅度

## 输出要求：
- 保持原有剧情和核心内容不变
- 只优化语言表达，不改变故事走向
- 提升爽点的冲击力和感染力
- 确保符合番茄平台风格
- 直接返回润色后的内容，不要包含任何分析或说明文字`;

    // 构建用户提示词
    const userPrompt = `请对以下章节内容进行精修润色：

${content}

请直接返回润色后的内容。`;

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
      temperature: 0.8,
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
    console.error('Polish error:', error);
    return NextResponse.json(
      { success: false, error: '润色失败，请稍后重试' },
      { status: 500 }
    );
  }
}
