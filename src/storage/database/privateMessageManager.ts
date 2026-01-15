import { eq, and, or, desc, sql, lt, gte } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
	privateMessageConversations,
	privateMessages,
	insertPrivateMessageConversationSchema,
	insertPrivateMessageSchema,
} from "./shared/schema";
import type {
	PrivateMessageConversation,
	InsertPrivateMessageConversation,
	PrivateMessage,
	InsertPrivateMessage,
} from "./shared/schema";

/**
 * 私信管理器
 */
export class PrivateMessageManager {
	/**
	 * 获取或创建对话
	 */
	async getOrCreateConversation(user1Id: string, user2Id: string): Promise<PrivateMessageConversation> {
		const db = await getDb();

		// 确保user1Id < user2Id，确保唯一性
		const [smallerId, largerId] = user1Id < user2Id
			? [user1Id, user2Id]
			: [user2Id, user1Id];

		// 尝试查找已有对话
		const [existingConversation] = await db
			.select()
			.from(privateMessageConversations)
			.where(
				and(
					eq(privateMessageConversations.user1Id, smallerId),
					eq(privateMessageConversations.user2Id, largerId),
					or(
						eq(privateMessageConversations.user1Deleted, false),
						eq(privateMessageConversations.user2Deleted, false)
					)
				)
			)
			.limit(1);

		if (existingConversation) {
			return existingConversation;
		}

		// 创建新对话
		const [newConversation] = await db
			.insert(privateMessageConversations)
			.values({
				user1Id: smallerId,
				user2Id: largerId,
			})
			.returning();

		return newConversation;
	}

	/**
	 * 发送私信
	 */
	async sendMessage(data: InsertPrivateMessage): Promise<PrivateMessage> {
		const db = await getDb();

		const [message] = await db
			.insert(privateMessages)
			.values({
				...data,
				isRead: false,
			})
			.returning();

		// 更新对话的最后消息信息
		const [user1, user2] = data.senderId < data.receiverId
			? [data.senderId, data.receiverId]
			: [data.receiverId, data.senderId];

		await db
			.update(privateMessageConversations)
			.set({
				lastMessageId: message.id,
				lastMessageAt: message.createdAt,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(privateMessageConversations.id, data.conversationId));

		// 增加接收者的未读消息数
		if (user1 === data.receiverId) {
			await db
				.update(privateMessageConversations)
				.set({
					user1UnreadCount: sql`${privateMessageConversations.user1UnreadCount} + 1`,
				})
				.where(eq(privateMessageConversations.id, data.conversationId));
		} else {
			await db
				.update(privateMessageConversations)
				.set({
					user2UnreadCount: sql`${privateMessageConversations.user2UnreadCount} + 1`,
				})
				.where(eq(privateMessageConversations.id, data.conversationId));
		}

		return message;
	}

	/**
	 * 标记消息为已读
	 */
	async markAsRead(messageId: string, userId: string): Promise<void> {
		const db = await getDb();

		const [message] = await db
			.select()
			.from(privateMessages)
			.where(eq(privateMessages.id, messageId))
			.limit(1);

		if (!message || message.receiverId !== userId) {
			throw new Error('消息不存在或无权操作');
		}

		if (message.isRead) {
			return; // 已经是已读状态
		}

		// 标记消息为已读
		await db
			.update(privateMessages)
			.set({
				isRead: true,
				readAt: new Date().toISOString(),
			})
			.where(eq(privateMessages.id, messageId));

		// 减少对话的未读消息数
		const [user1, user2] = message.senderId < message.receiverId
			? [message.senderId, message.receiverId]
			: [message.receiverId, message.senderId];

		if (user1 === userId) {
			await db
				.update(privateMessageConversations)
				.set({
					user1UnreadCount: sql`GREATEST(${privateMessageConversations.user1UnreadCount} - 1, 0)`,
				})
				.where(eq(privateMessageConversations.id, message.conversationId));
		} else {
			await db
				.update(privateMessageConversations)
				.set({
					user2UnreadCount: sql`GREATEST(${privateMessageConversations.user2UnreadCount} - 1, 0)`,
				})
				.where(eq(privateMessageConversations.id, message.conversationId));
		}
	}

	/**
	 * 标记对话中的所有消息为已读
	 */
	async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
		const db = await getDb();

		// 获取对话信息
		const [conversation] = await db
			.select()
			.from(privateMessageConversations)
			.where(eq(privateMessageConversations.id, conversationId))
			.limit(1);

		if (!conversation) {
			throw new Error('对话不存在');
		}

		// 确定用户在对话中的角色
		const isUser1 = conversation.user1Id === userId;
		const isUser2 = conversation.user2Id === userId;

		if (!isUser1 && !isUser2) {
			throw new Error('无权访问此对话');
		}

		// 标记所有未读消息为已读
		const unreadCondition = and(
			eq(privateMessages.conversationId, conversationId),
			eq(privateMessages.receiverId, userId),
			eq(privateMessages.isRead, false)
		);

		await db
			.update(privateMessages)
			.set({
				isRead: true,
				readAt: new Date().toISOString(),
			})
			.where(unreadCondition);

		// 重置用户的未读消息数
		if (isUser1) {
			await db
				.update(privateMessageConversations)
				.set({
					user1UnreadCount: 0,
				})
				.where(eq(privateMessageConversations.id, conversationId));
		} else {
			await db
				.update(privateMessageConversations)
				.set({
					user2UnreadCount: 0,
				})
				.where(eq(privateMessageConversations.id, conversationId));
		}
	}

