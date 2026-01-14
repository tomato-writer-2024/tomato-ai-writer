-- 创建内容版本历史表
CREATE TABLE IF NOT EXISTS content_versions (
  id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  novel_id varchar(36) REFERENCES novels(id) ON DELETE CASCADE,
  chapter_id varchar(36) REFERENCES chapters(id) ON DELETE CASCADE,
  content_type varchar(50) DEFAULT 'chapter', -- chapter, outline, notes, etc.
  content text NOT NULL,
  description text, -- 版本描述（如"修改了开头"）
  tags text[], -- 版本标签（如['polished', 'edited', 'restore']）
  created_by varchar(36) NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT NOW() NOT NULL,
  word_count integer, -- 字数统计（方便排序和筛选）
  is_deleted boolean DEFAULT false
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_content_versions_novel_id ON content_versions(novel_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_chapter_id ON content_versions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_created_by ON content_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_content_versions_created_at ON content_versions(created_at DESC);

-- 添加注释
COMMENT ON TABLE content_versions IS '内容版本历史表，记录所有内容修改历史';
COMMENT ON COLUMN content_versions.content_type IS '内容类型：chapter（章节）、outline（大纲）、notes（笔记）等';
COMMENT ON COLUMN content_versions.tags IS '版本标签：polished（已润色）、edited（已编辑）、restore（恢复）等';
COMMENT ON COLUMN content_versions.word_count IS '字数统计，方便按字数排序';
