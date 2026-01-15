'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import Button from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { BrandIcons } from '@/lib/brandIcons';

interface Order {
	id: string;
	level: string;
	months: number;
	amount: number;
	paymentMethod: string;
	paymentStatus: string;
	createdAt: string;
	notes?: string;
}

export default function PaymentConfirmPage({ params }: { params: Promise<{ id: string }> }) {
	const router = useRouter();
	const [orderId, setOrderId] = useState<string>('');

	// 订单信息
	const [order, setOrder] = useState<Order | null>(null);
	const [isLoadingOrder, setIsLoadingOrder] = useState(true);
	const [orderError, setOrderError] = useState<string | null>(null);

	// 支付凭证信息
	const [proofInfo, setProofInfo] = useState<any>(null);

	// 解析URL参数
	useEffect(() => {
		const initParams = async () => {
			const { id } = await params;
			setOrderId(id);
		};
		initParams();
	}, [params]);

	// 加载订单信息
	useEffect(() => {
		if (orderId) {
			loadOrder();
		}
	}, [orderId]);

	const loadOrder = async () => {
		setIsLoadingOrder(true);
		setOrderError(null);

		try {
			const response = await fetch(`/api/payment/${orderId}`);
			const result = await response.json();

			if (result.success) {
				setOrder(result.data);
				// 解析支付凭证信息
				if (result.data.notes) {
					try {
						const notes = JSON.parse(result.data.notes);
						setProofInfo(notes.proof);
					} catch (e) {
						// 解析失败
					}
				}
			} else {
				setOrderError(result.error || '加载订单信息失败');
			}
		} catch (error) {
			console.error('加载订单信息失败:', error);
			setOrderError('加载订单信息失败');
		} finally {
			setIsLoadingOrder(false);
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
	const getStatusConfig = (status: string) => {
		switch (status) {
			case 'PENDING_REVIEW':
				return {
					icon: <Clock className="text-yellow-600" size={48} />,
					title: '待审核',
					message: '您的支付凭证已上传，等待管理员审核',
					variant: 'warning' as const,
				};
			case 'PAID':
				return {
					icon: <CheckCircle className="text-green-600" size={48} />,
					title: '支付成功',
					message: '恭喜！您的会员已激活',
					variant: 'success' as const,
				};
			case 'FAILED':
				return {
					icon: <AlertCircle className="text-red-600" size={48} />,
					title: '审核失败',
					message: '您的支付凭证未通过审核，请重新上传',
					variant: 'danger' as const,
				};
			default:
				return {
					icon: <Clock className="text-gray-600" size={48} />,
					title: '处理中',
					message: '订单正在处理中，请稍候',
					variant: 'default' as const,
				};
		}
	};

	if (isLoadingOrder) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
				<Loader2 className="animate-spin text-indigo-600" size={40} />
			</div>
		);
	}

	if (orderError || !order) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
				<Card className="max-w-md w-full">
					<CardBody className="text-center py-12">
						<AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
						<h2 className="text-xl font-bold text-gray-900 mb-2">订单加载失败</h2>
						<p className="text-gray-600 mb-6">{orderError || '订单不存在'}</p>
						<Button onClick={() => router.push('/orders')}>
							返回订单列表
						</Button>
					</CardBody>
				</Card>
			</div>
		);
	}

	const statusConfig = getStatusConfig(order.paymentStatus);

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
			{/* 导航栏 */}
			<nav className="bg-white border-b border-gray-200">
				<div className="mx-auto max-w-7xl px-4 py-4">
					<button
						onClick={() => router.back()}
						className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
					>
						<ArrowLeft size={20} />
						返回
					</button>
				</div>
			</nav>

			<div className="mx-auto max-w-4xl px-4 py-8">
				{/* 状态卡片 */}
				<Card className="mb-6">
					<CardBody className="text-center py-12">
						<div className="mx-auto mb-4">{statusConfig.icon}</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							{statusConfig.title}
						</h2>
						<p className="text-gray-600 mb-6">{statusConfig.message}</p>
						{order.paymentStatus === 'PENDING_REVIEW' && (
							<div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
								<h3 className="text-sm font-medium text-blue-900 mb-2">
									温馨提示
								</h3>
								<ul className="text-xs text-blue-700 space-y-1">
									<li>• 审核通常在1-2个工作日内完成</li>
									<li>• 审核结果将通过站内信通知您</li>
									<li>• 如有疑问，请联系客服</li>
								</ul>
							</div>
						)}
						{order.paymentStatus === 'FAILED' && (
							<div className="flex justify-center gap-3">
								<Button variant="secondary" onClick={() => router.back()}>
									返回订单列表
								</Button>
								<Button onClick={() => router.push(`/payment/${order.id}/upload`)}>
									重新上传凭证
								</Button>
							</div>
						)}
						{order.paymentStatus === 'PAID' && (
							<Button onClick={() => router.push('/profile')}>
								前往个人中心
							</Button>
						)}
					</CardBody>
				</Card>

				{/* 订单信息卡片 */}
				<Card className="mb-6">
					<CardBody>
						<h2 className="text-xl font-bold text-gray-900 mb-6">订单详情</h2>

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
								<p className="text-sm text-gray-600 mb-1">创建时间</p>
								<p className="text-sm text-gray-900">{formatDate(order.createdAt)}</p>
							</div>
							<div className="col-span-2">
								<p className="text-sm text-gray-600 mb-1">订单状态</p>
								<Badge variant={statusConfig.variant}>{statusConfig.title}</Badge>
							</div>
						</div>
					</CardBody>
				</Card>

				{/* 支付凭证信息 */}
				{proofInfo && (
					<Card>
						<CardBody>
							<h2 className="text-xl font-bold text-gray-900 mb-6">支付凭证</h2>
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
								{proofInfo.url && (
									<div className="mt-4">
										<a
											href={proofInfo.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
										>
											查看支付凭证 →
										</a>
									</div>
								)}
							</div>
						</CardBody>
					</Card>
				)}
			</div>
		</div>
	);
}
