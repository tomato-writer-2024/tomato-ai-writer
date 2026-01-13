-- 用户账号管理脚本
-- 用于处理208343256@qq.com账号的角色和权限问题

-- 当前账号信息：
-- ID: 28412432-23ba-401f-a314-0a9d16d5f232
-- 用户名: 测试用户
-- 邮箱: 208343256@qq.com
-- 角色: FREE
-- 会员级别: FREE
-- 超级管理员: false
-- 创建时间: 2026-01-10 15:31:13

-- ============================================
-- 方案1：保留账号，升级为开发者账号（推荐）
-- ============================================
-- 说明：保留测试账号，但授予开发者权限，方便测试和管理

-- 将账号升级为开发者
UPDATE users
SET
  role = 'DEVELOPER',
  membership_level = 'PREMIUM',
  membership_expire_at = CURRENT_TIMESTAMP + INTERVAL '1 year',
  updated_at = CURRENT_TIMESTAMP
WHERE email = '208343256@qq.com';

-- 授予超级管理员权限（可选）
UPDATE users
SET
  is_super_admin = true,
  updated_at = CURRENT_TIMESTAMP
WHERE email = '208343256@qq.com';

-- ============================================
-- 方案2：重命名测试账号，避免混淆
-- ============================================
-- 说明：将测试账号重命名，避免与开发者/邮件服务混淆

UPDATE users
SET
  username = '开发测试用户',
  role = 'DEVELOPER',
  membership_level = 'PREMIUM',
  membership_expire_at = CURRENT_TIMESTAMP + INTERVAL '1 year',
  updated_at = CURRENT_TIMESTAMP
WHERE email = '208343256@qq.com';

-- ============================================
-- 方案3：删除测试账号（慎用）
-- ============================================
-- 说明：如果不再需要测试账号，可以删除
-- 注意：这将删除用户的所有数据和关联数据

-- 删除用户数据（谨慎使用，请先备份）
-- DELETE FROM users WHERE email = '208343256@qq.com';

-- ============================================
-- 验证账号状态
-- ============================================
SELECT
  id,
  username,
  email,
  role,
  membership_level,
  is_super_admin,
  membership_expire_at,
  daily_usage_count,
  monthly_usage_count,
  created_at,
  updated_at
FROM users
WHERE email = '208343256@qq.com';

-- ============================================
-- 建议：
-- ============================================
-- 1. 推荐使用方案1或方案2，保留测试账号但明确身份
-- 2. 建议创建一个专用的服务邮箱（如noreply@tomato-ai-writer.com）
--    用于发送忘记密码邮件，而不是使用个人邮箱
-- 3. GitHub开发者账号和测试账号可以共用，但需要在代码层面
--    确保邮件服务使用独立配置
-- 4. 如果需要分离，可以在环境变量中配置不同的SMTP服务账号
