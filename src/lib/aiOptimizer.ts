/**
 * AI写作优化器
 * 负责优化AI生成的响应速度、质量检测和模板管理
 */

import { ReadableStream } from 'stream/web';

/**
 * 质量检测结果
 */
export interface QualityResult {
	score: number; // 0-100
	issues: {
		type: 'length' | 'repetition' | 'coherence' | 'style' | 'sensitive';
		severity: 'low' | 'medium' | 'high';
		message: string;
	}[];
	suggestions: string[];
	estimatedCompletionRate: number; // 预估完读率
	shuangdianCount: number; // 爽点数量
}

/**
 * 写作模板
 */
export interface WritingTemplate {
	id: string;
	name: string;
	category: string; // 章节开篇、章节结尾、情节转折、人物对话等
	genre: string; // 都市、玄幻、言情等
	prompt: string;
	parameters: {
		name: string;
		description: string;
		default: any;
		required: boolean;
	}[];
	example: string;
	tags: string[];
	usageCount: number;
	createdAt: string;
}

/**
 * AI写作优化器类
 */
export class AIOptimizer {
	private templates: Map<string, WritingTemplate> = new Map();
	private qualityThreshold = 85; // 质量阈值

	/**
	 * 初始化模板
	 */
	async initTemplates(): Promise<void> {
		// 加载内置模板
		const builtInTemplates: WritingTemplate[] = [
			{
				id: 'chapter-opening-urban',
				name: '都市章节开篇模板',
				category: '章节开篇',
				genre: '都市',
				prompt: '请为一部都市小说生成一个引人入胜的章节开篇，要求：1. 设置一个吸引人的钩子；2. 介绍关键人物或场景；3. 营造氛围；4. 控制字数在{wordCount}字左右。',
				parameters: [
					{ name: 'wordCount', description: '目标字数', default: 500, required: true },
					{ name: 'tone', description: '基调', default: '轻松', required: false },
				],
				example: '清晨的阳光透过落地窗洒进办公室，李明揉了揉惺忪的睡眼，看了一眼桌上的日历——今天是他的三十岁生日。',
				tags: ['都市', '开篇', '办公室'],
				usageCount: 0,
				createdAt: new Date().toISOString(),
			},
			{
				id: 'chapter-climax-fantasy',
				name: '玄幻章节高潮模板',
				category: '章节高潮',
				genre: '玄幻',
				prompt: '请生成一个玄幻小说的高潮场面，要求：1. 突出主角的能力成长；2. 设计紧张刺激的战斗场景；3. 加入爽点元素；4. 字数约{wordCount}字。',
				parameters: [
					{ name: 'wordCount', description: '目标字数', default: 800, required: true },
					{ name: 'ability', description: '主角能力', default: '剑术', required: false },
				],
				example: '林啸深吸一口气，体内的灵力如江河奔涌，手中长剑发出清越的龙吟。面对眼前三大高手，他眼中闪过一丝决绝...',
				tags: ['玄幻', '高潮', '战斗'],
				usageCount: 0,
				createdAt: new Date().toISOString(),
			},
			{
				id: 'dialogue-emotional',
				name: '情感对话模板',
				category: '人物对话',
				genre: '通用',
				prompt: '请生成一段情感对话，要求：1. 展现人物的情感冲突；2. 对话自然流畅；3. 通过对话推进情节；4. 字数约{wordCount}字。',
				parameters: [
					{ name: 'wordCount', description: '目标字数', default: 400, required: true },
					{ name: 'emotion', description: '情感类型', default: '悲伤', required: false },
				],
				example: '"你真的要走吗？"她声音颤抖，眼中闪烁着泪光。"我必须去，这是我的责任。"他转身不敢看她，害怕自己会动摇。',
				tags: ['对话', '情感', '通用'],
				usageCount: 0,
				createdAt: new Date().toISOString(),
			},
		];

		builtInTemplates.forEach(template => {
			this.templates.set(template.id, template);
		});
	}

	/**
	 * 获取所有模板
	 */
	getTemplates(category?: string, genre?: string): WritingTemplate[] {
		let templates = Array.from(this.templates.values());

		if (category) {
			templates = templates.filter(t => t.category === category);
		}

		if (genre) {
			templates = templates.filter(t => t.genre === genre || t.genre === '通用');
		}

		return templates.sort((a, b) => b.usageCount - a.usageCount);
	}

	/**
	 * 获取模板详情
	 */
	getTemplate(id: string): WritingTemplate | null {
		return this.templates.get(id) || null;
	}

