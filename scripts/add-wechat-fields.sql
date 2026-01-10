-- 添加微信登录相关字段到users表

-- 添加微信OpenID字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS wechat_open_id VARCHAR(255);

-- 添加微信UnionID字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS wechat_union_id VARCHAR(255);

-- 为微信OpenID创建索引
CREATE INDEX IF NOT EXISTS users_wechat_openid_idx ON users(wechat_open_id);

-- 为微信UnionID创建索引
CREATE INDEX IF NOT EXISTS users_wechat_unionid_idx ON users(wechat_union_id);

-- 验证字段是否添加成功
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('wechat_open_id', 'wechat_union_id');
