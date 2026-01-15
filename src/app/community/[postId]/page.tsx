'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import Textarea from '@/components/ui/textarea';
import {
	MessageCircle,
	Heart,
	Eye,
	Share2,
	ArrowLeft,
	Send,
	User,
	Clock,
	ThumbsUp,
	Trash2,
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
	isLiked?: boolean;
	author: {
		id: string;
		username: string;
		avatarUrl?: string;
	};
	createdAt: string;
}

interface Comment {
	id: string;
	content: string;
	author: {
		id: string;
		username: string;
		avatarUrl?: string;
	};
	createdAt: string;
	isAuthor: boolean;
}

export default function PostDetailPage() {
	const params = useParams();
	const router = useRouter();
	const postId = params.postId as string;

	const [post, setPost] = useState<Post | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [loading, setLoading] = useState(true);
	const [commentContent, setCommentContent] = useState('');
	const [user, setUser] = useState<any>(null);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		fetchUser();
		fetchPost();
		fetchComments();
	}, [postId]);

	const fetchUser = async () => {
		try {
			const currentUser = await authClient.getCurrentUser();
			setUser(currentUser);
		} catch (error) {
			console.error('获取用户信息失败:', error);
		}
	};

	const fetchPost = async () => {
		setLoading(true);
		try {
			const response = await fetch(`/api/community/posts/${postId}`);
			const data = await response.json();

			if (data.success) {
				setPost(data.data.post);
			}
		} catch (error) {
			console.error('获取帖子详情失败:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchComments = async () => {
		try {
			const response = await fetch(`/api/community/${postId}/comments`);
			const data = await response.json();

			if (data.success) {
				setComments(data.data.comments);
			}
		} catch (error) {
			console.error('获取评论失败:', error);
		}
	};

	const handleLike = async () => {
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
				setPost(prev => prev ? { ...prev, likeCount: data.data.likeCount, isLiked: data.data.isLiked } : null);
			}
		} catch (error) {
			console.error('点赞失败:', error);
		}
	};

	const handleComment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) {
			alert('请先登录');
			return;
		}
		if (!commentContent.trim()) {
			return;
		}

		setSubmitting(true);
		try {
			const response = await fetch(`/api/community/${postId}/comments`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: commentContent }),
			});

			const data = await response.json();
			if (data.success) {
				setCommentContent('');
				fetchComments();
				fetchPost(); // 更新评论数
			}
		} catch (error) {
			console.error('评论失败:', error);
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteComment = async (commentId: string) => {
		if (!confirm('确定删除这条评论吗？')) {
			return;
		}

		try {
			const response = await fetch(`/api/community/comments/${commentId}`, {
				method: 'DELETE',
			});

			const data = await response.json();
			if (data.success) {
				setComments(comments.filter(c => c.id !== commentId));
				fetchPost(); // 更新评论数
			}
		} catch (error) {
			console.error('删除评论失败:', error);
		}
	};

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: post?.title,
					text: post?.content,
					url: window.location.href,
				});
			} catch (error) {
				console.log('分享失败:', error);
			}
		} else {
			navigator.clipboard.writeText(window.location.href);
			alert('链接已复制到剪贴板');
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-gray-500">加载中...</div>
			</div>
		);
	}

	if (!post) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-gray-500">帖子不存在</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			{/* 顶部导航栏 */}
			<div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<Button variant="ghost" onClick={() => router.back()}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							返回
						</Button>
						<Button variant="secondary" onClick={handleShare}>
							<Share2 className="h-4 w-4 mr-2" />
							分享
						</Button>
					</div>
				</div>
			</div>

			{/* 主要内容区 */}
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* 帖子详情 */}
				<Card className="mb-8">
					<CardHeader>
						{post.isPinned && (
							<Badge className="mb-2 bg-[#FF4757]">置顶</Badge>
						)}
						<Badge variant="secondary" className="mb-2">
							{post.category}
						</Badge>
						<h1 className="text-3xl font-bold mb-4">{post.title}</h1>
						<div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
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
								<User className="h-4 w-4" />
								<span>{post.author.username}</span>
							</div>
							<div className="flex items-center gap-1">
								<Clock className="h-4 w-4" />
								{new Date(post.createdAt).toLocaleString('zh-CN')}
							</div>
						</div>
					</CardHeader>
					<CardBody>
						<div className="prose prose-lg max-w-none">
							<p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
								{post.content}
							</p>
						</div>
						{post.tags && post.tags.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-6">
								{post.tags.map((tag, index) => (
									<Badge key={index} variant="secondary" className="text-sm">
										#{tag}
									</Badge>
								))}
							</div>
						)}
					</CardBody>
				</Card>

				{/* 操作栏 */}
				<div className="flex items-center justify-center gap-4 mb-8">
					<Button
						variant={post.isLiked ? 'primary' : 'secondary'}
						className={post.isLiked ? 'bg-[#FF4757] hover:bg-[#FF6B81]' : ''}
						onClick={handleLike}
					>
						<Heart className={`h-4 w-4 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
						点赞 {post.likeCount}
					</Button>
					<div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
						<Eye className="h-4 w-4" />
						浏览 {post.viewCount}
					</div>
					<div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
						<MessageCircle className="h-4 w-4" />
						评论 {post.commentCount}
					</div>
				</div>

				{/* 评论区 */}
				<Card>
					<CardHeader>
						<h2 className="text-xl font-bold flex items-center gap-2">
							<MessageCircle className="h-5 w-5" />
							评论 ({comments.length})
						</h2>
					</CardHeader>
					<CardBody className="space-y-6">
						{/* 发表评论 */}
						{user ? (
							<form onSubmit={handleComment} className="space-y-3">
								<Textarea
									placeholder="发表你的评论..."
									value={commentContent}
									onChange={(e) => setCommentContent(e.target.value)}
									rows={3}
								/>
								<div className="flex justify-end">
									<Button
										type="submit"
										disabled={submitting || !commentContent.trim()}
										className="bg-[#FF4757] hover:bg-[#FF6B81]"
									>
										<Send className="h-4 w-4 mr-2" />
										发表评论
									</Button>
								</div>
							</form>
						) : (
							<div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
								<p className="text-gray-600 dark:text-gray-300 mb-3">
									登录后发表评论
								</p>
								<Link href="/login">
									<Button className="bg-[#FF4757] hover:bg-[#FF6B81]">
										立即登录
									</Button>
								</Link>
							</div>
						)}

						{/* 评论列表 */}
						<div className="space-y-4">
							{comments.length === 0 ? (
								<div className="text-center py-8 text-gray-500">
									暂无评论，快来发表第一条评论吧！
								</div>
							) : (
								comments.map((comment) => (
									<div
										key={comment.id}
										className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
									>
										<div className="flex items-start gap-3">
											{comment.author.avatarUrl ? (
												<img
													src={comment.author.avatarUrl}
													alt={comment.author.username}
													className="w-10 h-10 rounded-full"
												/>
											) : (
												<div className="w-10 h-10 rounded-full bg-[#FF4757] flex items-center justify-center text-white text-sm">
													{comment.author.username[0]}
												</div>
											)}
											<div className="flex-1">
												<div className="flex items-center justify-between mb-2">
													<div className="flex items-center gap-2">
														<span className="font-semibold text-sm">
															{comment.author.username}
														</span>
														{comment.isAuthor && (
															<Badge className="text-xs bg-[#FF4757]">作者</Badge>
														)}
													</div>
													<span className="text-xs text-gray-500">
														{new Date(comment.createdAt).toLocaleString('zh-CN')}
													</span>
												</div>
												<p className="text-gray-800 dark:text-gray-200">
													{comment.content}
												</p>
												{(comment.author.id === user?.id || user?.role === 'ADMIN') && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDeleteComment(comment.id)}
														className="mt-2 text-red-500 hover:text-red-600"
													>
														<Trash2 className="h-4 w-4 mr-1" />
														删除
													</Button>
												)}
											</div>
										</div>
									</div>
								))
							)}
						</div>
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