	/**
	 * 获取用户的对话列表
	 */
	async getUserConversations(userId: string, options: {
		skip?: number;
		limit?: number;
	} = {}): Promise<PrivateMessageConversation[]> {
		const { skip = 0, limit = 20 } = options;
		const db = await getDb();

		return db
			.select()
			.from(privateMessageConversations)
			.where(
				and(
					or(
						eq(privateMessageConversations.user1Id, userId),
						eq(privateMessageConversations.user2Id, userId)
					),
					or(
						and(
							eq(privateMessageConversations.user1Id, userId),
							eq(privateMessageConversations.user1Deleted, false)
						),
						and(
							eq(privateMessageConversations.user2Id, userId),
							eq(privateMessageConversations.user2Deleted, false)
						)
					)
				)
			)
			.orderBy(desc(privateMessageConversations.lastMessageAt))
			.limit(limit)
			.offset(skip);
	}

	/**
	 * 获取对话的消息列表
	 */
	async getConversationMessages(conversationId: string, userId: string, options: {
		skip?: number;
		limit?: number;
	} = {}): Promise<PrivateMessage[]> {
		const { skip = 0, limit = 50 } = options;
		const db = await getDb();

		// 验证用户是否有权访问对话
		const [conversation] = await db
			.select()
			.from(privateMessageConversations)
			.where(eq(privateMessageConversations.id, conversationId))
			.limit(1);

		if (!conversation) {
			throw new Error('对话不存在');
		}

		const isUser1 = conversation.user1Id === userId;
		const isUser2 = conversation.user2Id === userId;

		if (!isUser1 && !isUser2) {
			throw new Error('无权访问此对话');
		}

		// 获取消息（排除已删除的消息）
		const deleteCondition = or(
			and(
				eq(privateMessages.senderId, userId),
				eq(privateMessages.senderDeleted, false)
			),
			and(
				eq(privateMessages.receiverId, userId),
				eq(privateMessages.receiverDeleted, false)
			)
		);

		return db
			.select()
			.from(privateMessages)
			.where(
				and(
					eq(privateMessages.conversationId, conversationId),
					deleteCondition
				)
			)
			.orderBy(desc(privateMessages.createdAt))
			.limit(limit)
			.offset(skip);
	}

	/**
	 * 删除消息（软删除）
	 */
	async deleteMessage(messageId: string, userId: string): Promise<void> {
		const db = await getDb();

		const [message] = await db
			.select()
			.from(privateMessages)
			.where(eq(privateMessages.id, messageId))
			.limit(1);

		if (!message) {
			throw new Error('消息不存在');
		}

		// 确定用户的角色
		if (message.senderId === userId) {
			await db
				.update(privateMessages)
				.set({
					senderDeleted: true,
				})
				.where(eq(privateMessages.id, messageId));
		} else if (message.receiverId === userId) {
			await db
				.update(privateMessages)
				.set({
					receiverDeleted: true,
				})
				.where(eq(privateMessages.id, messageId));
		} else {
			throw new Error('无权操作此消息');
		}
	}

	/**
	 * 删除对话（软删除）
	 */
	async deleteConversation(conversationId: string, userId: string): Promise<void> {
		const db = await getDb();

		const [conversation] = await db
			.select()
			.from(privateMessageConversations)
			.where(eq(privateMessageConversations.id, conversationId))
			.limit(1);

		if (!conversation) {
			throw new Error('对话不存在');
		}

		const isUser1 = conversation.user1Id === userId;
		const isUser2 = conversation.user2Id === userId;

		if (!isUser1 && !isUser2) {
			throw new Error('无权访问此对话');
		}

		// 标记对话为已删除
		if (isUser1) {
			await db
				.update(privateMessageConversations)
				.set({
					user1Deleted: true,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(privateMessageConversations.id, conversationId));
		} else {
			await db
				.update(privateMessageConversations)
				.set({
					user2Deleted: true,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(privateMessageConversations.id, conversationId));
		}
	}

	/**
	 * 获取未读消息数量
	 */
	async getUnreadCount(userId: string): Promise<number> {
		const db = await getDb();

		// 获取用户的所有对话
		const conversations = await db
			.select()
			.from(privateMessageConversations)
			.where(
				and(
					or(
						eq(privateMessageConversations.user1Id, userId),
						eq(privateMessageConversations.user2Id, userId)
					),
					or(
						and(
							eq(privateMessageConversations.user1Id, userId),
							eq(privateMessageConversations.user1Deleted, false)
						),
						and(
							eq(privateMessageConversations.user2Id, userId),
							eq(privateMessageConversations.user2Deleted, false)
						)
					)
				)
			);

		// 计算总未读数
		let totalUnread = 0;
		for (const conv of conversations) {
			if (conv.user1Id === userId) {
				totalUnread += conv.user1UnreadCount;
			} else {
				totalUnread += conv.user2UnreadCount;
			}
		}

		return totalUnread;
	}

	/**
	 * 搜索对话
	 */
	async searchConversations(userId: string, query: string, options: {
		skip?: number;
		limit?: number;
	} = {}): Promise<PrivateMessageConversation[]> {
		const { skip = 0, limit = 20 } = options;
		const db = await getDb();

		// 搜索与该用户相关的对话
		// 这里需要联查用户表来搜索用户名，暂时简化处理
		return db
			.select()
			.from(privateMessageConversations)
			.where(
				and(
					or(
						eq(privateMessageConversations.user1Id, userId),
						eq(privateMessageConversations.user2Id, userId)
					),
					or(
						and(
							eq(privateMessageConversations.user1Id, userId),
							eq(privateMessageConversations.user1Deleted, false)
						),
						and(
							eq(privateMessageConversations.user2Id, userId),
							eq(privateMessageConversations.user2Deleted, false)
						)
					)
				)
			)
			.orderBy(desc(privateMessageConversations.lastMessageAt))
			.limit(limit)
			.offset(skip);
	}
}

export const privateMessageManager = new PrivateMessageManager();
