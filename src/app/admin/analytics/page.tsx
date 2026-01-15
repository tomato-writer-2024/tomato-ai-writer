'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	ArrowLeft,
	TrendingUp,
	TrendingDown,
	DollarSign,
	Users,
	ShoppingCart,
	Download,
	RefreshCw,
	Calendar,
	BarChart3,
	PieChart,
	LineChart,
} from 'lucide-react';

interface AnalyticsData {
	overview: {
		totalOrders: number;
		totalRevenue: number;
		totalUsers: number;
		activeMembers: number;
		growthRate: number;
		averageOrderValue: number;
	};
	ordersByStatus: {
		status: string;
		count: number;
		percentage: number;
	}[];
	ordersByLevel: {
		level: string;
		count: number;
		revenue: number;
	}[];
	ordersByPaymentMethod: {
		method: string;
		count: number;
		revenue: number;
	}[];
	revenueTrend: {
		date: string;
		revenue: number;
		orders: number;
	}[];
}

export default function AdminAnalyticsPage() {
	const router = useRouter();
	const [data, setData] = useState<AnalyticsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
	const [activeTab, setActiveTab] = useState('overview');

	useEffect(() => {
		fetchAnalytics();
	}, [timeRange, activeTab]);

	const fetchAnalytics = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			params.append('timeRange', timeRange);

			const response = await fetch(`/api/admin/analytics?${params.toString()}`);
			const result = await response.json();

			if (result.success) {
				setData(result.data);
			} else {
				alert(result.error || '获取数据失败');
			}
		} catch (error) {
			console.error('获取分析数据失败:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleExport = async () => {
		try {
			const params = new URLSearchParams();
			params.append('timeRange', timeRange);
			params.append('format', 'csv');

			const response = await fetch(`/api/admin/analytics/export?${params.toString()}`);

			if (!response.ok) {
				throw new Error('导出失败');
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('导出失败:', error);
			alert('导出失败，请重试');
		}
	};

	const formatCurrency = (amount: number) => {
		return `¥${(amount / 100).toFixed(2)}`;
	};

	const formatNumber = (num: number) => {
		return num.toLocaleString('zh-CN');
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
								数据分析
							</h1>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="secondary"
								onClick={() => fetchAnalytics()}
								disabled={loading}
							>
								<RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
								刷新
							</Button>
							<Button
								onClick={handleExport}
								disabled={!data || loading}
								className="bg-[#FF4757] hover:bg-[#FF6B81]"
							>
								<Download className="h-4 w-4 mr-2" />
								导出数据
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* 主要内容区 */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* 时间范围选择 */}
				<div className="mb-6 flex gap-2">
					{[
						{ value: '7d', label: '近7天' },
						{ value: '30d', label: '近30天' },
						{ value: '90d', label: '近90天' },
						{ value: 'all', label: '全部' },
					].map((item) => (
						<Button
							key={item.value}
							variant={timeRange === item.value ? 'primary' : 'secondary'}
							onClick={() => setTimeRange(item.value as any)}
							className={
								timeRange === item.value ? 'bg-[#FF4757] hover:bg-[#FF6B81]' : ''
							}
						>
							<Calendar className="h-4 w-4 mr-2" />
							{item.label}
						</Button>
					))}
				</div>

				{loading ? (
					<div className="flex items-center justify-center py-12">
						<div className="text-gray-500">加载中...</div>
					</div>
				) : data ? (
					<div className="space-y-6">
						{/* 概览卡片 */}
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							<Card>
								<CardHeader className="pb-2">
									<div className="flex items-center justify-between">
										<CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
											总收入
										</CardTitle>
										<DollarSign className="h-4 w-4 text-[#FF4757]" />
									</div>
								</CardHeader>
								<CardBody>
									<div className="text-2xl font-bold text-[#FF4757]">
										{formatCurrency(data.overview.totalRevenue)}
									</div>
									{data.overview.growthRate !== 0 && (
										<div className="flex items-center mt-1">
											{data.overview.growthRate > 0 ? (
												<TrendingUp className="h-4 w-4 mr-1 text-green-500" />
											) : (
												<TrendingDown className="h-4 w-4 mr-1 text-red-500" />
											)}
											<span
												className={`text-sm ${
													data.overview.growthRate > 0 ? 'text-green-500' : 'text-red-500'
												}`}
											>
												{Math.abs(data.overview.growthRate).toFixed(1)}%
											</span>
											<span className="text-xs text-gray-500 ml-1">环比增长</span>
										</div>
									)}
								</CardBody>
							</Card>

							<Card>
								<CardHeader className="pb-2">
									<div className="flex items-center justify-between">
										<CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
											总订单数
										</CardTitle>
										<ShoppingCart className="h-4 w-4 text-blue-500" />
									</div>
								</CardHeader>
								<CardBody>
									<div className="text-2xl font-bold">
										{formatNumber(data.overview.totalOrders)}
									</div>
									<div className="text-sm text-gray-500 mt-1">
										平均客单价: {formatCurrency(data.overview.averageOrderValue)}
									</div>
								</CardBody>
							</Card>

							<Card>
								<CardHeader className="pb-2">
									<div className="flex items-center justify-between">
										<CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
											总用户数
										</CardTitle>
										<Users className="h-4 w-4 text-green-500" />
									</div>
								</CardHeader>
								<CardBody>
									<div className="text-2xl font-bold">
										{formatNumber(data.overview.totalUsers)}
									</div>
									<div className="text-sm text-gray-500 mt-1">
										活跃会员: {formatNumber(data.overview.activeMembers)}
									</div>
								</CardBody>
							</Card>
						</div>

						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList className="grid w-full grid-cols-4">
								<TabsTrigger value="orders" className="flex items-center gap-2">
									<ShoppingCart className="h-4 w-4" />
									订单分析
								</TabsTrigger>
								<TabsTrigger value="revenue" className="flex items-center gap-2">
									<DollarSign className="h-4 w-4" />
									收入趋势
								</TabsTrigger>
								<TabsTrigger value="members" className="flex items-center gap-2">
									<Users className="h-4 w-4" />
									会员分布
								</TabsTrigger>
								<TabsTrigger value="payment" className="flex items-center gap-2">
									<BarChart3 className="h-4 w-4" />
									支付方式
								</TabsTrigger>
							</TabsList>

							<TabsContent value="orders" className="mt-6">
								<Card>
									<CardHeader>
										<CardTitle>订单状态分布</CardTitle>
									</CardHeader>
									<CardBody>
										<div className="space-y-3">
											{data.ordersByStatus.map((item) => (
												<div
													key={item.status}
													className="flex items-center gap-4"
												>
													<div className="w-32 text-sm">{item.status}</div>
													<div className="flex-1">
														<div className="flex items-center justify-between mb-1">
															<span className="text-sm">{formatNumber(item.count)} 单</span>
															<span className="text-sm text-gray-500">
																{item.percentage.toFixed(1)}%
															</span>
														</div>
														<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
															<div
																className="bg-[#FF4757] h-2 rounded-full transition-all duration-300"
																style={{ width: `${item.percentage}%` }}
															/>
														</div>
													</div>
												</div>
											))}
										</div>
									</CardBody>
								</Card>
							</TabsContent>

							<TabsContent value="revenue" className="mt-6">
								<Card>
									<CardHeader>
										<CardTitle>收入趋势</CardTitle>
									</CardHeader>
									<CardBody>
										{data.revenueTrend.length > 0 ? (
											<div className="h-64">
												<div className="flex items-end justify-between gap-1 h-full">
													{data.revenueTrend.map((item, index) => {
														const maxRevenue = Math.max(
															...data.revenueTrend.map((t) => t.revenue)
														);
														const height = (item.revenue / maxRevenue) * 100;

														return (
															<div
																key={index}
																className="flex-1 flex flex-col items-center gap-1 group"
															>
																<div
																	className="w-full bg-[#FF4757] rounded-t transition-all duration-200 group-hover:bg-[#FF6B81]"
																	style={{ height: `${height}%` }}
																	title={`${new Date(item.date).toLocaleDateString('zh-CN')}: ${formatCurrency(item.revenue)}`}
																/>
																<div className="text-xs text-gray-500 transform -rotate-45 origin-left">
																	{new Date(item.date).toLocaleDateString('zh-CN', {
																		month: 'short',
																		day: 'numeric',
																	})}
																</div>
															</div>
														);
													})}
												</div>
											</div>
										) : (
											<div className="text-center py-8 text-gray-500">
												暂无数据
											</div>
										)}
									</CardBody>
								</Card>
							</TabsContent>

							<TabsContent value="members" className="mt-6">
								<div className="grid gap-6 md:grid-cols-2">
									<Card>
										<CardHeader>
											<CardTitle>会员等级分布</CardTitle>
										</CardHeader>
										<CardBody>
											<div className="space-y-3">
												{data.ordersByLevel.map((item) => (
													<div
														key={item.level}
														className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
													>
														<div className="flex-1">
															<div className="font-medium">{item.level}</div>
															<div className="text-sm text-gray-500">
																{formatNumber(item.count)} 单
															</div>
														</div>
														<div className="text-right">
															<div className="font-bold text-[#FF4757]">
																{formatCurrency(item.revenue)}
															</div>
														</div>
													</div>
												))}
											</div>
										</CardBody>
									</Card>

									<Card>
										<CardHeader>
											<CardTitle>收入占比</CardTitle>
										</CardHeader>
										<CardBody>
											<div className="space-y-3">
												{data.ordersByLevel.map((item) => {
													const percentage = data.overview.totalRevenue > 0
														? (item.revenue / data.overview.totalRevenue) * 100
														: 0;

													return (
														<div key={item.level}>
															<div className="flex items-center justify-between mb-1">
																<span className="text-sm">{item.level}</span>
																<span className="text-sm text-gray-500">
																	{percentage.toFixed(1)}%
																</span>
															</div>
															<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
																<div
																	className="bg-[#FF4757] h-2 rounded-full transition-all duration-300"
																	style={{ width: `${percentage}%` }}
																/>
															</div>
														</div>
													);
												})}
											</div>
										</CardBody>
									</Card>
								</div>
							</TabsContent>

							<TabsContent value="payment" className="mt-6">
								<Card>
									<CardHeader>
										<CardTitle>支付方式分布</CardTitle>
									</CardHeader>
									<CardBody>
										<div className="grid gap-4 md:grid-cols-2">
											{data.ordersByPaymentMethod.map((item) => (
												<div
													key={item.method}
													className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
												>
													<div className="flex items-center justify-between mb-2">
														<span className="font-medium">{item.method}</span>
														<Badge variant="secondary">{formatNumber(item.count)} 单</Badge>
													</div>
													<div className="text-2xl font-bold text-[#FF4757]">
														{formatCurrency(item.revenue)}
													</div>
												</div>
											))}
										</div>
									</CardBody>
								</Card>
							</TabsContent>
						</Tabs>
					</div>
				) : (
					<Card>
						<CardBody className="flex flex-col items-center justify-center py-16">
							<BarChart3 className="h-16 w-16 mb-4 text-gray-300" />
							<p className="text-gray-500 text-lg">暂无数据</p>
						</CardBody>
					</Card>
				)}
			</div>
		</div>
	);
}
