'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TestResult {
	id: string;
	testType: string;
	testConfig: any;
	totalTests: number;
	successCount: number;
	failureCount: number;
	successRate: number;
	averageQualityScore: number;
	averageCompletionRate: number;
	averageResponseTime: number;
	completedAt: string;
	duration: number;
}

export default function TestingPage() {
	const router = useRouter();
	const [testResults, setTestResults] = useState<TestResult[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem('admin_token');
		if (!token) {
			router.push('/admin/login');
			return;
		}

		fetchTestResults(token);
	}, [router]);

	const fetchTestResults = async (token: string) => {
		try {
			const response = await fetch('/api/admin/testing/report', {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (data.success) {
				setTestResults(data.reports);
			}
		} catch (error) {
			console.error('获取测试报告失败:', error);
		} finally {
			setLoading(false);
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
							<Link href="/admin/dashboard" className="text-white hover:text-blue-400 transition-colors">
								← 返回仪表盘
							</Link>
							<span className="text-white font-medium">测试报告</span>
						</div>
						<Link
							href="/admin/dashboard"
							className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
						>
							运行新测试
						</Link>
					</div>
				</div>
			</nav>

			{/* 主内容区 */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* 统计卡片 */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
						<p className="text-gray-400 text-sm mb-1">总测试次数</p>
						<p className="text-3xl font-bold text-white">{testResults.length}</p>
					</div>
					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
						<p className="text-gray-400 text-sm mb-1">平均成功率</p>
						<p className="text-3xl font-bold text-white">
							{testResults.length > 0
								? (testResults.reduce((sum, r) => sum + r.successRate, 0) / testResults.length).toFixed(2)
								: '0.00'}%
						</p>
					</div>
					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
						<p className="text-gray-400 text-sm mb-1">最近测试</p>
						<p className="text-3xl font-bold text-white">
							{testResults.length > 0
								? new Date(testResults[0].completedAt).toLocaleDateString('zh-CN')
								: '-'}
						</p>
					</div>
				</div>

				{/* 测试列表 */}
				<div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
					<div className="p-6 border-b border-white/10">
						<h2 className="text-xl font-bold text-white">测试历史</h2>
					</div>
					{testResults.length === 0 ? (
						<div className="p-12 text-center">
							<p className="text-gray-400 mb-4">暂无测试记录</p>
							<Link
								href="/admin/dashboard"
								className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
							>
								运行首次测试
							</Link>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="text-left text-gray-400 text-sm border-b border-white/10">
										<th className="px-6 py-4">测试ID</th>
										<th className="px-6 py-4">测试类型</th>
										<th className="px-6 py-4">测试数</th>
										<th className="px-6 py-4">成功率</th>
										<th className="px-6 py-4">质量评分</th>
										<th className="px-6 py-4">响应时间</th>
										<th className="px-6 py-4">耗时</th>
										<th className="px-6 py-4">完成时间</th>
										<th className="px-6 py-4">操作</th>
									</tr>
								</thead>
								<tbody>
									{testResults.map((result) => (
										<tr key={result.id} className="border-b border-white/10 text-white hover:bg-white/5 transition-colors">
											<td className="px-6 py-4 font-mono text-sm">{result.id}</td>
											<td className="px-6 py-4">{result.testType}</td>
											<td className="px-6 py-4 text-center">{result.totalTests}</td>
											<td className="px-6 py-4 text-center">
												<span className={
													result.successRate >= 95 ? 'text-green-400' :
													result.successRate >= 80 ? 'text-yellow-400' :
													'text-red-400'
												}>
													{result.successRate.toFixed(2)}%
												</span>
											</td>
											<td className="px-6 py-4 text-center">
												{result.averageQualityScore.toFixed(1)}
											</td>
											<td className="px-6 py-4 text-center">
												{result.averageResponseTime.toFixed(0)}ms
											</td>
											<td className="px-6 py-4 text-center">{result.duration}s</td>
											<td className="px-6 py-4 text-sm">
												{new Date(result.completedAt).toLocaleString('zh-CN')}
											</td>
											<td className="px-6 py-4">
												<Link
													href={`/admin/testing/${result.id}`}
													className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded hover:bg-blue-500/30 transition-colors text-sm"
												>
													查看
												</Link>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
