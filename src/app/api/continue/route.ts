import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { optimizeForCompletionRate } from '@/lib/contentGenerator';

export async function POST(request: NextRequest) {
  try {
    const { content, context, characters, type = 'auto', wordCount = 1000 } = await request.json();

    // 验证必要参数
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少前文内容' },
        { status: 400 }
      );
    }

    // 构建优化后的系统提示词（提升完读率和逻辑连贯性）
    let systemPrompt = '';
    let instruction = '';

    // 根据续写类型构建不同的提示词
    switch (type) {
      case 'chapter':
        // 单章节续写
        systemPrompt = `你是番茄小说的顶级续写专家，擅长创作90%+完读率的单章节续写。

## 核心目标：
1. 完整章节：确保续写是一个完整的章节
2. 逻辑连贯：确保续写与前文完美衔接
3. 爽点密集：每500字至少1个核心爽点
4. 钩子设计：在章节结尾留下悬念
5. 字数控制：控制字数在${wordCount}字左右

## 单章节续写策略：
1. **承接前文**：
   - 快速回顾前文关键信息
   - 建立与当前情节的联系

2. **发展情节**：
   - 选择合适的情节方向（打脸/逆袭/收获/装逼）
   - 设计2-3个高潮点
   - 控制情绪起伏

3. **章节收尾**：
   - 解决当前冲突或留白
   - 在结尾设置强力钩子

## 输出要求：
- 自然承接前文，无割裂感
- 保持网文风格（短句、口语化、爽点密集）
- 控制字数在${wordCount}字左右（可适当增减）
- 在结尾留下强力钩子
- 直接输出续写内容，无任何说明文字`;
        instruction = '请进行单章节续写，目标：完读率90%+，字数约' + wordCount + '字';
        break;

      case 'batch':
        // 批量续写
        systemPrompt = `你是番茄小说的顶级续写专家，擅长创作90%+完读率的批量续写内容。

## 核心目标：
1. 多章节推进：连续创作3-5个章节
2. 情节连贯：确保章节间逻辑衔接
3. 节奏控制：每个章节有独立的高潮点
4. 钩子设计：每个章节结尾留下悬念
5. 字数充足：总字数在${wordCount}字左右

## 批量续写策略：
1. **整体规划**：
   - 分析前文确定后续3-5个章节的大纲
   - 设计情节推进路径
   - 规划伏笔和回环

2. **章节设计**：
   - 第1章：承接前文，建立新冲突
   - 第2章：冲突升级，爽点爆发
   - 第3章：高潮迭起，反转不断
   - 第4章（可选）：解决冲突，埋下新伏笔
   - 第5章（可选）：收尾，引出下一段情节

3. **章节衔接**：
   - 每章开头简要回顾上一章
   - 章节间自然过渡

## 输出要求：
- 使用章节分割标记（第X章）
- 每个章节独立完整，有开头、发展、高潮、结尾
- 保持网文风格（短句、口语化、爽点密集）
- 总字数在${wordCount}字左右
- 每章结尾留下钩子
- 直接输出续写内容，无任何说明文字`;
        instruction = '请进行批量续写（3-5个章节），目标：完读率90%+，总字数约' + wordCount + '字';
        break;

      default:
        // 智能续写（自动选择）
        systemPrompt = `你是番茄小说的顶级续写专家，擅长创作90%+完读率的爽文续章。

## 核心目标：
1. 逻辑连贯：确保续写与前文完美衔接
2. 爽点密集：每500字至少1个核心爽点
3. 钩子设计：每段结尾留下悬念
4. 角色一致：保持角色性格和口吻

## 续写策略：
1. **分析前文**：
   - 识别当前情节阶段（铺垫/冲突/高潮/收尾）
   - 追踪伏笔线索（待回收的伏笔）
   - 确认角色状态（能力、位置、情绪）

2. **续写方向**：
   - **打脸流**：主角被轻视 → 展现实力 → 震惊全场
   - **逆袭流**：遇到强敌 → 绝境突破 → 反败为胜
   - **收获流**：探险秘境 → 获得宝物 → 实力提升
   - **装逼流**：展示特殊能力 → 众人崇拜 → 情感突破

3. **节奏控制**：
   - 前30%：承接前文，建立冲突
   - 中段50%：爽点爆发，情绪高潮
   - 后20%：埋下钩子，引出下文

4. **钩子设计**：
   - 悬念钩子："他究竟是谁？"
   - 期待钩子："接下来的战斗会怎样？"
   - 伏笔钩子："这件事背后隐藏着什么秘密？"

## 输出要求：
- 自然承接前文，无割裂感
- 保持网文风格（短句、口语化、爽点密集）
- 控制字数在${wordCount}字左右
- 在结尾留下强力钩子
- 直接输出续写内容，无任何说明文字`;
        instruction = '请进行智能续写，目标：完读率90%+，字数约' + wordCount + '字';
        break;
    }

    // 构建用户提示词
    const userPrompt = `${instruction}：

【前文内容】
${content}

${context ? `【故事背景】\n${context}` : ''}

${characters ? `【角色信息】\n${characters}` : ''}

【续写要求】
1. 分析前文，识别当前情节阶段
2. 选择合适的续写方向（打脸/逆袭/收获/装逼）
3. 确保逻辑连贯，角色一致
4. 每段结尾增加悬念钩子
5. 控制爽点密度（每500字至少1个）
6. 直接输出续写内容`;

    // 初始化LLM客户端
    const config = new Config();
    const client = new LLMClient(config);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    // 调用流式AI
    const stream = client.stream(messages, {
      model: 'doubao-pro-4k',
      temperature: 1.1,
      streaming: true,
    });

    // 创建可读流
    const encoder = new TextEncoder();
    let accumulatedContent = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.content?.toString() || '';
            accumulatedContent += content;
            controller.enqueue(encoder.encode(content));
          }

          // 应用完读率优化算法
          const optimizedContent = optimizeForCompletionRate(accumulatedContent);

          // 返回优化标记
          controller.enqueue(encoder.encode('\n\n[OPTIMIZED]'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Continue-Version': 'v2.0-90plus',
      },
    });
  } catch (error) {
    console.error('Continue error:', error);
    return NextResponse.json(
      { success: false, error: '续写失败，请稍后重试' },
      { status: 500 }
    );
  }
}
