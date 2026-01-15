'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	ShoppingCart,
	CreditCard,
	RefreshCw,
	CheckCircle,
	XCircle,
	Clock,
	Eye,
	FileText,
	AlertCircle,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface Order {
	id: string;
	orderNumber: string;
	level: string;
	months: number;
	amount: number;
	paymentMethod: string;
	paymentStatus: string;
	paidAt?: string;
	expiresAt?: string;
	createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
	PENDING: { label: '待支付', color: 'bg-yellow-500', icon: Clock },
	PENDING_REVIEW: { label: '待审核', color: 'bg-blue-500', icon: Clock },
	PAID: { label: '已支付', color: 'bg-green-500', icon: CheckCircle },
	REFUNDING: { label: '退款中', color: 'bg-orange-500', icon: RefreshCw },
	REFUNDED: { label: '已退款', color: 'bg-gray-500', icon: XCircle },
	CANCELLED: { label: '已取消', color: 'bg-red-500', icon: XCircle },
	FAILED: { label: '失败', color: 'bg-red-600', icon: XCircle },
};

export default function OrdersPage() {
	const router = useRouter();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('all');
	const [user, setUser] = useState<any>(null);

	useEffect(() => {
		fetchUser();
		fetchOrders();
	}, [activeTab]);

	const fetchUser = async () => {
		try {
			const currentUser = await authClient.getCurrentUser();
			if (!currentUser) {
				router.push('/login');
				return;
			}
			setUser(currentUser);
		} catch (error) {
			router.push('/login');
		}
	};

	const fetchOrders = async () => {
		setLoading(true);
		try {
			let endpoint = '/api/orders';
			const params = new URLSearchParams();

			if (activeTab !== 'all') {
				params.append('status', activeTab);
			}

			if (params.toString()) {
				endpoint += `?${params.toString()}`;
			}

			const response = await fetch(endpoint);
			const data = await response.json();

			if (data.success) {
				setOrders(data.data.orders);
			}
		} catch (error) {
			console.error('获取订单失败:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleCancelOrder = async (orderId: string) => {
		if (!confirm('确定取消这个订单吗？')) {
			return;
		}

		try {
			const response = await fetch(`/api/orders/${orderId}/cancel`, {
				method: 'POST',
			});

			const data = await response.json();
			if (data.success) {
				alert('订单已取消');
				fetchOrders();
			} else {
				alert(data.error || '取消失败');
			}
		} catch (error) {
			console.error('取消订单失败:', error);
			alert('取消失败，请重试');
		}
	};

	const handleRequestRefund = async (orderId: string) => {
		const reason = prompt('请输入退款原因：');
		if (!reason?.trim()) {
			alert('请输入退款原因');
			return;
		}

		try {
			const response = await fetch(`/api/orders/${orderId}/refund`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reason }),
			});

			const data = await response.json();
			if (data.success) {
				alert('退款申请已提交，请等待审核');
				fetchOrders();
			} else {
				alert(data.error || '申请失败');
			}
		} catch (error) {
			console.error('申请退款失败:', error);
			alert('申请失败，请重试');
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-gray-500">加载中...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			{/* 顶部导航栏 */}
			<div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-6xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<ShoppingCart className="h-8 w-8 text-[#FF4757]" />
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">我的订单</h1>
						</div>
						<Link href="/pricing">
							<Button className="bg-[#FF4757] hover:bg-[#FF6B81]">
								<CreditCard className="h-4 w-4 mr-2" />
								购买会员
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{/* 主要内容区 */}
			<div className="max-w-6xl mx-auto px-4 py-8">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
						<TabsTrigger value="all">全部</TabsTrigger>
						<TabsTrigger value="PENDING">待支付</TabsTrigger>
						<TabsTrigger value="PENDING_REVIEW">待审核</TabsTrigger>
						<TabsTrigger value="PAID">已支付</TabsTrigger>
						<TabsTrigger value="REFUNDING">退款中</TabsTrigger>
						<TabsTrigger value="REFUNDED">已退款</TabsTrigger>
						<TabsTrigger value="CANCELLED">已取消</TabsTrigger>
						<TabsTrigger value="FAILED">失败</TabsTrigger>
					</TabsList>

					<TabsContent value={activeTab} className="mt-6">
						{orders.length === 0 ? (
							<Card>
								<CardBody className="flex flex-col items-center justify-center py-16">
									<ShoppingCart className="h-16 w-16 mb-4 text-gray-300" />
									<p className="text-gray-500 text-lg mb-4">暂无订单</p>
									<Link href="/pricing">
										<Button className="bg-[#FF4757] hover:bg-[#FF6B81]">
											购买会员
										</Button>
									</Link>
								</CardBody>
							</Card>
						) : (
							<div className="space-y-4">
								{orders.map((order) => {
									const status = statusConfig[order.paymentStatus] || statusConfig.FAILED;
									const StatusIcon = status.icon;

									return (
										<Card key={order.id} className="hover:shadow-lg transition-shadow">
											<CardHeader>
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<div className="flex items-center gap-3 mb-2">
															<Badge className={`${status.color} text-white`}>
																<StatusIcon className="h-3 w-3 mr-1" />
																{status.label}
															</Badge>
															<span className="text-sm text-gray-500">
																订单号: {order.orderNumber}
															</span>
														</div>
														<CardTitle className="text-lg">
															{order.level}会员 - {order.months}个月
														</CardTitle>
													</div>
													<div className="text-right">
														<div className="text-2xl font-bold text-[#FF4757]">
															¥{order.amount}
														</div>
														<div className="text-sm text-gray-500">
															{new Date(order.createdAt).toLocaleDateString('zh-CN')}
														</div>
													</div>
												</div>
											</CardHeader>
											<CardBody>
												<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
													<div>
														<div className="text-sm text-gray-500">套餐类型</div>
														<div className="font-medium">{order.level}</div>
													</div>
													<div>
														<div className="text-sm text-gray-500">购买时长</div>
														<div className="font-medium">{order.months}个月</div>
													</div>
													<div>
														<div className="text-sm text-gray-500">支付方式</div>
														<div className="font-medium">{order.paymentMethod}</div>
													</div>
													<div>
														<div className="text-sm text-gray-500">
															{order.paidAt ? '支付时间' : '创建时间'}
														</div>
														<div className="font-medium">
															{order.paidAt
																? new Date(order.paidAt).toLocaleString('zh-CN')
																: new Date(order.createdAt).toLocaleString('zh-CN')}
														</div>
													</div>
												</div>

												<div className="flex gap-2">
													<Link href={`/orders/${order.id}`}>
														<Button variant="secondary" size="sm">
															<Eye className="h-4 w-4 mr-1" />
															查看详情
														</Button>
													</Link>
													{(order.paymentStatus === 'PENDING' ||
														order.paymentStatus === 'PENDING_REVIEW') && (
														<Button
															variant="secondary"
															size="sm"
															onClick={() => handleCancelOrder(order.id)}
														>
															<XCircle className="h-4 w-4 mr-1" />
															取消订单
														</Button>
													)}
													{order.paymentStatus === 'PAID' && (
														<Button
															variant="secondary"
															size="sm"
															onClick={() => handleRequestRefund(order.id)}
														>
															<RefreshCw className="h-4 w-4 mr-1" />
															申请退款
														</Button>
													)}
													{(order.paymentStatus === 'PENDING_REVIEW' ||
														order.paymentStatus === 'PENDING') && (
														<Link href={`/payment/${order.id}`}>
															<Button
																size="sm"
																className="bg-[#FF4757] hover:bg-[#FF6B81]"
															>
																<CreditCard className="h-4 w-4 mr-1" />
																上传凭证
															</Button>
														</Link>
													)}
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
