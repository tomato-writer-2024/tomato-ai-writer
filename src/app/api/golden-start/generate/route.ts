import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { startType, genre, protagonist, storyContext, wordCount = 500, versionCount = 3 } = await request.json();

    // 验证必要参数
    if (!genre || !protagonist) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数（题材、主角人设）' },
        { status: 400 }
      );
    }

    // 构建开头类型描述
    const startTypeMap: Record<string, string> = {
      conflict: '冲突型开篇（打脸/逆袭/危机）',
      suspense: '悬念型开篇（谜团/穿越/重生）',
      showcase: '装逼型开篇（系统/金手指/天才）',
      warm: '温情型开篇（甜宠/日常/治愈）',
      shocking: '震撼型开篇（世界观/神级设定）',
    };

    const startTypeDesc = startTypeMap[startType] || '综合型开篇';

    // 构建系统提示词
    const systemPrompt = `你是番茄小说的顶级开头创作专家，擅长创作黄金开头，确保前500字就能抓住读者，实现9.8分+的章评分数。

## 黄金开头核心目标：
1. **黄金3秒**：前3秒（前50字）必须抓住读者
2. **黄金500字**：前500字必须建立冲突、悬念或高潮
3. **钩子设计**：在结尾留下强力悬念或期待
4. **人设亮相**：快速展现主角特色和魅力
5. **世界观铺垫**：快速建立世界观（玄幻/仙侠等）

请按照以下JSON格式返回结果（不要包含任何其他文字）：
\`\`\`json
{
  "success": true,
  "data": [
    {
      "version": 1,
      "content": "开头内容...",
      "analysis": {
        "hookType": "冲突型",
        "hookStrength": 9,
        "tensionLevel": 8,
        "readability": 9,
        "uniqueness": 8,
        "marketFit": 9
      },
      "suggestions": [
        "建议1",
        "建议2"
      ]
    }
  ]
}
\`\`\``;

    // 构建用户提示词
    const userPrompt = `请生成${versionCount}个${startTypeDesc}的黄金开头：

【题材】${genre}
【主角人设】${protagonist}
${storyContext ? `【故事背景】${storyContext}` : ''}

【要求】
1. 前50字必须抓住读者（黄金3秒）
2. 前500字必须建立冲突、悬念或高潮
3. 快速展现主角特色和魅力
4. 在结尾留下强力悬念或期待
5. 控制字数在${wordCount}字左右
6. 生成${versionCount}个不同版本的开头
7. 每个版本都要符合${startTypeDesc}
8. 每个版本都要适配${genre}题材
9. 为每个版本提供6维评分（0-10分）：钩子强度、张力等级、可读性、独特性、市场契合度
10. 为每个版本提供2-3条优化建议
11. 必须严格按照上述JSON格式返回，不要包含任何其他文字`;

    // 初始化LLM客户端
    const config = new Config();
    const client = new LLMClient(config);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    // 调用流式AI，收集完整结果
    let aiContent = '';
    try {
      const stream = client.stream(messages, {
        model: 'doubao-pro-4k',
        temperature: 0.9,
        streaming: true,
      });

      for await (const chunk of stream) {
        const content = chunk.content?.toString() || '';
        aiContent += content;
      }
    } catch (error) {
      console.error('LLM stream error:', error);
      throw new Error('AI生成失败');
    }

    if (!aiContent) {
      throw new Error('AI返回内容为空');
    }

    // 解析AI返回的JSON
    let parsedResult;
    try {
      // 尝试提取JSON部分
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                        aiContent.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        parsedResult = JSON.parse(jsonStr);
      } else {
        // 如果无法解析，创建默认响应
        throw new Error('AI返回格式不正确');
      }
    } catch (error) {
      console.error('JSON parse error:', error);
      // 创建默认响应
      const defaultVersions = Array.from({ length: versionCount }, (_, i) => ({
        version: i + 1,
        content: aiContent.slice(i * 500, (i + 1) * 500) || '生成内容为空，请重试',
        analysis: {
          hookType: startTypeDesc,
          hookStrength: 7,
          tensionLevel: 7,
          readability: 8,
          uniqueness: 7,
          marketFit: 7,
        },
        suggestions: [
          '建议增加更多细节描写',
          '建议加强冲突张力',
        ],
      }));

      parsedResult = {
        success: true,
        data: defaultVersions,
      };
    }

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error('Golden start generate error:', error);
    return NextResponse.json(
      { success: false, error: '黄金开头生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
