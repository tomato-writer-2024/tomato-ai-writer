'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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
}

export default function PaymentUploadPage({ params }: { params: Promise<{ id: string }> }) {
	const router = useRouter();
	const [orderId, setOrderId] = useState<string>('');

	// 订单信息
	const [order, setOrder] = useState<Order | null>(null);
	const [isLoadingOrder, setIsLoadingOrder] = useState(true);
	const [orderError, setOrderError] = useState<string | null>(null);

	// 上传状态
	const [file, setFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [uploadSuccess, setUploadSuccess] = useState(false);

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

	// 处理文件选择
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (!selectedFile) return;

		// 验证文件类型
		const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
		if (!validTypes.includes(selectedFile.type)) {
			setUploadError('请上传图片或PDF文件');
			return;
		}

		// 验证文件大小（最大5MB）
		if (selectedFile.size > 5 * 1024 * 1024) {
			setUploadError('文件大小不能超过5MB');
			return;
		}

		setFile(selectedFile);
		setUploadError(null);

		// 预览图片
		if (selectedFile.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setPreviewUrl(e.target?.result as string);
			};
			reader.readAsDataURL(selectedFile);
		} else {
			setPreviewUrl(null);
		}
	};

	// 上传支付凭证
	const handleUpload = async () => {
		if (!file || !order) return;

		setIsUploading(true);
		setUploadError(null);
		setUploadSuccess(false);

		try {
			// 使用FormData上传文件
			const formData = new FormData();
			formData.append('file', file);
			formData.append('orderId', order.id);
			formData.append('fileName', file.name);
			formData.append('fileType', file.type);
			formData.append('fileSize', file.size.toString());

			const response = await fetch('/api/payment/upload-proof', {
				method: 'POST',
				body: formData,
			});

			const result = await response.json();

			if (result.success) {
				setUploadSuccess(true);

				// 3秒后跳转到确认页面
				setTimeout(() => {
					router.push(`/payment/${order.id}/confirm`);
				}, 3000);
			} else {
				setUploadError(result.error || '上传失败');
			}
		} catch (error) {
			console.error('上传支付凭证失败:', error);
			setUploadError('上传支付凭证失败，请重试');
		} finally {
			setIsUploading(false);
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

	// 如果订单状态不是待支付，显示提示
	if (order.paymentStatus !== 'PENDING') {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
				<Card className="max-w-md w-full">
					<CardBody className="text-center py-12">
						<CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
						<h2 className="text-xl font-bold text-gray-900 mb-2">订单状态异常</h2>
						<p className="text-gray-600 mb-6">此订单不需要上传支付凭证</p>
						<Button onClick={() => router.push(`/orders`)}>
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
				{/* 页面标题 */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold gradient-text">上传支付凭证</h1>
					<p className="mt-2 text-gray-600">
						请上传您的支付凭证截图或PDF文件，等待管理员审核
					</p>
				</div>

				{/* 订单信息卡片 */}
				<Card className="mb-6">
					<CardBody>
						<div className="flex items-start justify-between mb-6">
							<div>
								<h2 className="text-xl font-bold text-gray-900 mb-2">订单信息</h2>
								<p className="text-sm text-gray-600">订单号：{order.id}</p>
							</div>
							<BrandIcons.Membership level={order.level as any} size={48} />
						</div>

						<div className="grid grid-cols-2 gap-4">
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
							<div>
								<p className="text-sm text-gray-600 mb-1">订单状态</p>
								<Badge variant="warning">待支付</Badge>
							</div>
						</div>
					</CardBody>
				</Card>

				{/* 上传支付凭证 */}
				<Card className="mb-6">
					<CardBody>
						<h2 className="text-xl font-bold text-gray-900 mb-6">上传支付凭证</h2>

						{/* 成功提示 */}
						{uploadSuccess && (
							<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
								<CheckCircle className="text-green-600 mt-0.5" size={20} />
								<div>
									<p className="font-medium text-green-900">上传成功</p>
									<p className="text-sm text-green-700">
										支付凭证已上传，即将跳转到确认页面...
									</p>
								</div>
							</div>
						)}

						{/* 错误提示 */}
						{uploadError && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
								<AlertCircle className="text-red-600 mt-0.5" size={20} />
								<div>
									<p className="font-medium text-red-900">上传失败</p>
									<p className="text-sm text-red-700">{uploadError}</p>
								</div>
							</div>
						)}

						{/* 上传区域 */}
						{!uploadSuccess && (
							<div className="space-y-6">
								{/* 文件选择 */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										选择支付凭证文件
									</label>
									<div className="flex items-center gap-4">
										<input
											type="file"
											accept="image/jpeg,image/png,image/jpg,application/pdf"
											onChange={handleFileSelect}
											className="hidden"
											id="file-input"
											disabled={isUploading}
										/>
										<label
											htmlFor="file-input"
											className={`flex-1 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
												file
													? 'border-indigo-500 bg-indigo-50'
													: 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
											} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
										>
											{previewUrl ? (
												<img
													src={previewUrl}
													alt="支付凭证预览"
													className="max-h-48 mx-auto rounded"
												/>
											) : file?.type === 'application/pdf' ? (
												<div>
													<Upload className="mx-auto mb-3 text-indigo-600" size={32} />
													<p className="text-sm font-medium text-gray-900">
														{file.name}
													</p>
													<p className="text-xs text-gray-600 mt-1">
														{((file.size / 1024) / 1024).toFixed(2)} MB
													</p>
												</div>
											) : (
												<div>
													<Upload className="mx-auto mb-3 text-gray-400" size={32} />
													<p className="text-sm font-medium text-gray-900">
														点击或拖拽文件到此处上传
													</p>
													<p className="text-xs text-gray-600 mt-1">
														支持图片（JPG、PNG）和PDF文件，最大5MB
													</p>
												</div>
											)}
										</label>
									</div>
								</div>

								{/* 提示信息 */}
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
									<h3 className="text-sm font-medium text-blue-900 mb-2">
										上传须知
									</h3>
									<ul className="text-xs text-blue-700 space-y-1">
										<li>• 请确保支付凭证清晰可见，包含完整的支付信息</li>
										<li>• 支付凭证必须在有效期内，超过30天的凭证将不被接受</li>
										<li>• 审核通常在1-2个工作日内完成，请耐心等待</li>
										<li>• 如有疑问，请联系客服</li>
									</ul>
								</div>

								{/* 上传按钮 */}
								<div className="flex justify-end gap-3">
									<Button
										variant="outline"
										onClick={() => router.back()}
										disabled={isUploading}
									>
										取消
									</Button>
									<Button
										onClick={handleUpload}
										disabled={!file || isUploading}
										icon={isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
									>
										{isUploading ? '上传中...' : '上传支付凭证'}
									</Button>
								</div>
							</div>
						)}
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
