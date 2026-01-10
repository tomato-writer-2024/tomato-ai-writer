import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserRole, MembershipLevel } from './types/user';
import { userManager } from '@/storage/database';
import type { JwtPayload } from './types/user';

/**
 * JWT配置
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7天过期
const REFRESH_TOKEN_EXPIRES_IN = '30d'; // 30天过期

/**
 * 密码哈希（bcrypt，cost=12）
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * 密码验证
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * 生成JWT访问令牌
 */
export function generateAccessToken(payload: {
  userId: string;
  email: string;
  role: UserRole;
  membershipLevel: MembershipLevel;
}): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * 生成JWT刷新令牌
 */
export function generateRefreshToken(payload: {
  userId: string;
  email: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

/**
 * 生成重置密码令牌（30分钟有效）
 */
export function generateResetToken(payload: {
  userId: string;
  email: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30m',
  });
}

/**
 * 验证重置密码令牌
 */
export function verifyResetToken(token: string): {
  userId: string;
  email: string;
} | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    return null;
  }
}

/**
 * 验证JWT令牌
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * 生成随机字符串
 */
export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * 生成API密钥
 */
export function generateApiKey(): {
  key: string;
  keyHash: string;
} {
  const key = `fanqie_${generateRandomString(32)}`;
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  return { key, keyHash };
}

/**
 * 获取客户端IP地址
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * 获取用户代理
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * 检查用户是否有特定角色
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * 检查用户是否有特定会员等级
 */
export function hasMembership(
  userMembership: MembershipLevel,
  requiredLevels: MembershipLevel[]
): boolean {
  return requiredLevels.includes(userMembership);
}

/**
 * 检查用户使用量是否在限制内
 */
export async function checkUserQuota(userId: string): Promise<{
  canUse: boolean;
  reason?: string;
}> {
  const user = await userManager.getUserById(userId);

  if (!user) {
    return { canUse: false, reason: '用户不存在' };
  }

  // 检查用户是否被封禁
  if (user.isBanned) {
    return { canUse: false, reason: `账号已被封禁：${user.banReason}` };
  }

  // 检查会员是否过期
  if (user.membershipLevel !== MembershipLevel.FREE &&
      user.membershipExpireAt &&
      new Date(user.membershipExpireAt) < new Date()) {
    // 降级为免费用户
    await userManager.upgradeMembership(userId, MembershipLevel.FREE, null);
    return { canUse: false, reason: '会员已过期，请续费' };
  }

  // 获取会员权益配置
  const membershipKey = user.membershipLevel as MembershipLevel;
  const quotas = MEMBERSHIP_QUOTAS[membershipKey];

  // 检查每日限制
  if (quotas.daily !== Infinity) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    if (user.dailyUsageCount >= quotas.daily) {
      return {
        canUse: false,
        reason: '今日生成次数已用完，请明日再试或升级会员',
      };
    }
  }

  // 检查每月限制
  if (quotas.monthly !== Infinity) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    if (user.monthlyUsageCount >= quotas.monthly) {
      return {
        canUse: false,
        reason: '本月生成次数已用完，请下月再试或升级会员',
      };
    }
  }

  // 检查存储空间
  const storageLimit = quotas.storageLimit;
  if (user.storageUsed >= storageLimit) {
    const usedMB = (user.storageUsed / 1024 / 1024).toFixed(2);
    const limitMB = (storageLimit / 1024 / 1024).toFixed(2);
    return {
      canUse: false,
      reason: `存储空间已用完（${usedMB}MB/${limitMB}MB），请升级会员或删除旧内容`,
    };
  }

  return { canUse: true };
}

/**
 * 会员权益配置
 */
const MEMBERSHIP_QUOTAS = {
  [MembershipLevel.FREE]: {
    daily: 5,
    monthly: 100,
    storageLimit: 100 * 1024 * 1024, // 100MB
  },
  [MembershipLevel.BASIC]: {
    daily: 20,
    monthly: 500,
    storageLimit: 500 * 1024 * 1024, // 500MB
  },
  [MembershipLevel.PREMIUM]: {
    daily: Infinity,
    monthly: Infinity,
    storageLimit: 5 * 1024 * 1024 * 1024, // 5GB
  },
  [MembershipLevel.ENTERPRISE]: {
    daily: Infinity,
    monthly: Infinity,
    storageLimit: 50 * 1024 * 1024 * 1024, // 50GB
  },
};

/**
 * 从请求中提取并验证用户
 */
export async function extractUserFromRequest(request: Request): Promise<{
  user: any;
  error?: string;
}> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: '未授权访问' };
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);

  if (!payload) {
    return { user: null, error: '无效的令牌' };
  }

  const user = await userManager.getUserById(payload.userId);

  if (!user || !user.isActive) {
    return { user: null, error: '用户不存在或已被禁用' };
  }

  if (user.isBanned) {
    return { user: null, error: `账号已被封禁：${user.banReason}` };
  }

  return { user };
}

/**
 * 权限验证中间件
 */
export function requirePermission(requiredRoles: UserRole[]) {
  return async (request: Request) => {
    const { user, error } = await extractUserFromRequest(request);

    if (error) {
      return Response.json({ error }, { status: 401 });
    }

    if (!hasRole(user.role, requiredRoles)) {
      return Response.json({ error: '权限不足' }, { status: 403 });
    }

    return Response.json({ user });
  };
}

/**
 * 数据所有权验证
 */
export async function verifyDataOwnership(
  userId: string,
  resourceUserId: string,
  userRole: UserRole
): Promise<boolean> {
  // 超级管理员可以访问所有数据
  if (userRole === UserRole.SUPER_ADMIN) {
    return true;
  }

  // 普通用户只能访问自己的数据
  return userId === resourceUserId;
}
