import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createSchemaFactory } from "drizzle-zod";
import { z } from "zod";

// 使用 createSchemaFactory 配置 date coercion（处理前端 string → Date 转换）
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
  coerce: { date: true },
});

/**
 * 用户表
 */
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    username: varchar("username", { length: 100 }),
    role: varchar("role", { length: 20 }).notNull().default("FREE"),
    membershipLevel: varchar("membership_level", { length: 20 })
      .notNull()
      .default("FREE"),
    membershipExpireAt: timestamp("membership_expire_at", { withTimezone: true }),
    dailyUsageCount: integer("daily_usage_count").notNull().default(0),
    monthlyUsageCount: integer("monthly_usage_count").notNull().default(0),
    storageUsed: integer("storage_used").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    isBanned: boolean("is_banned").notNull().default(false),
    banReason: text("ban_reason"),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    roleIdx: index("users_role_idx").on(table.role),
    membershipIdx: index("users_membership_idx").on(table.membershipLevel),
  })
);

/**
 * 创作内容表
 */
export const works = pgTable(
  "works",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    title: varchar("title", { length: 255 }),
    content: text("content").notNull(),
    wordCount: integer("word_count").notNull().default(0),
    characters: jsonb("characters"),
    outline: text("outline"),
    tags: varchar("tags", { length: 500 }),
    originalityScore: numeric("originality_score", { precision: 5, scale: 2 }),
    plagiarismCheckResult: jsonb("plagiarism_check_result"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    isDeleted: boolean("is_deleted").notNull().default(false),
  },
  (table) => ({
    userIdIdx: index("works_user_id_idx").on(table.userId),
    createdAtIdx: index("works_created_at_idx").on(table.createdAt),
  })
);

/**
 * 使用日志表
 */
export const usageLogs = pgTable(
  "usage_logs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    action: varchar("action", { length: 50 }).notNull(),
    workId: varchar("work_id", { length: 36 }),
    metadata: jsonb("metadata"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("usage_logs_user_id_idx").on(table.userId),
    createdAtIdx: index("usage_logs_created_at_idx").on(table.createdAt),
  })
);

/**
 * 安全日志表
 */
export const securityLogs = pgTable(
  "security_logs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }),
    action: varchar("action", { length: 50 }).notNull(),
    details: jsonb("details"),
    ipAddress: varchar("ip_address", { length: 45 }),
    status: varchar("status", { length: 20 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("security_logs_user_id_idx").on(table.userId),
    createdAtIdx: index("security_logs_created_at_idx").on(table.createdAt),
    actionIdx: index("security_logs_action_idx").on(table.action),
  })
);

/**
 * 子账号表（企业会员）
 */
export const subAccounts = pgTable(
  "sub_accounts",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    parentId: varchar("parent_id", { length: 36 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    username: varchar("username", { length: 100 }),
    role: varchar("role", { length: 20 }).notNull().default("FREE"),
    permissions: jsonb("permissions").notNull().default("[]"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => ({
    parentIdIdx: index("sub_accounts_parent_id_idx").on(table.parentId),
    emailIdx: index("sub_accounts_email_idx").on(table.email),
  })
);

/**
 * API密钥表
 */
export const apiKeys = pgTable(
  "api_keys",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    keyHash: varchar("key_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    permissions: jsonb("permissions").notNull().default("[]"),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => ({
    userIdIdx: index("api_keys_user_id_idx").on(table.userId),
    keyHashIdx: index("api_keys_key_hash_idx").on(table.keyHash),
  })
);

/**
 * 会员订单表
 */
export const membershipOrders = pgTable(
  "membership_orders",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 36 }).notNull(),
    level: varchar("level", { length: 20 }).notNull(),
    months: integer("months").notNull(),
    amount: integer("amount").notNull(),  // 单位：分
    paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
    paymentStatus: varchar("payment_status", { length: 20 })
      .notNull()
      .default("PENDING"),
    transactionId: varchar("transaction_id", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index("membership_orders_user_id_idx").on(table.userId),
    createdAtIdx: index("membership_orders_created_at_idx").on(table.createdAt),
    paymentStatusIdx: index("membership_orders_payment_status_idx").on(
      table.paymentStatus
    ),
  })
);

