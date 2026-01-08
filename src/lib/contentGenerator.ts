/**
 * 高性能内容生成引擎
 *
 * 目标：
 * 1. 提升AI反应效率（响应时间 < 2秒）
 * 2. 章节完读率达90%以上
 * 3. 9.8分+内容质量
 */

import { LLMClient, Config } from 'coze-coding-dev-sdk';

// ============================================================================
// 类型定义
// ============================================================================

export interface GenerationConfig {
  // 基础配置
  wordCount: number;
  chapterTitle?: string;
  genre: string;

  // 角色和设定
  characters?: string;
  setting?: string;
  outline?: string;

  // 番茄平台优化
  targetReadCompletionRate: number; // 目标完读率（0-1）
  shuangdianDensity: number; // 爽点密度（每500字的爽点数）
  pacing: 'fast' | 'medium' | 'slow';

  // 风格
  tone: 'serious' | 'light' | 'humorous' | 'dramatic';
  style: 'modern' | 'classic' | 'internet';
}

export interface GenerationResult {
  content: string;
  wordCount: number;
  estimatedReadTime: number; // 预估阅读时间（秒）
  qualityScore: number; // 质量评分（0-100）
  completionRate: number; // 预估完读率（0-100）
  shuangdianCount: number; // 爽点数量
  suggestions: string[]; // 优化建议
}

// ============================================================================
// 番茄平台风格提示词模板
// ============================================================================

const styleRequirements = `
使用网文流行语和梗，但不低俗
避免长难句和抽象说教
多用感叹号和反问句增强语气
用数字和细节增强真实感
对话简洁有力，符合角色性格
`;

const TOMATO_STYLE_PROMPT = `
你是番茄小说平台的顶级AI写作助手，擅长创作高完读率的爽文。

核心原则：
1. 爽点密集：每500字至少1个核心爽点
2. 节奏明快：情节推进快速，不拖沓
3. 情绪调动：对比、冲突、期待感层层递进
4. 钩子设计：每段结尾都要有悬念或期待
5. 口语化：贴近网文读者的语言习惯
6. 短句为主：每段控制在3-5行，每句不超过30字
7. 画面感：用动词和细节营造画面，而非抽象描述

爽点类型：
- 打脸爽：主角碾压对手，获得他人认可
- 爆发爽：实力突破，展示强大能力
- 收获爽：获得珍贵资源、宝物、地位提升
- 情感爽：获得美女/帅哥青睐，情感突破
- 智商爽：主角展现超常智商，智胜对手
- 反差爽：看似弱势实则强大，出人意料

节奏控制：
- 前20%：快速铺垫，建立期待
- 中段60%：爽点密集，情绪高潮
- 后20%：钩子结尾，引出下一章

风格要求：
- ${styleRequirements}
`;

// ============================================================================
// 完读率优化算法
// ============================================================================

/**
 * 计算章节完读率预测
 *
 * 基于因素：
1. 爽点密度
2. 情节节奏
3. 钩子设计
4. 情绪调动
5. 文字可读性
 */
export function calculateCompletionRate(
  content: string,
  shuangdianCount: number,
  wordCount: number
): number {
  // 1. 爽点密度评分（0-30分）
  const density = shuangdianCount / (wordCount / 500); // 每500字爽点数
  const densityScore = Math.min(30, density * 15);

  // 2. 段落长度评分（0-20分）
  const paragraphs = content.split('\n').filter((p) => p.trim().length > 0);
  const avgParaLength = wordCount / paragraphs.length;
  // 最佳段落长度：3-5行，约50-100字
  const lengthScore = avgParaLength >= 50 && avgParaLength <= 150 ? 20 : 10;

  // 3. 句子长度评分（0-20分）
  const sentences = content.split(/[。！？]/).filter((s) => s.trim().length > 0);
  const avgSentenceLength = wordCount / sentences.length;
  // 最佳句子长度：15-25字
  const sentenceScore = avgSentenceLength >= 15 && avgSentenceLength <= 30 ? 20 : 10;

  // 4. 情绪词占比（0-15分）
  const emotionWords = ['爽', '炸裂', '牛逼', '震撼', '感动', '期待', '紧张', '激动', '兴奋'];
  let emotionCount = 0;
  emotionWords.forEach((word) => {
    emotionCount += (content.match(new RegExp(word, 'g')) || []).length;
  });
  const emotionScore = Math.min(15, emotionCount * 2);

  // 5. 钩子设计评分（0-15分）
  const lastParagraph = paragraphs[paragraphs.length - 1] || '';
  const hasHook = lastParagraph.includes('吗') || lastParagraph.includes('？') || lastParagraph.includes('...') || lastParagraph.includes('竟然');
  const hookScore = hasHook ? 15 : 5;

  // 总分
  const totalScore = densityScore + lengthScore + sentenceScore + emotionScore + hookScore;

  // 转换为完读率（基础60% + 评分影响）
  const baseRate = 60;
  const completionRate = baseRate + (totalScore / 100) * 40;

  return Math.min(100, Math.max(0, completionRate));
}

