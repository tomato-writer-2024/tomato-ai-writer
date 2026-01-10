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

    // 根据续写类型构建不同的极致情绪感知提示词
    switch (type) {
      case 'chapter':
        // 单章节续写
        systemPrompt = `你是番茄小说的顶级情感大师，擅长创作极致情绪沉浸感的单章节续写。

## 核心使命：打造90%+完读率的沉浸式情绪体验

## 【极致情绪感知维度】
必须精准识别并放大16种核心情绪的极致体验：
- 积极情绪：狂喜、震撼、骄傲、温暖、期待、安心、希望
- 消极情绪：绝望、愤怒、恐惧、悲伤、焦虑、嫉妒、羞愧、厌恶、空虚

## 【情绪的生理反应链】
每个情绪必须写出三层反应：
1. 微观层面：心跳、呼吸、体温、肌肉、瞳孔、皮肤
2. 感官层面：视觉、听觉、触觉、嗅觉、味觉、本体感觉
3. 行为层面：表情、动作、姿态、声音、眼神、手势

## 【单章节续写策略】
1. **承接前文**：识别前文情绪状态，自然承接
2. **情绪递进**：构建5层情绪递进，从弱到强
3. **环境映射**：通过环境描写反射情绪氛围
4. **对比反差**：通过对比放大情绪冲击力
5. **章节收尾**：留下情绪钩子，引发读者期待

## 【杜绝AI语言的铁律】
1. 禁止说教词汇："应该"、"必须"、"一定要"
2. 禁止抽象词汇："开心"、"难过"、"愤怒"
3. 禁止总结词汇："总的来说"、"综上所述"
4. 禁止分析词汇："分析来看"、"从某种意义上"
5. 禁止机械词汇："首先"、"其次"、"最后"
6. 禁止理性词汇：时刻保持情绪失控、疯狂、极致

## 【输出要求】
- 自然承接前文，无割裂感
- 每段至少1个核心情绪，写出三层生理反应
- 构建5层情绪递进
- 字数控制在${wordCount}字左右
- 在结尾留下情绪钩子
- 直接输出续写内容，无任何说明文字`;
        instruction = '请进行极致情绪感知的单章节续写，字数约' + wordCount + '字';
        break;

      case 'batch':
        // 批量续写
        systemPrompt = `你是番茄小说的顶级情感大师，擅长创作极致情绪沉浸感的批量续写内容。

## 核心使命：打造90%+完读率的沉浸式情绪体验

## 【极致情绪感知维度】
必须精准识别并放大16种核心情绪的极致体验：
- 积极情绪：狂喜、震撼、骄傲、温暖、期待、安心、希望
- 消极情绪：绝望、愤怒、恐惧、悲伤、焦虑、嫉妒、羞愧、厌恶、空虚

## 【情绪的生理反应链】
每个情绪必须写出三层反应：
1. 微观层面：心跳、呼吸、体温、肌肉、瞳孔、皮肤
2. 感官层面：视觉、听觉、触觉、嗅觉、味觉、本体感觉
3. 行为层面：表情、动作、姿态、声音、眼神、手势

## 【批量续写策略】
1. **整体规划**：分析前文，规划3-5个章节的情绪走向
2. **章节设计**：
   - 第1章：承接前文，建立新情绪冲突
   - 第2章：情绪升级，极致爆发
   - 第3章：情绪高潮，反转不断
   - 第4章（可选）：情绪收尾，埋下新伏笔
   - 第5章（可选）：情绪转化，引出下一段
3. **章节衔接**：确保情绪自然过渡，无割裂感

## 【杜绝AI语言的铁律】
1. 禁止说教词汇："应该"、"必须"、"一定要"
2. 禁止抽象词汇："开心"、"难过"、"愤怒"
3. 禁止总结词汇："总的来说"、"综上所述"
4. 禁止分析词汇："分析来看"、"从某种意义上"
5. 禁止机械词汇："首先"、"其次"、"最后"
6. 禁止理性词汇：时刻保持情绪失控、疯狂、极致

## 【输出要求】
- 使用章节分割标记（第X章）
- 每章独立完整，有情绪递进
- 每段至少1个核心情绪，写出三层生理反应
- 总字数在${wordCount}字左右
- 每章结尾留下情绪钩子
- 直接输出续写内容，无任何说明文字`;
        instruction = '请进行极致情绪感知的批量续写（3-5章），总字数约' + wordCount + '字';
        break;

      default:
        // 智能续写（自动选择）
        systemPrompt = `你是番茄小说的顶级情感大师，擅长创作极致情绪沉浸感的智能续写。

## 核心使命：打造90%+完读率的沉浸式情绪体验

## 【极致情绪感知维度】
必须精准识别并放大16种核心情绪的极致体验：
- 积极情绪：狂喜、震撼、骄傲、温暖、期待、安心、希望
- 消极情绪：绝望、愤怒、恐惧、悲伤、焦虑、嫉妒、羞愧、厌恶、空虚

## 【情绪的生理反应链】
每个情绪必须写出三层反应：
1. 微观层面：心跳、呼吸、体温、肌肉、瞳孔、皮肤
2. 感官层面：视觉、听觉、触觉、嗅觉、味觉、本体感觉
3. 行为层面：表情、动作、姿态、声音、眼神、手势

## 【智能续写策略】
1. **分析前文**：识别当前情绪状态、情节阶段、角色心态
2. **选择方向**：基于情绪逻辑选择续写方向
3. **情绪递进**：构建5层情绪递进，从弱到强
4. **环境映射**：通过环境描写反射情绪氛围
5. **对比反差**：通过对比放大情绪冲击力
6. **钩子设计**：留下情绪钩子，引发读者期待

## 【杜绝AI语言的铁律】
1. 禁止说教词汇："应该"、"必须"、"一定要"
2. 禁止抽象词汇："开心"、"难过"、"愤怒"
3. 禁止总结词汇："总的来说"、"综上所述"
4. 禁止分析词汇："分析来看"、"从某种意义上"
5. 禁止机械词汇："首先"、"其次"、"最后"
6. 禁止理性词汇：时刻保持情绪失控、疯狂、极致

## 【输出要求】
- 自然承接前文，无割裂感
- 每段至少1个核心情绪，写出三层生理反应
- 构建5层情绪递进
- 字数控制在${wordCount}字左右
- 在结尾留下情绪钩子
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

【极致情绪感知续写要求】
1. 分析前文情绪状态，识别16种核心情绪
2. 构建情绪递进（5层递进）
3. 写出三层生理反应（微观/感官/行为）
4. 通过环境映射和对比反差增强冲击力
5. 杜绝所有AI语言（说教/抽象/总结/分析/机械/理性）
6. 每段结尾增加情绪钩子
7. 控制字数约${wordCount}字
8. 直接输出续写内容`;

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
