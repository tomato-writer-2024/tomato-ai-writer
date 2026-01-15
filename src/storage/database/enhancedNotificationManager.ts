import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { notifications, users, insertNotificationSchema, updateNotificationSchema } from "./shared/schema";
import { emailService } from "@/lib/emailService";
import type { Notification, InsertNotification, UpdateNotification } from "./shared/schema";

/**
 * 通知类型枚举
 */
export enum NotificationType {
	ORDER = 'order',
	MEMBERSHIP = 'membership',
	SYSTEM = 'system',
	COMMUNITY = 'community',
}

/**
 * 增强的通知管理器 - 实现站内信和邮件通知
 */
export class EnhancedNotificationManager {
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
	 * 创建通知并发送邮件
	 */
	async createNotificationWithEmail(
		data: InsertNotification,
		sendEmail: boolean = true
	): Promise<Notification> {
		// 创建站内通知
		const notification = await this.createNotification(data);

		// 发送邮件通知
		if (sendEmail) {
			const user = await this.getUserById(data.userId);
			if (user && user.email) {
				await this.sendEmailByType(user.email, data);
			}
		}

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
			type?: NotificationType;
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
		const results = await db
			.select()
			.from(notifications)
			.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

		return results.length;
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
		const results = await db
			.update(notifications)
			.set({
				isRead: true,
				readAt: new Date().toISOString(),
			})
			.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
			.returning();

		return results.length;
	}

	/**
	 * 删除通知
	 */
	async deleteNotification(id: string): Promise<boolean> {
		const db = await getDb();
		await db.delete(notifications).where(eq(notifications.id, id));
		return true;
	}

	/**
	 * 删除用户的所有通知
	 */
	async deleteAllUserNotifications(userId: string): Promise<number> {
		const db = await getDb();
		const results = await db.delete(notifications).where(eq(notifications.userId, userId));
		return results.rowCount ?? 0;
	}

	/**
	 * 创建订单通知
	 */
	async createOrderNotification(
		userId: string,
		orderId: string,
		status: string,
		message: string,
		sendEmail: boolean = true
	): Promise<Notification> {
		const type = NotificationType.ORDER;
		const title = this.getOrderNotificationTitle(status);
		const link = `/orders?orderId=${orderId}`;

		// 构建metadata
		const metadata = {
			orderId,
			status,
		};

		return this.createNotificationWithEmail(
			{
				userId,
				type,
				title,
				content: message,
				link,
				metadata: JSON.stringify(metadata),
			},
			sendEmail
		);
	}

	/**
	 * 创建会员通知
	 */
	async createMembershipNotification(
		userId: string,
		level: string,
		expireDate: string,
		message: string,
		sendEmail: boolean = true
	): Promise<Notification> {
		const type = NotificationType.MEMBERSHIP;
		const title = `会员升级成功：${this.getMembershipLevelName(level)}`;
		const link = '/profile';

		const metadata = {
			level,
			expireDate,
		};

		return this.createNotificationWithEmail(
			{
				userId,
				type,
				title,
				content: message,
				link,
				metadata: JSON.stringify(metadata),
			},
			sendEmail
		);
	}

	/**
	 * 创建系统通知
	 */
	async createSystemNotification(
		userId: string,
		title: string,
		content: string,
		link?: string,
		sendEmail: boolean = true
	): Promise<Notification> {
		const type = NotificationType.SYSTEM;

		return this.createNotificationWithEmail(
			{
				userId,
				type,
				title,
				content,
				link,
				metadata: JSON.stringify({}),
			},
			sendEmail
		);
	}

	/**
	 * 创建社区通知
	 */
	async createCommunityNotification(
		userId: string,
		title: string,
		content: string,
		link: string,
		sendEmail: boolean = false // 默认不发邮件
	): Promise<Notification> {
		const type = NotificationType.COMMUNITY;

		return this.createNotificationWithEmail(
			{
				userId,
				type,
				title,
				content,
				link,
				metadata: JSON.stringify({}),
			},
			sendEmail
		);
	}

