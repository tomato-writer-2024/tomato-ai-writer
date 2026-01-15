'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	CheckCircle,
	Clock,
	XCircle,
	ArrowLeft,
	RefreshCw,
	Download,
	Eye,
	ThumbsUp,
	ThumbsDown,
	X,
	FileImage,
	FileText,
	Loader2,
} from 'lucide-react';
import Button from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { BrandIcons } from '@/lib/brandIcons';

interface Order {
	id: string;
	userId: string;
	level: string;
	months: number;
	amount: number;
	paymentMethod: string;
	paymentStatus: string;
	createdAt: string;
	notes?: string;
}

interface User {
	id: string;
	email: string;
	username?: string;
	membershipLevel: string;
	membershipExpireAt?: string;
}

interface ProofInfo {
	fileName: string;
	fileType: string;
	fileSize: number;
	url: string;
	uploadedAt: string;
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const router = useRouter();
	const [orderId, setOrderId] = useState<string>('');

	// 订单和用户信息
	const [order, setOrder] = useState<Order | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// 支付凭证信息
	const [proofInfo, setProofInfo] = useState<ProofInfo | null>(null);

	// 审核操作
	const [isProcessing, setIsProcessing] = useState(false);
	const [actionType, setActionType] = useState<'approve' | 'reject' | 'refund' | null>(null);
	const [reviewNotes, setReviewNotes] = useState('');
	const [refundAmount, setRefundAmount] = useState('');

	// 凭证预览
	const [showProofModal, setShowProofModal] = useState(false);

	// 解析URL参数
	useEffect(() => {
		const initParams = async () => {
			const { id } = await params;
			setOrderId(id);
		};
		initParams();
	}, [params]);

	// 加载订单详情
	useEffect(() => {
		if (orderId) {
			loadOrderDetail();
		}
	}, [orderId]);

