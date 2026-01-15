'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card, { CardBody, CardHeader, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import Input from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	MessageCircle,
	Heart,
	Eye,
	Plus,
	Search,
	Filter,
	Star,
	TrendingUp,
	Clock,
	Users,
	BookOpen,
	Mail,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface Post {
	id: string;
	title: string;
	content: string;
	category: string;
	tags: string[];
	viewCount: number;
	likeCount: number;
	commentCount: number;
	isPinned: boolean;
	author: {
		id: string;
		username: string;
		avatarUrl?: string;
	};
	createdAt: string;
}

const categories = [
	{ id: 'all', label: '全部', icon: Users },
	{ id: '经验分享', label: '经验分享', icon: BookOpen },
	{ id: '创作讨论', label: '创作讨论', icon: MessageCircle },
	{ id: '求助问答', label: '求助问答', icon: MessageCircle },
	{ id: '资源分享', label: '资源分享', icon: Star },
];

export default function CommunityPage() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeCategory, setActiveCategory] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState<'latest' | 'hot' | 'popular'>('latest');
	const [user, setUser] = useState<any>(null);

	useEffect(() => {
		fetchUser();
		fetchPosts();
	}, [activeCategory, sortBy, searchQuery]);

	const fetchUser = async () => {
		try {
			const currentUser = await authClient.getCurrentUser();
			setUser(currentUser);
		} catch (error) {
			console.error('获取用户信息失败:', error);
		}
	};

	const fetchPosts = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (activeCategory !== 'all') {
				params.append('category', activeCategory);
			}
			if (searchQuery) {
				params.append('search', searchQuery);
			}
			params.append('sort', sortBy);

			const response = await fetch(`/api/community/posts?${params.toString()}`);
			const data = await response.json();

			if (data.success) {
				setPosts(data.data.posts);
			}
		} catch (error) {
			console.error('获取帖子列表失败:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleLike = async (postId: string) => {
		if (!user) {
			alert('请先登录');
			return;
		}

		try {
			const response = await fetch(`/api/community/posts/${postId}/like`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});

			const data = await response.json();
			if (data.success) {
				setPosts(posts.map(post =>
					post.id === postId
						? { ...post, likeCount: data.data.likeCount, isLiked: data.data.isLiked }
						: post
				));
			}
		} catch (error) {
			console.error('点赞失败:', error);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			{/* 顶部导航栏 */}
			<div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<MessageCircle className="h-8 w-8 text-[#FF4757]" />
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">创作社区</h1>
						</div>
						<div className="flex items-center gap-3">
							{user && (
								<>
									<Link href="/community/feed">
										<Button variant="secondary">
											<TrendingUp className="h-4 w-4 mr-2" />
											动态流
										</Button>
									</Link>
									<Link href="/community/messages">
										<Button variant="secondary">
											<Mail className="h-4 w-4 mr-2" />
											私信
										</Button>
									</Link>
									<Link href="/community/new">
										<Button className="bg-[#FF4757] hover:bg-[#FF6B81]">
											<Plus className="h-4 w-4 mr-2" />
											发布帖子
										</Button>
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* 主要内容区 */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* 搜索和筛选栏 */}
				<div className="mb-8 space-y-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
						<Input
							placeholder="搜索帖子..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 h-12 text-lg"
						/>
					</div>

					<Tabs value={sortBy} onValueChange={(v: string) => setSortBy(v as any)}>
						<TabsList className="grid w-full max-w-md grid-cols-3">
							<TabsTrigger value="latest" className="flex items-center gap-2">
								<Clock className="h-4 w-4" />
								最新
							</TabsTrigger>
							<TabsTrigger value="hot" className="flex items-center gap-2">
								<TrendingUp className="h-4 w-4" />
								热门
							</TabsTrigger>
							<TabsTrigger value="popular" className="flex items-center gap-2">
								<Heart className="h-4 w-4" />
								最热
							</TabsTrigger>
						</TabsList>
					</Tabs>

					{/* 分类标签 */}
					<div className="flex flex-wrap gap-2">
						{categories.map((cat) => {
							const Icon = cat.icon;
							return (
								<Button
									key={cat.id}
									variant={activeCategory === cat.id ? 'primary' : 'secondary'}
									onClick={() => setActiveCategory(cat.id)}
									className={
										activeCategory === cat.id
											? 'bg-[#FF4757] hover:bg-[#FF6B81]'
											: ''
									}
								>
									<Icon className="h-4 w-4 mr-2" />
									{cat.label}
								</Button>
							);
						})}
					</div>
				</div>

				{/* 帖子列表 */}
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<div className="text-gray-500">加载中...</div>
					</div>
				) : posts.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-gray-500">
						<MessageCircle className="h-16 w-16 mb-4 text-gray-300" />
						<p className="text-lg">暂无帖子</p>
						{user && (
							<Link href="/community/new">
								<Button className="mt-4 bg-[#FF4757] hover:bg-[#FF6B81]">
									发布第一个帖子
								</Button>
							</Link>
						)}
					</div>
				) : (
					<div className="grid gap-6">
						{posts.map((post) => (
							<Card
								key={post.id}
								className="hover:shadow-lg transition-shadow duration-200"
							>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											{post.isPinned && (
												<Badge className="mb-2 bg-[#FF4757]">置顶</Badge>
											)}
											<Badge variant="secondary" className="mb-2">
												{post.category}
											</Badge>
											<Link href={`/community/${post.id}`}>
												<h2 className="text-xl font-bold hover:text-[#FF4757] transition-colors">
													{post.title}
												</h2>
											</Link>
										</div>
									</div>
								</CardHeader>
								<CardBody>
									<p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
										{post.content}
									</p>
									{post.tags && post.tags.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{post.tags.map((tag, index) => (
												<Badge key={index} variant="secondary" className="text-xs">
													#{tag}
												</Badge>
											))}
										</div>
									)}
								</CardBody>
								<CardFooter className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{post.author.avatarUrl ? (
											<img
												src={post.author.avatarUrl}
												alt={post.author.username}
												className="w-8 h-8 rounded-full"
											/>
										) : (
											<div className="w-8 h-8 rounded-full bg-[#FF4757] flex items-center justify-center text-white text-sm">
												{post.author.username[0]}
											</div>
										)}
										<span className="text-sm text-gray-600 dark:text-gray-300">
											{post.author.username}
										</span>
									</div>
									<div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
										<span className="flex items-center gap-1">
											<Eye className="h-4 w-4" />
											{post.viewCount}
										</span>
										<span className="flex items-center gap-1">
											<Heart className="h-4 w-4" />
											{post.likeCount}
										</span>
										<span className="flex items-center gap-1">
											<MessageCircle className="h-4 w-4" />
											{post.commentCount}
										</span>
									</div>
								</CardFooter>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
