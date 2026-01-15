'use client';

import { useState, useEffect, useRef } from 'react';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
	Sparkles,
	Zap,
	CheckCircle,
	XCircle,
	Download,
	Copy,
	FileText,
	BookOpen,
	MessageSquare,
	RefreshCw,
	Settings,
	TrendingUp,
	Target,
	Lightbulb,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface QualityResult {
	score: number;
	issues: Array<{
		type: 'length' | 'repetition' | 'coherence' | 'style' | 'sensitive';
		severity: 'low' | 'medium' | 'high';
		message: string;
	}>;
	suggestions: string[];
	estimatedCompletionRate: number;
	shuangdianCount: number;
	// 5维度评分
	dimensionScores: {
		lengthScore: number;
		repetitionScore: number;
		coherenceScore: number;
		styleScore: number;
		safetyScore: number;
	};
}

interface Template {
	id: string;
	name: string;
	category: string;
	genre: string;
	prompt: string;
	parameters: Array<{
		name: string;
		description: string;
		default: any;
		required: boolean;
	}>;
	example: string;
	tags: string[];
}

export default function AIOptimizePage() {
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('generate');

	// 生成相关
	const [content, setContent] = useState('');
	const [generatedContent, setGeneratedContent] = useState('');
	const [isGenerating, setIsGenerating] = useState(false);
	const [wordCount, setWordCount] = useState([500]);

	// 质量检测相关
	const [checkContent, setCheckContent] = useState('');
	const [qualityResult, setQualityResult] = useState<QualityResult | null>(null);
	const [isChecking, setIsChecking] = useState(false);

	// 模板相关
	const [templates, setTemplates] = useState<Template[]>([]);
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
	const [templateParams, setTemplateParams] = useState<Record<string, any>>({});

	// 自定义模板相关
	const [showCreateTemplate, setShowCreateTemplate] = useState(false);
	const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
	const [newTemplate, setNewTemplate] = useState<Partial<Template>>({});

	useEffect(() => {
		fetchUser();
		fetchTemplates();
	}, []);

	const fetchUser = async () => {
		try {
			const currentUser = await authClient.getCurrentUser();
			if (!currentUser) {
				window.location.href = '/login';
				return;
			}
			setUser(currentUser);
		} catch (error) {
			window.location.href = '/login';
		} finally {
			setLoading(false);
		}
	};

	const fetchTemplates = async () => {
		try {
			const response = await fetch('/api/ai/optimize/templates');
			const data = await response.json();
			if (data.success) {
				setTemplates(data.data.templates);
			}
		} catch (error) {
			console.error('获取模板失败:', error);
		}
	};

	const handleGenerate = async () => {
		if (!content.trim()) {
			alert('请输入内容');
			return;
		}

		setIsGenerating(true);
		setGeneratedContent('');

		try {
			const response = await fetch('/api/ai/optimize/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					prompt: content,
					wordCount: wordCount[0],
				}),
			});

			if (!response.ok) {
				throw new Error('生成失败');
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (reader) {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value, { stream: true });
					setGeneratedContent(prev => prev + chunk);
				}
			}
		} catch (error) {
			console.error('生成失败:', error);
			alert('生成失败，请重试');
		} finally {
			setIsGenerating(false);
		}
	};

	const handleStopGeneration = () => {
		setIsGenerating(false);
	};

	const handleQualityCheck = async () => {
		if (!checkContent.trim()) {
			alert('请输入内容');
			return;
		}

		setIsChecking(true);
		setQualityResult(null);

		try {
			const response = await fetch('/api/ai/optimize/quality', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: checkContent }),
			});

			const data = await response.json();
			if (data.success) {
				setQualityResult(data.data.result);
			}
		} catch (error) {
			console.error('质量检测失败:', error);
			alert('质量检测失败，请重试');
		} finally {
			setIsChecking(false);
		}
	};

	const handleUseTemplate = (template: Template) => {
		setSelectedTemplate(template);
		const params: Record<string, any> = {};
		template.parameters.forEach(param => {
			params[param.name] = param.default;
		});
		setTemplateParams(params);
	};

	const handleGenerateFromTemplate = async () => {
		if (!selectedTemplate) return;

		setIsGenerating(true);
		setGeneratedContent('');

		try {
			const response = await fetch('/api/ai/optimize/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					templateId: selectedTemplate.id,
					params: templateParams,
				}),
			});

			if (!response.ok) {
				throw new Error('生成失败');
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (reader) {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value, { stream: true });
					setGeneratedContent(prev => prev + chunk);
				}
			}
		} catch (error) {
			console.error('生成失败:', error);
			alert('生成失败，请重试');
		} finally {
			setIsGenerating(false);
		}
	};

	const handleCreateTemplate = async () => {
		if (!newTemplate.name || !newTemplate.prompt) {
			alert('请填写模板名称和提示词');
			return;
		}

		try {
			const response = await fetch('/api/community/templates', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newTemplate),
			});

			const data = await response.json();
			if (data.success) {
				alert('模板创建成功');
				setShowCreateTemplate(false);
				setNewTemplate({});
				fetchTemplates();
			} else {
				alert(data.error || '创建失败');
			}
		} catch (error) {
			console.error('创建模板失败:', error);
			alert('创建模板失败');
		}
	};

	const handleUpdateTemplate = async () => {
		if (!editingTemplate || !editingTemplate.name || !editingTemplate.prompt) {
			return;
		}

		try {
			const response = await fetch(`/api/community/templates/${editingTemplate.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editingTemplate),
			});

			const data = await response.json();
			if (data.success) {
				alert('模板更新成功');
				setEditingTemplate(null);
				fetchTemplates();
			} else {
				alert(data.error || '更新失败');
			}
		} catch (error) {
			console.error('更新模板失败:', error);
			alert('更新模板失败');
		}
	};

	const handleDeleteTemplate = async (templateId: string) => {
		if (!confirm('确定删除这个模板吗？')) {
			return;
		}

		try {
			const response = await fetch(`/api/community/templates/${templateId}`, {
				method: 'DELETE',
			});

			const data = await response.json();
			if (data.success) {
				alert('模板删除成功');
				if (selectedTemplate?.id === templateId) {
					setSelectedTemplate(null);
				}
				fetchTemplates();
			} else {
				alert(data.error || '删除失败');
			}
		} catch (error) {
			console.error('删除模板失败:', error);
			alert('删除模板失败');
		}
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(generatedContent);
		alert('已复制到剪贴板');
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
				<div className="max-w-6xl mx-auto px-4 py-4">
					<div className="flex items-center gap-3">
						<Sparkles className="h-8 w-8 text-[#FF4757]" />
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
							AI写作优化
						</h1>
					</div>
				</div>
			</div>

			{/* 主要内容区 */}
			<div className="max-w-6xl mx-auto px-4 py-8">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="generate" className="flex items-center gap-2">
							<Zap className="h-4 w-4" />
							流式生成
						</TabsTrigger>
						<TabsTrigger value="quality" className="flex items-center gap-2">
							<CheckCircle className="h-4 w-4" />
							质量检测
						</TabsTrigger>
						<TabsTrigger value="templates" className="flex items-center gap-2">
							<BookOpen className="h-4 w-4" />
							模板管理
						</TabsTrigger>
					</TabsList>

					{/* 流式生成 */}
					<TabsContent value="generate" className="mt-6 space-y-6">
						<div className="grid gap-6 md:grid-cols-2">
							{/* 输入区 */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<FileText className="h-5 w-5 text-[#FF4757]" />
										输入提示
									</CardTitle>
								</CardHeader>
								<CardBody className="space-y-4">
									<div>
										<label className="block text-sm font-medium mb-2">
											目标字数: {wordCount[0]}
										</label>
										<Slider
											value={wordCount}
											onValueChange={setWordCount}
											min={200}
											max={2000}
											step={100}
											className="w-full"
										/>
									</div>
									<Textarea
										placeholder="请输入写作提示，例如：写一个都市小说的开篇章节..."
										value={content}
										onChange={(e) => setContent(e.target.value)}
										rows={8}
										className="min-h-[200px]"
									/>
									<div className="flex gap-2">
										<Button
											onClick={handleGenerate}
											disabled={isGenerating || !content.trim()}
											className="flex-1 bg-[#FF4757] hover:bg-[#FF6B81]"
										>
											{isGenerating ? (
												<>
													<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
													生成中...
												</>
											) : (
												<>
													<Zap className="h-4 w-4 mr-2" />
													开始生成
												</>
											)}
										</Button>
										{isGenerating && (
											<Button
												onClick={handleStopGeneration}
												variant="danger"
											>
												停止
											</Button>
										)}
									</div>
								</CardBody>
							</Card>

							{/* 输出区 */}
							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<CardTitle className="flex items-center gap-2">
											<MessageSquare className="h-5 w-5 text-[#FF4757]" />
											生成结果
										</CardTitle>
										{generatedContent && (
											<div className="flex gap-2">
												<Button
													variant="secondary"
													size="sm"
													onClick={handleCopy}
												>
													<Copy className="h-4 w-4 mr-1" />
													复制
												</Button>
												<Button
													variant="secondary"
													size="sm"
													onClick={() => {
														const blob = new Blob([generatedContent], { type: 'text/plain' });
														const url = URL.createObjectURL(blob);
														const a = document.createElement('a');
														a.href = url;
														a.download = 'ai-generated.txt';
														a.click();
														URL.revokeObjectURL(url);
													}}
												>
													<Download className="h-4 w-4 mr-1" />
													下载
												</Button>
											</div>
										)}
									</div>
								</CardHeader>
								<CardBody>
									<div className="min-h-[300px] whitespace-pre-wrap text-gray-800 dark:text-gray-200">
										{isGenerating ? (
											<span className="animate-pulse">{generatedContent}|</span>
										) : generatedContent ? (
											generatedContent
										) : (
											<div className="flex items-center justify-center h-full text-gray-400">
												等待生成...
											</div>
										)}
									</div>
								</CardBody>
							</Card>
						</div>
					</TabsContent>

					{/* 质量检测 */}
					<TabsContent value="quality" className="mt-6">
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<TrendingUp className="h-5 w-5 text-[#FF4757]" />
										内容质量检测
									</CardTitle>
								</CardHeader>
								<CardBody className="space-y-4">
									<Textarea
										placeholder="请输入需要检测的内容..."
										value={checkContent}
										onChange={(e) => setCheckContent(e.target.value)}
										rows={10}
										className="min-h-[250px]"
									/>
									<Button
										onClick={handleQualityCheck}
										disabled={isChecking || !checkContent.trim()}
										className="bg-[#FF4757] hover:bg-[#FF6B81]"
									>
										{isChecking ? (
											<>
												<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
												检测中...
											</>
										) : (
											<>
												<CheckCircle className="h-4 w-4 mr-2" />
												开始检测
											</>
										)}
									</Button>
								</CardBody>
							</Card>

							{qualityResult && (
								<div className="space-y-6">
									{/* 综合质量评分 */}
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<Target className="h-5 w-5 text-[#FF4757]" />
												综合质量评分
											</CardTitle>
										</CardHeader>
										<CardBody>
											<div className="text-center mb-6">
												<div className="text-6xl font-bold text-[#FF4757] mb-2">
													{qualityResult.score}
												</div>
												<div className="text-gray-600 dark:text-gray-300">
													{qualityResult.score >= 90 ? '优秀' : qualityResult.score >= 80 ? '良好' : qualityResult.score >= 70 ? '一般' : '需要改进'}
												</div>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
													<div className="text-2xl font-bold text-[#FF4757]">
														{qualityResult.estimatedCompletionRate}%
													</div>
													<div className="text-sm text-gray-600 dark:text-gray-300">
														预估完读率
													</div>
												</div>
												<div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
													<div className="text-2xl font-bold text-[#FF4757]">
														{qualityResult.shuangdianCount}
													</div>
													<div className="text-sm text-gray-600 dark:text-gray-300">
														爽点数量
													</div>
												</div>
											</div>
										</CardBody>
									</Card>

									{/* 5维度评分 */}
									{qualityResult.dimensionScores && (
										<Card>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<TrendingUp className="h-5 w-5 text-[#FF4757]" />
													5维度详细评分
												</CardTitle>
											</CardHeader>
											<CardBody>
												<div className="grid gap-4">
													{/* 长度评分 */}
													<div>
														<div className="flex items-center justify-between mb-2">
															<span className="font-medium">长度适中</span>
															<span className="text-[#FF4757] font-bold">{qualityResult.dimensionScores.lengthScore}/100</span>
														</div>
														<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
															<div
																className="h-full bg-gradient-to-r from-[#FF4757] to-[#FF6B81] transition-all"
																style={{ width: `${qualityResult.dimensionScores.lengthScore}%` }}
															/>
														</div>
														<p className="text-xs text-gray-500 mt-1">
															内容长度是否适合当前章节，建议500-2000字
														</p>
													</div>

													{/* 重复度评分 */}
													<div>
														<div className="flex items-center justify-between mb-2">
															<span className="font-medium">内容原创性</span>
															<span className="text-[#FF4757] font-bold">{qualityResult.dimensionScores.repetitionScore}/100</span>
														</div>
														<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
															<div
																className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all"
																style={{ width: `${qualityResult.dimensionScores.repetitionScore}%` }}
															/>
														</div>
														<p className="text-xs text-gray-500 mt-1">
															检测重复内容，确保原创性
														</p>
													</div>

													{/* 连贯性评分 */}
													<div>
														<div className="flex items-center justify-between mb-2">
															<span className="font-medium">段落连贯</span>
															<span className="text-[#FF4757] font-bold">{qualityResult.dimensionScores.coherenceScore}/100</span>
														</div>
														<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
															<div
																className="h-full bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] transition-all"
																style={{ width: `${qualityResult.dimensionScores.coherenceScore}%` }}
															/>
														</div>
														<p className="text-xs text-gray-500 mt-1">
															段落间的衔接和流畅度
														</p>
													</div>

													{/* 风格评分 */}
													<div>
														<div className="flex items-center justify-between mb-2">
															<span className="font-medium">题材匹配</span>
															<span className="text-[#FF4757] font-bold">{qualityResult.dimensionScores.styleScore}/100</span>
														</div>
														<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
															<div
																className="h-full bg-gradient-to-r from-[#F59E0B] to-[#F97316] transition-all"
																style={{ width: `${qualityResult.dimensionScores.styleScore}%` }}
															/>
														</div>
														<p className="text-xs text-gray-500 mt-1">
															文风与目标题材的匹配度
														</p>
													</div>

													{/* 安全性评分 */}
													<div>
														<div className="flex items-center justify-between mb-2">
															<span className="font-medium">内容安全</span>
															<span className="text-[#FF4757] font-bold">{qualityResult.dimensionScores.safetyScore}/100</span>
														</div>
														<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
															<div
																className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] transition-all"
																style={{ width: `${qualityResult.dimensionScores.safetyScore}%` }}
															/>
														</div>
														<p className="text-xs text-gray-500 mt-1">
															敏感词检测，确保内容安全合规
														</p>
													</div>
												</div>
											</CardBody>
										</Card>
									)}

									{/* 问题和建议 */}
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<Lightbulb className="h-5 w-5 text-[#FF4757]" />
												问题与建议
											</CardTitle>
										</CardHeader>
										<CardBody className="space-y-4 max-h-[400px] overflow-y-auto">
											{qualityResult.issues.length > 0 ? (
												qualityResult.issues.map((issue, index) => (
													<div
														key={index}
														className={`p-3 rounded-lg border ${
															issue.severity === 'high'
																? 'border-red-500 bg-red-50 dark:bg-red-900/20'
																: issue.severity === 'medium'
																	? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
																	: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
														}`}
													>
														<div className="flex items-center gap-2 mb-1">
															{issue.severity === 'high' ? (
																<XCircle className="h-4 w-4 text-red-500" />
															) : (
																<CheckCircle className="h-4 w-4 text-yellow-500" />
															)}
															<span className="font-medium">{issue.message}</span>
														</div>
														<Badge variant="secondary">{issue.type}</Badge>
													</div>
												))
											) : (
												<div className="text-center text-gray-500 py-4">
													未发现明显问题
												</div>
											)}

											{qualityResult.suggestions.length > 0 && (
												<div>
													<h4 className="font-medium mb-2">优化建议:</h4>
													<ul className="space-y-2">
														{qualityResult.suggestions.map((suggestion, index) => (
															<li key={index} className="flex items-start gap-2">
																<span className="text-[#FF4757]">•</span>
																<span className="text-gray-700 dark:text-gray-300">
																	{suggestion}
																</span>
															</li>
														))}
													</ul>
												</div>
											)}
										</CardBody>
									</Card>
								</div>
							)}
						</div>
					</TabsContent>

					{/* 模板管理 */}
					<TabsContent value="templates" className="mt-6">
						{showCreateTemplate || editingTemplate ? (
							/* 创建/编辑模板 */
							<Card>
								<CardHeader>
									<CardTitle>{editingTemplate ? '编辑模板' : '创建自定义模板'}</CardTitle>
								</CardHeader>
								<CardBody className="space-y-4">
									<div>
										<label className="block text-sm font-medium mb-2">
											模板名称 <span className="text-red-500">*</span>
										</label>
										<Input
											value={editingTemplate?.name || newTemplate.name || ''}
											onChange={(e) =>
												editingTemplate
													? setEditingTemplate({ ...editingTemplate, name: e.target.value })
													: setNewTemplate({ ...newTemplate, name: e.target.value })
											}
											placeholder="例如：我的章节开篇模板"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-2">
											分类 <span className="text-red-500">*</span>
										</label>
										<Input
											value={editingTemplate?.category || newTemplate.category || ''}
											onChange={(e) =>
												editingTemplate
													? setEditingTemplate({ ...editingTemplate, category: e.target.value })
													: setNewTemplate({ ...newTemplate, category: e.target.value })
											}
											placeholder="例如：章节开篇"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-2">题材</label>
										<Input
											value={editingTemplate?.genre || newTemplate.genre || ''}
											onChange={(e) =>
												editingTemplate
													? setEditingTemplate({ ...editingTemplate, genre: e.target.value })
													: setNewTemplate({ ...newTemplate, genre: e.target.value })
											}
											placeholder="例如：都市、玄幻、通用"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-2">
											提示词 <span className="text-red-500">*</span>
										</label>
										<Textarea
											value={editingTemplate?.prompt || newTemplate.prompt || ''}
											onChange={(e) =>
												editingTemplate
													? setEditingTemplate({ ...editingTemplate, prompt: e.target.value })
													: setNewTemplate({ ...newTemplate, prompt: e.target.value })
											}
											placeholder="请输入模板提示词，可以使用 {参数名} 作为占位符"
											rows={6}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-2">标签（用逗号分隔）</label>
										<Input
											value={editingTemplate?.tags?.join(', ') || newTemplate.tags?.join(', ') || ''}
											onChange={(e) =>
												editingTemplate
													? setEditingTemplate({
															...editingTemplate,
															tags: e.target.value.split(',').map(t => t.trim()),
														})
													: setNewTemplate({
															...newTemplate,
															tags: e.target.value.split(',').map(t => t.trim()),
														})
											}
											placeholder="例如：开篇, 都市, 轻松"
										/>
									</div>
									<div className="flex gap-2">
										<Button
											onClick={() => {
												setShowCreateTemplate(false);
												setEditingTemplate(null);
												setNewTemplate({});
											}}
											variant="secondary"
										>
											取消
										</Button>
										<Button
											onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
											className="bg-[#FF4757] hover:bg-[#FF6B81]"
										>
											{editingTemplate ? '更新模板' : '创建模板'}
										</Button>
									</div>
								</CardBody>
							</Card>
						) : (
							/* 模板列表 */
							<div className="grid gap-6 md:grid-cols-3">
								{/* 模板列表 */}
								<Card className="md:col-span-1">
									<CardHeader>
										<div className="flex items-center justify-between">
											<CardTitle>写作模板</CardTitle>
											<Button
												size="sm"
												onClick={() => setShowCreateTemplate(true)}
												className="bg-[#FF4757] hover:bg-[#FF6B81]"
											>
												+
											</Button>
										</div>
									</CardHeader>
									<CardBody className="space-y-2 max-h-[600px] overflow-y-auto">
										{templates.map((template) => (
											<div
												key={template.id}
												className="flex items-center gap-2 group"
											>
												<Button
													variant={selectedTemplate?.id === template.id ? 'primary' : 'secondary'}
													className="flex-1 justify-start text-left"
													onClick={() => handleUseTemplate(template)}
												>
													<div className="flex flex-col items-start">
														<span className="font-medium">{template.name}</span>
														<span className="text-xs opacity-70">{template.category}</span>
													</div>
												</Button>
												{template.id.startsWith('custom-') && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => setEditingTemplate(template)}
														className="opacity-0 group-hover:opacity-100"
													>
														<Settings className="h-4 w-4" />
													</Button>
												)}
												{template.id.startsWith('custom-') && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDeleteTemplate(template.id)}
														className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600"
													>
														<XCircle className="h-4 w-4" />
													</Button>
												)}
											</div>
										))}
									</CardBody>
								</Card>

								{/* 模板详情 */}
								<Card className="md:col-span-2">
									<CardHeader>
										<CardTitle>模板详情</CardTitle>
									</CardHeader>
									<CardBody>
										{selectedTemplate ? (
											<div className="space-y-4">
												<div className="flex items-center justify-between">
													<div>
														<h3 className="font-semibold text-lg mb-2">
															{selectedTemplate.name}
														</h3>
														<div className="flex gap-2 mb-3">
															<Badge variant="secondary">{selectedTemplate.category}</Badge>
															<Badge variant="secondary">{selectedTemplate.genre}</Badge>
														</div>
													</div>
													{selectedTemplate.id.startsWith('custom-') && (
														<Button
															size="sm"
															variant="secondary"
															onClick={() => setEditingTemplate(selectedTemplate)}
														>
															<Settings className="h-4 w-4 mr-1" />
															编辑
														</Button>
													)}
												</div>
												<p className="text-gray-600 dark:text-gray-300 mb-4">
													{selectedTemplate.prompt}
												</p>

												{selectedTemplate.example && (
													<div>
														<h4 className="font-medium mb-2">示例:</h4>
														<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
															<p className="text-sm text-gray-700 dark:text-gray-300">
																{selectedTemplate.example}
															</p>
														</div>
													</div>
												)}

												{selectedTemplate.parameters.length > 0 && (
													<div>
														<h4 className="font-medium mb-2">参数设置:</h4>
														<div className="space-y-3">
															{selectedTemplate.parameters.map((param) => (
																<div key={param.name}>
																	<label className="block text-sm font-medium mb-1">
																		{param.description}
																		{param.required && (
																			<span className="text-red-500">*</span>
																		)}
																	</label>
																	<Input
																		value={templateParams[param.name] || ''}
																		onChange={(e) =>
																			setTemplateParams({
																				...templateParams,
																				[param.name]: e.target.value,
																			})
																		}
																		placeholder={String(param.default)}
																	/>
																</div>
															))}
														</div>
													</div>
												)}

												<Button
													onClick={handleGenerateFromTemplate}
													disabled={isGenerating}
													className="w-full bg-[#FF4757] hover:bg-[#FF6B81]"
												>
													{isGenerating ? (
														<>
															<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
															生成中...
														</>
													) : (
														<>
															<Sparkles className="h-4 w-4 mr-2" />
															使用模板生成
														</>
													)}
												</Button>
											</div>
										) : (
											<div className="text-center py-12 text-gray-500">
												<BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
												<p>请选择一个模板</p>
											</div>
										)}
									</CardBody>
								</Card>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
