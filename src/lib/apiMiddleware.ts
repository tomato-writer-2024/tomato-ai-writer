/**
 * API中间件工具
 * 集成请求限流、CSRF保护等功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMIT_CONFIGS } from './rateLimiter';
import { verifyCsrfToken } from './csrf';
import { getClientIp } from './auth';

/**
 * API中间件配置
 */
export interface MiddlewareConfig {
  // 是否启用CSRF保护
  enableCsrf?: boolean;
  // 限流配置
  rateLimit?: typeof RATE_LIMIT_CONFIGS[keyof typeof RATE_LIMIT_CONFIGS];
  // 是否需要身份验证
  requireAuth?: boolean;
  // 是否需要管理员权限
  requireAdmin?: boolean;
  // 是否需要超级管理员权限
  requireSuperAdmin?: boolean;
}

/**
 * API响应类型
 */
export interface ApiResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

/**
 * 执行API中间件检查
 *
 * @param request Next.js请求对象
 * @param config 中间件配置
 * @returns 检查结果，如果不通过则返回NextResponse
 */
export async function runMiddleware(
  request: NextRequest,
  config: MiddlewareConfig = {}
): Promise<NextResponse | null> {
  const { enableCsrf = false, rateLimit } = config;

  // 1. 请求限流检查
  if (rateLimit) {
    const rateLimitResult = await checkRateLimit(request, rateLimit);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.error || '请求过于频繁',
          code: 429,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': String(rateLimitResult.remaining || 0),
            'X-RateLimit-Reset': String(rateLimitResult.resetTime || 0),
          },
        }
      );
    }
  }

  // 2. CSRF保护检查
  if (enableCsrf) {
    const csrfResult = await verifyCsrfToken(request);

    if (!csrfResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: csrfResult.error || 'CSRF令牌验证失败',
          code: 403,
        },
        { status: 403 }
      );
    }
  }

  // 所有检查通过
  return null;
}

/**
 * 创建标准API响应
 */
export function createApiResponse<T = any>(
  data: ApiResult<T>,
  status: number = 200
): NextResponse<ApiResult<T>> {
  return NextResponse.json(data, { status });
}

/**
 * 创建成功响应
 */
export function successResponse<T = any>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResult<T>> {
  return createApiResponse(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    status
  );
}

/**
 * 创建错误响应
 */
export function errorResponse(
  error: string,
  code: number = 500,
  status: number = 400
): NextResponse<ApiResult> {
  return createApiResponse(
    {
      success: false,
      error,
      code,
    },
    status
  );
}

/**
 * 创建验证错误响应
 */
export function validationError(errors: Record<string, string>): NextResponse<ApiResult> {
  return NextResponse.json(
    {
      success: false,
      error: '输入验证失败',
      errors,
      code: 422,
    },
    { status: 422 }
  );
}

/**
 * 包装API处理器，自动应用中间件
 *
 * @param handler API处理函数
 * @param config 中间件配置
 * @returns 包装后的处理函数
 */
export function withMiddleware<T = any>(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse<ApiResult<T>>>,
  config: MiddlewareConfig = {}
) {
  return async (
    request: NextRequest,
    context?: any
  ): Promise<NextResponse<ApiResult<T>>> => {
    try {
      // 执行中间件检查
      const middlewareResult = await runMiddleware(request, config);

      // 如果中间件返回错误响应，直接返回
      if (middlewareResult) {
        return middlewareResult;
      }

      // 执行实际的API处理器
      return await handler(request, context);
    } catch (error) {
      console.error('[API中间件] 未捕获的错误:', error);

      return errorResponse(
        error instanceof Error ? error.message : '服务器内部错误',
        500,
        500
      );
    }
  };
}

/**
 * 记录API请求日志
 */
export function logApiRequest(
  request: NextRequest,
  response: NextResponse,
  duration: number,
  userId?: string
): void {
  const ip = getClientIp(request);
  const method = request.method;
  const url = request.nextUrl.pathname;
  const status = response.status;

  console.log(`[API日志] ${method} ${url} - ${status} - ${duration}ms - IP:${ip}${userId ? ` - User:${userId}` : ''}`);
}

/**
 * 异步日志包装器
 */
export function withLogging<T = any>(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse<ApiResult<T>>>,
  options: {
    includeUserId?: boolean;
    includeRequestData?: boolean;
  } = {}
) {
  return async (
    request: NextRequest,
    context?: any
  ): Promise<NextResponse<ApiResult<T>>> => {
    const startTime = Date.now();

    try {
      // 执行处理器
      const response = await handler(request, context);

      // 计算处理时间
      const duration = Date.now() - startTime;

      // 获取用户ID（如果响应中有）
      const userId = options.includeUserId
        ? (await response.json()).data?.userId
        : undefined;

      // 记录日志
      logApiRequest(request, response, duration, userId);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      console.error('[API日志] 请求处理失败:', error);

      const errorResponse = NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : '服务器内部错误',
          code: 500,
        },
        { status: 500 }
      );

      logApiRequest(request, errorResponse, duration);

      return errorResponse;
    }
  };
}

/**
 * 组合多个包装器
 */
export function compose<T = any>(
  ...wrappers: Array<(handler: any) => any>
): (handler: any) => any {
  return (handler: any) => {
    return wrappers.reduceRight((acc, wrapper) => wrapper(acc), handler);
  };
}
