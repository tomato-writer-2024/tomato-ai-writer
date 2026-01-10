import { NextRequest, NextResponse } from 'next/server';
import { TitleOption, generateTitleOptions, analyzeTitle, generateABTestSuggestions, generateMarketComparison, generateTitlePrompt, optimizeTitle } from '@/lib/titleGenerator';
import { LLMClient } from '@/lib/llmClient';

// POST /api/title-generator/generate - 生成书名选项（AI生成）
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

    // 使用LLM生成书名
    const llmClient = new LLMClient();

    const systemPrompt = '你是一个专业的小说书名创作助手，擅长创作吸引眼球的小说书名。';
    const userPrompt = `请为以下小说生成5-20个高质量书名：

题材：${genre}
主题：${theme}
主角：${mainCharacter || '未提供'}
关键元素：${keyElements?.join('、') || '未提供'}
背景设定：${setting || '未提供'}

请生成包含以下信息的书名列表（以JSON格式返回）：
{
  "titles": [
    {
      "title": "书名1",
      "style": "书名风格",
      "marketFit": "市场契合度评分（0-100）",
      "uniqueness": "独特性评分（0-100）",
      "memorability": "记忆度评分（0-100）",
      "advantages": ["优势1", "优势2"]
    }
  ]
}

确保书名符合题材特点、具有吸引力、易于记忆、符合市场趋势。`;

    const response = await llmClient.generateText(systemPrompt, userPrompt);

    // 尝试解析JSON响应
    let titles: any[];
    try {
      // 尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        titles = data.titles || [];
      } else {
        throw new Error('无法解析JSON');
      }
    } catch (error) {
      // 如果解析失败，使用本地生成器
      titles = generateTitleOptions(
        genre,
        theme,
        mainCharacter,
        keyElements,
        setting
      );
    }

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
