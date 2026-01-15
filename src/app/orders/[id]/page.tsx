'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import Textarea from '@/components/ui/textarea';
import {
	ArrowLeft,
	RefreshCw,
	CheckCircle,
	XCircle,
	Clock,
	CreditCard,
	AlertCircle,
	FileText,
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
	transactionId?: string;
	proofUrl?: string;
	proofType?: string;
	reviewStatus?: string;
	reviewNotes?: string;
	paidAt?: string;
	expiresAt?: string;
	createdAt: string;
	metadata?: Record<string, any>;
}

export default function OrderDetailPage() {
	const params = useParams();
	const router = useRouter();
	const orderId = params.id as string;

	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<any>(null);

	useEffect(() => {
		fetchUser();
		fetchOrder();
	}, [orderId]);

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

	const fetchOrder = async () => {
		setLoading(true);
		try {
			const response = await fetch(`/api/orders/${orderId}`);
			const data = await response.json();

			if (data.success) {
				setOrder(data.data.order);
			} else {
				alert(data.error || '获取订单失败');
				router.push('/orders');
			}
		} catch (error) {
			console.error('获取订单失败:', error);
			router.push('/orders');
		} finally {
			setLoading(false);
		}
	};

	const handleRequestRefund = async () => {
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
				fetchOrder();
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

	if (!order) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-gray-500">订单不存在</div>
			</div>
		);
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

	const status = statusConfig[order.paymentStatus] || statusConfig.FAILED;
	const StatusIcon = status.icon;

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			{/* 顶部导航栏 */}
			<div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className="flex items-center gap-3">
						<Button variant="ghost" onClick={() => router.back()}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							返回
						</Button>
						<h1 className="text-xl font-bold">订单详情</h1>
					</div>
				</div>
			</div>

			{/* 主要内容区 */}
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* 订单状态卡片 */}
				<Card className="mb-6">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Badge className={`${status.color} text-white px-4 py-2`}>
									<StatusIcon className="h-4 w-4 mr-2" />
									{status.label}
								</Badge>
								<span className="text-sm text-gray-500">{order.orderNumber}</span>
							</div>
							<div className="text-right">
								<div className="text-3xl font-bold text-[#FF4757]">¥{order.amount}</div>
							</div>
						</div>
					</CardHeader>
				</Card>

				<div className="grid gap-6 md:grid-cols-2">
					{/* 订单信息 */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CreditCard className="h-5 w-5 text-[#FF4757]" />
								订单信息
							</CardTitle>
						</CardHeader>
						<CardBody className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<div className="text-sm text-gray-500">订单号</div>
									<div className="font-medium">{order.orderNumber}</div>
								</div>
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
									<div className="text-sm text-gray-500">创建时间</div>
									<div className="font-medium">
										{new Date(order.createdAt).toLocaleString('zh-CN')}
									</div>
								</div>
								{order.paidAt && (
									<div>
										<div className="text-sm text-gray-500">支付时间</div>
										<div className="font-medium">
											{new Date(order.paidAt).toLocaleString('zh-CN')}
										</div>
									</div>
								)}
								{order.expiresAt && (
									<div>
										<div className="text-sm text-gray-500">订单过期时间</div>
										<div className="font-medium">
											{new Date(order.expiresAt).toLocaleString('zh-CN')}
										</div>
									</div>
								)}
								{order.transactionId && (
									<div>
										<div className="text-sm text-gray-500">交易ID</div>
										<div className="font-medium text-sm">{order.transactionId}</div>
									</div>
								)}
							</div>
						</CardBody>
					</Card>

					{/* 审核信息 */}
					{(order.paymentStatus === 'PENDING_REVIEW' ||
						order.reviewStatus ||
						order.reviewNotes) && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<AlertCircle className="h-5 w-5 text-[#FF4757]" />
									审核信息
								</CardTitle>
							</CardHeader>
							<CardBody className="space-y-4">
								{order.reviewStatus && (
									<div>
										<div className="text-sm text-gray-500">审核状态</div>
										<Badge variant="secondary">{order.reviewStatus}</Badge>
									</div>
								)}
								{order.reviewNotes && (
									<div>
										<div className="text-sm text-gray-500">审核备注</div>
										<p className="text-gray-800 dark:text-gray-200 mt-1">
											{order.reviewNotes}
										</p>
									</div>
								)}
							</CardBody>
						</Card>
					)}

					{/* 支付凭证 */}
					{order.proofUrl && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5 text-[#FF4757]" />
									支付凭证
								</CardTitle>
							</CardHeader>
							<CardBody>
								<a
									href={order.proofUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-[#FF4757] hover:underline"
								>
									查看支付凭证
								</a>
							</CardBody>
						</Card>
					)}
				</div>

				{/* 操作按钮 */}
				<Card className="mt-6">
					<CardHeader>
						<CardTitle>操作</CardTitle>
					</CardHeader>
					<CardBody>
						<div className="flex flex-wrap gap-3">
							{order.paymentStatus === 'PAID' && (
								<Button
									onClick={handleRequestRefund}
									variant="secondary"
									className="border-orange-500 text-orange-500 hover:bg-orange-50"
								>
									<RefreshCw className="h-4 w-4 mr-2" />
									申请退款
								</Button>
							)}
							{(order.paymentStatus === 'PENDING' ||
								order.paymentStatus === 'PENDING_REVIEW') && (
								<Button
									onClick={() => router.push(`/payment/${order.id}`)}
									className="bg-[#FF4757] hover:bg-[#FF6B81]"
								>
									<CreditCard className="h-4 w-4 mr-2" />
									上传支付凭证
								</Button>
							)}
						</div>
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
