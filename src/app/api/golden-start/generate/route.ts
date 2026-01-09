import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { optimizeForCompletionRate } from '@/lib/contentGenerator';

export async function POST(request: NextRequest) {
  try {
    const { startType, genre, protagonist, coreIdea, wordCount = 500, versions = 3 } = await request.json();

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
      cool: '装逼型开篇（系统/金手指/天才）',
      sweet: '温情型开篇（甜宠/日常/治愈）',
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

## 开头类型：
1. **冲突型开篇**：
   - 打脸流：主角被轻视 → 展现实力 → 震惊全场
   - 逆袭流：遇到危机 → 绝境爆发 → 反败为胜
   - 危机流：突发危机 → 主角应对 → 化险为夷

2. **悬念型开篇**：
   - 谜团型：发现谜团 → 展开调查 → 揭开真相
   - 穿越型：穿越重生 → 发现异常 → 展开冒险
   - 重生型：前世死亡 → 重生归来 → 改变命运

3. **装逼型开篇**：
   - 系统流：获得系统 → 展现能力 → 震惊众人
   - 金手指流：发现金手指 → 使用能力 → 爽点爆发
   - 天才流：天才登场 → 展现实力 → 众人崇拜

4. **温情型开篇**：
   - 甜宠流：甜蜜相遇 → 互动日常 → 情感升温
   - 日常流：温馨日常 → 小确幸 → 治愈人心
   - 治愈流：遭遇困难 → 温暖治愈 → 重获希望

5. **震撼型开篇**：
   - 世界观流：宏大世界观 → 神级设定 → 震撼开场
   - 战斗流：激烈战斗 → 高潮迭起 → 爽点爆发
   - 灾难流：突发灾难 → 主角应对 → 展现实力

## 开头结构模板：
1. **黄金3秒**（前50字）：
   - 直接切入冲突
   - 制造强烈悬念
   - 展现震撼场面
   - 快速建立人设

2. **黄金500字**结构：
   - 前30%（150字）：建立冲突或悬念
   - 中段50%（250字）：情节发展或爽点爆发
   - 后20%（100字）：留下钩子或转折

3. **钩子设计**：
   - 悬念钩子："他究竟是谁？"
   - 期待钩子："接下来的战斗会怎样？"
   - 伏笔钩子："这件事背后隐藏着什么秘密？"
   - 情绪钩子：引发读者强烈情绪

## 输出要求：
- 前50字必须抓住读者（黄金3秒）
- 前500字必须建立冲突、悬念或高潮
- 快速展现主角特色和魅力
- 在结尾留下强力悬念或期待
- 控制字数在${wordCount}字左右
- 生成${versions}个不同版本的开头
- 每个版本都要有独特性
- 每个版本都要符合${startTypeDesc}
- 每个版本都要适配${genre}题材
- 直接输出开头内容，无任何说明文字
- 每个版本之间用"---版本分隔---"分隔`;

    // 构建用户提示词
    const userPrompt = `请生成${versions}个${startTypeDesc}的黄金开头：

【题材】${genre}
【主角人设】${protagonist}
${coreIdea ? `【核心梗】${coreIdea}` : ''}

【要求】
1. 前50字必须抓住读者（黄金3秒）
2. 前500字必须建立冲突、悬念或高潮
3. 快速展现主角特色和魅力
4. 在结尾留下强力悬念或期待
5. 控制字数在${wordCount}字左右
6. 生成${versions}个不同版本的开头
7. 每个版本之间用"---版本分隔---"分隔
8. 直接输出开头内容`;

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
      temperature: 0.9,
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
        'X-Golden-Start-Version': 'v2.0-9.8plus',
      },
    });
  } catch (error) {
    console.error('Golden start generate error:', error);
    return NextResponse.json(
      { success: false, error: '黄金开头生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
