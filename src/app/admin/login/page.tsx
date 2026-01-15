'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	detectBrowser,
	getCompatibilityIssues,
	getCompatibilityTip,
	safeLocalStorageGet,
	safeLocalStorageSet,
	isLocalStorageAvailable,
} from '@/lib/browser-compat';

export default function AdminLoginPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [debugInfo, setDebugInfo] = useState<string[]>([]);
	const [showBrowserInfo, setShowBrowserInfo] = useState(false);
	const [browserInfo, setBrowserInfo] = useState<ReturnType<typeof detectBrowser> | null>(null);

	// 初始化检测浏览器
	useEffect(() => {
		const detected = detectBrowser();
		setBrowserInfo(detected);

		// 检查是否有兼容性问题
		const issues = getCompatibilityIssues();
		if (issues.length > 0) {
			console.warn('[浏览器兼容性] 检测到问题:', issues);
			setShowBrowserInfo(true);
		}

		// 检查是否已有token
		const existingToken = safeLocalStorageGet('admin_token');
		const existingInfo = safeLocalStorageGet('admin_info');

		if (existingToken && existingInfo) {
			console.log('[登录] 发现已有token，跳转到dashboard');
			router.push('/admin/dashboard');
		}
	}, [router]);

	// 添加调试信息
	const addDebugInfo = (info: string) => {
		console.log('[登录调试]', info);
		setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setDebugInfo([]);

		try {
			// 动态导入增强登录模块
			const { enhancedLogin } = await import('@/lib/enhanced-login');

			addDebugInfo('使用增强登录流程');
			addDebugInfo(`浏览器: ${browserInfo?.name} ${browserInfo?.version}`);

			// 检查localStorage
			if (!isLocalStorageAvailable()) {
				throw new Error('浏览器禁用了本地存储，请检查隐私模式或安全设置');
			}
			addDebugInfo('localStorage可用');

			// 使用增强登录（支持多重Token传输）
			const result = await enhancedLogin({
				email: formData.email,
				password: formData.password,
				useMultiToken: true,
				maxRetries: 3,
				onDebug: addDebugInfo,
			});

			if (!result.success) {
				throw new Error(result.error || '登录失败');
			}

			addDebugInfo('✅ 登录成功');

			// 跳转到管理后台
			addDebugInfo('准备跳转到管理后台');
			setTimeout(() => {
				router.push('/admin/dashboard');
			}, 100);
		} catch (err: any) {
			console.error('[登录错误]', err);
			setError(err.message || '登录失败，请重试');
			addDebugInfo(`错误: ${err.message}`);
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
					{/* 浏览器兼容性提示 */}
					{showBrowserInfo && browserInfo && (
						<div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-4 py-3 rounded-lg text-sm mb-6">
							<div className="font-medium mb-2 flex items-center gap-2">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
								检测到浏览器兼容性问题
							</div>
							<div className="mb-3 text-xs">
								检测到您使用 <strong>{browserInfo.name} {browserInfo.version}</strong>，
								可能存在本地存储访问限制
							</div>
							{getCompatibilityTip() && (
								<button
									onClick={() => {
										const tip = getCompatibilityTip();
										if (tip) {
											alert(tip);
										}
									}}
									className="text-yellow-300 hover:text-yellow-100 underline text-xs"
								>
									查看详细解决方案 →
								</button>
							)}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						{error && (
							<div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
								<div className="font-medium mb-1">登录失败</div>
								<div>{error}</div>
							</div>
						)}

						{/* 调试信息 */}
						{debugInfo.length > 0 && (
							<div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-xs font-mono max-h-48 overflow-y-auto">
								<div className="text-gray-400 mb-2 border-b border-gray-700 pb-1">调试信息:</div>
								{debugInfo.map((info, index) => (
									<div key={index} className="text-gray-300 py-0.5">
										{info}
									</div>
								))}
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

					{/* 自动登录脚本区域 */}
					<div className="mt-6 pt-6 border-t border-white/10">
						{/* 一键登录按钮（推荐360浏览器使用） */}
						<button
							onClick={async () => {
								if (!formData.email || !formData.password) {
									alert('请先输入邮箱和密码');
									return;
								}

								try {
									// 直接执行原生登录逻辑，不依赖模块导入
									console.log('=== 开始一键登录 ===');
									console.log('邮箱:', formData.email);

									// 1. 调用登录API
									console.log('步骤1: 调用登录API...');
									const loginResp = await fetch('/api/auth/login', {
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({
											email: formData.email,
											password: formData.password
										}),
										credentials: 'include'
									});

									const loginData = await loginResp.json();
									console.log('登录API响应:', loginData);

									if (!loginData.success) {
										throw new Error('登录失败: ' + (loginData.error || '未知错误'));
									}

									const token = loginData.data.token;
									console.log('✅ Token获取成功，长度:', token.length);

									// 2. 验证超级管理员权限（尝试多种方式）
									console.log('步骤2: 验证超级管理员权限...');

									let verifySuccess = false;
									let verifyData: any = null;
									let verifyError: string = '';

									// 方式1: Authorization header
									try {
										console.log('尝试方式1: Authorization header');
										const resp1 = await fetch('/api/admin/superadmin/verify', {
											method: 'POST',
											headers: {
												'Authorization': 'Bearer ' + token,
												'Content-Type': 'application/json'
											},
											credentials: 'include'
										});
										const data1 = await resp1.json();
										console.log('方式1响应:', data1);
										if (data1.success) {
											verifySuccess = true;
											verifyData = data1;
											console.log('✅ 方式1验证成功');
										} else {
											verifyError = data1.error || '未知错误';
											console.log('❌ 方式1失败:', verifyError);
										}
									} catch (e: any) {
										console.log('❌ 方式1异常:', e.message);
										verifyError = e.message;
									}

									// 方式2: X-Auth-Token header
									if (!verifySuccess) {
										try {
											console.log('尝试方式2: X-Auth-Token header');
											const resp2 = await fetch('/api/admin/superadmin/verify', {
												method: 'POST',
												headers: {
													'X-Auth-Token': token,
													'Content-Type': 'application/json'
												},
												credentials: 'include'
											});
											const data2 = await resp2.json();
											console.log('方式2响应:', data2);
											if (data2.success) {
												verifySuccess = true;
												verifyData = data2;
												console.log('✅ 方式2验证成功');
											} else {
												verifyError = data2.error || '未知错误';
												console.log('❌ 方式2失败:', verifyError);
											}
										} catch (e: any) {
											console.log('❌ 方式2异常:', e.message);
											verifyError = e.message;
										}
									}

									// 方式3: body参数
									if (!verifySuccess) {
										try {
											console.log('尝试方式3: body参数');
											const resp3 = await fetch('/api/admin/superadmin/verify', {
												method: 'POST',
												headers: {
													'Content-Type': 'application/json'
												},
												credentials: 'include',
												body: JSON.stringify({ token })
											});
											const data3 = await resp3.json();
											console.log('方式3响应:', data3);
											if (data3.success) {
												verifySuccess = true;
												verifyData = data3;
												console.log('✅ 方式3验证成功');
											} else {
												verifyError = data3.error || '未知错误';
												console.log('❌ 方式3失败:', verifyError);
											}
										} catch (e: any) {
											console.log('❌ 方式3异常:', e.message);
											verifyError = e.message;
										}
									}

									if (!verifySuccess) {
										throw new Error('所有验证方式均失败: ' + verifyError);
									}

									console.log('✅ 超级管理员验证通过');

									// 3. 保存token
									console.log('步骤3: 保存token...');
									try {
										localStorage.setItem('admin_token', token);
										localStorage.setItem('admin_info', JSON.stringify(verifyData.admin));
										sessionStorage.setItem('admin_token', token);
										sessionStorage.setItem('admin_info', JSON.stringify(verifyData.admin));
										console.log('✅ Token已保存到本地存储');
									} catch (e: any) {
										console.warn('保存到本地存储失败:', e.message);
									}

									// 4. 跳转
									console.log('步骤4: 跳转到管理后台...');
									setTimeout(() => {
										router.push('/admin/dashboard');
									}, 500);

								} catch (e: any) {
									console.error('❌ 一键登录失败:', e);
									alert('登录失败: ' + e.message + '\n\n请查看控制台了解详细信息');
								}
							}}
							disabled={loading}
							className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all mb-3"
						>
							🚀 一键登录（360浏览器专用）
						</button>

						<button
							onClick={() => {
								if (!formData.email || !formData.password) {
									alert('请先输入邮箱和密码');
									return;
								}
								try {
									const { generateAutoLoginScript } = require('@/lib/enhanced-login');
									const script = generateAutoLoginScript(formData.email, formData.password);
									// 创建一个模态框显示脚本
									const modal = document.createElement('div');
									modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
									modal.innerHTML = `
										<div class="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto border border-white/20">
											<div class="flex justify-between items-center mb-4">
												<h3 class="text-xl font-bold text-white">自动登录脚本</h3>
												<button id="closeModal" class="text-gray-400 hover:text-white text-2xl">&times;</button>
											</div>
											<div class="bg-black/50 rounded-lg p-4 mb-4 text-xs text-green-400 font-mono overflow-auto max-h-[300px]">
												${script.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
											</div>
											<div class="space-y-2 text-sm text-gray-300">
												<p><strong>使用说明：</strong></p>
												<p>1. 复制上面的脚本</p>
												<p>2. 按 <kbd class="bg-white/20 px-2 py-1 rounded">F12</kbd> 打开浏览器控制台</p>
												<p>3. 粘贴脚本并按 <kbd class="bg-white/20 px-2 py-1 rounded">Enter</kbd> 执行</p>
												<p>4. 自动登录成功后会跳转到管理后台</p>
												<p class="text-yellow-400 mt-2">提示：此脚本适用于所有浏览器，包括360、QQ等</p>
											</div>
											<button id="copyScript" class="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
												复制脚本
											</button>
										</div>
									`;
									document.body.appendChild(modal);

									modal.querySelector('#closeModal')?.addEventListener('click', () => {
										modal.remove();
									});
									modal.addEventListener('click', (e) => {
										if (e.target === modal) modal.remove();
									});
									modal.querySelector('#copyScript')?.addEventListener('click', () => {
										navigator.clipboard.writeText(script);
										alert('脚本已复制到剪贴板！');
									});
								} catch (e) {
									alert('生成脚本失败：' + e);
								}
							}}
							className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-2 rounded-lg font-medium hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
						>
							📝 生成自动登录脚本（适用于所有浏览器）
						</button>
					</div>

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
				<div className="mt-6 text-center text-xs text-gray-500 space-y-1">
					<p>仅授权管理员可访问此系统</p>
					<p>所有操作将被记录</p>
					{browserInfo && (
						<p className="text-gray-600 mt-2">
							当前浏览器: {browserInfo.name} {browserInfo.version}
							{browserInfo.is360 && <span className="ml-1">（360浏览器）</span>}
						</p>
					)}
					<button
						onClick={() => setShowBrowserInfo(!showBrowserInfo)}
						className="text-gray-400 hover:text-gray-300 transition-colors underline"
					>
						{showBrowserInfo ? '隐藏' : '显示'}调试信息
					</button>
				</div>
			</div>
		</div>
	);
}
