'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Flame,
	TrendingUp,
	UserPlus,
	Clock,
	MessageCircle,
	Heart,
	Eye,
	RefreshCw,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface FeedItem {
	type: 'post';
	id: string;
	userId: string;
	postId: string;
	title: string;
	content: string;
	category: string;
	tags: string[];
	viewCount: number;
	likeCount: number;
	commentCount: number;
	hotScore?: number;
	createdAt: string;
	author: {
		id: string;
		username: string;
		avatarUrl?: string;
	};
}

interface RecommendedUser {
	id: string;
	username: string;
	avatarUrl?: string;
	membershipLevel: string;
	createdAt: string;
}

export default function FeedPage() {
	const [user, setUser] = useState<any>(null);
	const [activeTab, setActiveTab] = useState<'following' | 'hot'>('following');
	const [followingFeed, setFollowingFeed] = useState<FeedItem[]>([]);
	const [hotFeed, setHotFeed] = useState<FeedItem[]>([]);
	const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

	useEffect(() => {
		fetchUser();
		fetchData();
	}, [activeTab, timeRange]);

	const fetchUser = async () => {
		try {
			const currentUser = await authClient.getCurrentUser();
			setUser(currentUser);
		} catch (error) {
			console.error('获取用户信息失败:', error);
		}
	};

	const fetchData = async () => {
		setLoading(true);
		try {
			if (user) {
				// 并行获取关注动态、热门动态和推荐用户
				await Promise.all([
					fetchFollowingFeed(),
					fetchHotFeed(),
					fetchRecommendedUsers(),
				]);
			}
		} catch (error) {
			console.error('获取数据失败:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchFollowingFeed = async () => {
		try {
			const response = await fetch('/api/feed/following');
			const data = await response.json();

			if (data.success) {
				setFollowingFeed(data.data.feed);
			}
		} catch (error) {
			console.error('获取关注动态失败:', error);
		}
	};

	const fetchHotFeed = async () => {
		try {
			const params = new URLSearchParams({ timeRange });
			const response = await fetch(`/api/feed/hot?${params.toString()}`);
			const data = await response.json();

			if (data.success) {
				setHotFeed(data.data.feed);
			}
		} catch (error) {
			console.error('获取热门动态失败:', error);
		}
	};

	const fetchRecommendedUsers = async () => {
		try {
			const response = await fetch('/api/users/recommended');
			const data = await response.json();

			if (data.success) {
				setRecommendedUsers(data.data.users);
			}
		} catch (error) {
			console.error('获取推荐用户失败:', error);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchData();
		setRefreshing(false);
	};

	const handleFollow = async (userId: string) => {
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
				// 刷新推荐用户列表
				fetchRecommendedUsers();
			}
		} catch (error) {
			console.error('关注失败:', error);
		}
	};

	const renderFeedItem = (item: FeedItem) => (
		<Link href={`/community/${item.postId}`} key={item.id}>
			<CardBody className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
				<div className="flex items-start gap-3">
					{item.author.avatarUrl ? (
						<img
							src={item.author.avatarUrl}
							alt={item.author.username}
							className="w-10 h-10 rounded-full object-cover"
						/>
					) : (
						<div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF4757] to-[#6366F1] flex items-center justify-center text-white font-bold">
							{item.author.username?.[0]?.toUpperCase()}
						</div>
					)}
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<span className="font-semibold text-gray-900 dark:text-white">
								{item.author.username}
							</span>
							<span className="text-xs text-gray-500">·</span>
							<span className="text-xs text-gray-500">
								{new Date(item.createdAt).toLocaleDateString('zh-CN')}
							</span>
							<Badge variant="secondary" className="ml-2">
								{item.category}
							</Badge>
						</div>
						<h3 className="font-semibold text-gray-900 dark:text-white mb-2">
							{item.title}
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
							{item.content}
						</p>
						<div className="flex items-center gap-4 text-xs text-gray-500">
							<span className="flex items-center gap-1">
								<Eye className="w-4 h-4" />
								{item.viewCount}
							</span>
							<span className="flex items-center gap-1">
								<Heart className="w-4 h-4" />
								{item.likeCount}
							</span>
							<span className="flex items-center gap-1">
								<MessageCircle className="w-4 h-4" />
								{item.commentCount}
							</span>
							{item.hotScore && (
								<span className="flex items-center gap-1 text-[#FF4757]">
									<Flame className="w-4 h-4" />
									热度 {item.hotScore}
								</span>
							)}
						</div>
					</div>
				</div>
			</CardBody>
		</Link>
	);

	if (!user) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
				<div className="max-w-4xl mx-auto px-4 py-12">
					<Card>
						<CardBody className="text-center py-12">
							<MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
							<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
								请先登录
							</h2>
							<p className="text-gray-600 dark:text-gray-400 mb-6">
								登录后查看关注动态和推荐内容
							</p>
							<Link href="/login">
								<Button className="bg-[#FF4757] hover:bg-[#FF6B81]">
									立即登录
								</Button>
							</Link>
						</CardBody>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			{/* 顶部导航栏 */}
			<div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<TrendingUp className="h-8 w-8 text-[#FF4757]" />
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">动态流</h1>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleRefresh}
							disabled={refreshing}
						>
							<RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
							刷新
						</Button>
					</div>
				</div>
			</div>

			{/* 主要内容区 */}
			<div className="max-w-4xl mx-auto px-4 py-8">
				<Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as any)}>
					<TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
						<TabsTrigger value="following" className="flex items-center gap-2">
							<UserPlus className="h-4 w-4" />
							关注动态
						</TabsTrigger>
						<TabsTrigger value="hot" className="flex items-center gap-2">
							<Flame className="h-4 w-4" />
							热门动态
						</TabsTrigger>
					</TabsList>

					{/* 推荐用户 */}
					{recommendedUsers.length > 0 && activeTab === 'following' && (
						<Card className="mb-6">
							<CardHeader>
								<div className="flex items-center justify-between">
									<h3 className="font-semibold text-gray-900 dark:text-white">
										推荐关注
									</h3>
								</div>
							</CardHeader>
							<CardBody>
								<div className="flex gap-4 overflow-x-auto pb-2">
									{recommendedUsers.map((recommendedUser) => (
										<div key={recommendedUser.id} className="flex-shrink-0 text-center">
											{recommendedUser.avatarUrl ? (
												<img
													src={recommendedUser.avatarUrl}
													alt={recommendedUser.username}
													className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
												/>
											) : (
												<div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF4757] to-[#6366F1] flex items-center justify-center text-white font-bold mx-auto mb-2">
													{recommendedUser.username?.[0]?.toUpperCase()}
												</div>
											)}
											<p className="text-sm font-medium text-gray-900 dark:text-white mb-1 truncate w-16">
												{recommendedUser.username}
											</p>
											<Button
												size="sm"
												variant="secondary"
												onClick={() => handleFollow(recommendedUser.id)}
												className="text-xs"
											>
												<UserPlus className="w-3 h-3 mr-1" />
												关注
											</Button>
										</div>
									))}
								</div>
							</CardBody>
						</Card>
					)}

					{/* 关注动态 */}
					<TabsContent value="following">
						<Card>
							{loading && followingFeed.length === 0 ? (
								<CardBody className="py-12 text-center">
									<RefreshCw className="w-8 h-8 mx-auto text-gray-400 mb-4 animate-spin" />
									<p className="text-gray-600 dark:text-gray-400">加载中...</p>
								</CardBody>
							) : followingFeed.length === 0 ? (
								<CardBody className="py-12 text-center">
									<MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
										暂无关注动态
									</h3>
									<p className="text-gray-600 dark:text-gray-400 mb-6">
										关注更多创作者，查看他们的最新动态
									</p>
									<Link href="/community">
										<Button className="bg-[#FF4757] hover:bg-[#FF6B81]">
											浏览社区
										</Button>
									</Link>
								</CardBody>
							) : (
								<div>
									{followingFeed.map((item) => renderFeedItem(item))}
								</div>
							)}
						</Card>
					</TabsContent>

					{/* 热门动态 */}
					<TabsContent value="hot">
						<Card>
							{loading && hotFeed.length === 0 ? (
								<CardBody className="py-12 text-center">
									<RefreshCw className="w-8 h-8 mx-auto text-gray-400 mb-4 animate-spin" />
									<p className="text-gray-600 dark:text-gray-400">加载中...</p>
								</CardBody>
							) : (
								<>
									{/* 时间范围选择器 */}
									<CardHeader className="pb-4">
										<div className="flex items-center gap-2">
											<Clock className="w-4 h-4 text-gray-500" />
											<div className="flex gap-2">
												{(['24h', '7d', '30d', 'all'] as const).map((range) => (
													<button
														key={range}
														onClick={() => setTimeRange(range)}
														className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
															timeRange === range
																? 'bg-[#FF4757] text-white'
																: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
														}`}
													>
														{range === '24h' && '24小时'}
														{range === '7d' && '7天'}
														{range === '30d' && '30天'}
														{range === 'all' && '全部'}
													</button>
												))}
											</div>
										</div>
									</CardHeader>
									{hotFeed.length === 0 ? (
										<CardBody className="py-12 text-center">
											<Flame className="w-16 h-16 mx-auto text-gray-400 mb-4" />
											<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
												暂无热门动态
											</h3>
											<p className="text-gray-600 dark:text-gray-400">
												快来发布优质内容，成为热门吧！
											</p>
										</CardBody>
									) : (
										<div className="pt-0">
											{hotFeed.map((item) => renderFeedItem(item))}
										</div>
									)}
								</>
							)}
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