	const loadOrderDetail = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/admin/orders/${orderId}`);
			const result = await response.json();

			if (result.success) {
				setOrder(result.data.order);
				setUser(result.data.user);

				// 解析支付凭证信息
				if (result.data.order.notes) {
					try {
						const notes = JSON.parse(result.data.order.notes);
						if (notes.proof) {
							setProofInfo(notes.proof);
						}
					} catch (e) {
						// 解析失败
					}
				}
			} else {
				setError(result.error || '加载订单详情失败');
			}
		} catch (error) {
			console.error('加载订单详情失败:', error);
			setError('加载订单详情失败');
		} finally {
			setIsLoading(false);
		}
	};

	// 处理订单操作
	const handleOrderAction = async (action: 'approve' | 'reject' | 'refund') => {
		setActionType(action);
		setIsProcessing(true);
		setError(null);

		try {
			const body: any = {
				action,
			};

			if (action === 'reject' || action === 'refund') {
				body.reviewNotes = reviewNotes;
			}

			if (action === 'refund') {
				body.refundAmount = refundAmount ? parseInt(refundAmount) * 100 : undefined;
			}

			const response = await fetch(`/api/admin/orders/${orderId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			const result = await response.json();

			if (result.success) {
				alert(result.data.message);
				// 重新加载订单信息
				await loadOrderDetail();
				// 清空表单
				setReviewNotes('');
				setRefundAmount('');
				setActionType(null);
			} else {
				setError(result.error || '操作失败');
			}
		} catch (error) {
			console.error('订单操作失败:', error);
			setError('订单操作失败，请重试');
		} finally {
			setIsProcessing(false);
		}
	};

	// 格式化金额
	const formatAmount = (amount: number) => {
		return `¥${(amount / 100).toFixed(2)}`;
	};

	// 格式化日期
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// 获取支付方式名称
	const getPaymentMethodName = (method: string) => {
		switch (method) {
			case 'alipay':
				return '支付宝';
			case 'wechat':
				return '微信支付';
			default:
				return method;
		}
	};

	// 获取会员等级名称
	const getLevelName = (level: string) => {
		switch (level) {
			case 'BASIC':
				return '基础版';
			case 'PREMIUM':
				return '高级版';
			case 'ENTERPRISE':
				return '企业版';
			default:
				return level;
		}
	};

	// 获取订单状态配置
	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'PAID':
				return <Badge variant="success" icon={<CheckCircle size={14} />}>已支付</Badge>;
			case 'PENDING':
				return <Badge variant="warning" icon={<Clock size={14} />}>待支付</Badge>;
			case 'PENDING_REVIEW':
				return <Badge variant="warning" icon={<Clock size={14} />}>待审核</Badge>;
			case 'FAILED':
				return <Badge variant="danger" icon={<XCircle size={14} />}>已失败</Badge>;
			case 'CANCELLED':
				return <Badge variant="default" icon={<X size={14} />}>已取消</Badge>;
			case 'REFUNDED':
				return <Badge variant="default" icon={<RefreshCw size={14} />}>已退款</Badge>;
			case 'REFUNDING':
				return <Badge variant="warning" icon={<Clock size={14} />}>退款中</Badge>;
			default:
				return <Badge variant="default">{status}</Badge>;
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
				<Loader2 className="animate-spin text-indigo-600" size={40} />
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
				<Card className="max-w-md w-full">
					<CardBody className="text-center py-12">
						<XCircle className="mx-auto mb-4 text-red-500" size={48} />
						<h2 className="text-xl font-bold text-gray-900 mb-2">加载失败</h2>
						<p className="text-gray-600 mb-6">{error || '订单不存在'}</p>
						<Button onClick={() => router.push('/admin/orders')}>
							返回订单列表
						</Button>
					</CardBody>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
			{/* 导航栏 */}
			<nav className="bg-white border-b border-gray-200">
				<div className="mx-auto max-w-7xl px-4 py-4">
					<div className="flex items-center justify-between">
						<button
							onClick={() => router.back()}
							className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
						>
							<ArrowLeft size={20} />
							返回
						</button>
						<div className="flex gap-3">
							<Button
								variant="outline"
								icon={<RefreshCw size={18} />}
								onClick={loadOrderDetail}
							>
								刷新
							</Button>
						</div>
					</div>
				</div>
			</nav>

			<div className="mx-auto max-w-7xl px-4 py-8">
				{/* 页面标题 */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold gradient-text">订单详情</h1>
					<p className="mt-2 text-gray-600">订单号：{order.id}</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* 左侧：订单信息 */}
					<div className="lg:col-span-2 space-y-6">
						{/* 订单基本信息 */}
						<Card>
							<CardBody>
								<div className="flex items-start justify-between mb-6">
									<h2 className="text-xl font-bold text-gray-900">订单信息</h2>
									<BrandIcons.Membership level={order.level as any} size={48} />
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-gray-600 mb-1">订单编号</p>
										<p className="text-sm font-medium text-gray-900">{order.id}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600 mb-1">会员等级</p>
										<Badge variant={order.level === 'PREMIUM' ? 'success' : 'info'}>
											{getLevelName(order.level)}
										</Badge>
									</div>
									<div>
										<p className="text-sm text-gray-600 mb-1">购买时长</p>
										<p className="text-lg font-semibold text-gray-900">
											{order.months}个月
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600 mb-1">订单金额</p>
										<p className="text-2xl font-bold text-indigo-600">
											{formatAmount(order.amount)}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600 mb-1">支付方式</p>
										<p className="text-lg font-semibold text-gray-900">
											{getPaymentMethodName(order.paymentMethod)}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600 mb-1">订单状态</p>
										{getStatusBadge(order.paymentStatus)}
									</div>
									<div>
										<p className="text-sm text-gray-600 mb-1">创建时间</p>
										<p className="text-sm text-gray-900">{formatDate(order.createdAt)}</p>
									</div>
									{order.notes && (
										<div>
											<p className="text-sm text-gray-600 mb-1">备注</p>
											<p className="text-sm text-gray-900 break-all">{order.notes}</p>
										</div>
									)}
								</div>
							</CardBody>
						</Card>

						{/* 支付凭证 */}
						{proofInfo && (
							<Card>
								<CardBody>
									<div className="flex items-start justify-between mb-6">
										<h2 className="text-xl font-bold text-gray-900">支付凭证</h2>
										<Button
											variant="outline"
											size="sm"
											icon={<Eye size={16} />}
											onClick={() => setShowProofModal(true)}
										>
											查看凭证
										</Button>
									</div>

									<div className="space-y-3">
										<div className="flex justify-between items-center py-2 border-b border-gray-200">
											<span className="text-sm text-gray-600">文件名</span>
											<span className="text-sm font-medium text-gray-900">
												{proofInfo.fileName || '未命名'}
											</span>
										</div>
										<div className="flex justify-between items-center py-2 border-b border-gray-200">
											<span className="text-sm text-gray-600">文件类型</span>
											<span className="text-sm font-medium text-gray-900">
												{proofInfo.fileType || '-'}
											</span>
										</div>
										<div className="flex justify-between items-center py-2 border-b border-gray-200">
											<span className="text-sm text-gray-600">文件大小</span>
											<span className="text-sm font-medium text-gray-900">
												{proofInfo.fileSize ? `${((proofInfo.fileSize / 1024) / 1024).toFixed(2)} MB` : '-'}
											</span>
										</div>
										<div className="flex justify-between items-center py-2">
											<span className="text-sm text-gray-600">上传时间</span>
											<span className="text-sm font-medium text-gray-900">
												{proofInfo.uploadedAt ? formatDate(proofInfo.uploadedAt) : '-'}
											</span>
										</div>
									</div>
								</CardBody>
							</Card>
						)}
					</div>

					{/* 右侧：用户信息和操作 */}
					<div className="space-y-6">
						{/* 用户信息 */}
						{user && (
							<Card>
								<CardBody>
									<h2 className="text-xl font-bold text-gray-900 mb-6">用户信息</h2>

									<div className="space-y-3">
										<div className="flex justify-between items-center py-2 border-b border-gray-200">
											<span className="text-sm text-gray-600">用户ID</span>
											<span className="text-sm font-medium text-gray-900">{user.id}</span>
										</div>
										<div className="flex justify-between items-center py-2 border-b border-gray-200">
											<span className="text-sm text-gray-600">邮箱</span>
											<span className="text-sm font-medium text-gray-900">{user.email}</span>
										</div>
										{user.username && (
											<div className="flex justify-between items-center py-2 border-b border-gray-200">
												<span className="text-sm text-gray-600">用户名</span>
												<span className="text-sm font-medium text-gray-900">{user.username}</span>
											</div>
										)}
										<div className="flex justify-between items-center py-2 border-b border-gray-200">
											<span className="text-sm text-gray-600">会员等级</span>
											<Badge variant={user.membershipLevel === 'PREMIUM' ? 'success' : 'info'}>
												{getLevelName(user.membershipLevel)}
											</Badge>
										</div>
										{user.membershipExpireAt && (
											<div className="flex justify-between items-center py-2">
												<span className="text-sm text-gray-600">会员到期时间</span>
												<span className="text-sm font-medium text-gray-900">
													{formatDate(user.membershipExpireAt)}
												</span>
											</div>
										)}
									</div>
								</CardBody>
							</Card>
						)}

						{/* 审核操作 */}
						{order.paymentStatus === 'PENDING_REVIEW' && (
							<Card>
								<CardBody>
									<h2 className="text-xl font-bold text-gray-900 mb-6">审核操作</h2>

									{/* 错误提示 */}
									{error && (
										<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
											{error}
										</div>
									)}

									<div className="space-y-3">
										<Button
											variant="primary"
											className="w-full"
											icon={<ThumbsUp size={18} />}
											onClick={() => handleOrderAction('approve')}
											disabled={isProcessing}
										>
											{isProcessing && actionType === 'approve' ? (
												<>
													<Loader2 className="animate-spin mr-2" size={18} />
													处理中...
												</>
											) : (
												'审核通过'
											)}
										</Button>

										<Button
											variant="danger"
											className="w-full"
											icon={<ThumbsDown size={18} />}
											onClick={() => handleOrderAction('reject')}
											disabled={isProcessing}
										>
											{isProcessing && actionType === 'reject' ? (
												<>
													<Loader2 className="animate-spin mr-2" size={18} />
													处理中...
												</>
											) : (
												'审核拒绝'
											)}
										</Button>
									</div>

									{isProcessing && (actionType === 'reject' || actionType === 'refund') && (
										<div className="mt-4">
											<label className="block text-sm font-medium text-gray-700 mb-2">
												审核备注
											</label>
											<textarea
												className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
												rows={3}
												placeholder="请输入审核备注..."
												value={reviewNotes}
												onChange={(e) => setReviewNotes(e.target.value)}
											/>
										</div>
									)}
								</CardBody>
							</Card>
						)}

						{/* 退款操作 */}
						{order.paymentStatus === 'PAID' && (
							<Card>
								<CardBody>
									<h2 className="text-xl font-bold text-gray-900 mb-6">退款操作</h2>

									{/* 错误提示 */}
									{error && (
										<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
											{error}
										</div>
									)}

									<div className="mb-4">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											退款金额（元）
										</label>
										<input
											type="number"
											className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
											placeholder={`默认全额退款：${formatAmount(order.amount)}`}
											value={refundAmount}
											onChange={(e) => setRefundAmount(e.target.value)}
										/>
										<p className="text-xs text-gray-600 mt-1">
											留空则全额退款
										</p>
									</div>

									<div className="mb-4">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											退款原因
										</label>
										<textarea
											className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
											rows={3}
											placeholder="请输入退款原因..."
											value={reviewNotes}
											onChange={(e) => setReviewNotes(e.target.value)}
										/>
									</div>

									<Button
										variant="outline"
										className="w-full"
										icon={<RefreshCw size={18} />}
										onClick={() => handleOrderAction('refund')}
										disabled={isProcessing}
									>
										{isProcessing && actionType === 'refund' ? (
											<>
												<Loader2 className="animate-spin mr-2" size={18} />
												处理中...
											</>
										) : (
											'确认退款'
										)}
									</Button>
								</CardBody>
							</Card>
						)}
					</div>
				</div>
			</div>

			{/* 凭证预览模态框 */}
			{showProofModal && proofInfo && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
					<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
						<div className="flex items-center justify-between p-4 border-b">
							<h3 className="text-lg font-bold text-gray-900">支付凭证预览</h3>
							<button
								onClick={() => setShowProofModal(false)}
								className="text-gray-600 hover:text-gray-900"
							>
								<X size={24} />
							</button>
						</div>
						<div className="p-4">
							{proofInfo.url ? (
								proofInfo.fileType?.startsWith('image/') ? (
									<img
										src={proofInfo.url}
										alt="支付凭证"
										className="w-full h-auto"
									/>
								) : (
									<div className="text-center py-8">
										<FileText className="mx-auto mb-3 text-gray-400" size={48} />
										<p className="text-gray-600 mb-3">无法在线预览PDF文件</p>
										<a
											href={proofInfo.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-indigo-600 hover:text-indigo-800 font-medium"
										>
											下载文件 →
										</a>
									</div>
								)
							) : (
								<div className="text-center py-8">
									<FileImage className="mx-auto mb-3 text-gray-400" size={48} />
									<p className="text-gray-600">无法加载凭证文件</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
