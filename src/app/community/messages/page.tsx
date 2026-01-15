'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Conversation {
	id: string;
	user1Id: string;
	user2Id: string;
	lastMessageId: string | null;
	lastMessageAt: string | null;
	user1UnreadCount: number;
	user2UnreadCount: number;
	user1Deleted: boolean;
	user2Deleted: boolean;
	otherUser: {
		id: string;
		username: string | null;
		email: string;
		avatarUrl: string | null;
	} | null;
	unreadCount: number;
	createdAt: string;
	updatedAt: string;
}

export default function MessagesPage() {
	const router = useRouter();
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [totalUnread, setTotalUnread] = useState(0);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			router.push('/login');
			return;
		}

		fetchConversations();
		fetchUnreadCount();
	}, [router]);

	const fetchConversations = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('/api/community/messages/conversations', {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (data.success) {
				setConversations(data.data);
			}
		} catch (error) {
			console.error('获取对话列表失败:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchUnreadCount = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('/api/community/messages/unread', {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (data.success) {
				setTotalUnread(data.data.unreadCount);
			}
		} catch (error) {
			console.error('获取未读数量失败:', error);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: 实现搜索功能
		alert('搜索功能开发中');
	};

	const handleDeleteConversation = async (conversationId: string) => {
		if (!confirm('确定要删除此对话吗？')) {
			return;
		}

		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`/api/community/messages/conversations/${conversationId}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (data.success) {
				alert('对话已删除');
				fetchConversations();
				fetchUnreadCount();
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
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
			{/* 顶部导航栏 */}
			<nav className="bg-slate-900/50 backdrop-blur-lg border-b border-white/10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-8">
							<Link href="/community" className="text-white hover:text-blue-400 transition-colors">
								← 返回社区
							</Link>
							<span className="text-white font-medium">我的私信</span>
							{totalUnread > 0 && (
								<span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
									{totalUnread} 条未读
								</span>
							)}
						</div>
					</div>
				</div>
			</nav>

			{/* 主内容区 */}
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* 搜索框 */}
				<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
					<form onSubmit={handleSearch} className="flex gap-4">
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="搜索对话..."
							className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button
							type="submit"
							className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
						>
							搜索
						</button>
					</form>
				</div>

				{/* 对话列表 */}
				<div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
					{conversations.length === 0 ? (
						<div className="p-12 text-center text-gray-400">
							暂无私信
						</div>
					) : (
						<div className="divide-y divide-white/10">
							{conversations.map((conversation) => (
								<div
									key={conversation.id}
									className="p-6 hover:bg-white/5 transition-colors cursor-pointer"
									onClick={() => router.push(`/community/messages/${conversation.id}`)}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-4 flex-1 min-w-0">
											{/* 头像 */}
											<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
												{conversation.otherUser?.username?.[0] || '?'}
											</div>

											<div className="flex-1 min-w-0">
												{/* 用户名 */}
												<div className="flex items-center space-x-2 mb-1">
													<h3 className="text-white font-medium truncate">
														{conversation.otherUser?.username || '未知用户'}
													</h3>
													{conversation.unreadCount > 0 && (
														<span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
															{conversation.unreadCount}
														</span>
													)}
												</div>

												{/* 邮箱 */}
												<p className="text-gray-400 text-sm truncate">
													{conversation.otherUser?.email || ''}
												</p>

												{/* 最后消息时间 */}
												{conversation.lastMessageAt && (
													<p className="text-gray-500 text-xs mt-1">
														最后消息：{new Date(conversation.lastMessageAt).toLocaleDateString('zh-CN')} {new Date(conversation.lastMessageAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
													</p>
												)}
											</div>
										</div>

										{/* 删除按钮 */}
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteConversation(conversation.id);
											}}
											className="text-red-400 hover:text-red-300 transition-colors px-3 py-1 text-sm"
										>
											删除
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
