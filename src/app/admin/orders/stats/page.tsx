'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Download, TrendingUp, DollarSign, Users, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import Button from '@/components/Button';
import Card, { CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';

interface StatsData {
	totalOrders: number;
	pendingOrders: number;
	paidOrders: number;
	failedOrders: number;
	cancelledOrders: number;
	refundedOrders: number;
	pendingReviewOrders: number;
	refundingOrders: number;
	totalRevenue: number;
	totalRefunded: number;
	netRevenue: number;
	basicOrders: number;
	premiumOrders: number;
	enterpriseOrders: number;
	basicRevenue: number;
	premiumRevenue: number;
	enterpriseRevenue: number;
	alipayOrders: number;
	wechatOrders: number;
	alipayRevenue: number;
	wechatRevenue: number;
	paymentSuccessRate: number;
}

interface TrendsData {
	period: string;
	startDate: string;
	endDate: string;
	trends: Array<{
		date: string;
		totalOrders: number;
		paidOrders: number;
		revenue: number;
	}>;
}

export default function AdminOrderStatsPage() {
	const router = useRouter();

	// 统计数据
	const [stats, setStats] = useState<StatsData | null>(null);
	const [trends, setTrends] = useState<TrendsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// 筛选条件
	const [period, setPeriod] = useState<'7days' | '30days' | '90days' | '1year'>('30days');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');

	// 加载统计数据
	useEffect(() => {
		loadStats();
	}, [startDate, endDate]);

	// 加载趋势数据
	useEffect(() => {
		loadTrends();
	}, [period]);

	const loadStats = async () => {
		setError(null);

		try {
			const params = new URLSearchParams();
			if (startDate) params.append('startDate', startDate);
			if (endDate) params.append('endDate', endDate);

			const response = await fetch(`/api/admin/orders/stats?${params.toString()}`);
			const result = await response.json();

			if (result.success) {
				setStats(result.data);
			} else {
				setError(result.error || '加载统计数据失败');
			}
		} catch (error) {
			console.error('加载统计数据失败:', error);
			setError('加载统计数据失败');
		}
	};

	const loadTrends = async () => {
		setError(null);

		try {
			const response = await fetch(`/api/admin/orders/trends?period=${period}`);
			const result = await response.json();

			if (result.success) {
				setTrends(result.data);
			} else {
				setError(result.error || '加载趋势数据失败');
			}
		} catch (error) {
			console.error('加载趋势数据失败:', error);
			setError('加载趋势数据失败');
		}
	};

	const handleRefresh = () => {
		setIsLoading(true);
		Promise.all([loadStats(), loadTrends()]).finally(() => {
			setIsLoading(false);
		});
	};

	// 格式化金额
	const formatAmount = (amount: number) => {
		return `¥${(amount / 100).toFixed(2)}`;
	};

	// 格式化日期
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		});
	};

	// 导出统计数据
	const exportStats = () => {
		if (!stats) return;

		const csvContent = [
			['指标', '数值'],
			['订单总数', stats.totalOrders],
			['待支付订单', stats.pendingOrders],
			['已支付订单', stats.paidOrders],
			['已失败订单', stats.failedOrders],
			['已取消订单', stats.cancelledOrders],
			['已退款订单', stats.refundedOrders],
			['待审核订单', stats.pendingReviewOrders],
			['退款中订单', stats.refundingOrders],
			['总收入', formatAmount(stats.totalRevenue)],
			['总退款', formatAmount(stats.totalRefunded)],
			['净收入', formatAmount(stats.netRevenue)],
			['基础版订单数', stats.basicOrders],
			['高级版订单数', stats.premiumOrders],
			['企业版订单数', stats.enterpriseOrders],
			['基础版收入', formatAmount(stats.basicRevenue)],
			['高级版收入', formatAmount(stats.premiumRevenue)],
			['企业版收入', formatAmount(stats.enterpriseRevenue)],
			['支付宝订单数', stats.alipayOrders],
			['微信支付订单数', stats.wechatOrders],
			['支付宝收入', formatAmount(stats.alipayRevenue)],
			['微信支付收入', formatAmount(stats.wechatRevenue)],
			['支付成功率', `${stats.paymentSuccessRate}%`],
		]
			.map(row => row.join(','))
			.join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `order-stats-${new Date().toISOString().split('T')[0]}.csv`;
		link.click();
	};

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
								variant="secondary"
								icon={<RefreshCw size={18} />}
								onClick={handleRefresh}
							>
								刷新
							</Button>
							<Button
								variant="secondary"
								icon={<Download size={18} />}
								onClick={exportStats}
							>
								导出
							</Button>
						</div>
					</div>
				</div>
			</nav>

			<div className="mx-auto max-w-7xl px-4 py-8">
				{/* 页面标题 */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold gradient-text">订单统计</h1>
					<p className="mt-2 text-gray-600">查看订单收入和统计数据</p>
				</div>

				{/* 日期筛选 */}
				<Card className="mb-6">
					<CardBody>
						<div className="flex flex-wrap items-center gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									开始日期
								</label>
								<input
									type="date"
									className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									结束日期
								</label>
								<input
									type="date"
									className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
								/>
							</div>
							<div className="ml-auto">
								<Button onClick={() => { setStartDate(''); setEndDate(''); }}>
									重置筛选
								</Button>
							</div>
						</div>
					</CardBody>
				</Card>

				{/* 统计卡片 */}
				{stats && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
						{/* 订单总数 */}
						<Card>
							<CardBody>
								<div className="flex items-center justify-between mb-4">
									<Package className="text-indigo-600" size={32} />
									<span className="text-sm text-gray-600">订单总数</span>
								</div>
								<div className="text-3xl font-bold text-gray-900 mb-2">
									{stats.totalOrders}
								</div>
								<div className="text-sm text-gray-600">
									已支付：{stats.paidOrders} / 待审核：{stats.pendingReviewOrders}
								</div>
							</CardBody>
						</Card>

						{/* 总收入 */}
						<Card>
							<CardBody>
								<div className="flex items-center justify-between mb-4">
									<DollarSign className="text-green-600" size={32} />
									<span className="text-sm text-gray-600">总收入</span>
								</div>
								<div className="text-3xl font-bold text-green-600 mb-2">
									{formatAmount(stats.totalRevenue)}
								</div>
								<div className="text-sm text-gray-600">
									净收入：{formatAmount(stats.netRevenue)}
								</div>
							</CardBody>
						</Card>

						{/* 支付成功率 */}
						<Card>
							<CardBody>
								<div className="flex items-center justify-between mb-4">
									<TrendingUp className="text-purple-600" size={32} />
									<span className="text-sm text-gray-600">支付成功率</span>
								</div>
								<div className="text-3xl font-bold text-purple-600 mb-2">
									{stats.paymentSuccessRate}%
								</div>
								<div className="text-sm text-gray-600">
									成功率：{stats.paidOrders} / {stats.paidOrders + stats.failedOrders}
								</div>
							</CardBody>
						</Card>

						{/* 用户数量 */}
						<Card>
							<CardBody>
								<div className="flex items-center justify-between mb-4">
									<Users className="text-blue-600" size={32} />
									<span className="text-sm text-gray-600">付费用户</span>
								</div>
								<div className="text-3xl font-bold text-blue-600 mb-2">
									{stats.paidOrders}
								</div>
								<div className="text-sm text-gray-600">
									待审核：{stats.pendingReviewOrders}
								</div>
							</CardBody>
						</Card>
					</div>
				)}

				{/* 详细统计 */}
				{stats && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
						{/* 订单状态分布 */}
						<Card>
							<CardBody>
								<h3 className="text-lg font-bold text-gray-900 mb-4">订单状态分布</h3>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<CheckCircle className="text-green-600" size={16} />
											<span className="text-sm text-gray-700">已支付</span>
										</div>
										<div className="flex items-center gap-3">
											<span className="text-sm font-medium text-gray-900">{stats.paidOrders}</span>
											<span className="text-sm text-gray-600">{formatAmount(stats.totalRevenue)}</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Clock className="text-yellow-600" size={16} />
											<span className="text-sm text-gray-700">待支付</span>
										</div>
										<span className="text-sm font-medium text-gray-900">{stats.pendingOrders}</span>
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Clock className="text-orange-600" size={16} />
											<span className="text-sm text-gray-700">待审核</span>
										</div>
										<span className="text-sm font-medium text-gray-900">{stats.pendingReviewOrders}</span>
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<XCircle className="text-red-600" size={16} />
											<span className="text-sm text-gray-700">已失败</span>
										</div>
										<span className="text-sm font-medium text-gray-900">{stats.failedOrders}</span>
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<XCircle className="text-gray-600" size={16} />
											<span className="text-sm text-gray-700">已取消</span>
										</div>
										<span className="text-sm font-medium text-gray-900">{stats.cancelledOrders}</span>
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<RefreshCw className="text-gray-600" size={16} />
											<span className="text-sm text-gray-700">已退款</span>
										</div>
										<div className="flex items-center gap-3">
											<span className="text-sm font-medium text-gray-900">{stats.refundedOrders}</span>
											<span className="text-sm text-red-600">{formatAmount(stats.totalRefunded)}</span>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>

						{/* 套餐分布 */}
						<Card>
							<CardBody>
								<h3 className="text-lg font-bold text-gray-900 mb-4">套餐分布</h3>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-700">基础版</span>
										<div className="flex items-center gap-3">
											<span className="text-sm font-medium text-gray-900">{stats.basicOrders} 单</span>
											<span className="text-sm text-gray-600">{formatAmount(stats.basicRevenue)}</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-700">高级版</span>
										<div className="flex items-center gap-3">
											<span className="text-sm font-medium text-gray-900">{stats.premiumOrders} 单</span>
											<span className="text-sm text-gray-600">{formatAmount(stats.premiumRevenue)}</span>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-700">企业版</span>
										<div className="flex items-center gap-3">
											<span className="text-sm font-medium text-gray-900">{stats.enterpriseOrders} 单</span>
											<span className="text-sm text-gray-600">{formatAmount(stats.enterpriseRevenue)}</span>
										</div>
									</div>
								</div>

								<div className="mt-6 pt-4 border-t border-gray-200">
									<h4 className="text-sm font-medium text-gray-700 mb-3">支付方式分布</h4>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-sm text-gray-700">支付宝</span>
											<div className="flex items-center gap-3">
												<span className="text-sm font-medium text-gray-900">{stats.alipayOrders} 单</span>
												<span className="text-sm text-gray-600">{formatAmount(stats.alipayRevenue)}</span>
											</div>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-gray-700">微信支付</span>
											<div className="flex items-center gap-3">
												<span className="text-sm font-medium text-gray-900">{stats.wechatOrders} 单</span>
												<span className="text-sm text-gray-600">{formatAmount(stats.wechatRevenue)}</span>
											</div>
										</div>
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
				)}

				{/* 趋势图 */}
				{trends && (
					<Card>
						<CardBody>
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-lg font-bold text-gray-900">订单趋势</h3>
								<div className="flex gap-2">
									{(['7days', '30days', '90days', '1year'] as const).map(p => (
										<button
											key={p}
											onClick={() => setPeriod(p)}
											className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
												period === p
													? 'bg-indigo-600 text-white'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											{p === '7days' && '最近7天'}
											{p === '30days' && '最近30天'}
											{p === '90days' && '最近90天'}
											{p === '1year' && '最近1年'}
										</button>
									))}
								</div>
							</div>

							{/* 简单的柱状图 */}
							<div className="h-64 flex items-end justify-between gap-2">
								{trends.trends.map((item, index) => {
									const maxRevenue = Math.max(...trends.trends.map(t => t.revenue));
									const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

									return (
										<div
											key={item.date}
											className="flex-1 flex flex-col items-center gap-2 group"
										>
											<div
												className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t transition-all group-hover:from-indigo-600 group-hover:to-purple-600 cursor-pointer"
												style={{ height: `${Math.max(height, 2)}%` }}
												title={`日期：${formatDate(item.date)}\n订单数：${item.totalOrders}\n支付数：${item.paidOrders}\n收入：${formatAmount(item.revenue)}`}
											></div>
											<div className="text-xs text-gray-600 text-center">
												<div className="font-medium">{item.revenue > 0 ? formatAmount(item.revenue) : '-'}</div>
												<div className="opacity-75">{item.paidOrders}</div>
											</div>
											<div className="text-xs text-gray-500 truncate w-full text-center">
												{item.date.slice(5)}
											</div>
										</div>
									);
								})}
							</div>
						</CardBody>
					</Card>
				)}
			</div>
		</div>
	);
}
