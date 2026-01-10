import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractUserFromRequest, checkUserQuota } from './auth';
import { UserRole, MembershipLevel } from './types/user';

/**
 * 权限验证错误响应
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * 权限不足错误
 */
export class PermissionError extends Error {
  constructor(message: string = '权限不足') {
    super(message);
    this.name = 'PermissionError';
  }
}

/**
 * 配额限制错误
 */
export class QuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaError';
  }
}

/**
 * 从请求中提取用户信息
 */
export async function getUserFromRequest(request: NextRequest) {
  const { user, error } = await extractUserFromRequest(request as unknown as Request);

  if (error || !user) {
    throw new AuthError(error || '未授权访问');
  }

  return user;
}

/**
 * 验证用户角色
 */
export function requireRoles(user: any, requiredRoles: UserRole[]) {
  if (!requiredRoles.includes(user.role)) {
    throw new PermissionError();
  }
}

/**
 * 验证会员等级
 */
export function requireMembership(user: any, requiredLevels: MembershipLevel[]) {
  if (!requiredLevels.includes(user.membershipLevel)) {
    throw new PermissionError('需要更高会员等级');
  }
}

/**
 * 验证用户配额
 */
export async function requireQuota(userId: string) {
  const { canUse, reason } = await checkUserQuota(userId);

  if (!canUse) {
    throw new QuotaError(reason || '配额已用完');
  }
}

/**
 * 验证数据所有权
 */
export function verifyOwnership(
  userId: string,
  resourceUserId: string,
  userRole: UserRole
): boolean {
  // 超级管理员可以访问所有数据
  if (userRole === UserRole.SUPER_ADMIN) {
    return true;
  }

  return userId === resourceUserId;
}

/**
 * 综合认证中间件
 * 检查：登录状态 + 角色权限 + 会员配额
 */
export async function authenticateRequest(
  request: NextRequest,
  options: {
    roles?: UserRole[];
    membershipLevels?: MembershipLevel[];
    checkQuota?: boolean;
    requireActive?: boolean;
  } = {}
) {
  try {
    // 提取用户信息
    const user = await getUserFromRequest(request);

    // 检查账号状态
    if (options.requireActive !== false) {
      if (!user.isActive) {
        throw new AuthError('账号已被禁用', 403);
      }

      if (user.isBanned) {
        throw new AuthError(`账号已被封禁：${user.banReason}`, 403);
      }
    }

    // 验证角色权限
    if (options.roles && options.roles.length > 0) {
      requireRoles(user, options.roles);
    }

    // 验证会员等级
    if (options.membershipLevels && options.membershipLevels.length > 0) {
      requireMembership(user, options.membershipLevels);
    }

    // 验证配额
    if (options.checkQuota) {
      await requireQuota(user.id);
    }

    return { user, error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { user: null, error: error.message, statusCode: error.statusCode };
    }
    if (error instanceof PermissionError) {
      return { user: null, error: error.message, statusCode: 403 };
    }
    if (error instanceof QuotaError) {
      return { user: null, error: error.message, statusCode: 429 };
    }
    return { user: null, error: '认证失败', statusCode: 401 };
  }
}

/**
 * 记录使用量（成功后调用）
 */
export async function recordUsage(
  userId: string,
  action: string,
  workId?: string,
  metadata?: any
) {
  // TODO: 实现使用量记录逻辑
  // 1. 更新用户的 dailyUsageCount 和 monthlyUsageCount
  // 2. 记录 usage_logs 表
  // 3. 更新 storageUsed（如果有文件上传）

  console.log(`[Usage] User: ${userId}, Action: ${action}, Work: ${workId}`);
}

/**
 * 记录安全日志
 */
export async function recordSecurityLog(
  userId: string | null,
  action: string,
  status: 'SUCCESS' | 'FAILURE',
  details?: any
) {
  // TODO: 实现安全日志记录逻辑
  // 记录到 security_logs 表

  console.log(`[Security] User: ${userId}, Action: ${action}, Status: ${status}`);
}

/**
 * 性能监控中间件
 */
