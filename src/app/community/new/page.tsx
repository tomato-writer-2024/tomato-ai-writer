'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
	ArrowLeft,
	Send,
	Plus,
	X,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

const categories = [
	'经验分享',
	'创作讨论',
	'求助问答',
	'资源分享',
];

export default function NewPostPage() {
	const router = useRouter();
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	const [formData, setFormData] = useState({
		title: '',
		content: '',
		category: '创作讨论',
		tags: [] as string[],
	});

	const [tagInput, setTagInput] = useState('');

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = async () => {
		try {
			const currentUser = await authClient.getCurrentUser();
			if (!currentUser) {
				router.push('/login');
				return;
			}
			setUser(currentUser);
			setLoading(false);
		} catch (error) {
			router.push('/login');
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.title.trim() || !formData.content.trim()) {
			alert('请填写标题和内容');
			return;
		}

		setSubmitting(true);
		try {
			const response = await fetch('/api/community/posts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			const data = await response.json();
			if (data.success) {
				alert('发布成功！');
				router.push(`/community/${data.data.post.id}`);
			} else {
				alert(data.error || '发布失败');
			}
		} catch (error) {
			console.error('发布失败:', error);
			alert('发布失败，请重试');
		} finally {
			setSubmitting(false);
		}
	};

	const handleAddTag = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && tagInput.trim()) {
			e.preventDefault();
			if (!formData.tags.includes(tagInput.trim())) {
				setFormData({
					...formData,
					tags: [...formData.tags, tagInput.trim()],
				});
			}
			setTagInput('');
		}
	};

	const handleRemoveTag = (tag: string) => {
		setFormData({
			...formData,
			tags: formData.tags.filter(t => t !== tag),
		});
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-gray-500">加载中...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			{/* 顶部导航栏 */}
			<div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-4xl mx-auto px-4 py-4">
					<div className="flex items-center gap-3">
						<Button variant="ghost" onClick={() => router.back()}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							返回
						</Button>
						<h1 className="text-xl font-bold">发布新帖子</h1>
					</div>
				</div>
			</div>

			{/* 主要内容区 */}
			<div className="max-w-4xl mx-auto px-4 py-8">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Send className="h-5 w-5 text-[#FF4757]" />
							发布帖子
						</CardTitle>
					</CardHeader>
					<CardBody>
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* 标题 */}
							<div>
								<label className="block text-sm font-medium mb-2">
									标题 *
								</label>
								<Input
									placeholder="请输入帖子标题"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									className="text-lg"
									maxLength={200}
								/>
								<p className="text-xs text-gray-500 mt-1">
									{formData.title.length}/200
								</p>
							</div>

							{/* 分类 */}
							<div>
								<label className="block text-sm font-medium mb-2">
									分类 *
								</label>
								<div className="flex flex-wrap gap-2">
									{categories.map((cat) => (
										<Badge
											key={cat}
											variant={formData.category === cat ? 'default' : 'outline'}
											className={
												formData.category === cat
													? 'bg-[#FF4757] hover:bg-[#FF6B81] cursor-pointer'
													: 'cursor-pointer'
											}
										>
											{cat}
										</Badge>
									))}
								</div>
							</div>

							{/* 标签 */}
							<div>
								<label className="block text-sm font-medium mb-2">
									标签（按Enter添加）
								</label>
								<div className="flex flex-wrap gap-2 mb-2">
									{formData.tags.map((tag) => (
										<Badge key={tag} variant="secondary" className="pr-1">
											{tag}
											<button
												type="button"
												onClick={() => handleRemoveTag(tag)}
												className="ml-1 hover:text-red-500"
											>
												<X className="h-3 w-3" />
											</button>
										</Badge>
									))}
								</div>
								<Input
									placeholder="输入标签后按Enter添加"
									value={tagInput}
									onChange={(e) => setTagInput(e.target.value)}
									onKeyDown={handleAddTag}
									className="w-full"
								/>
							</div>

							{/* 内容 */}
							<div>
								<label className="block text-sm font-medium mb-2">
									内容 *
								</label>
								<Textarea
									placeholder="请输入帖子内容，支持Markdown格式"
									value={formData.content}
									onChange={(e) => setFormData({ ...formData, content: e.target.value })}
									rows={12}
									className="min-h-[300px]"
								/>
								<p className="text-xs text-gray-500 mt-1">
									{formData.content.length} 字
								</p>
							</div>

							{/* 提交按钮 */}
							<div className="flex justify-end gap-3">
								<Button
									type="button"
									variant="secondary"
									onClick={() => router.back()}
									disabled={submitting}
								>
									取消
								</Button>
								<Button
									type="submit"
									disabled={submitting}
									className="bg-[#FF4757] hover:bg-[#FF6B81]"
								>
									<Send className="h-4 w-4 mr-2" />
									{submitting ? '发布中...' : '发布帖子'}
								</Button>
							</div>
						</form>
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
