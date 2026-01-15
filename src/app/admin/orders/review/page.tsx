'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
	ArrowLeft,
	CheckCircle,
	XCircle,
	Clock,
	Eye,
	RefreshCw,
	FileText,
	Search,
	Filter,
	Download,
} from 'lucide-react';

interface Order {
	id: string;
	orderNumber: string;
	userId: string;
	user?: {
		id: string;
		email: string;
		username: string;
	};
	level: string;
	months: number;
	amount: number;
	paymentMethod: string;
	paymentStatus: string;
	proofUrl?: string;
	proofType?: string;
	reviewStatus?: string;
	reviewNotes?: string;
	createdAt: string;
	expiresAt?: string;
}

export default function AdminOrderReviewPage() {
	const router = useRouter();
	const [orders, setOrders] = useState<Order[]>([]);
	const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('pending_review');
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		fetchOrders();
	}, [activeTab, searchQuery]);

	const fetchOrders = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (activeTab === 'pending_review') {
				params.append('paymentStatus', 'PENDING_REVIEW');
			}
			if (searchQuery) {
				params.append('search', searchQuery);
			}

			const response = await fetch(`/api/admin/orders?${params.toString()}`);
			const data = await response.json();

			if (data.success) {
				setOrders(data.data.orders || []);
			}
		} catch (error) {
			console.error('获取订单失败:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedOrders(orders.map(o => o.id));
		} else {
			setSelectedOrders([]);
		}
	};

	const handleSelectOrder = (orderId: string, checked: boolean) => {
		if (checked) {
			setSelectedOrders([...selectedOrders, orderId]);
		} else {
			setSelectedOrders(selectedOrders.filter(id => id !== orderId));
		}
	};

	const handleApprove = async (orderId: string) => {
		try {
			const notes = prompt('请输入审核备注（可选）：');
			const response = await fetch(`/api/admin/orders/${orderId}/review`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					status: 'approved',
					notes: notes || undefined,
				}),
			});

			const data = await response.json();
			if (data.success) {
				alert('审核通过');
				fetchOrders();
			} else {
				alert(data.error || '审核失败');
			}
		} catch (error) {
			console.error('审核失败:', error);
			alert('审核失败，请重试');
		}
	};

	const handleReject = async (orderId: string) => {
		try {
			const notes = prompt('请输入驳回原因（必填）：');
			if (!notes?.trim()) {
				alert('请输入驳回原因');
				return;
			}

			const response = await fetch(`/api/admin/orders/${orderId}/review`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					status: 'rejected',
					notes,
				}),
			});

			const data = await response.json();
			if (data.success) {
				alert('已驳回');
				fetchOrders();
			} else {
				alert(data.error || '驳回失败');
			}
		} catch (error) {
			console.error('驳回失败:', error);
			alert('驳回失败，请重试');
		}
	};

	const handleBatchApprove = async () => {
		if (selectedOrders.length === 0) {
			alert('请先选择要审核的订单');
			return;
		}

		if (!confirm(`确定批量通过 ${selectedOrders.length} 个订单吗？`)) {
			return;
		}

		try {
			const response = await fetch('/api/admin/orders/batch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					orderIds: selectedOrders,
					status: 'approved',
				}),
			});

			const data = await response.json();
			if (data.success) {
				alert(`已批量通过 ${data.data.approvedCount} 个订单`);
				setSelectedOrders([]);
				fetchOrders();
			} else {
				alert(data.error || '批量审核失败');
			}
		} catch (error) {
			console.error('批量审核失败:', error);
			alert('批量审核失败，请重试');
		}
	};

	const handleBatchReject = async () => {
		if (selectedOrders.length === 0) {
			alert('请先选择要审核的订单');
			return;
		}

		const notes = prompt('请输入驳回原因（必填）：');
		if (!notes?.trim()) {
			alert('请输入驳回原因');
			return;
		}

		if (!confirm(`确定批量驳回 ${selectedOrders.length} 个订单吗？`)) {
			return;
		}

		try {
			const response = await fetch('/api/admin/orders/batch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					orderIds: selectedOrders,
					status: 'rejected',
					notes,
				}),
			});

			const data = await response.json();
			if (data.success) {
				alert(`已批量驳回 ${data.data.rejectedCount} 个订单`);
				setSelectedOrders([]);
				fetchOrders();
			} else {
				alert(data.error || '批量驳回失败');
			}
		} catch (error) {
			console.error('批量驳回失败:', error);
			alert('批量驳回失败，请重试');
		}
	};

	const handleProcessRefund = async (orderId: string) => {
		try {
			if (!confirm('确定处理此退款吗？')) {
				return;
			}

			const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
				method: 'POST',
			});

			const data = await response.json();
			if (data.success) {
				alert('退款已处理');
				fetchOrders();
			} else {
				alert(data.error || '处理失败');
			}
		} catch (error) {
			console.error('处理退款失败:', error);
			alert('处理失败，请重试');
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			{/* 顶部导航栏 */}
			<div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Button variant="ghost" onClick={() => router.back()}>
								<ArrowLeft className="h-4 w-4 mr-2" />
								返回
							</Button>
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
								订单审核
							</h1>
						</div>
						{selectedOrders.length > 0 && (
							<div className="flex items-center gap-2">
								<Button onClick={handleBatchApprove} className="bg-green-500 hover:bg-green-600">
									<CheckCircle className="h-4 w-4 mr-2" />
									批量通过 ({selectedOrders.length})
								</Button>
								<Button onClick={handleBatchReject} variant="danger">
									<XCircle className="h-4 w-4 mr-2" />
									批量驳回
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* 主要内容区 */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* 搜索栏 */}
				<div className="mb-6 flex gap-4">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
						<Input
							placeholder="搜索订单号、用户邮箱、用户名..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<TabsTrigger value="pending_review" className="flex items-center gap-2">
							<Clock className="h-4 w-4" />
							待审核
						</TabsTrigger>
						<TabsTrigger value="approved" className="flex items-center gap-2">
							<CheckCircle className="h-4 w-4" />
							已通过
						</TabsTrigger>
						<TabsTrigger value="rejected" className="flex items-center gap-2">
							<XCircle className="h-4 w-4" />
							已驳回
						</TabsTrigger>
						<TabsTrigger value="all" className="flex items-center gap-2">
							<Filter className="h-4 w-4" />
							全部
						</TabsTrigger>
					</TabsList>

					<TabsContent value={activeTab} className="mt-6">
						{loading ? (
							<div className="flex items-center justify-center py-12">
								<div className="text-gray-500">加载中...</div>
							</div>
						) : orders.length === 0 ? (
							<Card>
								<CardBody className="flex flex-col items-center justify-center py-16">
									<FileText className="h-16 w-16 mb-4 text-gray-300" />
									<p className="text-gray-500 text-lg">暂无订单</p>
								</CardBody>
							</Card>
						) : (
							<div className="space-y-4">
								{/* 批量选择栏 */}
								{activeTab === 'pending_review' && (
									<div className="flex items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg border">
										<Checkbox
											checked={selectedOrders.length === orders.length && orders.length > 0}
											onCheckedChange={handleSelectAll}
										/>
										<span className="text-sm font-medium">
											全选 ({selectedOrders.length}/{orders.length})
										</span>
									</div>
								)}

								{orders.map((order) => (
									<Card key={order.id} className="hover:shadow-lg transition-shadow">
										<CardHeader>
											<div className="flex items-start justify-between">
												<div className="flex items-start gap-3 flex-1">
													{activeTab === 'pending_review' && (
														<Checkbox
															checked={selectedOrders.includes(order.id)}
															onCheckedChange={(checked: boolean) =>
																handleSelectOrder(order.id, checked)
															}
														/>
													)}
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-2">
															<span className="font-semibold">{order.orderNumber}</span>
															<Badge variant="secondary">{order.paymentStatus}</Badge>
															{order.reviewStatus && (
																<Badge
																	variant="secondary"
																	className={
																		order.reviewStatus === 'approved'
																			? 'border-green-500 text-green-500'
																			: 'border-red-500 text-red-500'
																	}
																>
																	{order.reviewStatus === 'approved' ? '已通过' : '已驳回'}
																</Badge>
															)}
														</div>
														<div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
															<div>
																用户: {order.user?.username} ({order.user?.email})
															</div>
															<div>
																套餐: {order.level}会员 - {order.months}个月
															</div>
															<div>金额: ¥{order.amount}</div>
															<div>支付方式: {order.paymentMethod}</div>
															<div>
																创建时间:{' '}
																{new Date(order.createdAt).toLocaleString('zh-CN')}
															</div>
														</div>
													</div>
												</div>
												<div className="text-right">
													<div className="text-2xl font-bold text-[#FF4757]">
														¥{order.amount}
													</div>
													{order.expiresAt && (
														<div className="text-sm text-orange-500 mt-1">
															过期:{' '}
															{new Date(order.expiresAt).toLocaleString('zh-CN')}
														</div>
													)}
												</div>
											</div>
										</CardHeader>
										<CardBody>
											<div className="space-y-4">
												{/* 支付凭证 */}
												{order.proofUrl && (
													<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
														<div className="flex items-center gap-2 mb-2">
															<FileText className="h-4 w-4" />
															<span className="font-medium">支付凭证</span>
															<Badge variant="secondary">{order.proofType}</Badge>
														</div>
														<a
															href={order.proofUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="text-[#FF4757] hover:underline"
														>
															查看凭证
														</a>
													</div>
												)}

												{/* 审核备注 */}
												{order.reviewNotes && (
													<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
														<div className="font-medium mb-1">审核备注:</div>
														<p className="text-sm text-gray-600 dark:text-gray-300">
															{order.reviewNotes}
														</p>
													</div>
												)}

												{/* 操作按钮 */}
												<div className="flex flex-wrap gap-2">
													<Link href={`/admin/orders/${order.id}`}>
														<Button variant="secondary" size="sm">
															<Eye className="h-4 w-4 mr-1" />
															详情
														</Button>
													</Link>
													{order.paymentStatus === 'PENDING_REVIEW' && (
														<>
															<Button
																size="sm"
																onClick={() => handleApprove(order.id)}
																className="bg-green-500 hover:bg-green-600"
															>
																<CheckCircle className="h-4 w-4 mr-1" />
																通过
															</Button>
															<Button
																size="sm"
																onClick={() => handleReject(order.id)}
																variant="danger"
															>
																<XCircle className="h-4 w-4 mr-1" />
																驳回
															</Button>
														</>
													)}
													{order.paymentStatus === 'REFUNDING' && (
														<Button
															size="sm"
															onClick={() => handleProcessRefund(order.id)}
															className="bg-orange-500 hover:bg-orange-600"
														>
															<RefreshCw className="h-4 w-4 mr-1" />
															处理退款
														</Button>
													)}
												</div>
											</div>
										</CardBody>
									</Card>
								))}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