export function performanceMonitor(apiEndpoint: string) {
  return async (fn: () => Promise<Response>) => {
    const startTime = Date.now();
    const response = await fn();
    const duration = Date.now() - startTime;

    // 记录性能指标
    // TODO: 实现性能指标记录逻辑
    // 记录到 performance_metrics 表

    console.log(`[Performance] ${apiEndpoint}: ${duration}ms`);

    // 添加性能头
    response.headers.set('X-Response-Time', `${duration}ms`);

    return response;
  };
}

/**
 * API响应包装器
 */
export function apiResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * API错误响应
 */
export function apiError(
  error: string,
  status: number = 500
): NextResponse {
  return NextResponse.json({ success: false, error }, { status });
}

/**
 * 会员限制配置
 */
export const MEMBERSHIP_LIMITS = {
  [MembershipLevel.FREE]: {
    // 角色设定
    charactersPerDay: 3,
    // 世界观构建
    worldBuildingPerDay: 2,
    // 大纲生成
    outlinePerDay: 2,
    // 关系图谱
    relationshipMapPerDay: 2,
    // 卡文诊断
    writerBlockPerDay: 5,
    // 爽点分析
    satisfactionAnalysisPerDay: 3,
    // 风格模拟
    styleSimulatorPerDay: 2,
    // 情节反转
    plotTwistPerDay: 3,
    // 结局生成
    endingGeneratorPerDay: 2,
    // 书名生成
    titleGeneratorPerDay: 10,
    // 封面描述
    coverGeneratorPerDay: 2,
    // 章节撰写
    chaptersPerDay: 5,
    // 章节精修
    polishPerDay: 10,
    // 智能续写
    continuePerDay: 5,
  },
  [MembershipLevel.BASIC]: {
    charactersPerDay: 10,
    worldBuildingPerDay: 5,
    outlinePerDay: 5,
    relationshipMapPerDay: 5,
    writerBlockPerDay: 20,
    satisfactionAnalysisPerDay: 10,
    styleSimulatorPerDay: 5,
    plotTwistPerDay: 10,
    endingGeneratorPerDay: 5,
    titleGeneratorPerDay: 50,
    coverGeneratorPerDay: 5,
    chaptersPerDay: 20,
    polishPerDay: 50,
    continuePerDay: 20,
  },
  [MembershipLevel.PREMIUM]: {
    charactersPerDay: Infinity,
    worldBuildingPerDay: Infinity,
    outlinePerDay: Infinity,
    relationshipMapPerDay: Infinity,
    writerBlockPerDay: Infinity,
    satisfactionAnalysisPerDay: Infinity,
    styleSimulatorPerDay: Infinity,
    plotTwistPerDay: Infinity,
    endingGeneratorPerDay: Infinity,
    titleGeneratorPerDay: Infinity,
    coverGeneratorPerDay: Infinity,
    chaptersPerDay: Infinity,
    polishPerDay: Infinity,
    continuePerDay: Infinity,
  },
  [MembershipLevel.ENTERPRISE]: {
    charactersPerDay: Infinity,
    worldBuildingPerDay: Infinity,
    outlinePerDay: Infinity,
    relationshipMapPerDay: Infinity,
    writerBlockPerDay: Infinity,
    satisfactionAnalysisPerDay: Infinity,
    styleSimulatorPerDay: Infinity,
    plotTwistPerDay: Infinity,
    endingGeneratorPerDay: Infinity,
    titleGeneratorPerDay: Infinity,
    coverGeneratorPerDay: Infinity,
    chaptersPerDay: Infinity,
    polishPerDay: Infinity,
    continuePerDay: Infinity,
  },
};

/**
 * 检查特定功能的会员限制
 */
export async function checkFeatureLimit(
  userId: string,
  feature: keyof typeof MEMBERSHIP_LIMITS[MembershipLevel]
): Promise<{ canUse: boolean; reason?: string }> {
  // TODO: 实现功能限制检查
  // 1. 获取用户会员等级
  // 2. 检查今日使用次数
  // 3. 判断是否超过限制

  return { canUse: true };
}

/**
 * 记录功能使用
 */
export async function recordFeatureUsage(
  userId: string,
  feature: keyof typeof MEMBERSHIP_LIMITS[MembershipLevel]
) {
  // TODO: 实现功能使用记录
  console.log(`[FeatureUsage] User: ${userId}, Feature: ${feature}`);
}
