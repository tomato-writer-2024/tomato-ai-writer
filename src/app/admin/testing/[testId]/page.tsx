'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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
	startedAt: string;
	completedAt: string;
	duration: number;
	summary: string;
	details: any;
}

export default function TestResultPage() {
	const router = useRouter();
	const params = useParams();
	const testId = params.testId as string;

	const [testResult, setTestResult] = useState<TestResult | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const token = localStorage.getItem('admin_token');
		if (!token) {
			router.push('/admin/login');
			return;
		}

		fetchTestResult(token, testId);
	}, [router, testId]);

	const fetchTestResult = async (token: string, testId: string) => {
		try {
			const response = await fetch(`/api/admin/testing/report?testId=${testId}`, {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || '获取测试报告失败');
			}

			setTestResult(data.report);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDownloadReport = async () => {
		try {
			const token = localStorage.getItem('admin_token');
			const response = await fetch('/api/admin/testing/report', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({ testId }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || '生成报告失败');
			}

			// 创建并下载HTML文件
			const blob = new Blob([data.html], { type: 'text/html' });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `test-report-${testId}.html`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (err: any) {
			alert('下载报告失败：' + err.message);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
				<div className="text-white text-xl">加载中...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
				<div className="text-white text-center">
					<p className="text-xl mb-4">{error}</p>
					<Link href="/admin/testing" className="text-blue-400 hover:text-blue-300">
						返回测试列表
					</Link>
				</div>
			</div>
		);
	}

	if (!testResult) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
				<div className="text-white text-center">
					<p className="text-xl mb-4">测试报告不存在</p>
					<Link href="/admin/testing" className="text-blue-400 hover:text-blue-300">
						返回测试列表
					</Link>
				</div>
			</div>
		);
	}

	const moduleResults = testResult.details?.moduleResults || {};

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
							<span className="text-white font-medium">测试报告详情</span>
						</div>
						<button
							onClick={handleDownloadReport}
							className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
						>
							下载HTML报告
						</button>
					</div>
				</div>
			</nav>

			{/* 主内容区 */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* 基本信息 */}
				<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
					<h1 className="text-2xl font-bold text-white mb-4">测试报告</h1>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
						<div>
							<span className="text-gray-400">测试ID：</span>
							<span className="text-white ml-2">{testResult.id}</span>
						</div>
						<div>
							<span className="text-gray-400">测试类型：</span>
							<span className="text-white ml-2">{testResult.testType}</span>
						</div>
						<div>
							<span className="text-gray-400">开始时间：</span>
							<span className="text-white ml-2">
								{new Date(testResult.startedAt).toLocaleString('zh-CN')}
							</span>
						</div>
						<div>
							<span className="text-gray-400">耗时：</span>
							<span className="text-white ml-2">{testResult.duration}秒</span>
						</div>
					</div>
				</div>

				{/* 统计卡片 */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
						<p className="text-gray-400 text-sm mb-1">总测试数</p>
						<p className="text-3xl font-bold text-white">{testResult.totalTests}</p>
					</div>
					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
						<p className="text-gray-400 text-sm mb-1">成功</p>
						<p className="text-3xl font-bold text-green-400">{testResult.successCount}</p>
					</div>
					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
						<p className="text-gray-400 text-sm mb-1">失败</p>
						<p className="text-3xl font-bold text-red-400">{testResult.failureCount}</p>
					</div>
					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
						<p className="text-gray-400 text-sm mb-1">成功率</p>
						<p className="text-3xl font-bold text-white">{testResult.successRate.toFixed(2)}%</p>
					</div>
				</div>

				{/* 质量指标 */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
						<p className="text-gray-400 text-sm mb-1">平均质量评分</p>
						<p className="text-3xl font-bold text-white">{testResult.averageQualityScore.toFixed(1)}</p>
						<p className="text-gray-400 text-xs mt-1">目标：85+</p>
					</div>
					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
						<p className="text-gray-400 text-sm mb-1">平均完读率</p>
						<p className="text-3xl font-bold text-white">{testResult.averageCompletionRate.toFixed(1)}%</p>
						<p className="text-gray-400 text-xs mt-1">目标：60%+</p>
					</div>
					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
						<p className="text-gray-400 text-sm mb-1">平均响应时间</p>
						<p className="text-3xl font-bold text-white">{testResult.averageResponseTime.toFixed(0)}ms</p>
						<p className="text-gray-400 text-xs mt-1">目标：<1000ms</p>
					</div>
				</div>

				{/* 测试总结 */}
				<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
					<h2 className="text-xl font-bold text-white mb-4">测试总结</h2>
					<p className="text-gray-300">{testResult.summary}</p>
				</div>

				{/* 模块测试详情 */}
				<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
					<h2 className="text-xl font-bold text-white mb-4">模块测试详情</h2>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="text-left text-gray-400 text-sm">
									<th className="pb-3 pr-4">模块名称</th>
									<th className="pb-3 pr-4 text-center">测试数</th>
									<th className="pb-3 pr-4 text-center">成功</th>
									<th className="pb-3 pr-4 text-center">失败</th>
									<th className="pb-3 pr-4 text-center">成功率</th>
									<th className="pb-3 text-center">平均响应时间</th>
								</tr>
							</thead>
							<tbody className="text-white">
								{Object.entries(moduleResults).map(([module, result]: [string, any]) => {
									const successRate = result.total > 0
										? ((result.success / result.total) * 100).toFixed(2)
										: '0.00';
									const avgTime = result.responseTimes.length > 0
										? (result.responseTimes.reduce((a: number, b: number) => a + b, 0) / result.responseTimes.length).toFixed(0)
										: '0';

									return (
										<tr key={module} className="border-t border-white/10">
											<td className="py-3 pr-4">{module}</td>
											<td className="py-3 pr-4 text-center">{result.total}</td>
											<td className="py-3 pr-4 text-center text-green-400">{result.success}</td>
											<td className="py-3 pr-4 text-center text-red-400">{result.failure}</td>
											<td className="py-3 pr-4 text-center">{successRate}%</td>
											<td className="py-3 text-center">{avgTime}ms</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>

				{/* 错误详情 */}
				{testResult.details?.errors && testResult.details.errors.length > 0 && (
					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
						<h2 className="text-xl font-bold text-white mb-4">
							错误详情 ({testResult.details.errors.length})
						</h2>
						<div className="max-h-96 overflow-y-auto">
							<table className="w-full">
								<thead>
									<tr className="text-left text-gray-400 text-sm">
										<th className="pb-3 pr-4">模块</th>
										<th className="pb-3 pr-4">用户ID</th>
										<th className="pb-3">错误信息</th>
									</tr>
								</thead>
								<tbody className="text-white text-sm">
									{testResult.details.errors.slice(0, 50).map((err: any, index: number) => (
										<tr key={index} className="border-t border-white/10">
											<td className="py-3 pr-4">{err.module}</td>
											<td className="py-3 pr-4 font-mono text-xs">{err.userId}</td>
											<td className="py-3 text-red-400">{err.error}</td>
										</tr>
									))}
								</tbody>
							</table>
							{testResult.details.errors.length > 50 && (
								<p className="text-gray-400 text-sm mt-4">
									还有 {testResult.details.errors.length - 50} 个错误未显示
								</p>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
