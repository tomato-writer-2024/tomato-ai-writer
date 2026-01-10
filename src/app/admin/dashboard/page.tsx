'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AdminInfo {
	id: string;
	email: string;
	username: string;
	membershipLevel: string;
	isSuperAdmin: boolean;
}

interface TestStats {
	totalUsers: number;
	testUsers: number;
	byMembership: {
		FREE: number;
		VIP: number;
		PREMIUM: number;
	};
	byStatus: {
		active: number;
		banned: number;
	};
}

export default function AdminDashboardPage() {
	const router = useRouter();
	const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
	const [testStats, setTestStats] = useState<TestStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [runningTest, setRunningTest] = useState(false);
	const [testProgress, setTestProgress] = useState(0);

	// 检查登录状态
	useEffect(() => {
		const checkLogin = () => {
			try {
				const token = localStorage.getItem('admin_token');
				const info = localStorage.getItem('admin_info');

				console.log('[Dashboard] 检查登录状态:', {
					hasToken: !!token,
					hasInfo: !!info,
				});

				if (!token || !info) {
					console.log('[Dashboard] 未登录，跳转到登录页');
					router.push('/admin/login');
					return;
				}

				try {
					const parsedInfo = JSON.parse(info);
					console.log('[Dashboard] 解析admin信息成功:', {
						id: parsedInfo.id,
						email: parsedInfo.email,
						username: parsedInfo.username,
					});
					setAdminInfo(parsedInfo);
				} catch (parseError) {
					console.error('[Dashboard] 解析admin信息失败:', parseError);
					localStorage.removeItem('admin_token');
					localStorage.removeItem('admin_info');
					router.push('/admin/login');
					return;
				}

				fetchTestStats();
			} catch (error) {
				console.error('[Dashboard] 检查登录状态出错:', error);
				router.push('/admin/login');
			}
		};

		checkLogin();
	}, [router]);

	const fetchTestStats = async () => {
		try {
			const token = localStorage.getItem('admin_token');
			const response = await fetch('/api/admin/testing/batch-users', {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			const data = await response.json();
			if (data.success) {
				setTestStats(data.stats);
			}
		} catch (error) {
			console.error('获取统计失败:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleBatchUsers = async () => {
		if (!confirm('确定要批量生成1000个测试用户吗？')) return;

		try {
			const token = localStorage.getItem('admin_token');
			const response = await fetch('/api/admin/testing/batch-users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({ count: 1000 }),
			});

			const data = await response.json();
			if (data.success) {
				alert(`成功创建 ${data.created} 个测试用户`);
				fetchTestStats();
			} else {
				alert(data.error || '创建失败');
			}
		} catch (error) {
			alert('批量生成用户失败：' + error);
		}
	};

	const handleRunTest = async () => {
		if (!confirm('确定要开始全面自动化测试吗？这可能需要几分钟时间。')) return;

		setRunningTest(true);
		setTestProgress(0);

		try {
			const token = localStorage.getItem('admin_token');
			const response = await fetch('/api/admin/testing/run', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({
					userCount: 1000,
					testModules: [],
				}),
			});

			const data = await response.json();
			if (data.success) {
				alert('测试已开始！请稍后在"测试报告"中查看结果。');
				router.push(`/admin/testing/${data.testId}`);
			} else {
				alert(data.error || '启动测试失败');
				setRunningTest(false);
			}
		} catch (error) {
			alert('启动测试失败：' + error);
			setRunningTest(false);
		}
	};

	const handleLogout = () => {
		if (confirm('确定要退出登录吗？')) {
			localStorage.removeItem('admin_token');
			localStorage.removeItem('admin_info');
			router.push('/admin/login');
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
							<div className="flex items-center space-x-2">
								<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
									<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
									</svg>
								</div>
								<span className="text-white font-bold">番茄小说AI写作工具</span>
							</div>
							<div className="flex space-x-4">
								<Link href="/admin/dashboard" className="text-white hover:text-blue-400 transition-colors font-medium">
									仪表盘
								</Link>
								<Link href="/admin/users" className="text-gray-300 hover:text-blue-400 transition-colors">
									用户管理
								</Link>
								<Link href="/admin/testing" className="text-gray-300 hover:text-blue-400 transition-colors">
									测试报告
								</Link>
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<div className="text-right">
								<div className="text-white text-sm font-medium">{adminInfo?.username}</div>
								<div className="text-gray-400 text-xs">{adminInfo?.email}</div>
							</div>
							<button
								onClick={handleLogout}
								className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
							>
								退出
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* 主内容区 */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* 欢迎区域 */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-white mb-2">管理后台</h1>
					<p className="text-gray-400">欢迎回来，{adminInfo?.username}</p>
				</div>

				{/* 统计卡片 */}
				{testStats && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-400 text-sm">总用户数</p>
									<p className="text-3xl font-bold text-white mt-1">{testStats.totalUsers}</p>
								</div>
								<div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
								</div>
							</div>
						</div>

						<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-400 text-sm">测试用户</p>
									<p className="text-3xl font-bold text-white mt-1">{testStats.testUsers}</p>
								</div>
								<div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
							</div>
						</div>

						<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-400 text-sm">活跃用户</p>
									<p className="text-3xl font-bold text-white mt-1">{testStats.byStatus.active}</p>
								</div>
								<div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
									</svg>
								</div>
							</div>
						</div>

						<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-400 text-sm">被封用户</p>
									<p className="text-3xl font-bold text-white mt-1">{testStats.byStatus.banned}</p>
								</div>
								<div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
									</svg>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* 会员分布 */}
				{testStats && (
					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
						<h2 className="text-xl font-bold text-white mb-4">会员分布</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-gray-500/20 rounded-lg p-4">
								<div className="text-gray-300 text-sm mb-1">免费用户</div>
								<div className="text-2xl font-bold text-white">{testStats.byMembership.FREE}</div>
								<div className="text-gray-400 text-xs mt-1">
									{((testStats.byMembership.FREE / testStats.testUsers) * 100).toFixed(1)}%
								</div>
							</div>
							<div className="bg-yellow-500/20 rounded-lg p-4">
								<div className="text-yellow-300 text-sm mb-1">VIP用户</div>
								<div className="text-2xl font-bold text-white">{testStats.byMembership.VIP}</div>
								<div className="text-gray-400 text-xs mt-1">
									{((testStats.byMembership.VIP / testStats.testUsers) * 100).toFixed(1)}%
								</div>
							</div>
							<div className="bg-blue-500/20 rounded-lg p-4">
								<div className="text-blue-300 text-sm mb-1">高级会员</div>
								<div className="text-2xl font-bold text-white">{testStats.byMembership.PREMIUM}</div>
								<div className="text-gray-400 text-xs mt-1">
									{((testStats.byMembership.PREMIUM / testStats.testUsers) * 100).toFixed(1)}%
								</div>
							</div>
						</div>
					</div>
				)}

				{/* 快捷操作 */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
						<h2 className="text-xl font-bold text-white mb-4">用户管理</h2>
						<div className="space-y-3">
							<button
								onClick={handleBatchUsers}
								className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
								</svg>
								<span>批量生成测试用户（1000个）</span>
							</button>
							<Link
								href="/admin/users"
								className="block w-full bg-white/20 text-white py-3 rounded-lg font-medium hover:bg-white/30 transition-all text-center"
							>
								查看所有用户
							</Link>
						</div>
					</div>

					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
						<h2 className="text-xl font-bold text-white mb-4">自动化测试</h2>
						<div className="space-y-3">
							<button
								onClick={handleRunTest}
								disabled={runningTest}
								className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
							>
								{runningTest ? (
									<>
										<svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										<span>测试进行中...</span>
									</>
								) : (
									<>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<span>运行全面自动化测试（1000用户）</span>
									</>
								)}
							</button>
							<Link
								href="/admin/testing"
								className="block w-full bg-white/20 text-white py-3 rounded-lg font-medium hover:bg-white/30 transition-all text-center"
							>
								查看测试报告
							</Link>
						</div>
					</div>
				</div>

				{/* 超级管理员信息 */}
				{adminInfo && (
					<div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
						<h2 className="text-xl font-bold text-white mb-4">管理员信息</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<div className="text-gray-400 text-sm">用户名</div>
								<div className="text-white font-medium">{adminInfo.username}</div>
							</div>
							<div>
								<div className="text-gray-400 text-sm">邮箱</div>
								<div className="text-white font-medium">{adminInfo.email}</div>
							</div>
							<div>
								<div className="text-gray-400 text-sm">会员等级</div>
								<div className="text-white font-medium">{adminInfo.membershipLevel}</div>
							</div>
							<div>
								<div className="text-gray-400 text-sm">超级管理员</div>
								<div className={`font-medium ${adminInfo.isSuperAdmin ? 'text-green-400' : 'text-red-400'}`}>
									{adminInfo.isSuperAdmin ? '是' : '否'}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
