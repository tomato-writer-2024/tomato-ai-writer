import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { optimizeForCompletionRate } from '@/lib/contentGenerator';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    // 验证必要参数
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少待润色内容' },
        { status: 400 }
      );
    }

    // 构建优化后的系统提示词（提升完读率）
    const systemPrompt = `你是番茄小说的顶级编辑，精通9.8分+内容的精修技巧。

## 核心目标：将章节完读率提升至90%+

## 润色策略：
1. **网感增强**：
   - "说" → "激动地说"、"不屑地说"、"咬牙切齿地说"
   - "看" → "震惊地看着"、"冷冷地盯着"、"狂热地注视"
   - "想" → "心中狂喜"、"暗自窃喜"、"心如刀割"

2. **爽点放大**：
   - 打脸爽：增加旁观者的震惊反应
   - 爆发爽：加入环境渲染（风起云涌、天地变色）
   - 收获爽：细致描写宝物的光芒、能量波动

3. **情绪渲染**：
   - 使用排比句增强气势
   - 加入环境描写烘托气氛
   - 通过对比突出情绪反差

4. **句式优化**：
   - 拆分长句为3-5句短句群
   - 每段控制在3-5行
   - 使用感叹号和反问句增强语气

5. **结尾钩子**：
   - 增加悬念：主角会怎么做？
   - 留下伏笔：这件事意味着什么？

## 输出要求：
- 保持原有剧情不变，只优化表达
- 提升爽点的冲击力（使用"恐怖如斯"、"炸裂"等网文词汇）
- 直接返回润色后内容，无任何说明文字`;

    // 构建用户提示词
    const userPrompt = `请对以下内容进行精修润色，目标：完读率90%+：

${content}

【要求】
1. 增强爽点表达和情绪渲染
2. 优化句式，提升阅读流畅度
3. 在结尾增加悬念钩子
4. 直接输出润色内容`;

    // 初始化LLM客户端
    const config = new Config();
    const client = new LLMClient(config);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    // 调用流式AI
    const stream = client.stream(messages, {
      model: 'doubao-pro-4k',
      temperature: 0.9,
      streaming: true,
    });

    // 创建可读流
    const encoder = new TextEncoder();
    let accumulatedContent = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.content?.toString() || '';
            accumulatedContent += content;
            controller.enqueue(encoder.encode(content));
          }

          // 应用完读率优化算法
          const optimizedContent = optimizeForCompletionRate(accumulatedContent);

          // 返回优化标记
          controller.enqueue(encoder.encode('\n\n[OPTIMIZED]'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
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
        'X-Polish-Version': 'v2.0-90plus',
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
