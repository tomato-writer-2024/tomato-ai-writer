-- 重置超级管理员密码
-- 用于重置208343256@qq.com账号的密码

-- ============================================
-- 方案1: 使用忘记密码功能（推荐）
-- ============================================
-- 1. 访问登录页面: https://tomato-ai-writer.vercel.app/login
-- 2. 点击"忘记密码"
-- 3. 输入邮箱: 208343256@qq.com
-- 4. 检查邮件，点击重置链接
-- 5. 设置新密码

-- ============================================
-- 方案2: 直接在数据库中重置密码（需要bcrypt哈希）
-- ============================================
-- 注意：password_hash必须使用bcrypt生成的哈希值
-- 可以使用在线工具: https://bcrypt-generator.com/

-- 示例：密码 "TomatoAdmin@2024" 的bcrypt哈希
-- $2b$12$YourHashValueHere

-- 重置密码（请替换为真实的bcrypt哈希）
UPDATE users
SET
  password_hash = '$2b$12$YourHashValueHere',
  updated_at = CURRENT_TIMESTAMP
WHERE email = '208343256@qq.com';

-- ============================================
-- 验证账号信息
-- ============================================
SELECT
  id,
  username,
  email,
  role,
  is_super_admin,
  membership_level,
  membership_expire_at,
  created_at,
  updated_at
FROM users
WHERE email = '208343256@qq.com';
