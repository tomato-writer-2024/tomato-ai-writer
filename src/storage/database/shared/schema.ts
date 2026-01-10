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
	isSuperAdmin: boolean("is_super_admin").default(false).notNull(), // 超级管理员标识
	wechatOpenId: varchar("wechat_open_id", { length: 255 }), // 微信OpenID
	wechatUnionId: varchar("wechat_union_id", { length: 255 }), // 微信UnionID
}, (table) => [
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("users_membership_idx").using("btree", table.membershipLevel.asc().nullsLast().op("text_ops")),
	index("users_role_idx").using("btree", table.role.asc().nullsLast().op("text_ops")),
	index("users_super_admin_idx").using("btree", table.isSuperAdmin.asc().nullsLast().op("bool_ops")),
	index("users_wechat_openid_idx").using("btree", table.wechatOpenId.asc().nullsLast().op("text_ops")),
	index("users_wechat_unionid_idx").using("btree", table.wechatUnionId.asc().nullsLast().op("text_ops")),
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
// 双视角评分表
// ============================================================================

export const dualPerspectiveRatings = pgTable("dual_perspective_ratings", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	novelId: varchar("novel_id", { length: 36 }),
	chapterId: varchar("chapter_id", { length: 36 }),
	contentType: varchar("content_type", { length: 50 }).notNull(), // novel, chapter, outline, character, world
	contentId: varchar("content_id", { length: 36 }).notNull(),
	// 编辑视角评分
	editorScore: numeric("editor_score", { precision: 3, scale: 1 }).default("0.0"), // 0-10分
	editorWriting: integer("editor_writing").default(0), // 文笔 (0-15)
	editorStructure: integer("editor_structure").default(0), // 结构 (0-20)
	editorCharacter: integer("editor_character").default(0), // 人物 (0-15)
	editorPlot: integer("editor_plot").default(0), // 情节 (0-20)
	editorInnovation: integer("editor_innovation").default(0), // 创新 (0-10)
	editorCommercial: integer("editor_commercial").default(0), // 商业 (0-20)
	editorFeedback: text("editor_feedback"),
	// 读者视角评分
	readerScore: numeric("reader_score", { precision: 3, scale: 1 }).default("0.0"), // 0-10分
	readerSatisfaction: integer("reader_satisfaction").default(0), // 爽感 (0-25)
	readerImmersion: integer("reader_immersion").default(0), // 代入 (0-20)
	readerPacing: integer("reader_pacing").default(0), // 节奏 (0-15)
	readerSuspense: integer("reader_suspense").default(0), // 悬念 (0-15)
	readerCharacter: integer("reader_character").default(0), // 人物 (0-10)
	readerEnding: integer("reader_ending").default(0), // 结局 (0-15)
	readerFeedback: text("reader_feedback"),
	// 整体评估
	overallScore: numeric("overall_score", { precision: 3, scale: 1 }).default("0.0"), // 0-10分
	targetMet: boolean("target_met").default(false), // 是否达到9.8分+目标
	recommendations: jsonb("recommendations"), // 优化建议
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("dual_perspective_ratings_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("dual_perspective_ratings_content_type_idx").using("btree", table.contentType.asc().nullsLast().op("text_ops")),
	index("dual_perspective_ratings_content_id_idx").using("btree", table.contentId.asc().nullsLast().op("text_ops")),
	index("dual_perspective_ratings_novel_id_idx").using("btree", table.novelId.asc().nullsLast().op("text_ops")),
	index("dual_perspective_ratings_chapter_id_idx").using("btree", table.chapterId.asc().nullsLast().op("text_ops")),
	index("dual_perspective_ratings_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
]);

// ============================================================================
// 测试结果表
// ============================================================================

export const testResults = pgTable("test_results", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	testType: varchar("test_type", { length: 50 }).notNull(), // new-features, comprehensive, performance
	testConfig: jsonb("test_config").notNull(), // 测试配置（功能模块、测试用例数等）
	totalTests: integer("total_tests").notNull(),
	successCount: integer("success_count").notNull(),
	failureCount: integer("failure_count").notNull(),
	successRate: numeric("success_rate", { precision: 5, scale: 2 }), // 成功率
	averageQualityScore: numeric("average_quality_score", { precision: 5, scale: 2 }), // 平均质量分
	averageCompletionRate: numeric("average_completion_rate", { precision: 5, scale: 2 }), // 平均完读率
	averageResponseTime: numeric("average_response_time", { precision: 5, scale: 2 }), // 平均响应时间（ms）
	details: jsonb("details").notNull(), // 详细测试结果
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).notNull(),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	duration: integer("duration"), // 测试持续时间（秒）
	summary: text("summary"), // 测试总结
}, (table) => [
	index("test_results_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("test_results_test_type_idx").using("btree", table.testType.asc().nullsLast().op("text_ops")),
	index("test_results_created_at_idx").using("btree", table.completedAt.asc().nullsLast().op("timestamptz_ops")),
]);

// ============================================================================
// 世界观设定表
// ============================================================================

export const worldBuildingSettings = pgTable("world_building_settings", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	novelId: varchar("novel_id", { length: 36 }),
	name: varchar("name", { length: 255 }).notNull(),
	worldType: varchar("world_type", { length: 50 }).notNull(), // fantasy, scifi, wuxia, xianxia, urban, apocalyptic
	theme: text("theme"),
	storyContext: text("story_context"),
	magicSystem: text("magic_system"), // 魔法/力量体系
	geography: jsonb("geography"), // 地理环境
	culture: jsonb("culture"), // 文化特色
	history: text("history"), // 历史背景
	factions: jsonb("factions"), // 势力
	rules: jsonb("rules"), // 规则
	conflicts: jsonb("conflicts"), // 冲突
	metadata: jsonb("metadata"), // 其他元数据
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
}, (table) => [
	index("world_building_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("world_building_novel_id_idx").using("btree", table.novelId.asc().nullsLast().op("text_ops")),
	index("world_building_type_idx").using("btree", table.worldType.asc().nullsLast().op("text_ops")),
]);

// ============================================================================
// 关系图谱表
// ============================================================================

export const relationshipGraphs = pgTable("relationship_graphs", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	novelId: varchar("novel_id", { length: 36 }),
	name: varchar("name", { length: 255 }),
	characters: jsonb("characters").notNull(), // 角色列表
	relationships: jsonb("relationships").notNull(), // 关系列表
	conflicts: jsonb("conflicts"), // 冲突分析
	centrality: jsonb("centrality"), // 网络中心性
	metadata: jsonb("metadata"), // 其他元数据
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
}, (table) => [
	index("relationship_graphs_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("relationship_graphs_novel_id_idx").using("btree", table.novelId.asc().nullsLast().op("text_ops")),
]);

// ============================================================================
// 卡文分析表
// ============================================================================

export const writerBlockAnalysis = pgTable("writer_block_analysis", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	novelId: varchar("novel_id", { length: 36 }),
	chapterId: varchar("chapter_id", { length: 36 }),
	blockType: varchar("block_type", { length: 50 }).notNull(), // no-idea, writer-block, plot-stuck, etc.
	severity: varchar("severity", { length: 20 }).notNull(), // mild, moderate, severe
	content: text("content"),
	chapterNumber: integer("chapter_number"),
	novelContext: text("novel_context"),
	causes: jsonb("causes"), // 主要原因
	solutions: jsonb("solutions"), // 解决方案
	alternativePlots: jsonb("alternative_plots"), // 替代情节思路
	estimatedRecoveryTime: integer("estimated_recovery_time"), // 预计恢复时间（小时）
	isResolved: boolean("is_resolved").default(false).notNull(),
	resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("writer_block_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("writer_block_novel_id_idx").using("btree", table.novelId.asc().nullsLast().op("text_ops")),
	index("writer_block_chapter_id_idx").using("btree", table.chapterId.asc().nullsLast().op("text_ops")),
	index("writer_block_type_idx").using("btree", table.blockType.asc().nullsLast().op("text_ops")),
	index("writer_block_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
]);

// ============================================================================
// 爽点分析表
// ============================================================================

export const satisfactionAnalysis = pgTable("satisfaction_analysis", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	novelId: varchar("novel_id", { length: 36 }),
	chapterId: varchar("chapter_id", { length: 36 }),
	chapterNumber: integer("chapter_number"),
	content: text("content").notNull(),
	satisfactionScore: numeric("satisfaction_score", { precision: 5, scale: 2 }), // 爽点评分
	satisfactionPoints: jsonb("satisfaction_points"), // 爽点列表
	climaxPoints: jsonb("climax_points"), // 高潮点
	tensionCurve: jsonb("tension_curve"), // 紧张度曲线
	readerExpectations: jsonb("reader_expectations"), // 读者期待
	suggestions: jsonb("suggestions"), // 优化建议
	improvementPotential: integer("improvement_potential"), // 提升空间
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("satisfaction_analysis_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("satisfaction_analysis_novel_id_idx").using("btree", table.novelId.asc().nullsLast().op("text_ops")),
	index("satisfaction_analysis_chapter_id_idx").using("btree", table.chapterId.asc().nullsLast().op("text_ops")),
]);

// ============================================================================
// 风格分析表
// ============================================================================

export const styleAnalysis = pgTable("style_analysis", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	content: text("content").notNull(),
	genre: varchar("genre", { length: 50 }),
	sentenceFeatures: jsonb("sentence_features"), // 句子特征
	vocabularyFeatures: jsonb("vocabulary_features"), // 词汇特征
	narrativeFeatures: jsonb("narrative_features"), // 叙事特征
	emotionalFeatures: jsonb("emotional_features"), // 情感特征
	themeFeatures: jsonb("theme_features"), // 主题特征
	targetStyle: varchar("target_style", { length: 100 }), // 目标风格
	similarityScore: numeric("similarity_score", { precision: 5, scale: 2 }), // 相似度评分
	improvements: jsonb("improvements"), // 改进建议
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("style_analysis_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("style_analysis_target_style_idx").using("btree", table.targetStyle.asc().nullsLast().op("text_ops")),
]);

// ============================================================================
// 情节反转表
// ============================================================================

export const plotTwistIdeas = pgTable("plot_twist_ideas", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	novelId: varchar("novel_id", { length: 36 }),
	currentPlot: text("current_plot").notNull(),
	twistType: varchar("twist_type", { length: 50 }), // identity, time, causality, etc.
	novelContext: text("novel_context"),
	ideas: jsonb("ideas").notNull(), // 反转建议列表
	selectedIdea: jsonb("selected_idea"), // 选中的反转
	foreshadowing: jsonb("foreshadowing"), // 伏笔建议
	difficulty: varchar("difficulty", { length: 20 }), // 实施难度
	readerReaction: varchar("reader_reaction", { length: 100 }), // 读者预期反应
	riskLevel: varchar("risk_level", { length: 20 }), // 风险等级
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("plot_twist_ideas_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("plot_twist_ideas_novel_id_idx").using("btree", table.novelId.asc().nullsLast().op("text_ops")),
	index("plot_twist_ideas_type_idx").using("btree", table.twistType.asc().nullsLast().op("text_ops")),
]);

// ============================================================================
// 结局提案表
// ============================================================================

export const endingProposals = pgTable("ending_proposals", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	novelId: varchar("novel_id", { length: 36 }).notNull(),
	novelTitle: varchar("novel_title", { length: 255 }).notNull(),
	storyGenre: varchar("story_genre", { length: 50 }).notNull(),
	storyTheme: text("story_theme"),
	mainCharacters: jsonb("main_characters"),
	currentPlot: text("current_plot"),
	preferredEndingType: varchar("preferred_ending_type", { length: 50 }),
	proposals: jsonb("proposals").notNull(), // 结局方案列表
	selectedProposal: jsonb("selected_proposal"), // 选中的结局
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("ending_proposals_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("ending_proposals_novel_id_idx").using("btree", table.novelId.asc().nullsLast().op("text_ops")),
]);

// ============================================================================
// 书名选项表
// ============================================================================

export const titleOptions = pgTable("title_options", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	novelId: varchar("novel_id", { length: 36 }),
	genre: varchar("genre", { length: 50 }).notNull(),
	theme: text("theme").notNull(),
	mainCharacter: varchar("main_character", { length: 255 }),
	keyElements: jsonb("key_elements"),
	setting: text("setting"),
	titles: jsonb("titles").notNull(), // 书名列表
	selectedTitle: varchar("selected_title", { length: 255 }),
	analysis: jsonb("analysis"), // 详细分析
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("title_options_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("title_options_novel_id_idx").using("btree", table.novelId.asc().nullsLast().op("text_ops")),
	index("title_options_genre_idx").using("btree", table.genre.asc().nullsLast().op("text_ops")),
]);

// ============================================================================
// 封面描述表
// ============================================================================

export const coverDescriptions = pgTable("cover_descriptions", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	novelId: varchar("novel_id", { length: 36 }),
	novelTitle: varchar("novel_title", { length: 255 }).notNull(),
	genre: varchar("genre", { length: 50 }).notNull(),
	mainCharacters: jsonb("main_characters"),
	keyElements: jsonb("key_elements"),
	theme: text("theme"),
	mood: varchar("mood", { length: 100 }),
	preferredStyle: varchar("preferred_style", { length: 50 }),
	targetAudience: text("target_audience"),
	description: text("description").notNull(), // 详细描述
	aiPrompts: jsonb("ai_prompts"), // AI绘画提示词
	alternatives: jsonb("alternatives"), // 替代方案
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("cover_descriptions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("cover_descriptions_novel_id_idx").using("btree", table.novelId.asc().nullsLast().op("text_ops")),
	index("cover_descriptions_genre_idx").using("btree", table.genre.asc().nullsLast().op("text_ops")),
]);

// ============================================================================
// 性能指标表
// ============================================================================

export const performanceMetrics = pgTable("performance_metrics", {
	id: varchar("id", { length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }),
	apiEndpoint: varchar("api_endpoint", { length: 255 }).notNull(),
	requestCount: integer("request_count").default(0).notNull(),
	successCount: integer("success_count").default(0).notNull(),
	failureCount: integer("failure_count").default(0).notNull(),
	averageResponseTime: numeric("average_response_time", { precision: 10, scale: 2 }), // 平均响应时间（ms）
	minResponseTime: numeric("min_response_time", { precision: 10, scale: 2 }), // 最小响应时间（ms）
	maxResponseTime: numeric("max_response_time", { precision: 10, scale: 2 }), // 最大响应时间（ms）
	p50ResponseTime: numeric("p50_response_time", { precision: 10, scale: 2 }), // P50响应时间（ms）
	p95ResponseTime: numeric("p95_response_time", { precision: 10, scale: 2 }), // P95响应时间（ms）
	p99ResponseTime: numeric("p99_response_time", { precision: 10, scale: 2 }), // P99响应时间（ms）
	cacheHitRate: numeric("cache_hit_rate", { precision: 5, scale: 2 }), // 缓存命中率
	errorRate: numeric("error_rate", { precision: 5, scale: 2 }), // 错误率
	metricsDate: timestamp("metrics_date", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("performance_metrics_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("performance_metrics_api_endpoint_idx").using("btree", table.apiEndpoint.asc().nullsLast().op("text_ops")),
	index("performance_metrics_metrics_date_idx").using("btree", table.metricsDate.asc().nullsLast().op("timestamptz_ops")),
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
	wechatOpenId: true,
	wechatUnionId: true,
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
		passwordHash: true,
		lastLoginAt: true,
		isActive: true,
		isBanned: true,
		banReason: true,
		isSuperAdmin: true,
		wechatOpenId: true,
		wechatUnionId: true,
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

