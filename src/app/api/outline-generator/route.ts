import { NextRequest, NextResponse } from 'next/server';
import { NovelOutline, generateThreeActOutline, analyzeOutline, generateChapterOutline, generateOutlinePrompt, calculateSatisfactionPoints, optimizeOutline } from '@/lib/outlineGenerator';
import { LLMClient } from '@/lib/llmClient';
import { getSystemPromptForFeature } from '@/lib/tomatoNovelPrompts';

// POST /api/outline-generator/generate - 生成大纲
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
      case 'generate':
        return handleGenerate(params);
      case 'analyze':
        return handleAnalyze(params);
      case 'chapter':
        return handleChapter(params);
      case 'satisfaction':
        return handleSatisfaction(params);
      case 'optimize':
        return handleOptimize(params);
      case 'ai-generate':
        return handleAiGenerate(params);
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

async function handleGenerate(params: any) {
  const { title, genre, targetLength, coreConflict, protagonistGoal, stakes } = params;

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
}

async function handleAnalyze(params: any) {
  const { outline } = params;

  if (!outline) {
    return NextResponse.json(
      { success: false, error: '缺少大纲信息' },
      { status: 400 }
    );
  }

  const analysis = analyzeOutline(outline);

  return NextResponse.json({ success: true, data: analysis });
}

async function handleChapter(params: any) {
  const { chapterNumber, outline, previousChapter } = params;

  if (!chapterNumber || !outline) {
    return NextResponse.json(
      { success: false, error: '缺少必要参数' },
      { status: 400 }
    );
  }

  const chapterOutline = generateChapterOutline(chapterNumber, outline, previousChapter);

  return NextResponse.json({ success: true, data: chapterOutline });
}

async function handleSatisfaction(params: any) {
  const { outline, targetReaders } = params;

  if (!outline) {
    return NextResponse.json(
      { success: false, error: '缺少大纲信息' },
      { status: 400 }
    );
  }

  const satisfaction = calculateSatisfactionPoints(outline, targetReaders || 'mixed');

  return NextResponse.json({ success: true, data: satisfaction });
}

async function handleOptimize(params: any) {
  const { outline } = params;

  if (!outline) {
    return NextResponse.json(
      { success: false, error: '缺少大纲信息' },
      { status: 400 }
    );
  }

  const suggestions = optimizeOutline(outline);

  return NextResponse.json({ success: true, data: suggestions });
}

async function handleAiGenerate(params: any) {
  const { params: generateParams } = params;

  if (!generateParams) {
    return NextResponse.json(
      { success: false, error: '缺少参数' },
      { status: 400 }
    );
  }

  const prompt = generateOutlinePrompt(generateParams);
  const llmClient = new LLMClient();

  // 流式输出（番茄小说风格）
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const generator = llmClient.generateTextStream(
          getSystemPromptForFeature('outline-generator'),
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
}
