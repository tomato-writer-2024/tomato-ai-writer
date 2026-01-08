/**
 * 用户角色枚举
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

/**
 * 会员等级枚举
 */
export enum MembershipLevel {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED'
}

/**
 * 会员权益配置
 */
export interface MembershipQuota {
  daily: number;  // 每日生成次数（Infinity表示无限）
  monthly: number;  // 每月生成次数
  maxWords: number;  // 单次生成最大字数
  storageLimit: number;  // 存储空间限制（字节）
  exportFormats: string[];  // 支持的导出格式
  maxBatchSize: number;  // 批量处理最大章节数
  hasOriginalityCheck: boolean;  // 是否有原创性检测
  hasApiAccess: boolean;  // 是否有API访问权限
  maxSubAccounts: number;  // 最多子账号数
  supportLevel: 'BASIC' | 'EMAIL' | 'PRIORITY' | 'DEDICATED';
}

/**
 * 会员权益配置表
 *
 * 统一标准：
 * - FREE（免费版）: ¥0
 * - BASIC（基础版）: ¥29/月（¥261/年，省10%）
 * - PREMIUM（高级版）: ¥99/月（¥891/年，省10%）
 * - ENTERPRISE（企业版）: ¥299/月（¥2691/年，省10%）
 */
export const MEMBERSHIP_QUOTAS: Record<MembershipLevel, MembershipQuota> = {
  [MembershipLevel.FREE]: {
    daily: 5,
    monthly: 100,
    maxWords: 2000,
    storageLimit: 100 * 1024 * 1024,  // 100MB
    exportFormats: ['txt'],
    maxBatchSize: 0,
    hasOriginalityCheck: false,
    hasApiAccess: false,
    maxSubAccounts: 0,
    supportLevel: 'BASIC'
  },
  [MembershipLevel.BASIC]: {
    daily: 30,
    monthly: 500,
    maxWords: 3000,
    storageLimit: 500 * 1024 * 1024,  // 500MB
    exportFormats: ['txt', 'docx'],
    maxBatchSize: 5,
    hasOriginalityCheck: false,
    hasApiAccess: false,
    maxSubAccounts: 0,
    supportLevel: 'EMAIL'
  },
  [MembershipLevel.PREMIUM]: {
    daily: Infinity,
    monthly: Infinity,
    maxWords: 5000,
    storageLimit: 5 * 1024 * 1024 * 1024,  // 5GB
    exportFormats: ['txt', 'docx', 'pdf'],
    maxBatchSize: 20,
    hasOriginalityCheck: true,
    hasApiAccess: false,
    maxSubAccounts: 0,
    supportLevel: 'PRIORITY'
  },
  [MembershipLevel.ENTERPRISE]: {
    daily: Infinity,
    monthly: Infinity,
    maxWords: 10000,
    storageLimit: 50 * 1024 * 1024 * 1024,  // 50GB
    exportFormats: ['txt', 'docx', 'pdf'],
    maxBatchSize: 100,
    hasOriginalityCheck: true,
    hasApiAccess: true,
    maxSubAccounts: 10,
    supportLevel: 'DEDICATED'
  }
};

/**
 * 会员定价配置（元）
 */
export const MEMBERSHIP_PRICING: Record<MembershipLevel, { monthly: number; yearly: number }> = {
  [MembershipLevel.FREE]: { monthly: 0, yearly: 0 },
  [MembershipLevel.BASIC]: { monthly: 29, yearly: 261 },  // 年付省10%
  [MembershipLevel.PREMIUM]: { monthly: 99, yearly: 891 },  // 年付省10%
  [MembershipLevel.ENTERPRISE]: { monthly: 299, yearly: 2691 },  // 年付省10%
};

/**
 * 用户接口
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  username?: string;
  role: UserRole;
  membershipLevel: MembershipLevel;
  membershipExpireAt?: Date;
  dailyUsageCount: number;
  monthlyUsageCount: number;
  storageUsed: number;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
}

/**
 * 用户创建接口
 */
export interface CreateUserInput {
  email: string;
  password: string;
  username?: string;
}