// Zod schemas for validation
export const insertUserSchema = createCoercedInsertSchema(users).pick({
  email: true,
  passwordHash: true,
  username: true,
  role: true,
  membershipLevel: true,
  membershipExpireAt: true,
  dailyUsageCount: true,
  monthlyUsageCount: true,
  storageUsed: true,
  isActive: true,
  isBanned: true,
  banReason: true,
});

export const updateUserSchema = createCoercedInsertSchema(users)
  .pick({
    username: true,
    role: true,
    membershipLevel: true,
    membershipExpireAt: true,
    dailyUsageCount: true,
    monthlyUsageCount: true,
    storageUsed: true,
    lastLoginAt: true,
    isActive: true,
    isBanned: true,
    banReason: true,
  })
  .partial();

export const insertWorkSchema = createCoercedInsertSchema(works).pick({
  userId: true,
  title: true,
  content: true,
  wordCount: true,
  characters: true,
  outline: true,
  tags: true,
  originalityScore: true,
  plagiarismCheckResult: true,
  isDeleted: true,
});

export const updateWorkSchema = createCoercedInsertSchema(works)
  .pick({
    title: true,
    content: true,
    wordCount: true,
    characters: true,
    outline: true,
    tags: true,
    originalityScore: true,
    plagiarismCheckResult: true,
    isDeleted: true,
  })
  .partial();

export const insertUsageLogSchema = createCoercedInsertSchema(usageLogs).pick({
  userId: true,
  action: true,
  workId: true,
  metadata: true,
  ipAddress: true,
  userAgent: true,
});

export const insertSecurityLogSchema = createCoercedInsertSchema(securityLogs).pick({
  userId: true,
  action: true,
  details: true,
  ipAddress: true,
  status: true,
});

export const insertSubAccountSchema = createCoercedInsertSchema(subAccounts).pick({
  parentId: true,
  email: true,
  username: true,
  role: true,
  permissions: true,
  isActive: true,
});

export const updateSubAccountSchema = createCoercedInsertSchema(subAccounts)
  .pick({
    username: true,
    role: true,
    permissions: true,
    isActive: true,
  })
  .partial();

export const insertApiKeySchema = createCoercedInsertSchema(apiKeys).pick({
  userId: true,
  keyHash: true,
  name: true,
  permissions: true,
  lastUsedAt: true,
  expiresAt: true,
  isActive: true,
});

export const updateApiKeySchema = createCoercedInsertSchema(apiKeys)
  .pick({
    name: true,
    permissions: true,
    lastUsedAt: true,
    expiresAt: true,
    isActive: true,
  })
  .partial();

export const insertMembershipOrderSchema = createCoercedInsertSchema(
  membershipOrders
).pick({
  userId: true,
  level: true,
  months: true,
  amount: true,
  paymentMethod: true,
  paymentStatus: true,
  transactionId: true,
  paidAt: true,
});

export const updateMembershipOrderSchema = createCoercedInsertSchema(
  membershipOrders
)
  .pick({
    paymentStatus: true,
    transactionId: true,
    paidAt: true,
  })
  .partial();

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Work = typeof works.$inferSelect;
export type InsertWork = z.infer<typeof insertWorkSchema>;
export type UpdateWork = z.infer<typeof updateWorkSchema>;

export type UsageLog = typeof usageLogs.$inferSelect;
export type InsertUsageLog = z.infer<typeof insertUsageLogSchema>;

export type SecurityLog = typeof securityLogs.$inferSelect;
export type InsertSecurityLog = z.infer<typeof insertSecurityLogSchema>;

export type SubAccount = typeof subAccounts.$inferSelect;
export type InsertSubAccount = z.infer<typeof insertSubAccountSchema>;
export type UpdateSubAccount = z.infer<typeof updateSubAccountSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type UpdateApiKey = z.infer<typeof updateApiKeySchema>;

export type MembershipOrder = typeof membershipOrders.$inferSelect;
export type InsertMembershipOrder = z.infer<typeof insertMembershipOrderSchema>;
export type UpdateMembershipOrder = z.infer<typeof updateMembershipOrderSchema>;
