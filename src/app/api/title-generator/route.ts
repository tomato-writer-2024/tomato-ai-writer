import { NextRequest, NextResponse } from 'next/server';
import { TitleOption, generateTitleOptions, analyzeTitle, generateABTestSuggestions, generateMarketComparison, generateTitlePrompt, optimizeTitle } from '@/lib/titleGenerator';

// POST /api/title-generator/generate - 生成书名选项
export async function generateTitles(request: NextRequest) {
  try {
    const body = await request.json();
    const { genre, theme, mainCharacter, keyElements, setting } = body;

    if (!genre || !theme) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const titles = generateTitleOptions(
      genre,
      theme,
      mainCharacter,
      keyElements,
      setting
    );

    return NextResponse.json({ success: true, data: titles });
  } catch (error) {
    console.error('生成书名失败:', error);
    return NextResponse.json(
      { success: false, error: '生成书名失败' },
      { status: 500 }
    );
  }
}

// POST /api/title-generator/analyze - 分析标题
export async function analyzeTitleOption(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, genre } = body;

    if (!title || !genre) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const analysis = analyzeTitle(title, genre);

    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    console.error('分析标题失败:', error);
    return NextResponse.json(
      { success: false, error: '分析标题失败' },
      { status: 500 }
    );
  }
}

// POST /api/title-generator/optimize - 优化标题
export async function optimizeTitleOption(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalTitle, genre, feedback } = body;

    if (!originalTitle || !genre) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const optimized = optimizeTitle(originalTitle, genre, feedback);

    return NextResponse.json({ success: true, data: optimized });
  } catch (error) {
    console.error('优化标题失败:', error);
    return NextResponse.json(
      { success: false, error: '优化标题失败' },
      { status: 500 }
    );
  }
}

// POST /api/title-generator/ab-test - 生成A/B测试建议
export async function generateABTest(request: NextRequest) {
  try {
    const body = await request.json();
    const { topTitles } = body;

    if (!topTitles || topTitles.length < 2) {
      return NextResponse.json(
        { success: false, error: '至少需要2个标题' },
        { status: 400 }
      );
    }

    const suggestions = generateABTestSuggestions(topTitles);

    return NextResponse.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('生成A/B测试建议失败:', error);
    return NextResponse.json(
      { success: false, error: '生成A/B测试建议失败' },
      { status: 500 }
    );
  }
}

// POST /api/title-generator/market-comparison - 市场对比
export async function marketComparison(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, genre } = body;

    if (!title || !genre) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const comparison = generateMarketComparison(title, genre);

    return NextResponse.json({ success: true, data: comparison });
  } catch (error) {
    console.error('市场对比失败:', error);
    return NextResponse.json(
      { success: false, error: '市场对比失败' },
      { status: 500 }
    );
  }
}
