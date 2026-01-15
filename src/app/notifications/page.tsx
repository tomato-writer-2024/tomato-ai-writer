'use client';

import { useState, useEffect } from 'react';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Bell,
	Check,
	CheckCheck,
	Filter,
	Trash2,
	ShoppingCart,
	User,
	Shield,
	MessageSquare,
	ExternalLink,
	X,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface Notification {
	id: string;
	type: 'order' | 'membership' | 'system' | 'community';
	title: string;
	content: string;
	isRead: boolean;
	relatedId?: string;
	metadata?: Record<string, any>;
	createdAt: string;
}

const notificationTypes = [
	{ id: 'all', label: '全部通知', icon: Bell },
	{ id: 'unread', label: '未读', icon: Bell },
	{ id: 'order', label: '订单通知', icon: ShoppingCart },
	{ id: 'membership', label: '会员通知', icon: User },
	{ id: 'system', label: '系统通知', icon: Shield },
	{ id: 'community', label: '社区通知', icon: MessageSquare },
];

const typeIcons: Record<string, any> = {
	order: ShoppingCart,
	membership: User,
	system: Shield,
	community: MessageSquare,
};

export default function NotificationsPage() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('all');
	const [user, setUser] = useState<any>(null);

	useEffect(() => {
		fetchUser();
		fetchNotifications();
	}, [activeTab]);

	const fetchUser = async () => {
		try {
			const currentUser = await authClient.getCurrentUser();
			setUser(currentUser);
		} catch (error) {
			console.error('获取用户信息失败:', error);
		}
	};

	const fetchNotifications = async () => {
		setLoading(true);
		try {
			let endpoint = '/api/notifications';
			const params = new URLSearchParams();

			if (activeTab === 'unread') {
				params.append('unread', 'true');
			} else if (activeTab !== 'all') {
				params.append('type', activeTab);
			}

			if (params.toString()) {
				endpoint += `?${params.toString()}`;
			}

			const response = await fetch(endpoint);
			const data = await response.json();

			if (data.success) {
				setNotifications(data.data.notifications);
			}
		} catch (error) {
			console.error('获取通知失败:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleMarkAsRead = async (notificationId: string) => {
		try {
			const response = await fetch(`/api/notifications/${notificationId}/read`, {
				method: 'POST',
			});

			if (response.ok) {
				setNotifications(notifications.map(n => 
					n.id === notificationId ? { ...n, isRead: true } : n
				));
			}
		} catch (error) {
			console.error('标记已读失败:', error);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			const response = await fetch('/api/notifications/read-all', {
				method: 'POST',
			});

			if (response.ok) {
				setNotifications(notifications.map(n => ({ ...n, isRead: true })));
			}
		} catch (error) {
			console.error('标记全部已读失败:', error);
		}
	};

	const handleDelete = async (notificationId: string) => {
		if (!confirm('确定删除这条通知吗？')) {
			return;
		}

		try {
			const response = await fetch(`/api/notifications/${notificationId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				setNotifications(notifications.filter(n => n.id !== notificationId));
			}
		} catch (error) {
			console.error('删除通知失败:', error);
		}
	};

	const handleClearAll = async () => {
		if (!confirm('确定清空所有通知吗？')) {
			return;
		}

		try {
			const response = await fetch('/api/notifications/clear', {
				method: 'DELETE',
			});

			if (response.ok) {
				setNotifications([]);
			}
		} catch (error) {
			console.error('清空通知失败:', error);
		}
	};

	const getNotificationLink = (notification: Notification) => {
		switch (notification.type) {
			case 'order':
				return notification.relatedId ? `/orders/${notification.relatedId}` : '/orders';
			case 'community':
				return notification.relatedId ? `/community/${notification.relatedId}` : '/community';
			case 'membership':
				return '/profile';
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			{/* 顶部导航栏 */}
			<div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-5xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Bell className="h-8 w-8 text-[#FF4757]" />
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">通知中心</h1>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="secondary"
								size="sm"
								onClick={handleMarkAllAsRead}
								disabled={!notifications.some(n => !n.isRead)}
							>
								<CheckCheck className="h-4 w-4 mr-2" />
								全部已读
							</Button>
							<Button
								variant="secondary"
								size="sm"
								onClick={handleClearAll}
								disabled={notifications.length === 0}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								清空
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* 主要内容区 */}
			<div className="max-w-5xl mx-auto px-4 py-8">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
						{notificationTypes.map((type) => {
							const Icon = type.icon;
							return (
								<TabsTrigger
									key={type.id}
									value={type.id}
									className="flex items-center gap-2"
								>
									<Icon className="h-4 w-4" />
									<span className="hidden md:inline">{type.label}</span>
								</TabsTrigger>
							);
						})}
					</TabsList>

					<TabsContent value={activeTab} className="mt-6">
						{loading ? (
							<div className="flex items-center justify-center py-12">
								<div className="text-gray-500">加载中...</div>
							</div>
						) : notifications.length === 0 ? (
							<Card>
								<CardBody className="flex flex-col items-center justify-center py-16">
									<Bell className="h-16 w-16 mb-4 text-gray-300" />
									<p className="text-gray-500 text-lg">暂无通知</p>
								</CardBody>
							</Card>
						) : (
							<div className="space-y-3">
								{notifications.map((notification) => {
									const Icon = typeIcons[notification.type] || Bell;
									const link = getNotificationLink(notification);

									return (
										<Card
											key={notification.id}
											className={`transition-all duration-200 hover:shadow-md ${
												!notification.isRead ? 'border-l-4 border-l-[#FF4757]' : ''
											}`}
										>
											<CardBody className="p-6">
												<div className="flex items-start gap-4">
													<div
														className={`p-2 rounded-full ${
															!notification.isRead ? 'bg-[#FF4757]' : 'bg-gray-200 dark:bg-gray-700'
														}`}
													>
														<Icon
															className={`h-5 w-5 ${
																!notification.isRead ? 'text-white' : 'text-gray-600 dark:text-gray-300'
															}`}
														/>
													</div>
													<div className="flex-1">
														<div className="flex items-start justify-between mb-2">
															<div className="flex items-center gap-2 flex-wrap">
																<h3 className="font-semibold text-lg">{notification.title}</h3>
																{!notification.isRead && (
																	<Badge className="bg-[#FF4757]">未读</Badge>
																)}
																<Badge variant="secondary">{notificationTypes.find(t => t.id === notification.type)?.label}</Badge>
															</div>
															<div className="flex items-center gap-2">
																{!notification.isRead && (
																	<Button
																		variant="ghost"
																		size="sm"
																		onClick={() => handleMarkAsRead(notification.id)}
																	>
																		<Check className="h-4 w-4" />
																	</Button>
																)}
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => handleDelete(notification.id)}
																>
																	<X className="h-4 w-4" />
																</Button>
															</div>
														</div>
														<p className="text-gray-600 dark:text-gray-300 mb-3">
															{notification.content}
														</p>
														<div className="flex items-center justify-between">
															<p className="text-xs text-gray-500">
																{new Date(notification.createdAt).toLocaleString('zh-CN')}
															</p>
															{link && (
																<a href={link} className="text-[#FF4757] hover:text-[#FF6B81] text-sm font-medium flex items-center">
																	查看详情
																	<ExternalLink className="h-4 w-4 ml-1" />
																</a>
															)}
														</div>
													</div>
												</div>
											</CardBody>
										</Card>
									);
								})}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