	/**
	 * 批量发送通知（用于系统广播）
	 */
	async broadcastNotification(
		userIds: string[],
		title: string,
		content: string,
		link?: string,
		sendEmail: boolean = false
	): Promise<Notification[]> {
		const notifications: Notification[] = [];

		for (const userId of userIds) {
			try {
				const notification = await this.createSystemNotification(
					userId,
					title,
					content,
					link,
					sendEmail
				);
				notifications.push(notification);
			} catch (error) {
				console.error(`Failed to send notification to user ${userId}:`, error);
			}
		}

		return notifications;
	}

	/**
	 * 根据类型发送邮件
	 */
	private async sendEmailByType(email: string, notificationData: InsertNotification): Promise<void> {
		let metadata: Record<string, any> = {};

		// 安全解析metadata
		if (notificationData.metadata && typeof notificationData.metadata === 'string') {
			try {
				metadata = JSON.parse(notificationData.metadata);
			} catch (e) {
				console.error('Failed to parse notification metadata:', e);
				metadata = {};
			}
		}

		switch (notificationData.type) {
			case NotificationType.ORDER:
				await emailService.sendOrderNotificationEmail(
					email,
					metadata.orderNumber || notificationData.title,
					metadata.status || 'PENDING',
					notificationData.content
				);
				break;

			case NotificationType.MEMBERSHIP:
				// 确保level和expireDate是字符串类型
				const level = metadata.level || 'BASIC';
				const expireDate = metadata.expireDate || new Date().toISOString();
				await emailService.sendMembershipUpgradeEmail(
					email,
					level,
					expireDate
				);
				break;

			case NotificationType.SYSTEM:
				await emailService.sendSystemNotificationEmail(
					email,
					notificationData.title,
					notificationData.content,
					notificationData.link || undefined
				);
				break;

			case NotificationType.COMMUNITY:
				// 社区通知默认不发邮件
				break;

			default:
				console.warn(`Unknown notification type: ${notificationData.type}`);
		}
	}

	/**
	 * 获取订单通知标题
	 */
	private getOrderNotificationTitle(status: string): string {
	 const titles = {
			PENDING: '订单待支付',
			PENDING_REVIEW: '订单审核中',
			PAID: '订单支付成功',
			REFUNDING: '退款处理中',
			REFUNDED: '退款成功',
			CANCELLED: '订单已取消',
			FAILED: '支付失败',
		};
		return titles[status as keyof typeof titles] || '订单状态更新';
	}

	/**
	 * 获取会员等级名称
	 */
	private getMembershipLevelName(level: string): string {
		const names = {
			BASIC: '基础会员',
			PREMIUM: '高级会员',
			ENTERPRISE: '企业会员',
		};
		return names[level as keyof typeof names] || level;
	}

	/**
	 * 获取用户信息
	 */
	private async getUserById(userId: string): Promise<{ email: string } | null> {
		const db = await getDb();
		const [user] = await db
			.select({ email: users.email })
			.from(users)
			.where(eq(users.id, userId));
		return user || null;
	}

	/**
	 * 清理旧通知（保留最近30天）
	 */
	async cleanupOldNotifications(userId?: string): Promise<number> {
		const db = await getDb();
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

		let query = db.delete(notifications).where(sql`${notifications.createdAt} < ${thirtyDaysAgo}`) as any;

		if (userId) {
			query = query.where(eq(notifications.userId, userId));
		}

		const result = await query;
		return result.rowCount ?? 0;
	}

	/**
	 * 获取通知统计
	 */
	async getNotificationStats(userId: string): Promise<{
		total: number;
		unread: number;
		byType: Record<string, number>;
	}> {
		const all = await this.getUserNotifications(userId, { limit: 1000 });
		const unread = await this.getUserNotifications(userId, { unreadOnly: true, limit: 1000 });

		const byType: Record<string, number> = {};
		all.forEach(notification => {
			byType[notification.type] = (byType[notification.type] || 0) + 1;
		});

		return {
			total: all.length,
			unread: unread.length,
			byType,
		};
	}
}

// 导出单例实例
export const enhancedNotificationManager = new EnhancedNotificationManager();