/**
 * 用户更新接口
 */
export interface UpdateUserInput {
  username?: string;
  password?: string;
  membershipLevel?: MembershipLevel;
  membershipExpireAt?: Date;
  isActive?: boolean;
  isBanned?: boolean;
  banReason?: string;
}

/**
 * 登录接口
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * 注册接口
 */
export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  username?: string;
}

/**
 * 登录响应接口
 */
export interface LoginResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
  refreshToken?: string;
}

/**
 * 创作内容接口
 */
export interface Work {
  id: string;
  userId: string;
  title?: string;
  content: string;
  wordCount: number;
  characters?: string;
  outline?: string;
  tags?: string;
  originalityScore?: number;
  plagiarismCheckResult?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

/**
 * 创作内容创建接口
 */
export interface CreateWorkInput {
  title?: string;
  content: string;
  characters?: string;
  outline?: string;
  tags?: string;
}

/**
 * 原创性检测结果接口
 */
export interface OriginalityCheckResult {
  score: number;
  duplicateSentences: number;
  templatePhrases: number;
  diversityScore: number;
  details: {
    duplicateContent: string[];
    templatePhrasesUsed: string[];
    uniqueWordRatio: number;
    sentenceVariety: number;
  };
}

/**
 * 内容评分接口
 */
export interface ContentScore {
  overall: number;  // 综合评分
  shuangdianScore: number;  // 爽点评分
  fanqieScore: number;  // 番茄平台适配评分
  oldReaderScore: number;  // 老书虫偏好评分
  completionRateScore: number;  // 完读率潜力评分
  details: {
    shuangdian: {
      density: number;  // 爽点密度（每千字）
      count: number;  // 爽点总数
      types: string[];  // 爽点类型列表
    };
    fanqie: {
      score: number;
      details: {
        opening: boolean;
        pacing: boolean;
        language: boolean;
        emotion: boolean;
      };
      suggestions: string[];
    };
    oldReader: {
      score: number;
      details: {
        logic: boolean;
        depth: boolean;
        innovation: boolean;
        pacing: boolean;
      };
      suggestions: string[];
    };
  };
}

/**
 * 优化建议接口
 */
export interface OptimizationSuggestion {
  score: ContentScore;
  suggestions: {
    category: string;
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    reason: string;
    action: string;
  }[];
}

/**
 * JWT载荷接口
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  membershipLevel: MembershipLevel;
  iat?: number;
  exp?: number;
}

/**
 * 使用日志接口
 */
export interface UsageLog {
  id: string;
  userId: string;
  action: 'GENERATE' | 'POLISH' | 'CONTINUE' | 'IMPORT' | 'EXPORT';
  workId?: string;
  metadata?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

/**
 * 安全日志接口
 */
export interface SecurityLog {
  id: string;
  userId?: string;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'PASSWORD_CHANGE'
    | 'PERMISSION_CHANGE'
    | 'MEMBERSHIP_CHANGE'
    | 'USER_BANNED'
    | 'USER_UNBANNED'
    | 'DATA_ACCESS'
    | 'DATA_EXPORT';
  details?: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILED';
  createdAt: Date;
}

/**
 * 会员升级请求接口
 */
export interface UpgradeMembershipRequest {
  level: MembershipLevel;
  months: number;
  paymentMethod: string;
}

/**
 * 原创性检测结果接口
 */
export interface OriginalityCheckResult {
  score: number;  // 0-100
  duplicateSentences: number;
  templatePhrases: number;
  diversityScore: number;
  details: {
    duplicateContent: string[];
    templatePhrasesUsed: string[];
    uniqueWordRatio: number;
    sentenceVariety: number;
  };
}

/**
 * 子账号接口
 */
export interface SubAccount {
  id: string;
  parentId: string;
  email: string;
  username?: string;
  role: UserRole;
  permissions: string[];
  createdAt: Date;
  isActive: boolean;
}

/**
 * API密钥接口
 */
export interface ApiKey {
  id: string;
  userId: string;
  keyHash: string;
  name: string;
  permissions: string[];
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  isActive: boolean;
}
