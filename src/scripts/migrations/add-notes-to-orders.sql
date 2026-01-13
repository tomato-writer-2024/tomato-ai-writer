-- 添加 notes 字段到 membership_orders 表
-- 用于存储支付凭证、审核备注等额外信息

ALTER TABLE membership_orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- 添加注释
COMMENT ON COLUMN membership_orders.notes IS '订单备注，用于存储支付凭证、审核备注等额外信息（JSON格式）';

-- 添加索引以加速查询
CREATE INDEX IF NOT EXISTS idx_membership_orders_notes ON membership_orders(notes);
