import { eq, and, SQL, desc, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
	membershipOrders,
	users,
	insertMembershipOrderSchema,
	updateMembershipOrderSchema,
	type MembershipOrder,
	type InsertMembershipOrder,
	type UpdateMembershipOrder,
} from "./shared/schema";
import { notificationManager } from "./notificationManager";
import { userManager } from "./userManager";

/**
 * 订单状态枚举
 */
export enum OrderStatus {
	PENDING = 'PENDING',              // 待支付
	PENDING_REVIEW = 'PENDING_REVIEW', // 待审核（已上传凭证）
	PAID = 'PAID',                    // 已支付
	REFUNDING = 'REFUNDING',          // 退款中
	REFUNDED = 'REFUNDED',            // 已退款
	CANCELLED = 'CANCELLED',          // 已取消
	FAILED = 'FAILED',                // 支付失败
}

/**
 * 审核状态枚举
 */
export enum ReviewStatus {
	PENDING = 'pending',    // 待审核
	APPROVED = 'approved',  // 审核通过
	REJECTED = 'rejected',  // 审核拒绝
}

/**
 * 增强的订单管理器 - 实现完整的订单闭环系统
 */
export class EnhancedOrderManager {
	/**
	 * 生成唯一订单号
	 */
	private generateOrderNumber(): string {
		const timestamp = Date.now().toString();
		const random = Math.random().toString(36).substring(2, 8).toUpperCase();
		return `ORD${timestamp}${random}`;
	}

