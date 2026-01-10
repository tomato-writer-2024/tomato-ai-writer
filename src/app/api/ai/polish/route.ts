import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware, successResponse, errorResponse, ApiResult } from '@/lib/apiMiddleware';
import { LLMClient, getModelForTask } from '@/lib/llmClient';
import { RATE_LIMIT_CONFIGS } from '@/lib/rateLimiter';
import { verifyToken, checkUserQuota } from '@/lib/auth';

/**
 * 精修润色提示词
 */
const POLISH_PROMPT = `你是一位专业网文编辑，精通番茄小说平台风格，擅长精修润色章节内容。

【精修原则】
1. 保持原意：不改变原有剧情和人物设定
2. 优化节奏：调整段落长度，加快节奏
3. 增强爽点：强化爽点描写，提升情绪爆发
4. 精炼对话：去除冗余对话，让对话更自然
5. 提升文笔：优化用词，增强画面感
6. 紧凑结构：删除无效段落，提升信息密度

【精修要点】
- 删除过度铺垫，直接进入高潮
- 增强冲突描写，提升紧张感
- 优化动作描写，增强画面感
- 调整对话语气，符合人设
- 强化心理描写，提升代入感
- 切换长短句，增加韵律感

【输出格式】
直接输出精修后的内容，不需要解释`;

/**
 * 精修润色API
 *
 * 对现有章节内容进行精修润色
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

    const { content, genre, style, focus } = await request.json();

    // 验证输入
    if (!content || content.length < 100) {
      return errorResponse('内容过短，无法润色', 400, 400);
    }

    if (content.length > 100000) {
      return errorResponse('内容过长，请分段润色', 400, 400);
    }

    // 初始化LLM客户端
    const llmClient = new LLMClient();

    // 构建系统提示词
    const systemPrompt = `${POLISH_PROMPT}

【精修配置】
- 题材类型：${genre || '不限'}
- 润色风格：${style || '番茄爽文风格'}
- 润色重点：${focus || '全面润色'}

【润色重点说明】
${focus === 'plot' ? '重点优化剧情节奏，删除冗余情节' : ''}
${focus === 'dialogue' ? '重点优化对话，让对话更自然生动' : ''}
${focus === 'emotion' ? '重点强化情感描写，提升情绪爆发' : ''}
${focus === 'description' ? '重点优化环境描写，增强画面感' : ''}
${focus === 'all' ? '进行全面润色，优化所有方面' : ''}
`;

    // 构建用户提示词
    const userPrompt = `请对以下章节内容进行精修润色：

【原文内容】
${content}

【润色要求】
1. 保持原意不变
2. 优化节奏和文笔
3. 增强爽点
4. 紧凑结构
5. 直接输出精修后的内容，不需要解释`;

    // 调用LLM（流式输出）
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();

          for await (const chunk of llmClient.creativeWritingStream(systemPrompt, userPrompt, {
            model: getModelForTask('creative'),
            temperature: 0.7,
          })) {
            controller.enqueue(encoder.encode(chunk));
          }

          controller.close();
        } catch (error) {
          console.error('精修润色失败:', error);
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
    console.error('[精修润色] 服务器错误:', error);
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
