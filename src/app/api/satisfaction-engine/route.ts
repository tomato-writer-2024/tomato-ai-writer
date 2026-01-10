import { NextRequest, NextResponse } from 'next/server';
import { SatisfactionAnalysis, analyzeSatisfactionPoints, analyzeClimaxPoints, generateTensionCurve, analyzeReaderExpectations, generateSatisfactionSuggestions, calculateSatisfactionScore, generateOptimizationPrompt, calculateSatisfactionDensity } from '@/lib/satisfactionEngine';
import { LLMClient } from '@/lib/llmClient';
import { getSystemPromptForFeature } from '@/lib/tomatoNovelPrompts';

// POST /api/satisfaction-engine/analyze - 分析爽点
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
      case 'optimize':
        return handleOptimize(params);
      case 'density':
        return handleDensity(params);
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
  const { content, chapterNumber, previousContent } = params;

  if (!content) {
    return NextResponse.json(
      { success: false, error: '缺少内容' },
      { status: 400 }
    );
  }

  const satisfactionPoints = analyzeSatisfactionPoints(content);
  const climaxPoints = analyzeClimaxPoints(content, chapterNumber || 1);
  const tensionCurve = generateTensionCurve(content);
  const readerExpectations = analyzeReaderExpectations(content, chapterNumber || 1);

  const analysis: SatisfactionAnalysis = {
    id: `sat-${Date.now()}`,
    userId: params.userId || '',
    novelId: params.novelId || '',
    chapterNumber: chapterNumber || 1,
    content,
    satisfactionScore: 0, // 稍后计算
    satisfactionPoints,
    climaxPoints,
    tensionCurve,
    readerExpectations,
    suggestions: [],
    improvementPotential: 0,
    createdAt: new Date()
  };

  // 生成建议
  analysis.suggestions = generateSatisfactionSuggestions(analysis);

  // 计算总分
  analysis.satisfactionScore = calculateSatisfactionScore(analysis);

  // 计算提升空间
  analysis.improvementPotential = Math.max(0, 100 - analysis.satisfactionScore);

  return NextResponse.json({ success: true, data: analysis });
}

async function handleOptimize(params: any) {
  const { analysis } = params;

  if (!analysis) {
    return NextResponse.json(
      { success: false, error: '缺少分析数据' },
      { status: 400 }
    );
  }

  const prompt = generateOptimizationPrompt(analysis);
  const llmClient = new LLMClient();

  // 流式输出（番茄小说风格）
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const generator = llmClient.generateTextStream(
          getSystemPromptForFeature('satisfaction-engine'),
          prompt
        );

        for await (const chunk of generator) {
          const text = chunk || '';
          controller.enqueue(encoder.encode(text));
        }

        controller.enqueue(encoder.encode('[DONE]'));
        controller.close();
      } catch (error) {
        console.error('AI优化失败:', error);
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

async function handleDensity(params: any) {
  const { satisfactionPoints, contentLength } = params;

  if (!satisfactionPoints || !contentLength) {
    return NextResponse.json(
      { success: false, error: '缺少必要参数' },
      { status: 400 }
    );
  }

  const density = calculateSatisfactionDensity(satisfactionPoints, contentLength);

  return NextResponse.json({ success: true, data: density });
}
