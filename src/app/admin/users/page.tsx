'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
	id: string;
	email: string;
	username: string | null;
	membershipLevel: string;
	isActive: boolean;
	isBanned: boolean;
	createdAt: string;
	lastLoginAt: string | null;
}

export default function UsersPage() {
	const router = useRouter();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const pageSize = 50;

	useEffect(() => {
		const token = localStorage.getItem('admin_token');
		if (!token) {
			router.push('/admin/login');
			return;
		}

		fetchUsers(token, 0, pageSize, searchQuery);
	}, [router]);

	const fetchUsers = async (token: string, skip: number, limit: number, query: string) => {
		try {
			const response = await fetch(`/api/user/list?skip=${skip}&limit=${limit}&searchQuery=${encodeURIComponent(query)}`, {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (data.success) {
				setUsers(data.users);
				setTotal(data.total || data.users.length);
			}
		} catch (error) {
			console.error('获取用户列表失败:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const token = localStorage.getItem('admin_token');
		if (token) {
			setPage(1);
			fetchUsers(token, 0, pageSize, searchQuery);
		}
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		const token = localStorage.getItem('admin_token');
		if (token) {
			fetchUsers(token, (newPage - 1) * pageSize, pageSize, searchQuery);
		}
	};

	const handleDeleteUser = async (userId: string, email: string) => {
		if (!confirm(`确定要删除用户 ${email} 吗？`)) return;

		try {
			const token = localStorage.getItem('admin_token');
			const response = await fetch('/api/admin/users/delete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({ userId }),
			});

			const data = await response.json();

			if (data.success) {
				alert('用户已删除');
				const token = localStorage.getItem('admin_token');
				if (token) {
					fetchUsers(token, (page - 1) * pageSize, pageSize, searchQuery);
				}
			} else {
				alert(data.error || '删除失败');
			}
		} catch (error) {
			alert('删除失败：' + error);
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
							<span className="text-white font-medium">用户管理</span>
						</div>
					</div>
				</div>
			</nav>

			{/* 主内容区 */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* 搜索框 */}
				<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
					<form onSubmit={handleSearch} className="flex gap-4">
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="搜索用户名或邮箱..."
							className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button
							type="submit"
							className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
						>
							搜索
						</button>
					</form>
				</div>

				{/* 用户列表 */}
				<div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
					<div className="p-6 border-b border-white/10 flex justify-between items-center">
						<h2 className="text-xl font-bold text-white">用户列表</h2>
						span className="text-gray-400 text-sm">
							共 {total} 个用户
						</span>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="text-left text-gray-400 text-sm border-b border-white/10">
									<th className="px-6 py-4">用户ID</th>
									<th className="px-6 py-4">用户名</th>
									<th className="px-6 py-4">邮箱</th>
									<th className="px-6 py-4">会员等级</th>
									<th className="px-6 py-4">状态</th>
									<th className="px-6 py-4">注册时间</th>
									<th className="px-6 py-4">最后登录</th>
									<th className="px-6 py-4">操作</th>
								</tr>
							</thead>
							<tbody>
								{users.length === 0 ? (
									<tr>
										<td colSpan={8} className="px-6 py-12 text-center text-gray-400">
											暂无用户
										</td>
									</tr>
								) : (
									users.map((user) => (
										<tr key={user.id} className="border-b border-white/10 text-white hover:bg-white/5 transition-colors">
											<td className="px-6 py-4 font-mono text-sm">{user.id}</td>
											<td className="px-6 py-4">{user.username || '-'}</td>
											<td className="px-6 py-4">{user.email}</td>
											<td className="px-6 py-4">
												<span className={
													user.membershipLevel === 'PREMIUM' ? 'bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm' :
													user.membershipLevel === 'VIP' ? 'bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-sm' :
													'bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-sm'
												}>
													{user.membershipLevel}
												</span>
											</td>
											<td className="px-6 py-4">
												{!user.isActive && (
													<span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-sm mr-1">
														未激活
													</span>
												)}
												{user.isBanned && (
													<span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-sm">
														已封禁
													</span>
												)}
												{user.isActive && !user.isBanned && (
													<span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
														正常
													</span>
												)}
											</td>
											<td className="px-6 py-4 text-sm">
												{new Date(user.createdAt).toLocaleDateString('zh-CN')}
											</td>
											<td className="px-6 py-4 text-sm">
												{user.lastLoginAt
													? new Date(user.lastLoginAt).toLocaleDateString('zh-CN')
													: '从未登录'}
											</td>
											<td className="px-6 py-4">
												<button
													onClick={() => handleDeleteUser(user.id, user.email)}
													className="bg-red-500/20 text-red-400 px-3 py-1 rounded hover:bg-red-500/30 transition-colors text-sm"
												>
													删除
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* 分页 */}
					{total > pageSize && (
						<div className="p-4 border-t border-white/10 flex justify-center items-center space-x-2">
							<button
								onClick={() => handlePageChange(page - 1)}
								disabled={page === 1}
								className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								上一页
							</button>
							<span className="text-white px-4">
								第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页
							</span>
							<button
								onClick={() => handlePageChange(page + 1)}
								disabled={page >= Math.ceil(total / pageSize)}
								className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								下一页
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
