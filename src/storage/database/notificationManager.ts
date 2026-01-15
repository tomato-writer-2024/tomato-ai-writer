import { eq, and, desc } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { notifications, insertNotificationSchema, updateNotificationSchema } from "./shared/schema";
import type { Notification, InsertNotification, UpdateNotification } from "./shared/schema";

/**
 * 通知管理器
 */
export class NotificationManager {
	/**
	 * 创建通知
	 */
	async createNotification(data: InsertNotification): Promise<Notification> {
		const db = await getDb();
		const validated = insertNotificationSchema.parse(data);
		const [notification] = await db.insert(notifications).values(validated).returning();
		return notification;
	}

	/**
	 * 根据ID获取通知
	 */
	async getNotificationById(id: string): Promise<Notification | null> {
		const db = await getDb();
		const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
		return notification || null;
	}

	/**
	 * 获取用户的通知列表
	 */
	async getUserNotifications(
		userId: string,
		options?: {
			skip?: number;
			limit?: number;
			unreadOnly?: boolean;
			type?: string;
		}
	): Promise<Notification[]> {
		const { skip = 0, limit = 20, unreadOnly = false, type } = options || {};
		const db = await getDb();

		const conditions: any[] = [eq(notifications.userId, userId)];

		if (unreadOnly) {
			conditions.push(eq(notifications.isRead, false));
		}

		if (type) {
			conditions.push(eq(notifications.type, type));
		}

		let query = db.select().from(notifications) as any;
		query = query.where(and(...conditions));
		query = query.orderBy(desc(notifications.createdAt));
		query = query.limit(limit);
		query = query.offset(skip);

		return query as unknown as Notification[];
	}

	/**
	 * 获取未读通知数量
	 */
	async getUnreadCount(userId: string): Promise<number> {
		const db = await getDb();
		const [result] = await db
			.select({ count: notifications.id })
			.from(notifications)
			.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

		return Array.isArray(result) ? result.length : 1;
	}

	/**
	 * 标记通知为已读
	 */
	async markAsRead(id: string): Promise<Notification | null> {
		const db = await getDb();
		const [notification] = await db
			.update(notifications)
			.set({
				isRead: true,
				readAt: new Date().toISOString(),
			})
			.where(eq(notifications.id, id))
			.returning();

		return notification || null;
	}

	/**
	 * 标记所有通知为已读
	 */
	async markAllAsRead(userId: string): Promise<number> {
		const db = await getDb();
		const result = await db
			.update(notifications)
			.set({
				isRead: true,
				readAt: new Date().toISOString(),
			})
			.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
			.returning();

		return result.length;
	}

	/**
	 * 删除通知
	 */
	async deleteNotification(id: string): Promise<boolean> {
		const db = await getDb();
		const result = await db.delete(notifications).where(eq(notifications.id, id));
		return true;
	}

	/**
	 * 删除用户的所有通知
	 */
	async deleteAllUserNotifications(userId: string): Promise<number> {
		const db = await getDb();
		const result = await db.delete(notifications).where(eq(notifications.userId, userId));
		return 1; // 简化处理
	}

	/**
	 * 创建订单通知
	 */
	async createOrderNotification(
		userId: string,
		orderId: string,
		status: string,
		message: string
	): Promise<Notification> {
		const type = 'order';
		const title = this.getOrderNotificationTitle(status);
		const link = `/orders?orderId=${orderId}`;

		return this.createNotification({
			userId,
			type,
			title,
			content: message,
			link,
			metadata: JSON.stringify({
				orderId,
				status,
			}),
		});
	}

	/**
	 * 创建会员通知
	 */
	async createMembershipNotification(
		userId: string,
		level: string,
		expireDate: string,
		message: string
	): Promise<Notification> {
		const type = 'membership';
		const title = `会员升级成功：${this.getMembershipLevelName(level)}`;
		const link = '/profile';

		return this.createNotification({
			userId,
			type,
			title,
			content: message,
			link,
			metadata: JSON.stringify({
				level,
				expireDate,
			}),
		});
	}

	/**
	 * 创建系统通知
	 */
	async createSystemNotification(
		userId: string,
		title: string,
		content: string,
		link?: string
	): Promise<Notification> {
		const type = 'system';

		return this.createNotification({
			userId,
			type,
			title,
			content,
			link,
			metadata: JSON.stringify({}),
		});
	}

	/**
	 * 创建社区通知
	 */
	async createCommunityNotification(
		userId: string,
		action: string,
		content: string,
		link: string
	): Promise<Notification> {
		const type = 'community';
		const title = this.getCommunityNotificationTitle(action);

		return this.createNotification({
			userId,
			type,
			title,
			content,
			link,
			metadata: JSON.stringify({
				action,
			}),
		});
	}

	/**
	 * 获取订单通知标题
	 */
	private getOrderNotificationTitle(status: string): string {
		switch (status) {
			case 'PAID':
				return '订单支付成功';
			case 'PENDING_REVIEW':
				return '订单待审核';
			case 'CANCELLED':
				return '订单已取消';
			case 'REFUNDING':
				return '退款申请已提交';
			case 'REFUNDED':
				return '退款处理成功';
			case 'FAILED':
				return '订单支付失败';
			default:
				return '订单状态更新';
		}
	}

	/**
	 * 获取会员等级名称
	 */
	private getMembershipLevelName(level: string): string {
		switch (level) {
			case 'FREE':
				return '免费版';
			case 'BASIC':
				return '基础版';
			case 'PREMIUM':
				return '高级版';
			case 'ENTERPRISE':
				return '企业版';
			default:
				return level;
		}
	}

	/**
	 * 获取社区通知标题
	 */
	private getCommunityNotificationTitle(action: string): string {
		switch (action) {
			case 'comment':
				return '新评论';
			case 'like':
				return '收到点赞';
			case 'reply':
				return '收到回复';
			case 'mention':
				return '被@提到';
			default:
				return '社区通知';
		}
	}
}

// 导出单例
export const notificationManager = new NotificationManager();