	/**
	 * 创建会员订单
	 */
	async createOrder(data: Omit<InsertMembershipOrder, 'orderNumber' | 'paymentStatus' | 'expiresAt' | 'createdAt'>): Promise<MembershipOrder> {
		const db = await getDb();
		const orderNumber = this.generateOrderNumber();

		// 订单30分钟后过期
		const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

		const validated = insertMembershipOrderSchema.parse({
			...data,
			orderNumber,
			paymentStatus: OrderStatus.PENDING,
			expiresAt,
			reviewStatus: ReviewStatus.PENDING,
		});

		const [order] = await db.insert(membershipOrders).values(validated).returning();

		// 发送订单创建通知
		await notificationManager.createOrderNotification(
			data.userId,
			order.id,
			OrderStatus.PENDING,
			`您的订单 ${orderNumber} 已创建，请在30分钟内完成支付。`
		);

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
	 */
	async getOrderByOrderNumber(orderNumber: string): Promise<MembershipOrder | null> {
		const db = await getDb();
		const [order] = await db
			.select()
			.from(membershipOrders)
			.where(eq(membershipOrders.orderNumber, orderNumber));
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
			reviewStatus?: ReviewStatus;
			membershipLevel?: string;
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
		if (filters.reviewStatus !== undefined) {
			conditions.push(eq(membershipOrders.reviewStatus, filters.reviewStatus as any));
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
	 * 上传支付凭证（进入审核流程）
	 */
	async uploadPaymentProof(
		orderId: string,
		proofUrl: string,
		proofType: string = 'image'
	): Promise<MembershipOrder | null> {
		const db = await getDb();
		const order = await this.getOrderById(orderId);

		if (!order) {
			return null;
		}

		// 检查订单状态
		if (order.paymentStatus !== OrderStatus.PENDING) {
			throw new Error('订单状态不允许上传凭证');
		}

		// 检查订单是否过期
		if (order.expiresAt && new Date(order.expiresAt) < new Date()) {
			throw new Error('订单已过期');
		}

		// 更新订单
		const [updatedOrder] = await db
			.update(membershipOrders)
			.set({
				paymentStatus: OrderStatus.PENDING_REVIEW,
				proofUrl,
				proofType,
			})
			.where(eq(membershipOrders.id, orderId))
			.returning();

		// 发送通知
		await notificationManager.createOrderNotification(
			order.userId,
			orderId,
			OrderStatus.PENDING_REVIEW,
			`您的订单 ${order.orderNumber} 支付凭证已上传，正在审核中。`
		);

		return updatedOrder || null;
	}

	/**
	 * 审核订单（管理员）
	 */
	async reviewOrder(
		orderId: string,
		reviewerId: string,
		approved: boolean,
		reviewNotes?: string
	): Promise<MembershipOrder | null> {
		const db = await getDb();
		const order = await this.getOrderById(orderId);

		if (!order) {
			return null;
		}

		if (order.paymentStatus !== OrderStatus.PENDING_REVIEW) {
			throw new Error('订单状态不允许审核');
		}

		// 更新审核信息
		const updateData: any = {
			reviewedBy: reviewerId,
			reviewedAt: new Date().toISOString(),
			reviewStatus: approved ? ReviewStatus.APPROVED : ReviewStatus.REJECTED,
			reviewNotes,
		};

		if (approved) {
			// 审核通过，更新为已支付
			updateData.paymentStatus = OrderStatus.PAID;
			updateData.paidAt = new Date().toISOString();

			// 激活会员
			await userManager.activateMembership(
				order.userId,
				order.level as any,
				order.months
			);
		} else {
			// 审核拒绝，返回待支付状态
			updateData.paymentStatus = OrderStatus.PENDING;
			updateData.proofUrl = null;
			updateData.proofType = null;
		}

		const [updatedOrder] = await db
			.update(membershipOrders)
			.set(updateData)
			.where(eq(membershipOrders.id, orderId))
			.returning();

		// 发送通知
		const status = approved ? '审核通过' : '审核拒绝';
		await notificationManager.createOrderNotification(
			order.userId,
			orderId,
			approved ? OrderStatus.PAID : OrderStatus.PENDING,
			`您的订单 ${order.orderNumber} ${status}${reviewNotes ? `：${reviewNotes}` : ''}`
		);

		return updatedOrder || null;
	}

	/**
	 * 申请退款
	 */
	async requestRefund(orderId: string, reason: string): Promise<MembershipOrder | null> {
		const db = await getDb();
		const order = await this.getOrderById(orderId);

		if (!order) {
			return null;
		}

		if (order.paymentStatus !== OrderStatus.PAID) {
			throw new Error('只有已支付的订单才能申请退款');
		}

		// 更新订单状态
		const [updatedOrder] = await db
			.update(membershipOrders)
			.set({
				paymentStatus: OrderStatus.REFUNDING,
				refundRequestedAt: new Date().toISOString(),
				refundReason: reason,
			})
			.where(eq(membershipOrders.id, orderId))
			.returning();

		// 发送通知
		await notificationManager.createOrderNotification(
			order.userId,
			orderId,
			OrderStatus.REFUNDING,
			`您的退款申请已提交，请等待审核。`
		);

		return updatedOrder || null;
	}

	/**
	 * 处理退款（管理员）
	 */
	async processRefund(
		orderId: string,
		adminId: string,
		approved: boolean,
		refundAmount?: number,
		notes?: string
	): Promise<MembershipOrder | null> {
		const db = await getDb();
		const order = await this.getOrderById(orderId);

		if (!order) {
			return null;
		}

		if (order.paymentStatus !== OrderStatus.REFUNDING) {
			throw new Error('订单状态不允许处理退款');
		}

		// 安全解析现有metadata
		let metadata: Record<string, any> = {};
		if (order.metadata && typeof order.metadata === 'string') {
			try {
				metadata = JSON.parse(order.metadata);
			} catch (e) {
				console.error('Failed to parse order metadata:', e);
			}
		}

		// 添加退款备注
		if (notes) {
			metadata.refundNotes = notes;
		}

		const updateData: any = {
			refundProcessedAt: new Date().toISOString(),
			refundedBy: adminId,
			metadata: JSON.stringify(metadata),
		};

		if (approved) {
			// 退款批准
			updateData.paymentStatus = OrderStatus.REFUNDED;
			updateData.refundAmount = refundAmount || order.amount;

			// 取消会员（可选，根据业务需求）
			// await userManager.cancelMembership(order.userId);
		} else {
			// 退款拒绝，恢复为已支付状态
			updateData.paymentStatus = OrderStatus.PAID;
			updateData.refundAmount = null;
		}

		const [updatedOrder] = await db
			.update(membershipOrders)
			.set(updateData)
			.where(eq(membershipOrders.id, orderId))
			.returning();

		// 发送通知
		const status = approved ? '退款成功' : '退款拒绝';
		await notificationManager.createOrderNotification(
			order.userId,
			orderId,
			approved ? OrderStatus.REFUNDED : OrderStatus.PAID,
			`您的退款申请${status}${notes ? `：${notes}` : ''}`
		);

		return updatedOrder || null;
	}

	/**
	 * 取消订单
	 */
	async cancelOrder(orderId: string): Promise<MembershipOrder | null> {
		const db = await getDb();
		const order = await this.getOrderById(orderId);

		if (!order) {
			return null;
		}

		if (order.paymentStatus !== OrderStatus.PENDING && order.paymentStatus !== OrderStatus.PENDING_REVIEW) {
			throw new Error('只有待支付或待审核的订单可以取消');
		}

		const [updatedOrder] = await db
			.update(membershipOrders)
			.set({ paymentStatus: OrderStatus.CANCELLED })
			.where(eq(membershipOrders.id, orderId))
			.returning();

		// 发送通知
		await notificationManager.createOrderNotification(
			order.userId,
			orderId,
			OrderStatus.CANCELLED,
			`您的订单 ${order.orderNumber} 已取消。`
		);

		return updatedOrder || null;
	}

	/**
	 * 标记订单为支付失败
	 */
	async markAsFailed(orderId: string, reason?: string): Promise<MembershipOrder | null> {
		const db = await getDb();
		const order = await this.getOrderById(orderId);

		if (!order) {
			return null;
		}

		// 安全解析现有metadata
		let metadata: Record<string, any> = {};
		if (order.metadata && typeof order.metadata === 'string') {
			try {
				metadata = JSON.parse(order.metadata);
			} catch (e) {
				console.error('Failed to parse order metadata:', e);
			}
		}

		// 添加失败原因
		if (reason) {
			metadata.failureReason = reason;
		}

		const [updatedOrder] = await db
			.update(membershipOrders)
			.set({
				paymentStatus: OrderStatus.FAILED,
				metadata: JSON.stringify(metadata),
			})
			.where(eq(membershipOrders.id, orderId))
			.returning();

		if (order) {
			await notificationManager.createOrderNotification(
				order.userId,
				orderId,
				OrderStatus.FAILED,
				`您的订单 ${order.orderNumber} 支付失败${reason ? `：${reason}` : ''}。`
			);
		}

		return updatedOrder || null;
	}

	/**
	 * 获取过期订单（自动取消）
	 */
	async getExpiredOrders(): Promise<MembershipOrder[]> {
		const db = await getDb();
		const now = new Date().toISOString();

		return db
			.select()
			.from(membershipOrders)
			.where(and(
				eq(membershipOrders.paymentStatus, OrderStatus.PENDING),
				sql`${membershipOrders.expiresAt} < ${now}`
			));
	}

	/**
	 * 批量取消过期订单
	 */
	async cancelExpiredOrders(): Promise<number> {
		const expiredOrders = await this.getExpiredOrders();
		let count = 0;

		for (const order of expiredOrders) {
			await this.cancelOrder(order.id);
			count++;
		}

		return count;
	}

	/**
	 * 获取待审核订单（管理员）
	 */
	async getPendingReviewOrders(): Promise<MembershipOrder[]> {
		const db = await getDb();
		return db
			.select()
			.from(membershipOrders)
			.where(eq(membershipOrders.paymentStatus, OrderStatus.PENDING_REVIEW))
			.orderBy(desc(membershipOrders.createdAt));
	}

	/**
	 * 获取退款中订单（管理员）
	 */
	async getRefundingOrders(): Promise<MembershipOrder[]> {
		const db = await getDb();
		return db
			.select()
			.from(membershipOrders)
			.where(eq(membershipOrders.paymentStatus, OrderStatus.REFUNDING))
			.orderBy(desc(membershipOrders.refundRequestedAt));
	}

	/**
	 * 获取订单统计信息
	 */
	async getOrderStats(filters?: {
		startDate?: Date;
		endDate?: Date;
	}): Promise<{
		totalOrders: number;
		totalRevenue: number;
		pendingOrders: number;
		paidOrders: number;
		refundedOrders: number;
		cancelledOrders: number;
		refundingOrders: number;
	}> {
		const db = await getDb();
		let query = db.select().from(membershipOrders) as any;

		if (filters?.startDate || filters?.endDate) {
			const conditions: SQL[] = [];
			if (filters.startDate) {
				conditions.push(sql`${membershipOrders.createdAt} >= ${filters.startDate.toISOString()}`);
			}
			if (filters.endDate) {
				conditions.push(sql`${membershipOrders.createdAt} <= ${filters.endDate.toISOString()}`);
			}
			query = query.where(and(...conditions));
		}

		const orders = await query;

		return {
			totalOrders: orders.length,
			totalRevenue: orders
				.filter((o: any) => o.paymentStatus === OrderStatus.PAID)
				.reduce((sum: number, o: any) => sum + o.amount, 0),
			pendingOrders: orders.filter((o: any) => o.paymentStatus === OrderStatus.PENDING).length,
			paidOrders: orders.filter((o: any) => o.paymentStatus === OrderStatus.PAID).length,
			refundedOrders: orders.filter((o: any) => o.paymentStatus === OrderStatus.REFUNDED).length,
			cancelledOrders: orders.filter((o: any) => o.paymentStatus === OrderStatus.CANCELLED).length,
			refundingOrders: orders.filter((o: any) => o.paymentStatus === OrderStatus.REFUNDING).length,
		};
	}
}

// 导出单例实例
export const enhancedOrderManager = new EnhancedOrderManager();
