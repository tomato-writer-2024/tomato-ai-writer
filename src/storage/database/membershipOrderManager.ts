import { eq, and, SQL, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { membershipOrders, insertMembershipOrderSchema, updateMembershipOrderSchema } from "./shared/schema";
import type { MembershipOrder, InsertMembershipOrder, UpdateMembershipOrder } from "./shared/schema";

/**
 * 会员订单管理器
 */
export class MembershipOrderManager {
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
	 * 获取订单列表
	 */
	async getOrders(options: {
		skip?: number;
		limit?: number;
		filters?: Partial<Pick<MembershipOrder, 'userId' | 'paymentStatus' | 'level'>>;
	} = {}): Promise<MembershipOrder[]> {
		const { skip = 0, limit = 100, filters = {} } = options;
		const db = await getDb();

		const conditions: SQL[] = [];

		// 精确条件
		if (filters.userId !== undefined) {
			conditions.push(eq(membershipOrders.userId, filters.userId));
		}
		if (filters.paymentStatus !== undefined) {
			conditions.push(eq(membershipOrders.paymentStatus, filters.paymentStatus));
		}
		if (filters.level !== undefined) {
			conditions.push(eq(membershipOrders.level, filters.level));
		}

		let query = db.select().from(membershipOrders) as any;
		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		return query.orderBy(desc(membershipOrders.createdAt)).limit(limit).offset(skip) as unknown as MembershipOrder[];
	}

	/**
	 * 根据ID获取订单
	 */
	async getOrderById(id: string): Promise<MembershipOrder | null> {
		const db = await getDb();
		const [order] = await db.select().from(membershipOrders).where(eq(membershipOrders.id, id));
		return order || null;
	}

	/**
	 * 获取用户的订单
	 */
	async getOrdersByUserId(userId: string, options?: {
		skip?: number;
		limit?: number;
	}): Promise<MembershipOrder[]> {
		return this.getOrders({
			...options,
			filters: { userId },
		});
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
	 * 更新支付状态
	 */
	async updatePaymentStatus(id: string, status: string, transactionId?: string): Promise<MembershipOrder | null> {
		const updateData: UpdateMembershipOrder = {
			paymentStatus: status as any,
		};

		if (status === 'PAID' || status === 'COMPLETED') {
			updateData.paidAt = new Date().toISOString();
		}

		if (transactionId) {
			updateData.transactionId = transactionId;
		}

		return this.updateOrder(id, updateData);
	}

	/**
	 * 标记订单为已支付
	 */
	async markAsPaid(id: string, transactionId?: string): Promise<MembershipOrder | null> {
		return this.updatePaymentStatus(id, 'PAID', transactionId);
	}

	/**
	 * 标记订单为失败
	 */
	async markAsFailed(id: string): Promise<MembershipOrder | null> {
		return this.updatePaymentStatus(id, 'FAILED');
	}

	/**
	 * 获取待支付订单
	 */
	async getPendingOrders(): Promise<MembershipOrder[]> {
		return this.getOrders({
			filters: { paymentStatus: 'PENDING' },
		});
	}

	/**
	 * 获取用户待支付订单
	 */
	async getPendingOrdersByUserId(userId: string): Promise<MembershipOrder[]> {
		return this.getOrders({
			filters: {
				userId,
				paymentStatus: 'PENDING',
			},
		});
	}

	/**
	 * 获取用户支付成功订单
	 */
	async getPaidOrdersByUserId(userId: string, options?: {
		skip?: number;
		limit?: number;
	}): Promise<MembershipOrder[]> {
		return this.getOrders({
			...options,
			filters: {
				userId,
				paymentStatus: 'PAID',
			},
		});
	}

	/**
	 * 计算会员到期时间
	 */
	calculateExpireDate(months: number, currentExpireAt?: Date): Date {
		const baseDate = currentExpireAt && new Date(currentExpireAt) > new Date()
			? new Date(currentExpireAt)
			: new Date();

		const expireDate = new Date(baseDate);
		expireDate.setMonth(expireDate.getMonth() + months);

		return expireDate;
	}

	/**
	 * 获取用户消费统计
	 */
	async getUserSpendingStats(userId: string): Promise<{
		totalAmount: number;
		totalOrders: number;
		paidOrders: number;
		pendingOrders: number;
		failedOrders: number;
	}> {
		const orders = await this.getOrdersByUserId(userId);

		return {
			totalAmount: orders.reduce((sum, o) => sum + o.amount, 0),
			totalOrders: orders.length,
			paidOrders: orders.filter(o => o.paymentStatus === 'PAID').length,
			pendingOrders: orders.filter(o => o.paymentStatus === 'PENDING').length,
			failedOrders: orders.filter(o => o.paymentStatus === 'FAILED').length,
		};
	}

	/**
	 * 更新订单备注（用于存储支付凭证等额外信息）
	 */
	async updateOrderNotes(id: string, notes: string): Promise<MembershipOrder | null> {
		return this.updateOrder(id, { notes });
	}

	/**
	 * 更新订单状态（通用方法）
	 */
	async updateOrderStatus(id: string, status: string): Promise<MembershipOrder | null> {
		return this.updatePaymentStatus(id, status);
	}

	/**
	 * 获取待审核订单
	 */
	async getPendingReviewOrders(): Promise<MembershipOrder[]> {
		return this.getOrders({
			filters: { paymentStatus: 'PENDING_REVIEW' as any },
		});
	}
}

export const membershipOrderManager = new MembershipOrderManager();
