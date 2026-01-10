import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware, successResponse, errorResponse, ApiResult } from '@/lib/apiMiddleware';
import { LLMClient, getModelForTask } from '@/lib/llmClient';
import { RATE_LIMIT_CONFIGS } from '@/lib/rateLimiter';
import { verifyToken, checkUserQuota } from '@/lib/auth';

/**
 * 智能续写提示词
 */
const CONTINUE_WRITING_PROMPT = `你是一位资深的番茄小说网文作者，精通各题材爽文写作，擅长智能续写。

【续写原则】
1. 承接上文：无缝衔接上文的情节和氛围
2. 保持人设：延续人物性格和语气
3. 推进剧情：向前推进主线或支线剧情
4. 制造爽点：在续写中设置新的爽点
5. 预埋伏笔：为后续剧情埋下伏笔
6. 控制节奏：根据需要调整节奏（快/慢）
7. 留足悬念：在结尾处制造悬念

【续写类型】
- 剧情推进：继续当前冲突，推动剧情发展
- 场景切换：切换到新场景，展开新情节
- 人物互动：通过对话展开人物关系
- 动作场面：描写紧张的动作场景
- 情感爆发：强化情感冲突和爆发
- 伏笔铺垫：为后续剧情埋线索
- 爽点爆发：制造新的爽点

【续写技巧】
- 上文结尾如果是悬念，先回应再展开
- 根据上下文判断是快节奏还是慢节奏
- 人物行为必须符合性格设定
- 新角色出现要快速建立印象
- 每段续写都要有明确的目的`;

/**
 * 智能续写API
 *
 * 根据上文内容智能续写
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

    const { context, genre, continuationType, wordCount, style } = await request.json();

    // 验证输入
    if (!context || context.length < 50) {
      return errorResponse('上下文内容过短', 400, 400);
    }

    if (context.length > 50000) {
      return errorResponse('上下文过长，请截取最近内容', 400, 400);
    }

    if (wordCount && (wordCount < 200 || wordCount > 5000)) {
      return errorResponse('续写字数要求在200-5000字之间', 400, 400);
    }

    // 初始化LLM客户端
    const llmClient = new LLMClient();

    // 构建系统提示词
    const systemPrompt = `${CONTINUE_WRITING_PROMPT}

【续写配置】
- 题材类型：${genre || '不限'}
- 续写类型：${continuationType || '剧情推进'}
- 目标字数：${wordCount || '1000-2000'}字
- 写作风格：${style || '标准爽文风格'}

【续写类型说明】
${continuationType === 'plot' ? '继续推进当前剧情，向前发展' : ''}
${continuationType === 'scene' ? '切换到新场景，展开新情节' : ''}
${continuationType === 'dialogue' ? '通过对话展开人物关系和剧情' : ''}
${continuationType === 'action' ? '描写紧张的动作场景' : ''}
${continuationType === 'emotion' ? '强化情感冲突和爆发' : ''}
${continuationType === 'foreshadowing' ? '为后续剧情埋下伏笔' : ''}
${continuationType === 'climax' ? '制造爽点爆发，情绪高潮' : ''}
${!continuationType ? '智能判断续写类型，自然推进剧情' : ''}`;

    // 构建用户提示词
    const userPrompt = `请根据以下上下文内容进行智能续写：

【上文内容】
${context}

【续写要求】
1. 承接上文，保持连贯性
2. 推进剧情，制造爽点
3. 控制字数在${wordCount || '1000-2000'}字左右
4. 在结尾处制造悬念
5. 直接输出续写内容，不需要解释`;

    // 调用LLM（流式输出）
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();

          for await (const chunk of llmClient.creativeWritingStream(systemPrompt, userPrompt, {
            model: getModelForTask('creative'),
            temperature: 0.85,
          })) {
            controller.enqueue(encoder.encode(chunk));
          }

          controller.close();
        } catch (error) {
          console.error('智能续写失败:', error);
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
    console.error('[智能续写] 服务器错误:', error);
    return errorResponse(
      error instanceof Error ? error.message : '服务器内部错误',
      500,
      500
    );
  }
}

// 使用中间件包装：标准限流 + CSRF + 日志
export const POST = withMiddleware(handler, {
  rateLimit: RATE_LIMIT_CONFIGS.STANDARD,
  enableCsrf: true,
});