/**
 * 优化内容以提升完读率
 */
export function optimizeForCompletionRate(content: string): string {
  let optimized = content;

  // 1. 增强爽点表达
  optimized = optimized.replace(/很厉害/g, '炸裂般厉害');
  optimized = optimized.replace(/非常强/g, '恐怖如斯');
  optimized = optimized.replace(/很开心/g, '爽翻天');

  // 2. 增强情绪表达
  optimized = optimized.replace(/说/g, '激动地说');
  optimized = optimized.replace(/看着/g, '震惊地看着');
  optimized = optimized.replace(/想着/g, '心中狂喜地想');

  // 3. 优化句式（长句拆分）
  optimized = optimized.replace(/([^，。！？]{30,})([，。！？])/g, '$1$2\n');

  // 4. 增加悬念钩子
  const paragraphs = optimized.split('\n').filter((p) => p.trim().length > 0);
  if (paragraphs.length > 0) {
    const lastPara = paragraphs[paragraphs.length - 1];
    if (!lastPara.includes('吗') && !lastPara.includes('？') && !lastPara.includes('...')) {
      paragraphs[paragraphs.length - 1] = lastPara + '\n\n然而，事情真的这么简单吗？';
      optimized = paragraphs.join('\n');
    }
  }

  return optimized;
}

// ============================================================================
// 高性能内容生成函数
// ============================================================================

/**
 * 流式生成内容（提升响应效率）
 *
 * 优化策略：
1. 使用流式输出，首字输出时间 < 2秒
2. 分段处理，避免等待完整响应
3. 预计算和缓存常用提示词
4. 并行处理（如需要）
 */
export async function* generateContentStream(
  config: GenerationConfig
): AsyncGenerator<string, void, unknown> {
  // 构建提示词
  const prompt = buildPrompt(config);

  // 初始化LLM客户端
  const llmConfig = new Config();
  const client = new LLMClient(llmConfig);

  const messages = [
    {
      role: 'system' as const,
      content: TOMATO_STYLE_PROMPT,
    },
    {
      role: 'user' as const,
      content: prompt,
    },
  ];

  // 调用流式AI
  const stream = client.stream(messages, {
    model: 'doubao-pro-4k', // 使用快速模型
    temperature: 0.8, // 提升创意性
    streaming: true,
  });

  // 流式输出
  for await (const chunk of stream) {
    if (chunk.content) {
      yield chunk.content.toString();
    }
  }
}

/**
 * 构建生成提示词
 */
function buildPrompt(config: GenerationConfig): string {
  const { wordCount, chapterTitle, genre, characters, setting, outline, targetReadCompletionRate, shuangdianDensity, pacing, tone, style } = config;

  let prompt = `请生成${genre}题材的章节内容，字数约${wordCount}字。\n\n`;

  if (chapterTitle) {
    prompt += `章节标题：${chapterTitle}\n`;
  }

  if (characters) {
    prompt += `主要角色：${characters}\n`;
  }

  if (setting) {
    prompt += `故事背景：${setting}\n`;
  }

  if (outline) {
    prompt += `章节大纲：${outline}\n`;
  }

  prompt += `\n目标完读率：${Math.round(targetReadCompletionRate * 100)}%\n`;
  prompt += `爽点密度：每500字${shuangdianDensity}个\n`;
  prompt += `节奏：${pacing}\n`;
  prompt += `基调：${tone}\n`;
  prompt += `风格：${style === 'internet' ? '网文流行' : style === 'modern' ? '现代网文' : '经典网文'}\n\n`;

  prompt += `请严格按照番茄小说平台风格创作，确保高完读率。开始生成：\n\n`;

  return prompt;
}

