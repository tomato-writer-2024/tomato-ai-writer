-- ============================================================================
-- 创建所有缺失的数据库表
-- ============================================================================

-- 1. 创建 membership_orders 表
CREATE TABLE IF NOT EXISTS membership_orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    level VARCHAR(20) NOT NULL,
    months INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    transaction_id VARCHAR(100),
    proof_url VARCHAR(500),
    proof_type VARCHAR(20),
    refund_amount INTEGER,
    refund_reason TEXT,
    refund_requested_at TIMESTAMP WITH TIME ZONE,
    refund_processed_at TIMESTAMP WITH TIME ZONE,
    refunded_by VARCHAR(36),
    reviewed_by VARCHAR(36),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_status VARCHAR(20),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    metadata JSONB
);

-- 创建索引
CREATE INDEX IF NOT EXISTS membership_orders_order_number_idx ON membership_orders(order_number);
CREATE INDEX IF NOT EXISTS membership_orders_created_at_idx ON membership_orders(created_at);
CREATE INDEX IF NOT EXISTS membership_orders_payment_status_idx ON membership_orders(payment_status);
CREATE INDEX IF NOT EXISTS membership_orders_user_id_idx ON membership_orders(user_id);
CREATE INDEX IF NOT EXISTS membership_orders_review_status_idx ON membership_orders(review_status);

