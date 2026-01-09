import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { content, dimensions = 'all', depth = 'comprehensive' } = await request.json();

    // 验证必要参数
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少爆款内容' },
        { status: 400 }
      );
    }

    // 构建分析维度
    let analysisDimensions = [];
    if (dimensions === 'all' || dimensions.includes('plot')) {
      analysisDimensions.push('plot'); // 情节结构
    }
    if (dimensions === 'all' || dimensions.includes('shuangdian')) {
      analysisDimensions.push('shuangdian'); // 爽点密度
    }
    if (dimensions === 'all' || dimensions.includes('rhythm')) {
      analysisDimensions.push('rhythm'); // 节奏把控
    }
    if (dimensions === 'all' || dimensions.includes('hook')) {
      analysisDimensions.push('hook'); // 钩子设计
    }
    if (dimensions === 'all' || dimensions.includes('character')) {
      analysisDimensions.push('character'); // 人设分析
    }
    if (dimensions === 'all' || dimensions.includes('twist')) {
      analysisDimensions.push('twist'); // 反转设计
    }

    // 根据分析深度调整提示词
    const depthInstruction = depth === 'comprehensive' 
      ? '请进行深度全面分析，提供详细的专业见解'
      : depth === 'deep'
      ? '请进行深入分析，提供专业见解'
      : '请进行快速分析，提供核心要点';

    // 构建系统提示词
    const systemPrompt = `你是番茄小说的顶级爆款分析专家，擅长5分钟拆解爆款小说，提炼可复用的"爆款公式"。

## 分析维度：
1. **情节结构拆解**：
   - 识别情节模式（三幕式/英雄之旅/网文模板）
   - 分析开篇、发展、高潮、结局
   - 识别关键转折点

2. **爽点密度分析**：
   - 统计爽点类型（打脸/逆袭/收获/装逼）
   - 计算爽点密度（每500字爽点数量）
   - 分析爽点分布规律

3. **节奏把控分析**：
   - 分析节奏类型（铺垫/冲突/高潮/收尾）
   - 识别节奏变化点
   - 评估节奏把控质量

4. **钩子设计分析**：
   - 识别钩子类型（悬念/期待/伏笔）
   - 分析钩子密度
   - 评估钩子质量

5. **人设分析**：
   - 分析主角人设（类型/特点/成长）
   - 分析配角人设
   - 分析反派人设
   - 分析人物关系

6. **反转设计分析**：
   - 识别反转时机
   - 分析反转类型
   - 评估反转效果

## 爆款公式提炼：
- 开篇公式：如何在前500字抓住读者
- 爽点公式：爽点设计的核心模式
- 悬念公式：悬念设计的核心模式
- 节奏公式：节奏把控的核心模式
- 收尾公式：断章和伏笔回收技巧

## 输出格式（JSON）：
{
  "summary": "爆款内容摘要（2-3句话）",
  "plotStructure": {
    "mode": "情节模式（三幕式/英雄之旅/网文模板）",
    "opening": "开篇分析",
    "development": "发展分析",
    "climax": "高潮分析",
    "ending": "结局分析",
    "keyTurningPoints": ["关键转折点1", "关键转折点2"]
  },
  "shuangdianAnalysis": {
    "types": {
      "打脸": "打脸爽点数量",
      "逆袭": "逆袭爽点数量",
      "收获": "收获爽点数量",
      "装逼": "装逼爽点数量"
    },
    "density": "每500字爽点数量",
    "distribution": "爽点分布规律"
  },
  "rhythmAnalysis": {
    "phases": [
      {
        "type": "铺垫/冲突/高潮/收尾",
        "content": "该阶段内容",
        "proportion": "占比"
      }
    ],
    "control": "节奏把控评价"
  },
  "hookAnalysis": {
    "types": {
      "悬念": "悬念钩子数量",
      "期待": "期待钩子数量",
      "伏笔": "伏笔钩子数量"
    },
    "density": "钩子密度",
    "quality": "钩子质量评价"
  },
  "characterAnalysis": {
    "protagonist": {
      "type": "主角类型",
      "characteristics": ["特点1", "特点2"],
      "growth": "成长轨迹"
    },
    "supporting": "配角分析",
    "antagonist": "反派分析",
    "relationships": "人物关系分析"
  },
  "twistAnalysis": {
    "timing": "反转时机分析",
    "types": ["反转类型1", "反转类型2"],
    "effect": "反转效果评价"
  },
  "explosiveFormulas": {
    "openingFormula": {
      "description": "开篇公式描述",
      "template": "可复用的开篇模板",
      "keyPoints": ["关键点1", "关键点2"]
    },
    "shuangdianFormula": {
      "description": "爽点公式描述",
      "template": "可复用的爽点模板",
      "keyPoints": ["关键点1", "关键点2"]
    },
    "suspenseFormula": {
      "description": "悬念公式描述",
      "template": "可复用的悬念模板",
      "keyPoints": ["关键点1", "关键点2"]
    },
    "rhythmFormula": {
      "description": "节奏公式描述",
      "template": "可复用的节奏模板",
      "keyPoints": ["关键点1", "关键点2"]
    },
    "endingFormula": {
      "description": "收尾公式描述",
      "template": "可复用的收尾模板",
      "keyPoints": ["关键点1", "关键点2"]
    }
  },
  "applicableScenarios": ["适用场景1", "适用场景2"],
  "writingTips": ["写作技巧建议1", "写作技巧建议2"]
}

## 要求：
- 客观分析，基于文本实际内容
- 提炼可复用的爆款公式
- 提供具体的写作建议
- ${depthInstruction}`;

    // 构建用户提示词
    const userPrompt = `请对以下爆款内容进行拆解分析：

【爆款内容】
${content}

请严格按照JSON格式输出分析结果和爆款公式。`;

    // 初始化LLM客户端
    const config = new Config();
    const client = new LLMClient(config);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    // 调用AI（非流式）
    const stream = client.stream(messages, {
      model: 'doubao-pro-4k',
      temperature: 0.7,
      streaming: false,
    });

    let contentText = '';
    for await (const chunk of stream) {
      contentText += chunk.content?.toString() || '';
    }

    // 尝试解析JSON结果
    let analysisData;
    try {
      // 提取JSON部分（AI可能包含额外说明）
      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        // 如果无法提取JSON，返回纯文本
        analysisData = {
          summary: contentText.substring(0, 200),
          applicableScenarios: [contentText.substring(200)],
        };
      }
    } catch (error) {
      console.error('JSON解析错误:', error);
      // 解析失败，返回原始文本
      analysisData = {
        summary: contentText.substring(0, 200),
        applicableScenarios: [contentText.substring(200)],
      };
    }

    return NextResponse.json({
      success: true,
      data: analysisData,
    });
  } catch (error) {
    console.error('Explosive analyze error:', error);
    return NextResponse.json(
      { success: false, error: '爆款分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}
