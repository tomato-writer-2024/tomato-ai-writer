import { NextRequest, NextResponse } from 'next/server';
import {
  WriterBlockAnalysis,
  BLOCK_TYPE_DESCRIPTIONS,
  COMMON_BLOCK_CAUSES,
  generateInspirationTriggers
} from '@/lib/writerBlockHelper';
import { generateCreativeWritingStream, generateReasoningStream } from '@/lib/llmClient';

// POST /api/writer-block/diagnose - 诊断卡文问题
export async function diagnoseBlock(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, chapterNumber, novelContext } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: '缺少当前内容' },
        { status: 400 }
      );
    }

    // 使用LLM进行诊断
    const systemPrompt = '你是一个专业的小说创作顾问，擅长分析卡文问题。';
    const userPrompt = `请分析以下内容的卡文问题：

内容：${content}
章节：${chapterNumber}
背景：${novelContext}

请分析：
1. 卡文类型
2. 严重程度
3. 主要原因（3-5个）
4. 紧急程度评估

请以JSON格式输出。`;

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
          console.error('诊断卡文问题失败:', error);
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
    console.error('诊断卡文问题失败:', error);
    return NextResponse.json(
      { success: false, error: '诊断卡文问题失败' },
      { status: 500 }
    );
  }
}

// POST /api/writer-block/solutions - 生成破局建议
export async function generateBlockSolutions(request: NextRequest) {
  try {
    const body = await request.json();
    const { blockType, currentContent, novelContext } = body;

    if (!blockType) {
      return NextResponse.json(
        { success: false, error: '缺少卡文类型' },
        { status: 400 }
      );
    }

    // 使用LLM生成深度分析
    const systemPrompt = '你是一个专业的小说创作顾问，擅长分析卡文问题并提供实用的破局建议。';
    const userPrompt = `请为以下卡文情况提供详细的破局建议：

卡文类型：${BLOCK_TYPE_DESCRIPTIONS[blockType as keyof typeof BLOCK_TYPE_DESCRIPTIONS]}
当前内容：${currentContent || '未提供'}
小说背景：${novelContext || '未提供'}

请提供：
1. 问题根源分析（3-5个主要原因）
2. 立即可执行的破局方案（3个）
3. 长期解决方案（2个）
4. 替代情节思路（2-3个）
5. 预计恢复时间评估

请以结构化的方式输出，每个方案都要说明具体的操作步骤和预期效果。`;

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
          console.error('生成破局建议失败:', error);
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
    console.error('生成破局建议失败:', error);
    return NextResponse.json(
      { success: false, error: '生成破局建议失败' },
      { status: 500 }
    );
  }
}

// POST /api/writer-block/plot-gaps - 识别剧情漏洞
export async function identifyGaps(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, chapterContext } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: '缺少内容信息' },
        { status: 400 }
      );
    }

    // 使用LLM识别剧情漏洞
    const systemPrompt = '你是一个专业的小说剧情分析助手，擅长识别剧情漏洞和逻辑问题。';
    const userPrompt = `请分析以下内容的剧情漏洞：

内容：${content}
章节背景：${chapterContext}

请识别：
1. 信息漏洞
2. 动机缺失
3. 因果逻辑问题
4. 节奏问题
5. 其他问题

请以JSON格式输出。`;

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
          console.error('识别剧情漏洞失败:', error);
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
    console.error('识别剧情漏洞失败:', error);
    return NextResponse.json(
      { success: false, error: '识别剧情漏洞失败' },
      { status: 500 }
    );
  }
}

// POST /api/writer-block/inspiration - 生成灵感触发器
export async function generateInspiration(request: NextRequest) {
  try {
    const body = await request.json();
    const { blockType, preferences } = body;

    const triggers = generateInspirationTriggers(blockType);

    return NextResponse.json({ success: true, data: triggers });
  } catch (error) {
    console.error('生成灵感触发器失败:', error);
    return NextResponse.json(
      { success: false, error: '生成灵感触发器失败' },
      { status: 500 }
    );
  }
}

// POST /api/writer-block/brainstorm - 头脑风暴生成创意
export async function brainstormIdeas(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPlot, constraints, creativeDirection } = body;

    const systemPrompt = '你是一个专业的小说创意生成助手，擅长通过头脑风暴激发创作灵感。';
    const userPrompt = `请为以下情节进行头脑风暴，生成多个创意方向：

当前情节：${currentPlot}
限制条件：${constraints || '无限制'}
创意方向：${creativeDirection || '无特别要求'}

请生成：
1. 5个不同方向的情节发展
2. 每个方向包含：核心创意、关键转折、潜在冲突、角色成长
3. 评估每个创意的新颖度和可行性
4. 标记出最具爆点的方向

请以Markdown格式输出，确保创意新颖、逻辑合理、符合网文爽点。`;

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
          console.error('头脑风暴失败:', error);
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
    console.error('头脑风暴失败:', error);
    return NextResponse.json(
      { success: false, error: '头脑风暴失败' },
      { status: 500 }
    );
  }
}

// POST /api/writer-block/action-plan - 创建行动计划
export async function createRecoveryPlan(request: NextRequest) {
  try {
    const body = await request.json();
    const { diagnosis, timeframe } = body;

    // 使用LLM创建行动计划
    const systemPrompt = '你是一个专业的小说创作顾问，擅长制定行动计划。';
    const userPrompt = `请为以下卡文诊断创建恢复计划：

诊断：${JSON.stringify(diagnosis, null, 2)}
时间范围：${timeframe || '一周'}

请创建：
1. 优先级任务清单
2. 每个任务的具体步骤
3. 截止日期建议
4. 所需资源
5. 成功标准

请以JSON格式输出。`;

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
          console.error('创建行动计划失败:', error);
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
    console.error('创建行动计划失败:', error);
    return NextResponse.json(
      { success: false, error: '创建行动计划失败' },
      { status: 500 }
    );
  }
}