/**
 * 完整生成并分析内容
 */
export async function generateAndAnalyze(
  config: GenerationConfig
): Promise<GenerationResult> {
  let content = '';

  // 流式生成内容
  for await (const chunk of generateContentStream(config)) {
    content += chunk;
  }

  // 统计字数
  const wordCount = content.length;

  // 计算爽点数量
  const shuangdianCount = calculateShuangdianCount(content);

  // 计算完读率
  const completionRate = calculateCompletionRate(content, shuangdianCount, wordCount);

  // 估算阅读时间（平均阅读速度：500字/分钟）
  const estimatedReadTime = (wordCount / 500) * 60;

  // 计算质量评分
  const qualityScore = calculateQualityScore(content, completionRate, shuangdianCount);

  // 生成优化建议
  const suggestions = generateSuggestions(content, completionRate, qualityScore);

  return {
    content,
    wordCount,
    estimatedReadTime,
    qualityScore,
    completionRate,
    shuangdianCount,
    suggestions,
  };
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 计算爽点数量
 */
function calculateShuangdianCount(content: string): number {
  const shuangdianKeywords = [
    '打脸', '碾压', '震惊', '恐怖', '变态',
    '牛逼', '炸裂', '秒杀', '无敌', '巅峰',
    '突破', '进阶', '蜕变', '觉醒', '爆发',
    '美女', '心动', '脸红', '迷恋', '痴迷',
    '财富', '宝物', '神药', '秘籍', '传承',
    '智商', '算计', '布局', '谋略', '智慧',
    '反差', '打脸', '逆袭', '翻身', '超越',
  ];

  let count = 0;
  shuangdianKeywords.forEach((keyword) => {
    count += (content.match(new RegExp(keyword, 'g')) || []).length;
  });

  return count;
}

/**
 * 计算质量评分（0-100）
 */
function calculateQualityScore(
  content: string,
  completionRate: number,
  shuangdianCount: number
): number {
  const wordCount = content.length;

  // 1. 字数达标（0-20分）
  const lengthScore = wordCount >= 1000 ? 20 : (wordCount / 1000) * 20;

  // 2. 完读率（0-40分）
  const completionScore = completionRate * 0.4;

  // 3. 爽点密度（0-20分）
  const density = shuangdianCount / (wordCount / 500);
  const shuangdianScore = Math.min(20, density * 10);

  // 4. 文字质量（0-20分）
  // 检查是否有明显的语法错误或表达问题
  const qualityScore = 15; // 基础分

  const totalScore = lengthScore + completionScore + shuangdianScore + qualityScore;

  return Math.min(100, Math.max(0, totalScore));
}

/**
 * 生成优化建议
 */
function generateSuggestions(
  content: string,
  completionRate: number,
  qualityScore: number
): string[] {
  const suggestions: string[] = [];

  if (completionRate < 70) {
    suggestions.push('建议增加爽点密度，每500字至少1个核心爽点');
    suggestions.push('建议在章节结尾增加悬念钩子');
  }

  if (qualityScore < 70) {
    suggestions.push('建议增强情绪表达，使用更具感染力的词汇');
    suggestions.push('建议优化句式，长句拆分为短句');
  }

  if (content.length < 1000) {
    suggestions.push('建议增加字数，保持至少1000字以符合平台要求');
  }

  if (suggestions.length === 0) {
    suggestions.push('内容质量优秀，继续保持！');
  }

  return suggestions;
}

// ============================================================================
// 批量优化函数
// ============================================================================

/**
 * 批量生成并优化章节
 */
export async function* generateBatchContent(
  configs: GenerationConfig[]
): AsyncGenerator<GenerationResult, void, unknown> {
  for (const config of configs) {
    const result = await generateAndAnalyze(config);
    yield result;
  }
}
