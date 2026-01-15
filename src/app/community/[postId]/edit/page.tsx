'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/textarea';
import {
	Save,
	X,
	Loader2,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

const categories = [
	'经验分享',
	'创作讨论',
	'求助问答',
	'资源分享',
];

export default function EditPostPage() {
	const params = useParams();
	const router = useRouter();
	const postId = params.postId as string;

	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [category, setCategory] = useState('经验分享');
	const [tags, setTags] = useState('');
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [user, setUser] = useState<any>(null);
	const [originalPost, setOriginalPost] = useState<any>(null);

	useEffect(() => {
		fetchUser();
		fetchPost();
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
				const post = data.data.post;
				setOriginalPost(post);
				setTitle(post.title);
				setContent(post.content);
				setCategory(post.category);
				setTags(post.tags?.join(', ') || '');
			} else {
				alert('加载帖子失败');
				router.push('/community');
			}
		} catch (error) {
			console.error('获取帖子失败:', error);
			alert('加载帖子失败');
			router.push('/community');
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		if (!title.trim() || !content.trim()) {
			alert('标题和内容不能为空');
			return;
		}

		setSaving(true);
		try {
			const response = await fetch(`/api/community/posts/${postId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					content,
					category,
					tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
				}),
			});

			const data = await response.json();
			if (data.success) {
				alert('保存成功');
				router.push(`/community/${postId}`);
			} else {
				alert(data.error || '保存失败');
			}
		} catch (error) {
			console.error('保存失败:', error);
			alert('保存失败，请重试');
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		if (title !== originalPost?.title ||
			content !== originalPost?.content ||
			category !== originalPost?.category ||
			tags !== originalPost?.tags?.join(', ')) {
			if (!confirm('确定放弃修改吗？未保存的内容将丢失。')) {
				return;
			}
		}
		router.push(`/community/${postId}`);
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#FF4757]" />
					<p className="text-gray-500">加载中...</p>
				</div>
			</div>
		);
	}

	// 权限检查
	if (user && user.id !== originalPost?.author.id &&
		user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card>
					<CardBody className="text-center py-12">
						<X className="w-16 h-16 mx-auto text-red-500 mb-4" />
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
							无权编辑
						</h2>
						<p className="text-gray-600 dark:text-gray-400 mb-6">
							只有作者和管理员可以编辑此帖子
						</p>
						<Button onClick={() => router.push(`/community/${postId}`)}>
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
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
							编辑帖子
						</h1>
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								onClick={handleCancel}
								disabled={saving}
							>
								<X className="h-4 w-4 mr-2" />
								取消
							</Button>
							<Button
								onClick={handleSave}
								disabled={saving}
								className="bg-[#FF4757] hover:bg-[#FF6B81]"
							>
								{saving ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										保存中...
									</>
								) : (
									<>
										<Save className="h-4 w-4 mr-2" />
										保存
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* 主要内容区 */}
			<div className="max-w-4xl mx-auto px-4 py-8">
				<Card>
					<CardBody className="space-y-6">
						{/* 标题 */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								标题 <span className="text-red-500">*</span>
							</label>
							<Input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="请输入帖子标题"
								className="text-lg"
								maxLength={255}
							/>
						</div>

						{/* 分类 */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								分类 <span className="text-red-500">*</span>
							</label>
							<div className="flex flex-wrap gap-2">
								{categories.map((cat) => (
									<button
										key={cat}
										onClick={() => setCategory(cat)}
										className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
											category === cat
												? 'bg-[#FF4757] text-white shadow-lg shadow-[#FF4757]/20'
												: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
										}`}
									>
										{cat}
									</button>
								))}
							</div>
						</div>

						{/* 标签 */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								标签（用逗号分隔）
							</label>
							<Input
								value={tags}
								onChange={(e) => setTags(e.target.value)}
								placeholder="例如：写作技巧, 爽文创作, 经验分享"
							/>
						</div>

						{/* 内容 */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								内容 <span className="text-red-500">*</span>
							</label>
							<Textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="请输入帖子内容..."
								rows={15}
								className="text-base"
							/>
						</div>

						{/* 预览 */}
						{title || content ? (
							<div>
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
									预览
								</h3>
								<Card className="bg-gray-50 dark:bg-gray-800">
									<CardBody>
										{title && (
											<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
												{title}
											</h2>
										)}
										{category && (
											<Badge variant="secondary" className="mb-3">
												{category}
											</Badge>
										)}
										{content && (
											<p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
												{content}
											</p>
										)}
									</CardBody>
								</Card>
							</div>
						) : null}
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
