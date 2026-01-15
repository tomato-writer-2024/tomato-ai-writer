'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	ArrowLeft,
	UserPlus,
	UserCheck,
	Calendar,
	MapPin,
	Phone,
	Mail,
	FileText,
	MessageCircle,
	Heart,
	Users,
	ChevronRight,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface UserProfile {
	id: string;
	username: string;
	email?: string;
	avatarUrl?: string;
	role: string;
	membershipLevel: string;
	location?: string;
	phone?: string;
	createdAt: string;
	lastLoginAt?: string;
	stats: {
		postCount: number;
		followingCount: number;
		followerCount: number;
	};
	isFollowing?: boolean;
	recentPosts: any[];
}

export default function UserProfilePage() {
	const params = useParams();
	const router = useRouter();
	const userId = params.userId as string;

	const [user, setUser] = useState<any>(null);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [following, setFollowing] = useState(false);
	const [activeTab, setActiveTab] = useState('posts');

	useEffect(() => {
		fetchUser();
		fetchProfile();
	}, [userId]);

	const fetchUser = async () => {
		try {
			const currentUser = await authClient.getCurrentUser();
			setUser(currentUser);
		} catch (error) {
			console.error('获取用户信息失败:', error);
		}
	};

	const fetchProfile = async () => {
		setLoading(true);
		try {
			const response = await fetch(`/api/users/${userId}`);
			const data = await response.json();

			if (data.success) {
				setProfile(data.data.user);
				setFollowing(data.data.user.isFollowing || false);
			}
		} catch (error) {
			console.error('获取用户资料失败:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleFollow = async () => {
		if (!user) {
			alert('请先登录');
			return;
		}

		try {
			const response = await fetch(`/api/users/${userId}/follow`, {
				method: 'POST',
			});

			const data = await response.json();
			if (data.success) {
				setFollowing(true);
				// 更新统计数据
				setProfile(prev => prev ? {
					...prev,
					stats: {
						...prev.stats,
						followerCount: prev.stats.followerCount + 1,
					}
				} : null);
			}
		} catch (error) {
			console.error('关注失败:', error);
			alert('关注失败');
		}
	};

	const handleUnfollow = async () => {
		if (!confirm('确定取消关注吗？')) {
			return;
		}

		try {
			const response = await fetch(`/api/users/${userId}/follow`, {
				method: 'DELETE',
			});

			const data = await response.json();
			if (data.success) {
				setFollowing(false);
				// 更新统计数据
				setProfile(prev => prev ? {
					...prev,
					stats: {
						...prev.stats,
						followerCount: prev.stats.followerCount - 1,
					}
				} : null);
			}
		} catch (error) {
			console.error('取消关注失败:', error);
			alert('取消关注失败');
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-gray-500">加载中...</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card>
					<CardBody className="text-center py-12">
						<p className="text-gray-500">用户不存在</p>
						<Button onClick={() => router.back()} className="mt-4">
							<ArrowLeft className="h-4 w-4 mr-2" />
							返回
						</Button>
					</CardBody>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			{/* 顶部导航栏 */}
			<div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className="flex items-center gap-2">
						<Button variant="ghost" onClick={() => router.back()}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							返回
						</Button>
						<h1 className="text-xl font-bold text-gray-900 dark:text-white">
							{profile.username}
						</h1>
					</div>
				</div>
			</div>

			{/* 主要内容区 */}
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* 用户资料卡片 */}
				<Card className="mb-8">
					<CardBody>
						<div className="flex items-start gap-6">
							{/* 头像 */}
							{profile.avatarUrl ? (
								<img
									src={profile.avatarUrl}
									alt={profile.username}
									className="w-24 h-24 rounded-full object-cover"
								/>
							) : (
								<div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF4757] to-[#6366F1] flex items-center justify-center text-white text-3xl font-bold">
									{profile.username[0]?.toUpperCase()}
								</div>
							)}

							{/* 用户信息 */}
							<div className="flex-1">
								<div className="flex items-center justify-between mb-3">
									<div>
										<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
											{profile.username}
										</h2>
										<div className="flex items-center gap-2">
											{profile.membershipLevel !== 'FREE' && (
												<Badge className="bg-gradient-to-r from-[#FF4757] to-[#FF6B81]">
													{profile.membershipLevel}
												</Badge>
											)}
											<Badge variant="secondary">
												{profile.role}
											</Badge>
										</div>
									</div>
									{user && user.id !== userId && (
										<>
											{following ? (
												<Button
													variant="secondary"
													onClick={handleUnfollow}
												>
													<UserCheck className="h-4 w-4 mr-2" />
													已关注
												</Button>
											) : (
												<Button
													className="bg-[#FF4757] hover:bg-[#FF6B81]"
													onClick={handleFollow}
												>
													<UserPlus className="h-4 w-4 mr-2" />
													关注
												</Button>
											)}
										</>
									)}
								</div>

								{/* 详细信息 */}
								<div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
									{profile.location && (
										<div className="flex items-center gap-2">
											<MapPin className="h-4 w-4" />
											{profile.location}
										</div>
									)}
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										{new Date(profile.createdAt).toLocaleDateString('zh-CN')} 加入
									</div>
									{profile.lastLoginAt && (
										<div className="flex items-center gap-2">
											<Phone className="h-4 w-4" />
											最后登录：{new Date(profile.lastLoginAt).toLocaleString('zh-CN')}
										</div>
									)}
								</div>
							</div>
						</div>

						{/* 统计数据 */}
						<div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
							<Link href={`/community/users/${userId}/posts`} className="text-center group">
								<div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-[#FF4757] transition-colors">
									{profile.stats.postCount}
								</div>
								<div className="text-sm text-gray-600 dark:text-gray-300">帖子</div>
							</Link>
							<Link href={`/community/users/${userId}/following`} className="text-center group">
								<div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-[#FF4757] transition-colors">
									{profile.stats.followingCount}
								</div>
								<div className="text-sm text-gray-600 dark:text-gray-300">关注</div>
							</Link>
							<Link href={`/community/users/${userId}/followers`} className="text-center group">
								<div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-[#FF4757] transition-colors">
									{profile.stats.followerCount}
								</div>
								<div className="text-sm text-gray-600 dark:text-gray-300">粉丝</div>
							</Link>
						</div>
					</CardBody>
				</Card>

				{/* 标签页 */}
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
						<TabsTrigger value="posts" className="flex items-center gap-2">
							<FileText className="h-4 w-4" />
							帖子
						</TabsTrigger>
						<TabsTrigger value="following" className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							关注
						</TabsTrigger>
						<TabsTrigger value="followers" className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							粉丝
						</TabsTrigger>
					</TabsList>

					{/* 帖子列表 */}
					<TabsContent value="posts">
						<Card>
							<CardHeader>
								<h3 className="font-semibold text-gray-900 dark:text-white">
									最近帖子
								</h3>
							</CardHeader>
							<CardBody>
								{profile.recentPosts.length === 0 ? (
									<div className="text-center py-8 text-gray-500">
										暂无帖子
									</div>
								) : (
									<div className="space-y-4">
										{profile.recentPosts.map((post: any) => (
											<Link
												key={post.id}
												href={`/community/${post.id}`}
												className="block"
											>
												<CardBody className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
													<div className="flex items-start justify-between mb-2">
														<h4 className="font-semibold text-gray-900 dark:text-white">
															{post.title}
														</h4>
														<Badge variant="secondary" className="text-xs">
															{post.category}
														</Badge>
													</div>
													<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
														{post.content}
													</p>
													<div className="flex items-center gap-4 text-xs text-gray-500">
														<span className="flex items-center gap-1">
															<MessageCircle className="w-3 h-3" />
															{post.commentCount}
														</span>
														<span className="flex items-center gap-1">
															<Heart className="w-3 h-3" />
															{post.likeCount}
														</span>
														<span className="flex items-center gap-1">
															<FileText className="w-3 h-3" />
															{post.viewCount}
														</span>
													</div>
												</CardBody>
											</Link>
										))}
									</div>
								)}
							</CardBody>
						</Card>
					</TabsContent>

					{/* 关注列表 */}
					<TabsContent value="following">
						<Card>
							<CardBody>
								<UserFollowList userId={userId} type="following" />
							</CardBody>
						</Card>
					</TabsContent>

					{/* 粉丝列表 */}
					<TabsContent value="followers">
						<Card>
							<CardBody>
								<UserFollowList userId={userId} type="followers" />
							</CardBody>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

// 关注/粉丝列表组件
function UserFollowList({ userId, type }: { userId: string; type: 'following' | 'followers' }) {
	const [users, setUsers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [currentUser, setCurrentUser] = useState<any>(null);

	useEffect(() => {
		fetchCurrentUser();
		fetchUsers();
	}, [userId, type, page]);

	const fetchCurrentUser = async () => {
		try {
			const user = await authClient.getCurrentUser();
			setCurrentUser(user);
		} catch (error) {
			console.error('获取当前用户失败:', error);
		}
	};

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const endpoint = type === 'following'
				? `/api/users/${userId}/following`
				: `/api/users/${userId}/followers`;
			const response = await fetch(`${endpoint}?page=${page}&pageSize=20`);
			const data = await response.json();

			if (data.success) {
				setUsers(data.data[type]);
				setTotal(data.data.total);
			}
		} catch (error) {
			console.error('获取列表失败:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleFollow = async (targetUserId: string) => {
		if (!currentUser) {
			alert('请先登录');
			return;
		}

		try {
			const response = await fetch(`/api/users/${targetUserId}/follow`, {
				method: 'POST',
			});

			const data = await response.json();
			if (data.success) {
				fetchUsers();
			}
		} catch (error) {
			console.error('关注失败:', error);
		}
	};

	return (
		<div>
			{loading ? (
				<div className="text-center py-8 text-gray-500">加载中...</div>
			) : users.length === 0 ? (
				<div className="text-center py-8 text-gray-500">
					{type === 'following' ? '暂无关注' : '暂无粉丝'}
				</div>
			) : (
				<div className="space-y-3">
					{users.map((item: any) => (
						<div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
							<Link href={`/community/users/${item.user.id}`} className="flex items-center gap-3">
								{item.user.avatarUrl ? (
									<img
										src={item.user.avatarUrl}
										alt={item.user.username}
										className="w-10 h-10 rounded-full"
									/>
								) : (
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF4757] to-[#6366F1] flex items-center justify-center text-white font-bold">
										{item.user.username[0]?.toUpperCase()}
									</div>
								)}
								<div>
									<div className="font-semibold text-gray-900 dark:text-white">
										{item.user.username}
									</div>
									{item.user.isFollowing !== undefined && (
										<div className="text-xs text-gray-500">
											{item.user.isFollowing ? '已关注' : ''}
										</div>
									)}
								</div>
							</Link>
							{currentUser && currentUser.id !== item.user.id && !item.user.isFollowing && type === 'followers' && (
								<Button
									size="sm"
									variant="secondary"
									onClick={() => handleFollow(item.user.id)}
								>
									<UserPlus className="h-4 w-4 mr-1" />
									关注
								</Button>
							)}
						</div>
					))}
					{/* 分页 */}
					{total > 20 && (
						<div className="flex justify-center gap-2 mt-6">
							{Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map(
								(p) => (
									<button
										key={p}
										onClick={() => setPage(p)}
										className={`px-3 py-1 rounded-lg ${
											page === p
												? 'bg-[#FF4757] text-white'
												: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
										}`}
									>
										{p}
									</button>
								)
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
