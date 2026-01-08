/**
 * 会员订单管理器
 */

import { eq, and, SQL, desc, sql as pgSql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  membershipOrders,
  insertMembershipOrderSchema,
  updateMembershipOrderSchema,
  type MembershipOrder,
  type InsertMembershipOrder,
  type UpdateMembershipOrder,
} from "./shared/schema";
import { MembershipLevel } from "@/lib/types/user";

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PENDING = 'PENDING',  // 待支付
  PAID = 'PAID',        // 已支付
  FAILED = 'FAILED',    // 支付失败
  REFUNDED = 'REFUNDED', // 已退款
  CANCELLED = 'CANCELLED', // 已取消
}

/**
 * 会员订单管理器
 */
export class OrderManager {
  /**
   * 创建会员订单
   */
  async createOrder(data: InsertMembershipOrder): Promise<MembershipOrder> {
    const db = await getDb();
    const validated = insertMembershipOrderSchema.parse(data);
    const [order] = await db.insert(membershipOrders).values(validated).returning();
    return order;
  }

  /**
   * 通过ID获取订单
   */
  async getOrderById(id: string): Promise<MembershipOrder | null> {
    const db = await getDb();
    const [order] = await db.select().from(membershipOrders).where(eq(membershipOrders.id, id));
    return order || null;
  }

  /**
   * 通过订单号获取订单
   * 注意：当前schema没有orderNumber字段，这里使用transactionId作为替代
   */
  async getOrderByOrderNumber(orderNumber: string): Promise<MembershipOrder | null> {
    const db = await getDb();
    const [order] = await db
      .select()
      .from(membershipOrders)
      .where(eq(membershipOrders.transactionId, orderNumber));
    return order || null;
  }

  /**
   * 获取用户的订单列表
   */
  async getOrdersByUserId(userId: string, options: {
    skip?: number;
    limit?: number;
    status?: OrderStatus;
  } = {}): Promise<MembershipOrder[]> {
    const {
      skip = 0,
      limit = 100,
      status,
    } = options;
    const db = await getDb();

    if (status) {
      return db
        .select()
        .from(membershipOrders)
        .where(and(eq(membershipOrders.userId, userId), eq(membershipOrders.paymentStatus, status)))
        .orderBy(desc(membershipOrders.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(membershipOrders)
      .where(eq(membershipOrders.userId, userId))
      .orderBy(desc(membershipOrders.createdAt))
      .limit(limit)
      .offset(skip);
  }

  /**
   * 获取所有订单列表（管理员）
   */
  async getAllOrders(options: {
    skip?: number;
    limit?: number;
    filters?: {
      userId?: string;
      status?: OrderStatus;
      membershipLevel?: MembershipLevel;
    };
  } = {}): Promise<MembershipOrder[]> {
    const {
      skip = 0,
      limit = 100,
      filters = {},
    } = options;
    const db = await getDb();

    const conditions: SQL[] = [];

    if (filters.userId !== undefined) {
      conditions.push(eq(membershipOrders.userId, filters.userId));
    }
    if (filters.status !== undefined) {
      conditions.push(eq(membershipOrders.paymentStatus, filters.status));
    }
    if (filters.membershipLevel !== undefined) {
      conditions.push(eq(membershipOrders.level, filters.membershipLevel));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(membershipOrders)
        .where(and(...conditions))
        .orderBy(desc(membershipOrders.createdAt))
        .limit(limit)
        .offset(skip);
    }

    return db
      .select()
      .from(membershipOrders)
      .orderBy(desc(membershipOrders.createdAt))
      .limit(limit)
      .offset(skip);
  }

  /**
   * 更新订单
   */
  async updateOrder(id: string, data: UpdateMembershipOrder): Promise<MembershipOrder | null> {
    const db = await getDb();
    const validated = updateMembershipOrderSchema.parse(data);
    const [order] = await db
      .update(membershipOrders)
      .set(validated)
      .where(eq(membershipOrders.id, id))
      .returning();
    return order || null;
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(id: string, status: OrderStatus, metadata?: Record<string, any>): Promise<MembershipOrder | null> {
    const db = await getDb();
    const updateData: any = {
      paymentStatus: status,
    };

    if (status === OrderStatus.PAID) {
      updateData.paidAt = new Date();
    }

    if (metadata) {
      updateData.transactionId = metadata.transactionId;
    }

    const [order] = await db
      .update(membershipOrders)
      .set(updateData)
      .where(eq(membershipOrders.id, id))
      .returning();
    return order || null;
  }

  /**
   * 取消订单
   */
  async cancelOrder(id: string): Promise<MembershipOrder | null> {
    return this.updateOrderStatus(id, OrderStatus.CANCELLED);
  }

  /**
   * 退款订单
   */
  async refundOrder(id: string, reason: string): Promise<MembershipOrder | null> {
    const db = await getDb();
    // 注意：当前schema没有refundReason和refundAt字段，这里简化处理
    const [order] = await db
      .update(membershipOrders)
      .set({
        paymentStatus: OrderStatus.REFUNDED,
      })
      .where(eq(membershipOrders.id, id))
      .returning();
    return order || null;
  }

  /**
   * 生成订单号
   */
  generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `FQ${timestamp}${random}`;
  }

  /**
   * 统计用户订单数量
   */
  async countUserOrders(userId: string, status?: OrderStatus): Promise<number> {
    const db = await getDb();
    if (status) {
      const [result] = await db
        .select({ count: pgSql`count(*)` })
        .from(membershipOrders)
        .where(and(eq(membershipOrders.userId, userId), eq(membershipOrders.paymentStatus, status)));
      return Number(result?.count || 0);
    }

    const [result] = await db
      .select({ count: pgSql`count(*)` })
      .from(membershipOrders)
      .where(eq(membershipOrders.userId, userId));
    return Number(result?.count || 0);
  }

  /**
   * 统计订单数量
   */
  async countAllOrders(filters?: {
    userId?: string;
    status?: OrderStatus;
    membershipLevel?: MembershipLevel;
  }): Promise<number> {
    const db = await getDb();
    const conditions: SQL[] = [];

    if (filters?.userId !== undefined) {
      conditions.push(eq(membershipOrders.userId, filters.userId));
    }
    if (filters?.status !== undefined) {
      conditions.push(eq(membershipOrders.paymentStatus, filters.status));
    }
    if (filters?.membershipLevel !== undefined) {
      conditions.push(eq(membershipOrders.level, filters.membershipLevel));
    }

    if (conditions.length > 0) {
      const [result] = await db
        .select({ count: pgSql`count(*)` })
        .from(membershipOrders)
        .where(and(...conditions));
      return Number(result?.count || 0);
    }

    const [result] = await db
      .select({ count: pgSql`count(*)` })
      .from(membershipOrders);
    return Number(result?.count || 0);
  }
}
