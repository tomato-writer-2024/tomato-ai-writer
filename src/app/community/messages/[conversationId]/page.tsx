'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Message {
	id: string;
	conversationId: string;
	senderId: string;
	receiverId: string;
	content: string;
	isRead: boolean;
	readAt: string | null;
	senderDeleted: boolean;
	receiverDeleted: boolean;
	createdAt: string;
	sender?: {
		id: string;
		username: string | null;
		email: string;
		avatarUrl: string | null;
	};
	receiver?: {
		id: string;
		username: string | null;
		email: string;
		avatarUrl: string | null;
	};
}

interface Conversation {
	id: string;
	user1Id: string;
	user2Id: string;
	otherUser: {
		id: string;
		username: string | null;
		email: string;
		avatarUrl: string | null;
	};
	unreadCount: number;
	lastMessageAt: string | null;
}

export default function ConversationDetailPage() {
	const router = useRouter();
	const params = useParams();
	const conversationId = params.conversationId as string;

	const [messages, setMessages] = useState<Message[]>([]);
	const [conversation, setConversation] = useState<Conversation | null>(null);
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [newMessage, setNewMessage] = useState('');
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
			return;
		}

		fetchConversation();
		fetchMessages();
	}, [conversationId]);

	// 自动滚动到底部
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const fetchConversation = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`/api/community/messages/conversations`, {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (data.success) {
				const conv = data.data.find((c: Conversation) => c.id === conversationId);
				if (conv) {
					setConversation(conv);
					// 如果有未读消息，标记为已读
					if (conv.unreadCount > 0) {
						await markConversationAsRead();
					}
				}
			}
		} catch (error) {
			console.error('获取对话信息失败:', error);
		}
	};

	const fetchMessages = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`/api/community/messages/conversations/${conversationId}/messages`, {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (data.success) {
				setMessages(data.data);
			}
		} catch (error) {
			console.error('获取消息列表失败:', error);
		} finally {
			setLoading(false);
		}
	};

	const markConversationAsRead = async () => {
		try {
			const token = localStorage.getItem('token');
			await fetch(`/api/community/messages/conversations/${conversationId}/read-all`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});
		} catch (error) {
			console.error('标记对话已读失败:', error);
		}
	};

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!newMessage.trim()) {
			return;
		}

		setSending(true);

		try {
			const token = localStorage.getItem('token');
			const response = await fetch('/api/community/messages/send', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({
					receiverId: conversation?.otherUser.id,
					content: newMessage.trim(),
				}),
			});

			const data = await response.json();

			if (data.success) {
				setNewMessage('');
				// 刷新消息列表
				await fetchMessages();
				// 刷新对话列表
				fetchConversation();
			} else {
				alert(data.error || '发送失败');
			}
		} catch (error) {
			alert('发送失败：' + error);
		} finally {
			setSending(false);
		}
	};

	const handleDeleteMessage = async (messageId: string) => {
		if (!confirm('确定要删除此消息吗？')) {
			return;
		}

		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`/api/community/messages/${messageId}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (data.success) {
				// 刷新消息列表
				await fetchMessages();
			} else {
				alert(data.error || '删除失败');
			}
		} catch (error) {
			alert('删除失败：' + error);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
				<div className="text-white text-xl">加载中...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
			{/* 顶部导航栏 */}
			<nav className="bg-slate-900/50 backdrop-blur-lg border-b border-white/10 flex-shrink-0">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-8">
							<Link href="/community/messages" className="text-white hover:text-blue-400 transition-colors">
								← 返回
							</Link>
							{conversation?.otherUser && (
								<div className="flex items-center space-x-3">
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
										{conversation.otherUser.username?.[0] || '?'}
									</div>
									<span className="text-white font-medium">
										{conversation.otherUser.username || '未知用户'}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</nav>

			{/* 消息列表 */}
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{messages.length === 0 ? (
						<div className="text-center text-gray-400 py-12">
							暂无消息，开始聊天吧！
						</div>
					) : (
						<div className="space-y-4">
							{messages.map((message) => {
								const isCurrentUser = message.senderId === localStorage.getItem('userId'); // 假设userId存在localStorage中
								return (
									<div
										key={message.id}
										className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
									>
										<div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
											<div
												className={`p-4 rounded-xl ${
													isCurrentUser
														? 'bg-blue-500 text-white'
														: 'bg-white/10 text-white'
												} backdrop-blur-lg`}
											>
												<p className="mb-2 whitespace-pre-wrap">{message.content}</p>
												<div className="flex items-center justify-between text-xs opacity-70">
													<span>{new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
													{isCurrentUser && (
														<button
															onClick={() => handleDeleteMessage(message.id)}
															className="hover:opacity-100 opacity-70 ml-2"
														>
															删除
														</button>
													)}
													{!isCurrentUser && !message.isRead && (
														<span className="text-xs">未读</span>
													)}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* 发送消息输入框 */}
			<div className="bg-slate-900/50 backdrop-blur-lg border-t border-white/10 flex-shrink-0">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<form onSubmit={handleSendMessage} className="flex gap-4">
						<input
							type="text"
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							placeholder="输入消息..."
							maxLength={2000}
							disabled={sending}
							className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
						/>
						<button
							type="submit"
							disabled={sending || !newMessage.trim()}
							className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
						>
							{sending ? '发送中...' : '发送'}
						</button>
					</form>
					<p className="text-gray-400 text-xs mt-2 text-right">
						{newMessage.length} / 2000
					</p>
				</div>
			</div>
		</div>
	);
}