-- 2. 创建 novels 表
CREATE TABLE IF NOT EXISTS novels (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(50),
    status VARCHAR(20) DEFAULT '连载中',
    type VARCHAR(50),
    cover_url VARCHAR(500),
    word_count INTEGER DEFAULT 0 NOT NULL,
    chapter_count INTEGER DEFAULT 0 NOT NULL,
    average_rating NUMERIC(3, 1) DEFAULT 0.0,
    completion_rate INTEGER DEFAULT 0,
    tags VARCHAR(1000),
    is_published BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_deleted BOOLEAN DEFAULT false NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS novels_user_id_idx ON novels(user_id);
CREATE INDEX IF NOT EXISTS novels_genre_idx ON novels(genre);
CREATE INDEX IF NOT EXISTS novels_status_idx ON novels(status);
CREATE INDEX IF NOT EXISTS novels_created_at_idx ON novels(created_at);

-- 3. 创建 chapters 表
CREATE TABLE IF NOT EXISTS chapters (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    novel_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    chapter_num INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0 NOT NULL,
    quality_score INTEGER,
    completion_rate INTEGER,
    shuangdian_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    CONSTRAINT chapters_novel_chapter_unique UNIQUE(novel_id, chapter_num)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS chapters_novel_id_idx ON chapters(novel_id);
CREATE INDEX IF NOT EXISTS chapters_user_id_idx ON chapters(user_id);
CREATE INDEX IF NOT EXISTS chapters_chapter_num_idx ON chapters(chapter_num);

-- 4. 创建 content_stats 表
CREATE TABLE IF NOT EXISTS content_stats (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    novel_id VARCHAR(36),
    chapter_id VARCHAR(36),
    word_count INTEGER NOT NULL,
    quality_score INTEGER,
    density_score INTEGER,
    length_score INTEGER,
    emotion_score INTEGER,
    hook_score INTEGER,
    completion_rate INTEGER,
    shuangdian_count INTEGER,
    estimated_read_time INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS content_stats_user_id_idx ON content_stats(user_id);
CREATE INDEX IF NOT EXISTS content_stats_novel_id_idx ON content_stats(novel_id);
CREATE INDEX IF NOT EXISTS content_stats_chapter_id_idx ON content_stats(chapter_id);
CREATE INDEX IF NOT EXISTS content_stats_created_at_idx ON content_stats(created_at);

-- 5. 创建 materials 表
CREATE TABLE IF NOT EXISTS materials (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    tags VARCHAR(500),
    novel_id VARCHAR(36),
    notes TEXT,
    is_favorite BOOLEAN DEFAULT false NOT NULL,
    usage_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_deleted BOOLEAN DEFAULT false NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS materials_user_id_idx ON materials(user_id);
CREATE INDEX IF NOT EXISTS materials_category_idx ON materials(category);
CREATE INDEX IF NOT EXISTS materials_novel_id_idx ON materials(novel_id);
CREATE INDEX IF NOT EXISTS materials_created_at_idx ON materials(created_at);
CREATE INDEX IF NOT EXISTS materials_favorite_idx ON materials(is_favorite);

-- 6. 创建 posts 表
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    tags JSONB DEFAULT '[]' NOT NULL,
    view_count INTEGER DEFAULT 0 NOT NULL,
    like_count INTEGER DEFAULT 0 NOT NULL,
    comment_count INTEGER DEFAULT 0 NOT NULL,
    favorite_count INTEGER DEFAULT 0 NOT NULL,
    is_pinned BOOLEAN DEFAULT false NOT NULL,
    is_locked BOOLEAN DEFAULT false NOT NULL,
    is_approved BOOLEAN DEFAULT true NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(36),
    review_notes TEXT,
    report_count INTEGER DEFAULT 0 NOT NULL,
    is_hidden BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_deleted BOOLEAN DEFAULT false NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_is_approved_idx ON posts(is_approved);
CREATE INDEX IF NOT EXISTS posts_is_hidden_idx ON posts(is_hidden);

-- 7. 创建 post_likes 表
CREATE TABLE IF NOT EXISTS post_likes (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT post_likes_user_post_unique UNIQUE(user_id, post_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS post_likes_user_id_idx ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON post_likes(post_id);

-- 8. 创建 post_comments 表
CREATE TABLE IF NOT EXISTS post_comments (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    parent_id VARCHAR(36),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_deleted BOOLEAN DEFAULT false NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS post_comments_user_id_idx ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS post_comments_parent_id_idx ON post_comments(parent_id);

-- 9. 创建 post_favorites 表
CREATE TABLE IF NOT EXISTS post_favorites (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT post_favorites_user_post_unique UNIQUE(user_id, post_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS post_favorites_user_id_idx ON post_favorites(user_id);
CREATE INDEX IF NOT EXISTS post_favorites_post_id_idx ON post_favorites(post_id);

-- 10. 创建 post_reports 表
CREATE TABLE IF NOT EXISTS post_reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    reviewed_by VARCHAR(36),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    action VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS post_reports_user_id_idx ON post_reports(user_id);
CREATE INDEX IF NOT EXISTS post_reports_post_id_idx ON post_reports(post_id);
CREATE INDEX IF NOT EXISTS post_reports_status_idx ON post_reports(status);
CREATE INDEX IF NOT EXISTS post_reports_created_at_idx ON post_reports(created_at DESC);

-- 11. 创建 notifications 表
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT false NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(type);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- 12. 创建 api_keys 表
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    permissions JSONB DEFAULT '[]' NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id);

-- 13. 创建 security_logs 表
CREATE TABLE IF NOT EXISTS security_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36),
    action VARCHAR(50) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS security_logs_action_idx ON security_logs(action);
CREATE INDEX IF NOT EXISTS security_logs_created_at_idx ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS security_logs_user_id_idx ON security_logs(user_id);

-- 14. 创建 sub_accounts 表
CREATE TABLE IF NOT EXISTS sub_accounts (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    role VARCHAR(20) DEFAULT 'FREE' NOT NULL,
    permissions JSONB DEFAULT '[]' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS sub_accounts_email_idx ON sub_accounts(email);
CREATE INDEX IF NOT EXISTS sub_accounts_parent_id_idx ON sub_accounts(parent_id);

-- 15. 创建 usage_logs 表
CREATE TABLE IF NOT EXISTS usage_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL,
    work_id VARCHAR(36),
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS usage_logs_created_at_idx ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS usage_logs_user_id_idx ON usage_logs(user_id);

-- 16. 创建 works 表
CREATE TABLE IF NOT EXISTS works (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0 NOT NULL,
    characters JSONB,
    outline TEXT,
    tags VARCHAR(500),
    genre VARCHAR(50),
    status VARCHAR(20),
    type VARCHAR(50),
    originality_score NUMERIC(5, 2),
    plagiarism_check_result JSONB,
    quality_score INTEGER,
    completion_rate INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_deleted BOOLEAN DEFAULT false NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS works_created_at_idx ON works(created_at);
CREATE INDEX IF NOT EXISTS works_user_id_idx ON works(user_id);
CREATE INDEX IF NOT EXISTS works_genre_idx ON works(genre);
CREATE INDEX IF NOT EXISTS works_status_idx ON works(status);

-- ============================================================================
-- 完成
-- ============================================================================
SELECT 'All tables created successfully' as status;
