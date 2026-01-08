-- 添加users表缺失的字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone varchar(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location varchar(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url varchar(500);

-- 添加novels表
CREATE TABLE IF NOT EXISTS novels (
  id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar(36) NOT NULL,
  title varchar(200) NOT NULL,
  description text,
  genre varchar(50),
  status varchar(20) DEFAULT 'DRAFT',
  type varchar(20),
  cover_url varchar(500),
  tags jsonb,
  word_count integer DEFAULT 0,
  chapter_count integer DEFAULT 0,
  average_rating numeric(3, 1),
  completion_rate integer,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL,
  is_deleted boolean DEFAULT false NOT NULL
);

-- 添加chapters表
CREATE TABLE IF NOT EXISTS chapters (
  id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id varchar(36) NOT NULL,
  user_id varchar(36) NOT NULL,
  chapter_num integer NOT NULL,
  title varchar(200) NOT NULL,
  content text,
  word_count integer DEFAULT 0,
  quality_score numeric(3, 2),
  completion_rate numeric(5, 2),
  shuangdian_count integer DEFAULT 0,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL,
  is_deleted boolean DEFAULT false NOT NULL
);

-- 添加content_stats表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS novels_user_id_idx ON novels(user_id);
CREATE INDEX IF NOT EXISTS novels_is_deleted_idx ON novels(is_deleted);
CREATE INDEX IF NOT EXISTS chapters_novel_id_idx ON chapters(novel_id);
CREATE INDEX IF NOT EXISTS chapters_user_id_idx ON chapters(user_id);
CREATE INDEX IF NOT EXISTS chapters_is_deleted_idx ON chapters(is_deleted);
CREATE INDEX IF NOT EXISTS content_stats_user_id_idx ON content_stats(user_id);
CREATE INDEX IF NOT EXISTS content_stats_novel_id_idx ON content_stats(novel_id);
