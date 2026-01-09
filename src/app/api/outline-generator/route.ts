import { NextRequest, NextResponse } from 'next/server';
import { NovelOutline, generateThreeActOutline, analyzeOutline, generateChapterOutline, generateOutlinePrompt, calculateSatisfactionPoints, optimizeOutline } from '@/lib/outlineGenerator';
import { LLMClient } from '@/lib/llmClient';

// POST /api/outline-generator/generate - 生成大纲
export async function generateOutline(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, genre, targetLength, coreConflict, protagonistGoal, stakes } = body;

    if (!title || !genre || !coreConflict) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const outline = generateThreeActOutline(
      title,
      genre,
      targetLength || 100000,
      coreConflict,
      protagonistGoal || '',
      stakes || ''
    );

    return NextResponse.json({ success: true, data: outline });
  } catch (error) {
    console.error('生成大纲失败:', error);
    return NextResponse.json(
      { success: false, error: '生成大纲失败' },
      { status: 500 }
    );
  }
}

// POST /api/outline-generator/analyze - 分析大纲
export async function analyzeNovelOutline(request: NextRequest) {
  try {
    const body = await request.json();
    const { outline } = body;

    if (!outline) {
      return NextResponse.json(
        { success: false, error: '缺少大纲信息' },
        { status: 400 }
      );
    }

    const analysis = analyzeOutline(outline);

    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    console.error('分析大纲失败:', error);
    return NextResponse.json(
      { success: false, error: '分析大纲失败' },
      { status: 500 }
    );
  }
}

// POST /api/outline-generator/chapter - 生成章节大纲
export async function generateChapterOutlineAPI(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterNumber, outline, previousChapter } = body;

    if (!chapterNumber || !outline) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const chapterOutline = generateChapterOutline(chapterNumber, outline, previousChapter);

    return NextResponse.json({ success: true, data: chapterOutline });
  } catch (error) {
    console.error('生成章节大纲失败:', error);
    return NextResponse.json(
      { success: false, error: '生成章节大纲失败' },
      { status: 500 }
    );
  }
}

// POST /api/outline-generator/satisfaction - 计算爽点分布
export async function calculateSatisfaction(request: NextRequest) {
  try {
    const body = await request.json();
    const { outline, targetReaders } = body;

    if (!outline) {
      return NextResponse.json(
        { success: false, error: '缺少大纲信息' },
        { status: 400 }
      );
    }

    const satisfaction = calculateSatisfactionPoints(outline, targetReaders || 'mixed');

    return NextResponse.json({ success: true, data: satisfaction });
  } catch (error) {
    console.error('计算爽点分布失败:', error);
    return NextResponse.json(
      { success: false, error: '计算爽点分布失败' },
      { status: 500 }
    );
  }
}

// POST /api/outline-generator/optimize - 优化大纲
export async function optimizeNovelOutline(request: NextRequest) {
  try {
    const body = await request.json();
    const { outline } = body;

    if (!outline) {
      return NextResponse.json(
        { success: false, error: '缺少大纲信息' },
        { status: 400 }
      );
    }

    const suggestions = optimizeOutline(outline);

    return NextResponse.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('优化大纲失败:', error);
    return NextResponse.json(
      { success: false, error: '优化大纲失败' },
      { status: 500 }
    );
  }
}

// POST /api/outline-generator/ai-generate - AI辅助生成大纲
export async function aiGenerateOutline(request: NextRequest) {
  try {
    const body = await request.json();
    const { params } = body;

    if (!params) {
      return NextResponse.json(
        { success: false, error: '缺少参数' },
        { status: 400 }
      );
    }

    const prompt = generateOutlinePrompt(params);
    const llmClient = new LLMClient();

    // 流式输出
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = llmClient.generateTextStream(
            '你是一个专业的小说大纲创作助手，擅长构建番茄小说风格的爽文大纲。',
            prompt
          );

          for await (const chunk of generator) {
            const text = chunk || '';
            controller.enqueue(encoder.encode(text));
          }

          controller.enqueue(encoder.encode('[DONE]'));
          controller.close();
        } catch (error) {
          console.error('AI生成大纲失败:', error);
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
    console.error('AI生成大纲失败:', error);
    return NextResponse.json(
      { success: false, error: 'AI生成大纲失败' },
      { status: 500 }
    );
  }
}
