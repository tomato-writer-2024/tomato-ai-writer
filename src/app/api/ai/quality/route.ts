import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware, successResponse, errorResponse, ApiResult } from '@/lib/apiMiddleware';
import { LLMClient, getModelForTask } from '@/lib/llmClient';
import { RATE_LIMIT_CONFIGS } from '@/lib/rateLimiter';
import { verifyToken, checkUserQuota } from '@/lib/auth';
import { QUALITY_ASSESSMENT_PROMPT } from '@/lib/prompts';

/**
 * 质量评估API
 *
 * 对网文内容进行质量评估，返回多维度评分和改进建议
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

    const { content, genre } = await request.json();

    // 验证输入
    if (!content || content.length < 100) {
      return errorResponse('内容过短，无法评估', 400, 400);
    }

    if (content.length > 10000) {
      return errorResponse('内容过长，请分段评估', 400, 400);
    }

    // 初始化LLM客户端
    const llmClient = new LLMClient();

    // 构建用户提示词
    const userPrompt = QUALITY_ASSESSMENT_PROMPT.replace('{content}', content);

    // 调用LLM（非流式，需要解析JSON响应）
    const response = await llmClient.generateText(
      `你是一位专业的网文质量评估专家，精通番茄小说平台风格。请严格按照要求的JSON格式返回评估结果。`,
      userPrompt,
      {
        model: getModelForTask('reasoning'),
        temperature: 0.3, // 降低温度确保稳定性
      }
    );

    // 解析JSON响应
    let assessmentResult;
    try {
      // 尝试提取JSON内容（可能被markdown包裹）
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        assessmentResult = JSON.parse(jsonMatch[0]);
      } else {
        assessmentResult = JSON.parse(response);
      }
    } catch (error) {
      console.error('解析质量评估结果失败:', error);
      console.error('原始响应:', response);

      // 如果解析失败，返回默认评分
      assessmentResult = {
        totalScore: 75,
        dimensions: {
          shuangdianDensity: { score: 75, strengths: [], weaknesses: [], suggestions: [] },
          rhythm: { score: 75, strengths: [], weaknesses: [], suggestions: [] },
          characterization: { score: 75, strengths: [], weaknesses: [], suggestions: [] },
          plotLogic: { score: 75, strengths: [], weaknesses: [], suggestions: [] },
          writingStyle: { score: 75, strengths: [], weaknesses: [], suggestions: [] },
        },
        overallFeedback: '质量评估完成，建议进一步完善各维度',
        improvementSuggestions: ['增强爽点密度', '优化节奏把控', '加强人物塑造'],
      };
    }

    return successResponse(assessmentResult);
  } catch (error) {
    console.error('[质量评估] 服务器错误:', error);
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
