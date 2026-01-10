import { NextRequest, NextResponse } from 'next/server';
import { PLATFORMS, adaptToPlatform, getPlatformById } from '@/lib/platforms/platformAdapter';
import { LLMClient } from '@/lib/llmClient';
import { getSystemPromptForFeature } from '@/lib/tomatoNovelPrompts';

// GET /api/platform - 获取所有平台信息
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: PLATFORMS
    });
  } catch (error) {
    console.error('获取平台信息失败:', error);
    return NextResponse.json(
      { success: false, error: '获取平台信息失败' },
      { status: 500 }
    );
  }
}

// POST /api/platform - 平台适配操作
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
      case 'guidelines':
        return handleGuidelines(params);
      case 'adapt':
        return handleAdapt(params);
      case 'analyze':
        return handleAnalyze(params);
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

async function handleGuidelines(params: any) {
  try {
    const { platformId } = params;

    if (!platformId) {
      return NextResponse.json(
        { success: false, error: '缺少平台ID' },
        { status: 400 }
      );
    }

    const platform = getPlatformById(platformId);
    if (!platform) {
      return NextResponse.json(
        { success: false, error: '不存在的平台' },
        { status: 404 }
      );
    }

    // 返回平台信息作为指南
    return NextResponse.json({ success: true, data: platform });
  } catch (error) {
    console.error('获取平台指南失败:', error);
    return NextResponse.json(
      { success: false, error: '获取平台指南失败' },
      { status: 500 }
    );
  }
}

async function handleAdapt(params: any) {
  try {
    const { content, sourcePlatform, targetPlatform, genre } = params;

    if (!content || !targetPlatform) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 使用适配函数
    const adaptation = adaptToPlatform(content, targetPlatform, genre || '都市');

    return NextResponse.json({ success: true, data: adaptation });
  } catch (error) {
    console.error('平台适配失败:', error);
    return NextResponse.json(
      { success: false, error: '平台适配失败' },
      { status: 500 }
    );
  }
}

async function handleAnalyze(params: any) {
  try {
    const { content, platformId } = params;

    if (!content || !platformId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const platform = getPlatformById(platformId);
    if (!platform) {
      return NextResponse.json(
        { success: false, error: '不存在的平台' },
        { status: 404 }
      );
    }

    // 使用LLM分析内容是否符合平台要求
    const systemPrompt = getSystemPromptForFeature('platform-adapter');
    const userPrompt = `请分析以下内容是否符合${platform.name}平台的要求（符合Top3爆款标准）：

内容：${content}

平台信息：
- 公司名称：${platform.company}
- 商业模式：${platform.monetization}
- 目标读者：${platform.audience}
- 平台特点：${platform.features.join('、')}
- 热门题材：${platform.hotGenres.map(g => g.name).join('、')}

【分析要求】
- 从${platform.name}平台的审稿标准和读者喜好角度分析
- 考虑平台的独特性（如番茄小说的快节奏、起点的付费阅读、晋江的女性向等）
- 评估商业潜力和爆款可能性

请分析：
1. 平台符合度评分（0-100分，目标：90分+）
2. 优点分析（3-5个，结合平台特征）
3. 待改进点（3-5个，提升至Top3水平）
4. 爆款潜力评估（结合平台特征）
5. 具体改进建议（达到Top3标准）

【质量目标】
- 分析准确率：95%+
- 改进建议成功率：90%+
- 爆款潜力预测准确率：85%+`;

    const llmClient = new LLMClient();
    const response = await llmClient.generateText(systemPrompt, userPrompt);

    return NextResponse.json({ success: true, data: { analysis: response } });
  } catch (error) {
    console.error('平台分析失败:', error);
    return NextResponse.json(
      { success: false, error: '平台分析失败' },
      { status: 500 }
    );
  }
}
