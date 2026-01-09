import { pgTable, index, varchar, jsonb, timestamp, boolean, integer, text, unique, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

// ============================================================================
// API 密钥表
// ============================================================================

export const apiKeys = pgTable("api_keys", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	keyHash: varchar("key_hash", { length: 255 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	permissions: jsonb().default([]).notNull(),
	lastUsedAt: timestamp("last_used_at", { withTimezone: true, mode: 'string' }),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	index("api_keys_key_hash_idx").using("btree", table.keyHash.asc().nullsLast().op("text_ops")),
	index("api_keys_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const membershipOrders = pgTable("membership_orders", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	level: varchar({ length: 20 }).notNull(),
	months: integer().notNull(),
	amount: integer().notNull(),
	paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
	paymentStatus: varchar("payment_status", { length: 20 }).default('PENDING').notNull(),
	transactionId: varchar("transaction_id", { length: 100 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	paidAt: timestamp("paid_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("membership_orders_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("membership_orders_payment_status_idx").using("btree", table.paymentStatus.asc().nullsLast().op("text_ops")),
	index("membership_orders_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const securityLogs = pgTable("security_logs", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }),
	action: varchar({ length: 50 }).notNull(),
	details: jsonb(),
	ipAddress: varchar("ip_address", { length: 45 }),
	status: varchar({ length: 20 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("security_logs_action_idx").using("btree", table.action.asc().nullsLast().op("text_ops")),
	index("security_logs_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("security_logs_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const subAccounts = pgTable("sub_accounts", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	parentId: varchar("parent_id", { length: 36 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	username: varchar({ length: 100 }),
	role: varchar({ length: 20 }).default('FREE').notNull(),
	permissions: jsonb().default([]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	index("sub_accounts_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("sub_accounts_parent_id_idx").using("btree", table.parentId.asc().nullsLast().op("text_ops")),
]);

export const usageLogs = pgTable("usage_logs", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	action: varchar({ length: 50 }).notNull(),
	workId: varchar("work_id", { length: 36 }),
	metadata: jsonb(),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("usage_logs_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("usage_logs_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const users = pgTable("users", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	username: varchar("username", { length: 100 }),
	phone: varchar("phone", { length: 20 }),
	location: varchar("location", { length: 100 }),
	avatarUrl: varchar("avatar_url", { length: 500 }),
	role: varchar("role", { length: 20 }).default("FREE").notNull(),
	membershipLevel: varchar("membership_level", { length: 20 }).default("FREE").notNull(),
	membershipExpireAt: timestamp("membership_expire_at", { withTimezone: true, mode: 'string' }),
	dailyUsageCount: integer("daily_usage_count").default(0).notNull(),
	monthlyUsageCount: integer("monthly_usage_count").default(0).notNull(),
	storageUsed: integer("storage_used").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	isBanned: boolean("is_banned").default(false).notNull(),
	banReason: text("ban_reason"),
}, (table) => [
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("users_membership_idx").using("btree", table.membershipLevel.asc().nullsLast().op("text_ops")),
	index("users_role_idx").using("btree", table.role.asc().nullsLast().op("text_ops")),
	unique("users_email_unique").on(table.email),
]);

export const works = pgTable("works", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	title: varchar("title", { length: 255 }),
	content: text("content").notNull(),
	wordCount: integer("word_count").default(0).notNull(),
	characters: jsonb("characters"),
	outline: text("outline"),
	tags: varchar("tags", { length: 500 }),
	genre: varchar("genre", { length: 50 }), // 都市、玄幻、言情、科幻、悬疑
	status: varchar("status", { length: 20 }), // 连载中、已完结、暂停
	type: varchar("type", { length: 50 }), // 爽文、甜宠、悬疑、玄幻、都市
	originalityScore: numeric("originality_score", { precision: 5, scale: 2 }),
	plagiarismCheckResult: jsonb("plagiarism_check_result"),
	qualityScore: integer("quality_score"), // 质量评分
	completionRate: integer("completion_rate"), // 预估完读率
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
}, (table) => [
	index("works_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("works_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("works_genre_idx").using("btree", table.genre.asc().nullsLast().op("text_ops")),
	index("works_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
]);

// ============================================================================
// 小说表
// ============================================================================

export const novels = pgTable("novels", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	genre: varchar("genre", { length: 50 }), // 都市、玄幻、言情、科幻、悬疑、历史、军事
	status: varchar("status", { length: 20 }).default("连载中"), // 连载中、已完结、暂停
	type: varchar("type", { length: 50 }), // 爽文、甜宠、悬疑、玄幻、都市
	coverUrl: varchar("cover_url", { length: 500 }),
	wordCount: integer("word_count").default(0).notNull(),
	chapterCount: integer("chapter_count").default(0).notNull(),
	averageRating: numeric("average_rating", { precision: 3, scale: 1 }).default("0.0"),
	completionRate: integer("completion_rate").default(0), // 平均完读率
	tags: varchar("tags", { length: 1000 }),
	isPublished: boolean("is_published").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
}, (table) => [
	index("novels_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("novels_genre_idx").using("btree", table.genre.asc().nullsLast().op("text_ops")),
	index("novels_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("novels_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
]);

// ============================================================================
// 章节表
// ============================================================================

export const chapters = pgTable("chapters", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	novelId: varchar("novel_id", { length: 36 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	chapterNum: integer("chapter_num").notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	content: text("content").notNull(),
	wordCount: integer("word_count").default(0).notNull(),
	qualityScore: integer("quality_score"), // 质量评分（0-100）
	completionRate: integer("completion_rate"), // 预估完读率（0-100）
	shuangdianCount: integer("shuangdian_count").default(0), // 爽点数量
	isPublished: boolean("is_published").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
}, (table) => [
	index("chapters_novel_id_idx").using("btree", table.novelId.asc().nullsLast().op("text_ops")),
	index("chapters_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("chapters_chapter_num_idx").using("btree", table.chapterNum.asc().nullsLast().op("integer_ops")),
	unique("chapters_novel_chapter_unique").on(table.novelId, table.chapterNum),
]);

// ============================================================================
// 内容统计表
// ============================================================================

export const contentStats = pgTable("content_stats", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	novelId: varchar("novel_id", { length: 36 }),
	chapterId: varchar("chapter_id", { length: 36 }),
	wordCount: integer("word_count").notNull(),
	qualityScore: integer("quality_score"), // 总质量评分
	densityScore: integer("density_score"), // 爽点密度评分
	lengthScore: integer("length_score"), // 段落长度评分
	emotionScore: integer("emotion_score"), // 情绪词评分
	hookScore: integer("hook_score"), // 钩子设计评分
	completionRate: integer("completion_rate"), // 预估完读率
	shuangdianCount: integer("shuangdian_count"),
	estimatedReadTime: integer("estimated_read_time"), // 预估阅读时间（秒）
	metadata: jsonb(), // 其他统计信息
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("content_stats_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("content_stats_novel_id_idx").using("btree", table.novelId.asc().nullsLast().op("text_ops")),
	index("content_stats_chapter_id_idx").using("btree", table.chapterId.asc().nullsLast().op("text_ops")),
	index("content_stats_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
]);

// ============================================================================
// 素材库表
// ============================================================================

export const materials = pgTable("materials", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	content: text("content").notNull(),
	category: varchar("category", { length: 50 }).notNull(), // 人物、情节、场景、对话、金句、设定等
	tags: varchar("tags", { length: 500 }),
	novelId: varchar("novel_id", { length: 36 }), // 关联的小说ID（可选）
	notes: text("notes"), // 备注
	isFavorite: boolean("is_favorite").default(false).notNull(), // 是否收藏
	usageCount: integer("usage_count").default(0).notNull(), // 使用次数
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
}, (table) => [
	index("materials_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("materials_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("materials_novel_id_idx").using("btree", table.novelId.asc().nullsLast().op("text_ops")),
	index("materials_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("materials_favorite_idx").using("btree", table.isFavorite.asc().nullsLast().op("bool_ops")),
]);

// ============================================================================
// Zod Validation Schemas
// ============================================================================

const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
	coerce: { date: true },
});

// Users
export const insertUserSchema = createCoercedInsertSchema(users).pick({
	email: true,
	passwordHash: true,
	username: true,
	role: true,
	membershipLevel: true,
	membershipExpireAt: true,
	phone: true,
	location: true,
	avatarUrl: true,
});

export const updateUserSchema = createCoercedInsertSchema(users)
	.pick({
		username: true,
		phone: true,
		location: true,
		avatarUrl: true,
		role: true,
		membershipLevel: true,
		membershipExpireAt: true,
		isActive: true,
		isBanned: true,
		banReason: true,
	})
	.partial();

// Novels
export const insertNovelSchema = createCoercedInsertSchema(novels).pick({
	userId: true,
	title: true,
	description: true,
	genre: true,
	status: true,
	type: true,
	coverUrl: true,
	tags: true,
	isPublished: true,
});

export const updateNovelSchema = createCoercedInsertSchema(novels)
	.pick({
		title: true,
		description: true,
		genre: true,
		status: true,
		type: true,
		coverUrl: true,
		tags: true,
		isPublished: true,
		isDeleted: true,
	})
	.partial();

// Chapters
export const insertChapterSchema = createCoercedInsertSchema(chapters).pick({
	novelId: true,
	userId: true,
	chapterNum: true,
	title: true,
	content: true,
	wordCount: true,
	qualityScore: true,
	completionRate: true,
	shuangdianCount: true,
	isPublished: true,
});

export const updateChapterSchema = createCoercedInsertSchema(chapters)
	.pick({
		title: true,
		content: true,
		wordCount: true,
		qualityScore: true,
		completionRate: true,
		shuangdianCount: true,
		isPublished: true,
		isDeleted: true,
	})
	.partial();

// Content Stats
export const insertContentStatsSchema = createCoercedInsertSchema(contentStats).pick({
	userId: true,
	novelId: true,
	chapterId: true,
	wordCount: true,
	qualityScore: true,
	densityScore: true,
	lengthScore: true,
	emotionScore: true,
	hookScore: true,
	completionRate: true,
	shuangdianCount: true,
	estimatedReadTime: true,
	metadata: true,
});

// Materials
export const insertMaterialSchema = createCoercedInsertSchema(materials).pick({
	userId: true,
	title: true,
	content: true,
	category: true,
	tags: true,
	novelId: true,
	notes: true,
	isFavorite: true,
});

export const updateMaterialSchema = createCoercedInsertSchema(materials)
	.pick({
		title: true,
		content: true,
		category: true,
		tags: true,
		novelId: true,
		notes: true,
		isFavorite: true,
		isDeleted: true,
	})
	.partial();

// Membership Orders
export const insertMembershipOrderSchema = createCoercedInsertSchema(membershipOrders).pick({
	userId: true,
	level: true,
	months: true,
	amount: true,
	paymentMethod: true,
	paymentStatus: true,
	transactionId: true,
	paidAt: true,
});

export const updateMembershipOrderSchema = createCoercedInsertSchema(membershipOrders)
	.pick({
		paymentStatus: true,
		transactionId: true,
		paidAt: true,
	})
	.partial();

// Usage Logs
export const insertUsageLogSchema = createCoercedInsertSchema(usageLogs).pick({
	userId: true,
	action: true,
	workId: true,
	metadata: true,
	ipAddress: true,
	userAgent: true,
});

// Security Logs
export const insertSecurityLogSchema = createCoercedInsertSchema(securityLogs).pick({
	userId: true,
	action: true,
	details: true,
	ipAddress: true,
	status: true,
});

// ============================================================================
// TypeScript Types
// ============================================================================

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Novel = typeof novels.$inferSelect;
export type InsertNovel = z.infer<typeof insertNovelSchema>;
export type UpdateNovel = z.infer<typeof updateNovelSchema>;

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type UpdateChapter = z.infer<typeof updateChapterSchema>;

export type ContentStats = typeof contentStats.$inferSelect;
export type InsertContentStats = z.infer<typeof insertContentStatsSchema>;

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type UpdateMaterial = z.infer<typeof updateMaterialSchema>;

export type MembershipOrder = typeof membershipOrders.$inferSelect;
export type InsertMembershipOrder = z.infer<typeof insertMembershipOrderSchema>;
export type UpdateMembershipOrder = z.infer<typeof updateMembershipOrderSchema>;

export type UsageLog = typeof usageLogs.$inferSelect;
export type InsertUsageLog = z.infer<typeof insertUsageLogSchema>;

export type SecurityLog = typeof securityLogs.$inferSelect;
export type InsertSecurityLog = z.infer<typeof insertSecurityLogSchema>;

