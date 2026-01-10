'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			// 调用登录API
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || '登录失败');
			}

			// 验证是否为超级管理员
			const verifyResponse = await fetch('/api/admin/superadmin/verify', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${data.token}`,
				},
			});

			const verifyData = await verifyResponse.json();

			if (!verifyResponse.ok || !verifyData.success) {
				throw new Error('您没有权限访问后台管理系统');
			}

			// 保存token到localStorage
			localStorage.setItem('admin_token', data.token);
			localStorage.setItem('admin_info', JSON.stringify(verifyData.admin));

			// 跳转到管理后台
			router.push('/admin/dashboard');
		} catch (err: any) {
			setError(err.message || '登录失败，请重试');
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Logo和标题 */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
						<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
					</div>
					<h1 className="text-3xl font-bold text-white mb-2">番茄小说AI写作工具</h1>
					<p className="text-gray-400">超级管理员登录</p>
				</div>

				{/* 登录表单 */}
				<div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
					<form onSubmit={handleSubmit} className="space-y-6">
						{error && (
							<div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
								{error}
							</div>
						)}

						<div>
							<label className="block text-sm font-medium text-gray-200 mb-2">
								管理员邮箱
							</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								required
								className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
								placeholder="admin@example.com"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-200 mb-2">
								密码
							</label>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								required
								className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
								placeholder="••••••••"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
						>
							{loading ? '登录中...' : '登录'}
						</button>
					</form>

					<div className="mt-6 pt-6 border-t border-white/10">
						<div className="text-center text-sm text-gray-400 space-y-2">
							<div>
								<Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
									← 返回首页
								</Link>
							</div>
							<div>
								<button
									onClick={async () => {
										try {
											const response = await fetch('/api/admin/superadmin/init', {
												method: 'POST',
												headers: {
													'Content-Type': 'application/json',
												},
												body: JSON.stringify({
													email: 'admin@tomato-ai.com',
													username: '超级管理员',
													password: 'Admin@123456',
												}),
											});
											const data = await response.json();
											if (data.success) {
												alert('超级管理员创建成功！\n邮箱: admin@tomato-ai.com\n密码: Admin@123456');
											} else {
												alert(data.error || '创建失败');
											}
										} catch (err) {
											alert('创建失败：' + err);
										}
									}}
									className="text-purple-400 hover:text-purple-300 transition-colors"
								>
								 初始化超级管理员
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* 安全提示 */}
				<div className="mt-6 text-center text-xs text-gray-500">
					<p>仅授权管理员可访问此系统</p>
					<p>所有操作将被记录</p>
				</div>
			</div>
		</div>
	);
}
