/**
 * SQLite 数据库 Schema
 *
 * 用于0成本本地部署
 * 与PostgreSQL schema保持兼容
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================================================
// API 密钥表
// ============================================================================

export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  keyHash: text('key_hash').notNull(),
  name: text('name').notNull(),
  permissions: text('permissions', { mode: 'json' }).notNull().$type<string[]>(),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

// ============================================================================
// 会员订单表
// ============================================================================

export const membershipOrders = sqliteTable('membership_orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  level: text('level').notNull(),
  months: integer('months').notNull(),
  amount: integer('amount').notNull(),
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status').notNull().default('PENDING'),
  transactionId: text('transaction_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
});

// ============================================================================
// 安全日志表
// ============================================================================

export const securityLogs = sqliteTable('security_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  action: text('action').notNull(),
  details: text('details', { mode: 'json' }),
  ipAddress: text('ip_address'),
  status: text('status').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ============================================================================
// 子账号表
// ============================================================================

export const subAccounts = sqliteTable('sub_accounts', {
  id: text('id').primaryKey(),
  parentId: text('parent_id').notNull(),
  email: text('email').notNull(),
  username: text('username'),
  role: text('role').notNull().default('FREE'),
  permissions: text('permissions', { mode: 'json' }).notNull().$type<string[]>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

// ============================================================================
// 使用日志表
// ============================================================================

export const usageLogs = sqliteTable('usage_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  action: text('action').notNull(),
  workId: text('work_id'),
  metadata: text('metadata', { mode: 'json' }),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ============================================================================
// 用户表
// ============================================================================

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  username: text('username'),
  phone: text('phone'),
  location: text('location'),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default('FREE'),
  membershipLevel: text('membership_level').notNull().default('FREE'),
  membershipExpireAt: integer('membership_expire_at', { mode: 'timestamp' }),
  dailyUsageCount: integer('daily_usage_count').notNull().default(0),
  monthlyUsageCount: integer('monthly_usage_count').notNull().default(0),
  storageUsed: integer('storage_used').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isBanned: integer('is_banned', { mode: 'boolean' }).notNull().default(false),
  banReason: text('ban_reason'),
});

// ============================================================================
// 作品表（兼容旧版本）
// ============================================================================

export const works = sqliteTable('works', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title'),
  content: text('content').notNull(),
  wordCount: integer('word_count').notNull().default(0),
  characters: text('characters', { mode: 'json' }),
  outline: text('outline'),
  tags: text('tags'),
  genre: text('genre'),
  status: text('status'),
  type: text('type'),
  originalityScore: text('originality_score'),
  plagiarismCheckResult: text('plagiarism_check_result', { mode: 'json' }),
  qualityScore: integer('quality_score'),
  completionRate: integer('completion_rate'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
});

// ============================================================================
// 小说表
// ============================================================================

export const novels = sqliteTable('novels', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  genre: text('genre'),
  status: text('status').notNull().default('连载中'),
  type: text('type'),
  coverUrl: text('cover_url'),
  wordCount: integer('word_count').notNull().default(0),
  originalityScore: integer('originality_score'),
  qualityScore: integer('quality_score'),
  completionRate: integer('completion_rate'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
});

// ============================================================================
// 章节表
// ============================================================================

export const chapters = sqliteTable('chapters', {
  id: text('id').primaryKey(),
  novelId: text('novel_id').notNull(),
  userId: text('user_id').notNull(),
  chapterNumber: integer('chapter_number').notNull(),
  title: text('title'),
  content: text('content').notNull(),
  wordCount: integer('word_count').notNull().default(0),
  originalityScore: integer('originality_score'),
  qualityScore: integer('quality_score'),
  completionRate: integer('completion_rate'),
  originalContent: text('original_content'),
  polishHistory: text('polish_history', { mode: 'json' }),
  continueHistory: text('continue_history', { mode: 'json' }),
  status: text('status').notNull().default('DRAFT'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
});

// ============================================================================
// 内容统计表
// ============================================================================

export const contentStats = sqliteTable('content_stats', {
  id: text('id').primaryKey(),
  workId: text('work_id'),
  chapterId: text('chapter_id'),
  userId: text('user_id').notNull(),
  wordCount: integer('word_count').notNull(),
  originalityScore: integer('originality_score'),
  qualityScore: integer('quality_score'),
  completionRate: integer('completion_rate'),
  shuangdianCount: integer('shuangdian_count').notNull().default(0),
  shuangdianDensity: integer('shuangdian_density').notNull().default(0),
  pacingScore: integer('pacing_score'),
  logicScore: integer('logic_score'),
  emotionScore: integer('emotion_score'),
  languageScore: integer('language_score'),
  estimatedReadTime: integer('estimated_read_time').notNull().default(0),
  suggestions: text('suggestions', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ============================================================================
// 导出类型
// ============================================================================

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

export type MembershipOrder = typeof membershipOrders.$inferSelect;
export type InsertMembershipOrder = typeof membershipOrders.$inferInsert;

export type SecurityLog = typeof securityLogs.$inferSelect;
export type InsertSecurityLog = typeof securityLogs.$inferInsert;

export type SubAccount = typeof subAccounts.$inferSelect;
export type InsertSubAccount = typeof subAccounts.$inferInsert;

export type UsageLog = typeof usageLogs.$inferSelect;
export type InsertUsageLog = typeof usageLogs.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UpdateUser = Partial<InsertUser>;

export type Work = typeof works.$inferSelect;
export type InsertWork = typeof works.$inferInsert;
export type UpdateWork = Partial<InsertWork>;

export type Novel = typeof novels.$inferSelect;
export type InsertNovel = typeof novels.$inferInsert;
export type UpdateNovel = Partial<InsertNovel>;

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = typeof chapters.$inferInsert;
export type UpdateChapter = Partial<InsertChapter>;

export type ContentStat = typeof contentStats.$inferSelect;
export type InsertContentStat = typeof contentStats.$inferInsert;
export type UpdateContentStat = Partial<InsertContentStat>;
