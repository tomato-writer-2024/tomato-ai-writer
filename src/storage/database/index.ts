// ============================================================================
// Manager 实例导出
// ============================================================================
export { userManager } from './userManager';
export { novelManager } from './novelManager';
export { chapterManager } from './chapterManager';
export { contentStatsManager } from './contentStatsManager';
export { membershipOrderManager } from './membershipOrderManager';
export { usageLogManager } from './usageLogManager';
export { securityLogManager } from './securityLogManager';
export { authManager } from './authManager';
export { notificationManager } from './notificationManager';
export { communityManager } from './communityManager';

// ============================================================================
// Mock Manager 导出
// ============================================================================
export { mockUserManager } from './mock/mockUserManager';
export { mockAuthManager } from './mock/mockAuthManager';

// ============================================================================
// Schema 类型导出
// ============================================================================
export * from './shared/schema';

// ============================================================================
// 数据库连接函数（从 SDK 导入）
// ============================================================================
export { getDb } from 'coze-coding-dev-sdk';

// ============================================================================
// Mock数据库导出
// ============================================================================
export { initMockDb } from './mock/mockDb';
