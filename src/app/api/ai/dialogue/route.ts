import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware, successResponse, errorResponse, ApiResult } from '@/lib/apiMiddleware';
import { LLMClient, getModelForTask } from '@/lib/llmClient';
import { RATE_LIMIT_CONFIGS } from '@/lib/rateLimiter';
import { verifyToken, checkUserQuota } from '@/lib/auth';
import { DIALOGUE_WRITING_PROMPT } from '@/lib/prompts';

/**
 * 对话式写作API
 *
 * 支持多轮对话，与作者协作创作小说
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

    const { messages, context, genre } = await request.json();

    // 验证输入
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return errorResponse('缺少对话消息', 400, 400);
    }

    // 初始化LLM客户端
    const llmClient = new LLMClient();

    // 构建系统提示词
    const systemPrompt = `${DIALOGUE_WRITING_PROMPT}

【当前作品信息】
- 题材类型：${genre || '不限'}
${context ? `【上下文信息】\n${context}\n` : ''}`;

    // 转换消息格式
    const llmMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // 调用LLM（流式输出）
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();

          for await (const chunk of llmClient.chatStream(llmMessages, {
            model: getModelForTask('creative'),
            temperature: 0.85,
          })) {
            controller.enqueue(encoder.encode(chunk));
          }

          controller.close();
        } catch (error) {
          console.error('对话式写作失败:', error);
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
    console.error('[对话式写作] 服务器错误:', error);
    return errorResponse(
      error instanceof Error ? error.message : '服务器内部错误',
      500,
      500
    );
  }
}

// 使用中间件包装：标准限流 + 禁用CSRF保护
export const POST = withMiddleware(handler, {
  rateLimit: RATE_LIMIT_CONFIGS.STANDARD,
  enableCsrf: false,
});
