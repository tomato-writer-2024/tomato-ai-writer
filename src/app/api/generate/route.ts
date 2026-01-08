import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { type, prompt, chapterNum, context, characters, outline, wordCount } = await request.json();

    // 构建系统提示词
    const systemPrompt = `你是一位专业的番茄小说创作助手，擅长创作符合番茄平台风格的爆款爽文。

## 创作要求：
1. **爽点密度**：每500字至少包含一个爽点（打脸、逆袭、装逼等）
2. **节奏控制**：情节推进要快，避免冗长描写
3. **语言风格**：口语化、网感强，使用番茄风格词汇（如"炸了"、"爽翻"、"跪舔"等）
4. **句子结构**：多用短句，每段不超过30字
5. **情绪调动**：通过对比、冲突、期待感等手法调动读者情绪
6. **结尾钩子**：章节结尾要留下悬念或冲突，吸引读者追更

## 番茄平台适配：
- 开篇800字内要抛出核心冲突
- 1000字内展示金手指的强大功能
- 通过悬念和伏笔营造期待感
- 确保内容符合番茄平台审核规则

## 输出要求：
- 严格按照大纲发展剧情
- 保持角色性格一致性
- 确保逻辑连贯，不出现前后矛盾
- 控制字数在${wordCount}字左右
- 添加合理的对话和心理描写`;

    // 构建用户提示词
    const userPrompt = `请根据以下信息创作第${chapterNum}章：

【故事背景】
${context}

【角色信息】
${characters}

【本章大纲】
${outline}

【创作要求】
${prompt}

请直接输出章节内容，不要包含任何分析或说明文字。`;

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
      temperature: 1.2,
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
    console.error('Generate error:', error);
    return NextResponse.json(
      { success: false, error: '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