	/**
	 * 使用模板生成内容
	 */
	async generateFromTemplate(
		templateId: string,
		parameters: Record<string, any>,
		onStream?: (chunk: string) => void
	): Promise<string> {
		const template = this.getTemplate(templateId);
		if (!template) {
			throw new Error('模板不存在');
		}

		// 合并参数
		const mergedParams = { ...parameters };
		template.parameters.forEach(param => {
			if (mergedParams[param.name] === undefined && param.default !== undefined) {
				mergedParams[param.name] = param.default;
			}
		});

		// 构建提示词
		let prompt = template.prompt;
		Object.entries(mergedParams).forEach(([key, value]) => {
			prompt = prompt.replace(`{${key}}`, String(value));
		});

		// 调用AI生成
		const generatedContent = await this.generateWithStream(prompt, onStream);

		// 更新模板使用次数
		template.usageCount++;

		return generatedContent;
	}

	/**
	 * 流式生成AI内容（优化响应速度）
	 */
	async generateWithStream(
		prompt: string,
		onStream?: (chunk: string) => void
	): Promise<string> {
		try {
			// 使用豆包API（集成服务）
			// 注意：这里使用环境变量中的API配置
			const baseUrl = process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
			const apiKey = process.env.DOUBAO_API_KEY || '';
			const model = process.env.DOUBAO_MODEL || 'doubao-pro-4k';

			if (!apiKey) {
				throw new Error('DOUBAO_API_KEY not configured');
			}

			// 构建请求
			const response = await fetch(baseUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model: model,
					messages: [
						{
							role: 'system',
							content: '你是一位专业的小说作家，擅长创作番茄小说风格的爽文。请根据用户要求生成高质量的内容，确保文笔流畅、情节紧凑、爽点密集。',
						},
						{
							role: 'user',
							content: prompt,
						},
					],
					stream: true, // 启用流式输出
					temperature: 0.8,
					top_p: 0.95,
					max_tokens: 2000,
				}),
			});

			if (!response.ok) {
				throw new Error(`AI生成失败: ${response.statusText}`);
			}

			// 处理流式响应
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			let fullContent = '';

			if (reader) {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value);
					const lines = chunk.split('\n');

					for (const line of lines) {
						if (line.startsWith('data: ')) {
							const data = line.slice(6);
							if (data === '[DONE]') continue;

							try {
								const parsed = JSON.parse(data);
								const content = parsed.choices?.[0]?.delta?.content || '';
								if (content) {
									fullContent += content;
									// 实时回调
									if (onStream) {
										onStream(content);
									}
								}
							} catch (e) {
								// 忽略解析错误
							}
						}
					}
				}
			}

			return fullContent;
		} catch (error) {
			console.error('AI生成失败:', error);
			throw error;
		}
	}

	/**
	 * 质量检测
	 */
	async detectQuality(content: string, genre: string = '都市'): Promise<QualityResult> {
		const issues: QualityResult['issues'] = [];
		const suggestions: string[] = [];

		// 1. 长度检测
		const wordCount = content.length;
		if (wordCount < 300) {
			issues.push({
				type: 'length',
				severity: 'medium',
				message: '内容过短，建议增加至500字以上',
			});
			suggestions.push('增加情节细节描写');
		} else if (wordCount > 5000) {
			issues.push({
				type: 'length',
				severity: 'low',
				message: '内容较长，建议适当分段',
			});
		}

		// 2. 重复检测
		const paragraphs = content.split('\n').filter(p => p.trim());
		const duplicateCount = this.detectRepetitions(paragraphs);
		if (duplicateCount > 3) {
			issues.push({
				type: 'repetition',
				severity: 'high',
				message: `发现${duplicateCount}处重复内容`,
			});
			suggestions.push('修改重复的表达');
		}

		// 3. 连贯性检测（简化版）
		const coherenceScore = this.detectCoherence(content);
		if (coherenceScore < 0.6) {
			issues.push({
				type: 'coherence',
				severity: 'medium',
				message: '段落间衔接不够自然',
			});
			suggestions.push('增加过渡句，改善流畅度');
		}

		// 4. 风格检测
		const styleScore = this.detectStyle(content, genre);
		if (styleScore < 0.5) {
			issues.push({
				type: 'style',
				severity: 'low',
				message: '文风与目标题材略有偏差',
			});
			suggestions.push('调整语言风格以匹配题材');
		}

		// 5. 敏感词检测（简化版）
		const sensitiveWords = this.detectSensitiveWords(content);
		if (sensitiveWords.length > 0) {
			issues.push({
				type: 'sensitive',
				severity: 'high',
				message: `发现${sensitiveWords.length}个敏感词`,
			});
			suggestions.push('修改或删除敏感内容');
		}

		// 计算质量分数
		const baseScore = 100;
		const penalty = issues.reduce((sum, issue) => {
			const severityMap = { low: 2, medium: 5, high: 10 };
			return sum + severityMap[issue.severity];
		}, 0);

		const score = Math.max(0, baseScore - penalty);

		// 估算爽点数量（简化）
		const shuangdianCount = this.estimateShuangdian(content);

		// 估算完读率（简化）
		const estimatedCompletionRate = Math.min(100, score * 0.6 + shuangdianCount * 5);

		return {
			score,
			issues,
			suggestions,
			estimatedCompletionRate: Math.round(estimatedCompletionRate),
			shuangdianCount,
		};
	}

	/**
	 * 检测重复内容
	 */
	private detectRepetitions(paragraphs: string[]): number {
		const seen = new Map<string, number>();
		let duplicateCount = 0;

		paragraphs.forEach((para, index) => {
			const normalized = para.toLowerCase().trim();
			// 检查是否有相似的段落
			for (const [key, count] of seen) {
				if (this.calculateSimilarity(normalized, key) > 0.8) {
					duplicateCount++;
					break;
				}
			}
			seen.set(normalized, (seen.get(normalized) || 0) + 1);
		});

		return duplicateCount;
	}

	/**
	 * 计算文本相似度
	 */
	private calculateSimilarity(text1: string, text2: string): number {
		const set1 = new Set(text1.split(''));
		const set2 = new Set(text2.split(''));
		const intersection = new Set([...set1].filter(x => set2.has(x)));
		const union = new Set([...set1, ...set2]);
		return intersection.size / union.size;
	}

	/**
	 * 检测连贯性
	 */
	private detectCoherence(content: string): number {
		// 简化版：检查段落首尾的关联性
		const paragraphs = content.split('\n').filter(p => p.trim());
		if (paragraphs.length < 2) return 1;

		let coherentPairs = 0;
		for (let i = 1; i < paragraphs.length; i++) {
			const prevEnd = paragraphs[i - 1].slice(-20);
			const currStart = paragraphs[i].slice(0, 20);

			// 检查是否有过渡词
			const transitionWords = ['然后', '接着', '于是', '然而', '但是', '因此', '所以'];
			const hasTransition = transitionWords.some(word =>
				currStart.includes(word) || prevEnd.includes(word)
			);

			if (hasTransition || this.calculateSimilarity(prevEnd, currStart) > 0.2) {
				coherentPairs++;
			}
		}

		return coherentPairs / (paragraphs.length - 1);
	}

	/**
	 * 检测风格匹配度
	 */
	private detectStyle(content: string, genre: string): number {
		// 简化版：基于关键词匹配
		const genreKeywords: Record<string, string[]> = {
			'都市': ['办公室', '地铁', '咖啡', '手机', '微信', '老板'],
			'玄幻': ['灵力', '修炼', '境界', '法宝', '宗门', '天地'],
			'言情': ['拥抱', '亲吻', '心动', '喜欢', '浪漫', '温柔'],
			'悬疑': ['秘密', '真相', '线索', '凶手', '疑点', '诡异'],
		};

		const keywords = genreKeywords[genre] || [];
		if (keywords.length === 0) return 1;

		const matchCount = keywords.filter(keyword => content.includes(keyword)).length;
		return matchCount / keywords.length;
	}

	/**
	 * 检测敏感词（简化版）
	 */
	private detectSensitiveWords(content: string): string[] {
		// 简化的敏感词库（实际应用中应使用更完善的词库）
		const sensitiveWords = ['暴力', '血腥', '色情', '赌博'];
		return sensitiveWords.filter(word => content.includes(word));
	}

	/**
	 * 估算爽点数量
	 */
	private estimateShuangdian(content: string): number {
		// 爽点关键词
		const shuangdianKeywords = [
			'成功', '胜利', '逆袭', '打脸', '震惊',
			'崇拜', '羡慕', '嫉妒', '恐惧', '敬畏',
			'天才', '妖孽', '超越', '突破', '觉醒',
		];

		let count = 0;
		shuangdianKeywords.forEach(keyword => {
			const matches = content.match(new RegExp(keyword, 'g'));
			if (matches) {
				count += matches.length;
			}
		});

		return count;
	}
}

// 导出单例实例
export const aiOptimizer = new AIOptimizer();

// 初始化模板
aiOptimizer.initTemplates();
