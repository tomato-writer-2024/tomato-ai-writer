-- ============================================================================
-- 初始化数据库架构
-- 番茄小说AI写作工具
-- ============================================================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL,
  password_hash varchar(255) NOT NULL,
  username varchar(100),
  phone varchar(20),
  location varchar(100),
  avatar_url varchar(500),
  role varchar(20) DEFAULT 'FREE' NOT NULL,
  membership_level varchar(20) DEFAULT 'FREE' NOT NULL,
  membership_expire_at timestamptz,
  daily_usage_count integer DEFAULT 0 NOT NULL,
  monthly_usage_count integer DEFAULT 0 NOT NULL,
  storage_used integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL,
  last_login_at timestamptz,
  is_active boolean DEFAULT true NOT NULL,
  is_banned boolean DEFAULT false NOT NULL,
  ban_reason text,
  is_super_admin boolean DEFAULT false NOT NULL,
  wechat_open_id varchar(255),
  wechat_union_id varchar(255)
);

-- 小说表
CREATE TABLE IF NOT EXISTS novels (
  id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar(36) NOT NULL,
  title varchar(255) NOT NULL,
  description text,
  genre varchar(50),
  status varchar(20) DEFAULT '连载中',
  type varchar(50),
  cover_url varchar(500),
  tags varchar(1000),
  word_count integer DEFAULT 0 NOT NULL,
  chapter_count integer DEFAULT 0 NOT NULL,
  average_rating numeric(3, 1) DEFAULT 0.0,
  completion_rate integer DEFAULT 0,
  is_published boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL,
  is_deleted boolean DEFAULT false NOT NULL
);

-- 章节表
CREATE TABLE IF NOT EXISTS chapters (
  id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id varchar(36) NOT NULL,
  user_id varchar(36) NOT NULL,
  chapter_num integer NOT NULL,
  title varchar(255) NOT NULL,
  content text NOT NULL,
  word_count integer DEFAULT 0 NOT NULL,
  quality_score integer,
  completion_rate integer,
  shuangdian_count integer DEFAULT 0,
  is_published boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL,
  is_deleted boolean DEFAULT false NOT NULL
);

-- 内容统计表
CREATE TABLE IF NOT EXISTS content_stats (
  id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar(36) NOT NULL,
  novel_id varchar(36),
  chapter_id varchar(36),
  word_count integer DEFAULT 0,
  quality_score numeric(3, 2),
  density_score numeric(3, 2),
  length_score numeric(3, 2),
  emotion_score numeric(3, 2),
  hook_score numeric(3, 2),
  completion_rate numeric(5, 2),
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL
);

-- API密钥表
CREATE TABLE IF NOT EXISTS api_keys (
  id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar(36) NOT NULL,
  key_hash varchar(255) NOT NULL,
  name varchar(100) NOT NULL,
  permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  is_active boolean DEFAULT true NOT NULL
);

-- 会员订单表
CREATE TABLE IF NOT EXISTS membership_orders (
  id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar(36) NOT NULL,
  level varchar(20) NOT NULL,
  months integer NOT NULL,
  amount integer NOT NULL,
  payment_method varchar(50) NOT NULL,
  payment_status varchar(20) DEFAULT 'PENDING' NOT NULL,
  transaction_id varchar(100),
  created_at timestamptz DEFAULT NOW() NOT NULL,
  paid_at timestamptz,
  notes text
);

-- 安全日志表
CREATE TABLE IF NOT EXISTS security_logs (
  id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar(36),
  action varchar(50) NOT NULL,
  details jsonb,
  ip_address varchar(45),
  status varchar(20) NOT NULL,
  created_at timestamptz DEFAULT NOW() NOT NULL
);

-- 子账号表
CREATE TABLE IF NOT EXISTS sub_accounts (
  id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id varchar(36) NOT NULL,
  email varchar(255) NOT NULL,
  username varchar(100),
  role varchar(20) DEFAULT 'FREE' NOT NULL,
  permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  is_active boolean DEFAULT true NOT NULL
);

-- 使用日志表
CREATE TABLE IF NOT EXISTS usage_logs (
  id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar(36) NOT NULL,
  action varchar(50) NOT NULL,
  work_id varchar(36),
  metadata jsonb,
  ip_address varchar(45),
  user_agent text,
  created_at timestamptz DEFAULT NOW() NOT NULL
);

-- 作品表
CREATE TABLE IF NOT EXISTS works (
  id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar(36) NOT NULL,
  title varchar(255),
  content text NOT NULL,
  word_count integer DEFAULT 0 NOT NULL,
  characters jsonb,
  outline text,
  tags varchar(500),
  genre varchar(50),
  status varchar(20),
  type varchar(50),
  originality_score numeric(5, 2),
  plagiarism_check_result jsonb,
  quality_score integer,
  completion_rate integer,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL,
  is_deleted boolean DEFAULT false NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id);

CREATE INDEX IF NOT EXISTS membership_orders_created_at_idx ON membership_orders(created_at);
CREATE INDEX IF NOT EXISTS membership_orders_payment_status_idx ON membership_orders(payment_status);
CREATE INDEX IF NOT EXISTS membership_orders_user_id_idx ON membership_orders(user_id);

CREATE INDEX IF NOT EXISTS security_logs_action_idx ON security_logs(action);
CREATE INDEX IF NOT EXISTS security_logs_created_at_idx ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS security_logs_user_id_idx ON security_logs(user_id);

CREATE INDEX IF NOT EXISTS sub_accounts_email_idx ON sub_accounts(email);
CREATE INDEX IF NOT EXISTS sub_accounts_parent_id_idx ON sub_accounts(parent_id);

CREATE INDEX IF NOT EXISTS usage_logs_created_at_idx ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS usage_logs_user_id_idx ON usage_logs(user_id);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_membership_idx ON users(membership_level);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS users_super_admin_idx ON users(is_super_admin);
CREATE INDEX IF NOT EXISTS users_wechat_openid_idx ON users(wechat_open_id);
CREATE INDEX IF NOT EXISTS users_wechat_unionid_idx ON users(wechat_union_id);

CREATE INDEX IF NOT EXISTS works_created_at_idx ON works(created_at);
CREATE INDEX IF NOT EXISTS works_user_id_idx ON works(user_id);
CREATE INDEX IF NOT EXISTS works_genre_idx ON works(genre);
CREATE INDEX IF NOT EXISTS works_status_idx ON works(status);

CREATE INDEX IF NOT EXISTS novels_user_id_idx ON novels(user_id);
CREATE INDEX IF NOT EXISTS novels_genre_idx ON novels(genre);
CREATE INDEX IF NOT EXISTS novels_status_idx ON novels(status);
CREATE INDEX IF NOT EXISTS novels_created_at_idx ON novels(created_at);

CREATE INDEX IF NOT EXISTS chapters_novel_id_idx ON chapters(novel_id);
CREATE INDEX IF NOT EXISTS chapters_user_id_idx ON chapters(user_id);
CREATE INDEX IF NOT EXISTS chapters_chapter_num_idx ON chapters(chapter_num);

CREATE INDEX IF NOT EXISTS content_stats_user_id_idx ON content_stats(user_id);
CREATE INDEX IF NOT EXISTS content_stats_novel_id_idx ON content_stats(novel_id);
