-- ============================================================================
-- 添加membership_orders表缺失的列
-- ============================================================================

-- 添加缺失的列
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(50);
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS proof_url VARCHAR(500);
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS proof_type VARCHAR(20);
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS refund_amount INTEGER;
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS refunded_by VARCHAR(36);
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(36);
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS review_status VARCHAR(20);
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 添加索引
CREATE INDEX IF NOT EXISTS membership_orders_order_number_idx ON membership_orders(order_number);
CREATE INDEX IF NOT EXISTS membership_orders_created_at_idx ON membership_orders(created_at);
CREATE INDEX IF NOT EXISTS membership_orders_payment_status_idx ON membership_orders(payment_status);
CREATE INDEX IF NOT EXISTS membership_orders_user_id_idx ON membership_orders(user_id);
CREATE INDEX IF NOT EXISTS membership_orders_review_status_idx ON membership_orders(review_status);

-- ============================================================================
-- 创建posts表（如果不存在）
-- ============================================================================

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

-- 创建posts表的索引
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_is_approved_idx ON posts(is_approved);
CREATE INDEX IF NOT EXISTS posts_is_hidden_idx ON posts(is_hidden);

-- ============================================================================
-- 创建notifications表（如果不存在）
-- ============================================================================

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

-- 创建notifications表的索引
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(type);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- ============================================================================
-- 创建其他关联表
-- ============================================================================

-- post_likes表
CREATE TABLE IF NOT EXISTS post_likes (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT post_likes_user_post_unique UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS post_likes_user_id_idx ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON post_likes(post_id);

-- post_comments表
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

CREATE INDEX IF NOT EXISTS post_comments_user_id_idx ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS post_comments_parent_id_idx ON post_comments(parent_id);

-- post_favorites表
CREATE TABLE IF NOT EXISTS post_favorites (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT post_favorites_user_post_unique UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS post_favorites_user_id_idx ON post_favorites(user_id);
CREATE INDEX IF NOT EXISTS post_favorites_post_id_idx ON post_favorites(post_id);

-- post_reports表
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

CREATE INDEX IF NOT EXISTS post_reports_user_id_idx ON post_reports(user_id);
CREATE INDEX IF NOT EXISTS post_reports_post_id_idx ON post_reports(post_id);
CREATE INDEX IF NOT EXISTS post_reports_status_idx ON post_reports(status);
CREATE INDEX IF NOT EXISTS post_reports_created_at_idx ON post_reports(created_at DESC);

-- ============================================================================
-- 完成
-- ============================================================================
SELECT 'All tables and columns updated successfully' as status;
