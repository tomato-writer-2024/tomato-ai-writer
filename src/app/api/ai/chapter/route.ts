import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware, successResponse, errorResponse, ApiResult } from '@/lib/apiMiddleware';
import { LLMClient, getModelForTask } from '@/lib/llmClient';
import { RATE_LIMIT_CONFIGS } from '@/lib/rateLimiter';
import { verifyToken, checkUserQuota } from '@/lib/auth';

/**
 * 番茄小说风格专用提示词
 */
const TOMATO_NOVEL_STYLE = `你是一位资深的番茄小说网文作者，精通各题材爽文写作，熟悉番茄小说平台的推荐算法和读者喜好。

【核心写作原则】
1. 快节奏：开头3章必须抓住读者，情节紧凑，不拖沓
2. 爽点密集：每500字至少一个爽点，每章至少3-5个爽点
3. 情绪递进：情绪从低谷到高潮，形成强烈反差
4. 章节悬念：每章结尾必留悬念，吸引下章
5. 人物鲜明：主角人设鲜明，配角有记忆点
6. 对话精炼：避免冗长对话，多对话推进剧情
7. 描写适度：环境描写服务于剧情，不超过15%

【爽点类型】
- 打脸爽：主角被嘲笑后反击成功
- 装逼爽：展示隐藏实力震惊众人
- 收获爽：获得宝物、升级、突破境界
- 情感爽：被认可、被崇拜、被依赖
- 复仇爽：报复仇人，大仇得报
- 惊喜爽：意外收获，反转剧情

【章节结构】
- 开头（10%）：承接上章，快速进入剧情
- 发展（60%）：冲突升级，铺垫爽点
- 高潮（25%）：爆发爽点，情绪达到顶点
- 悬念（5%）：留下悬念，吸引下章

【避坑指南】
- 禁止长篇说教，通过剧情展现
- 避免过于直白的爽点，要铺垫
- 不要让主角太顺利，要有挫折
- 配角不能抢主角风头
- 每章必须有小高潮，每5章有大高潮`;

/**
 * 章节撰写API
 *
 * 支持生成完整的小说章节
 */
async function handler(request: NextRequest): Promise<NextResponse<ApiResult<any>>> {
  try {
    // 验证身份
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('未授权访问', 401, 401);
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return errorResponse('Token无效或已过期', 401, 401);
    }

    // 检查用户配额
    const quotaCheck = await checkUserQuota(payload.userId);
    if (!quotaCheck.canUse) {
      return errorResponse(quotaCheck.reason || '配额不足', 403, 403);
    }

    const { prompt, genre, chapterNumber, wordCount, context, style } = await request.json();

    // 验证输入
    if (!prompt) {
      return errorResponse('缺少章节提示词', 400, 400);
    }

    if (wordCount && (wordCount < 500 || wordCount > 10000)) {
      return errorResponse('字数要求在500-10000字之间', 400, 400);
    }

    // 初始化LLM客户端
    const llmClient = new LLMClient();

    // 构建系统提示词
    const systemPrompt = `${TOMATO_NOVEL_STYLE}

【当前章节信息】
- 章节序号：第${chapterNumber || 'N'}章
- 题材类型：${genre || '不限'}
- 目标字数：${wordCount || '2000-3000'}字
- 写作风格：${style || '标准爽文风格'}
${context ? `【前文上下文】\n${context}\n` : ''}
`;

    // 构建用户提示词
    const userPrompt = `请根据以下要求撰写章节内容：

章节要求：${prompt}

写作要求：
1. 严格按照番茄小说爽文风格
2. 字数控制在${wordCount || '2000-3000'}字左右
3. 开头要吸引人，结尾留悬念
4. 爽点密集，节奏明快
5. 对话生动，描写适度
6. 符合${genre || '爽文'}题材特点

请开始撰写章节：`;

    // 调用LLM（流式输出）
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();

          for await (const chunk of llmClient.creativeWritingStream(systemPrompt, userPrompt, {
            model: getModelForTask('creative'),
            temperature: 0.9,
          })) {
            controller.enqueue(encoder.encode(chunk));
          }

          controller.close();
        } catch (error) {
          console.error('章节生成失败:', error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('[章节撰写] 服务器错误:', error);
    return errorResponse(
      error instanceof Error ? error.message : '服务器内部错误',
      500,
      500
    );
  }
}

// 使用中间件包装：标准限流 + 禁用CSRF保护（需要身份验证的API暂时禁用CSRF）
export const POST = withMiddleware(handler, {
  rateLimit: RATE_LIMIT_CONFIGS.STANDARD,
  enableCsrf: false, // 暂时禁用CSRF保护，待前端支持CSRF令牌后再启用
});
