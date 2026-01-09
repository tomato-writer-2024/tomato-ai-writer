import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { content, type, context } = await request.json();

    // 验证必要参数
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少内容' },
        { status: 400 }
      );
    }

    let systemPrompt = '';
    let userPrompt = '';

    // 根据分析类型构建不同的提示词
    switch (type) {
      case 'original':
        // 前文分析
        systemPrompt = `你是番茄小说的顶级内容分析师，擅长识别文本质量、结构和潜在问题。

## 分析维度：
1. **内容质量**：语言表达、情节逻辑、角色塑造
2. **结构问题**：段落安排、节奏控制、过渡衔接
3. **爽点密度**：打脸、装逼、收获等爽点分布
4. **钩子设计**：结尾悬念、伏笔布置
5. **完读率预测**：基于以上维度预测完读率

## 输出格式（JSON）：
{
  "summary": "内容摘要（2-3句话）",
  "qualityAnalysis": {
    "language": "语言表达评价",
    "logic": "逻辑连贯性评价",
    "character": "角色塑造评价"
  },
  "structureAnalysis": {
    "paragraph": "段落结构评价",
    "rhythm": "节奏控制评价",
    "transition": "过渡衔接评价"
  },
  "shuangdianAnalysis": {
    "count": "爽点数量",
    "distribution": "分布情况"
  },
  "hookAnalysis": {
    "hasHook": "是否有钩子",
    "hookType": "钩子类型"
  },
  "completionRatePrediction": "预测完读率（%）",
  "suggestions": ["修改建议1", "修改建议2", "修改建议3"]
}

## 要求：
- 客观分析，不要夸大其词
- 提供具体的修改建议
- 预测完读率要基于实际分析`;

        userPrompt = `请对以下内容进行前文分析：

【前文内容】
${content}

${context?.storyContext ? `【故事背景】\n${context.storyContext}` : ''}
${context?.chapterOutline ? `【章节剧情梗概】\n${context.chapterOutline}` : ''}
${context?.bookOutline ? `【本书大纲】\n${context.bookOutline}` : ''}

请严格按照JSON格式输出分析结果。`;
        break;

      case 'plot':
        // 剧情分析
        systemPrompt = `你是番茄小说的资深剧情分析师，擅长分析情节发展、冲突设计和人物关系。

## 分析维度：
1. **当前情节阶段**：铺垫/冲突/高潮/收尾
2. **冲突类型**：外部冲突/内部冲突/情感冲突
3. **人物关系**：主要人物关系变化
4. **伏笔线索**：已布置的伏笔
5. **情节连贯性**：逻辑是否自洽

## 输出格式（JSON）：
{
  "currentPhase": "当前情节阶段（铺垫/冲突/高潮/收尾）",
  "conflictType": "主要冲突类型",
  "conflictAnalysis": "冲突发展分析",
  "characterRelationships": {
    "protagonist": "主角状态",
    "antagonist": "对手状态",
    "supporting": "配角状态"
  },
  "foreshadowing": {
    "existing": "已有伏笔",
    "potential": "可利用的伏笔"
  },
  "continuity": "情节连贯性评价",
  "plotSuggestions": [
    "剧情建议1",
    "剧情建议2",
    "剧情建议3"
  ]
}

## 要求：
- 准确识别当前情节阶段
- 分析冲突设计的合理性
- 提供有价值的剧情发展建议`;

        userPrompt = `请对以下内容进行剧情分析：

【前文内容】
${content}

${context?.storyContext ? `【故事背景】\n${context.storyContext}` : ''}
${context?.chapterOutline ? `【章节剧情梗概】\n${context.chapterOutline}` : ''}
${context?.bookOutline ? `【本书大纲】\n${context.bookOutline}` : ''}

请严格按照JSON格式输出分析结果。`;
        break;

      case 'suggestion':
        // 剧情建议
        systemPrompt = `你是番茄小说的顶级剧情策划，擅长提供高质量的续写建议和剧情发展方案。

## 分析维度：
1. **续写方向**：打脸流/逆袭流/收获流/装逼流
2. **核心爽点**：重点突出的爽点类型
3. **情节设计**：3-5个关键情节节点
4. **情绪曲线**：高潮和低谷的安排
5. **结尾钩子**：留下什么样的悬念

## 输出格式（JSON）：
{
  "continueDirection": "续写方向（打脸流/逆袭流/收获流/装逼流）",
  "directionReason": "选择该方向的原因",
  "coreShuangdian": {
    "type": "核心爽点类型",
    "description": "爽点设计描述"
  },
  "plotNodes": [
    {
      "order": 1,
      "content": "情节节点1",
      "emotion": "情绪状态"
    },
    {
      "order": 2,
      "content": "情节节点2",
      "emotion": "情绪状态"
    }
  ],
  "emotionCurve": {
    "opening": "开场情绪",
    "climax": "高潮情绪",
    "ending": "结尾情绪"
  },
  "endingHook": "结尾钩子设计",
  "writingTips": [
    "写作技巧建议1",
    "写作技巧建议2"
  ]
}

## 要求：
- 续写方向要符合前文逻辑
- 情节节点要具体可执行
- 情绪曲线要有起伏`;

        userPrompt = `请为以下内容提供剧情建议：

【前文内容】
${content}

${context?.storyContext ? `【故事背景】\n${context.storyContext}` : ''}
${context?.chapterOutline ? `【章节剧情梗概】\n${context.chapterOutline}` : ''}
${context?.bookOutline ? `【本书大纲】\n${context.bookOutline}` : ''}

请严格按照JSON格式输出剧情建议。`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: '不支持的的分析类型' },
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
          suggestions: [contentText.substring(200)],
        };
      }
    } catch (error) {
      console.error('JSON解析错误:', error);
      // 解析失败，返回原始文本
      analysisData = {
        summary: contentText.substring(0, 200),
        suggestions: [contentText.substring(200)],
      };
    }

    return NextResponse.json({
      success: true,
      data: analysisData,
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { success: false, error: '分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}
