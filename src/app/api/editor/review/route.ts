import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { type, content, novelInfo = {} } = await request.json();

    // 验证必要参数
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少待审稿内容' },
        { status: 400 }
      );
    }

    let systemPrompt = '';
    let userPrompt = '';

    // 根据审稿类型构建不同的提示词
    switch (type) {
      case 'outline':
        // 大纲审稿
        systemPrompt = `你是番茄小说的资深编辑，精通平台审稿标准，擅长识别优质大纲。

## 审稿维度（番茄平台标准）：
1. **叙事节奏**：开篇吸引度、节奏把控、情绪波动
2. **剧情冲突**：核心冲突、冲突强度、冲突密度
3. **情绪爽点**：爽点类型、爽点密度、爽点质量
4. **人物塑造**：人设鲜明度、人物成长、人物关系
5. **悬念设计**：悬念强度、悬念密度、钩子质量
6. **语言表达**：网文风格、遣词造句、流畅度
7. **逻辑连贯**：情节逻辑、人物逻辑、世界观逻辑
8. **创新性**：题材创新、情节创新、人设创新
9. **商业性**：市场热度、变现潜力、传播性
10. **完读率预测**：基于多维度综合评分

## 双视角评分系统：
- **编辑视角**（权重40%）：专业度、商业性、创新性
- **读者视角**（权重60%）：爽度、代入感、流畅度

## 输出格式（JSON）：
{
  "summary": "大纲评价摘要（1-2句话）",
  "highlights": [
    {
      "dimension": "审稿维度",
      "point": "审稿亮点描述",
      "evidence": "证据/例子",
      "score": "该维度评分（1-10）"
    }
  ],
  "scores": {
    "editor": {
      "narrativeRhythm": "叙事节奏评分（1-10）",
      "plotConflict": "剧情冲突评分（1-10）",
      "emotionalShuangdian": "情绪爽点评分（1-10）",
      "characterShaping": "人物塑造评分（1-10）",
      "suspenseDesign": "悬念设计评分（1-10）",
      "languageExpression": "语言表达评分（1-10）",
      "logicalCoherence": "逻辑连贯评分（1-10）",
      "innovation": "创新性评分（1-10）",
      "commerciality": "商业性评分（1-10）",
      "average": "编辑视角平均分"
    },
    "reader": {
      "shuangdu": "爽度评分（1-10）",
      "substitution": "代入感评分（1-10）",
      "fluency": "流畅度评分（1-10）",
      "engagement": "吸引力评分（1-10）",
      "emotionalResonance": "情绪共鸣评分（1-10）",
      "average": "读者视角平均分"
    },
    "overall": "综合评分（编辑40% + 读者60%）",
    "bookReviewPrediction": "书评分数预测（1-10）",
    "chapterReviewPrediction": "章评分数预测（1-10）",
    "completionRatePrediction": "完读率预测（%）"
  },
  "issues": [
    {
      "dimension": "问题维度",
      "issue": "问题描述",
      "severity": "严重程度（高/中/低）",
      "suggestion": "修改建议"
    }
  ],
  "optimizationSuggestions": [
    {
      "dimension": "优化维度",
      "suggestion": "具体优化建议",
      "expectedEffect": "预期效果"
    }
  ],
  "benchmarkComparison": {
    "topExplosive": "与爆款对比分析",
    "gapAnalysis": "差距分析",
    "improvementDirection": "改进方向"
  },
  "reviewConclusion": {
    "verdict": "审稿结论（优秀/良好/一般/待改进）",
    "recommendation": "编辑建议（签约/修改后签约/不签约）",
    "keyStrengths": ["核心优势1", "核心优势2"],
    "keyWeaknesses": ["核心问题1", "核心问题2"]
  }
}

## 要求：
- 客观公正，基于番茄审稿标准
- 提供10+审稿亮点
- 双视角评分（编辑+读者）
- 预测书评和章评分数（目标9.8分+）
- 提供具体的优化建议`;

        userPrompt = `请对以下大纲进行编辑审稿：

【小说信息】
${JSON.stringify(novelInfo, null, 2)}

【大纲内容】
${content}

请严格按照JSON格式输出审稿结果，包括10+审稿亮点、双视角评分、问题清单、优化建议、对标爆款对比和审稿结论。`;
        break;

      case 'chapter':
        // 章节审稿
        systemPrompt = `你是番茄小说的资深编辑，精通平台审稿标准，擅长识别优质章节。

## 章节审稿维度：
1. **开篇吸引力**：前3秒/前500字是否能抓住读者
2. **节奏把控**：铺垫-冲突-高潮-收尾的节奏设计
3. **爽点质量**：爽点的强度、时机、类型
4. **钩子设计**：悬念钩子、期待钩子、伏笔钩子
5. **人物表现**：人物性格、对话、动作描写
6. **情绪渲染**：情绪调动、氛围营造
7. **逻辑连贯**：情节逻辑、人物逻辑、时间逻辑
8. **语言表达**：网文风格、遣词造句、段落结构

## 输出格式（JSON）：
{
  "summary": "章节评价摘要（1-2句话）",
  "highlights": [
    {
      "dimension": "审稿维度",
      "point": "审稿亮点描述",
      "evidence": "证据/例子",
      "score": "该维度评分（1-10）"
    }
  ],
  "scores": {
    "opening": "开篇吸引力（1-10）",
    "rhythm": "节奏把控（1-10）",
    "shuangdianQuality": "爽点质量（1-10）",
    "hookDesign": "钩子设计（1-10）",
    "characterPerformance": "人物表现（1-10）",
    "emotionalRendering": "情绪渲染（1-10）",
    "logicalCoherence": "逻辑连贯（1-10）",
    "languageExpression": "语言表达（1-10）",
    "average": "章节平均分"
  },
  "chapterReviewPrediction": "章评分数预测（1-10）",
  "issues": [
    {
      "dimension": "问题维度",
      "issue": "问题描述",
      "severity": "严重程度（高/中/低）",
      "suggestion": "修改建议"
    }
  ],
  "optimizationSuggestions": [
    {
      "dimension": "优化维度",
      "suggestion": "具体优化建议",
      "expectedEffect": "预期效果"
    }
  ],
  "reviewConclusion": {
    "verdict": "审稿结论（优秀/良好/一般/待改进）",
    "keyStrengths": ["核心优势1", "核心优势2"],
    "keyWeaknesses": ["核心问题1", "核心问题2"]
  }
}

## 要求：
- 客观公正，基于番茄审稿标准
- 提供章节评分和预测
- 提供具体的优化建议
- 预测章评分数（目标9.8分+）`;

        userPrompt = `请对以下章节进行编辑审稿：

【章节内容】
${content}

请严格按照JSON格式输出审稿结果，包括审稿亮点、评分、问题清单、优化建议和审稿结论。`;
        break;

      case 'full':
        // 全文审稿
        systemPrompt = `你是番茄小说的资深编辑，精通平台审稿标准，擅长识别优质全文。

## 全文审稿维度：
1. **整体结构**：开头-发展-高潮-结尾的结构完整性
2. **主线推进**：主线剧情的推进速度和质量
3. **副线布局**：副线剧情的布局和与主线的关联
4. **人物成长**：主角的成长轨迹和配角的塑造
5. **世界观构建**：世界观设定的完整性和自洽性
6. **伏笔回收**：伏笔的布置和回收质量
7. **反转设计**：情节反转的时机和效果
8. **高潮把控**：高潮部分的冲突强度和爽点密度
9. **结局设计**：结局的完整性和余韵
10. **整体质量**：整体质量评分和完读率预测

## 输出格式（JSON）：
{
  "summary": "全文评价摘要（1-2句话）",
  "highlights": [
    {
      "dimension": "审稿维度",
      "point": "审稿亮点描述",
      "evidence": "证据/例子",
      "score": "该维度评分（1-10）"
    }
  ],
  "scores": {
    "overallStructure": "整体结构（1-10）",
    "mainlineProgression": "主线推进（1-10）",
    "subplotLayout": "副线布局（1-10）",
    "characterGrowth": "人物成长（1-10）",
    "worldBuilding": "世界观构建（1-10）",
    "foreshadowingRecycling": "伏笔回收（1-10）",
    "twistDesign": "反转设计（1-10）",
    "climaxControl": "高潮把控（1-10）",
    "endingDesign": "结局设计（1-10）",
    "average": "全文平均分"
  },
  "bookReviewPrediction": "书评分数预测（1-10）",
  "completionRatePrediction": "完读率预测（%）",
  "top3Potential": "是否有Top3爆款潜力（是/否）",
  "issues": [
    {
      "dimension": "问题维度",
      "issue": "问题描述",
      "severity": "严重程度（高/中/低）",
      "suggestion": "修改建议"
    }
  ],
  "optimizationSuggestions": [
    {
      "dimension": "优化维度",
      "suggestion": "具体优化建议",
      "expectedEffect": "预期效果"
    }
  ],
  "benchmarkComparison": {
    "topExplosive": "与爆款对比分析",
    "gapAnalysis": "差距分析",
    "improvementDirection": "改进方向"
  },
  "reviewConclusion": {
    "verdict": "审稿结论（优秀/良好/一般/待改进）",
    "recommendation": "编辑建议（签约/修改后签约/不签约）",
    "keyStrengths": ["核心优势1", "核心优势2"],
    "keyWeaknesses": ["核心问题1", "核心问题2"],
    "marketPositioning": "市场定位建议"
  }
}

## 要求：
- 客观公正，基于番茄审稿标准
- 提供全文评分和预测
- 预测书评分数（目标9.8分+）
- 预测是否有Top3爆款潜力
- 提供具体的优化建议`;

        userPrompt = `请对以下全文进行编辑审稿：

【小说信息】
${JSON.stringify(novelInfo, null, 2)}

【全文内容】
${content}

请严格按照JSON格式输出审稿结果，包括审稿亮点、评分、问题清单、优化建议、对标爆款对比和审稿结论。`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: '不支持的审稿类型' },
          { status: 400 }
        );
    }

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
    let reviewData;
    try {
      // 提取JSON部分（AI可能包含额外说明）
      const jsonMatch = contentText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reviewData = JSON.parse(jsonMatch[0]);
      } else {
        // 如果无法提取JSON，返回纯文本
        reviewData = {
          summary: contentText.substring(0, 200),
          reviewConclusion: {
            verdict: '待评估',
          },
        };
      }
    } catch (error) {
      console.error('JSON解析错误:', error);
      // 解析失败，返回原始文本
      reviewData = {
        summary: contentText.substring(0, 200),
        reviewConclusion: {
          verdict: '待评估',
        },
      };
    }

    return NextResponse.json({
      success: true,
      data: reviewData,
    });
  } catch (error) {
    console.error('Editor review error:', error);
    return NextResponse.json(
      { success: false, error: '编辑审稿失败，请稍后重试' },
      { status: 500 }
    );
  }
}
