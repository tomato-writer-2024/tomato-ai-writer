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
你是番茄小说平台的顶级AI写作助手，擅长创作高完读率的爆款爽文。

## 核心目标：
1. 完读率90%+：每500字至少1.2个核心爽点
2. 首字响应<2秒：快速输出，不要等待
3. 9.8分+质量：逻辑严密、情绪饱满、语言流畅

## 爽点设计原则：
1. **打脸爽**：主角被轻视→ 展现实力→ 震惊全场
2. **爆发爽**：绝境突破→ 实力暴涨→ 碾压对手
3. **收获爽**：探险秘境→ 获得宝物→ 实力提升
4. **情感爽**：获得青睐→ 情感突破→ 心动时刻
5. **智商爽**：展现智谋→ 预判对手→ 完胜而归

## 节奏控制（黄金比例）：
- 前20%（400字）：快速铺垫，建立冲突和期待
- 中段60%（1200字）：爽点密集爆发，情绪高涨
- 后20%（400字）：留下强力钩子，引出下章

## 语言风格：
- 短句为主，每句不超过25字
- 每段3-5行，控制视觉节奏
- 网感词：爽、炸裂、牛逼、恐怖如斯、震惊
- 情绪词：激动、狂喜、颤抖、心跳加速

## 开篇前800字必须包含：
1. 核心冲突（主角遇到什么问题）
2. 金手指展示（特殊能力或身份）
3. 强期待感（读者想知道接下来会发生什么）

## 章节结尾必须包含：
1. 悬念钩子（"他究竟是谁？"）
2. 期待钩子（"接下来的战斗会怎样？"）
3. 伏笔钩子（"这件事背后隐藏着什么？"）

## 质量标准：
1. 逻辑严密：行为符合角色设定
2. 情绪饱满：用动词和细节渲染
3. 画面感强：避免抽象描述
4. 代入感强：第二人称视角

`;

// ============================================================================
// 完读率优化算法
// ============================================================================

/**
 * 计算章节完读率预测（目标：90%+）
 *
 * 基于因素（权重优化）：
1. 爽点密度（30%）- 每500字爽点数
2. 段落长度（20%）- 最佳3-5行，50-150字
3. 句子长度（15%）- 最佳15-25字
4. 情绪词占比（15%）- 调动读者情绪
5. 钩子设计（20%）- 每段结尾的悬念
 */
export function calculateCompletionRate(
  content: string,
  shuangdianCount: number,
  wordCount: number
): number {
  // 1. 爽点密度评分（0-30分）- 目标：每500字1.2个爽点
  const density = shuangdianCount / (wordCount / 500); // 每500字爽点数
  const densityScore = Math.min(30, density * 25); // 每个爽点贡献25分

  // 2. 段落长度评分（0-20分）- 目标：3-5行，50-150字
  const paragraphs = content.split('\n').filter((p) => p.trim().length > 0);
  const avgParaLength = wordCount / (paragraphs.length || 1);
  // 最佳段落长度：50-150字
  const lengthScore = avgParaLength >= 50 && avgParaLength <= 150 ? 20 : Math.max(0, 20 - Math.abs(avgParaLength - 100) / 10);

  // 3. 句子长度评分（0-15分）- 目标：15-25字
  const sentences = content.split(/[。！？]/).filter((s) => s.trim().length > 0);
  const avgSentenceLength = wordCount / (sentences.length || 1);
  // 最佳句子长度：15-25字
  const sentenceScore = avgSentenceLength >= 15 && avgSentenceLength <= 25 ? 15 : Math.max(0, 15 - Math.abs(avgSentenceLength - 20) / 5);

  // 4. 情绪词占比（0-15分）- 目标：调动读者情绪
  const emotionWords = [
    '爽', '炸裂', '牛逼', '震撼', '感动', '期待', '紧张', '激动', '兴奋',
    '狂喜', '颤抖', '心跳加速', '窒息', '疯狂', '恐怖如斯', '难以置信'
  ];
  let emotionCount = 0;
  emotionWords.forEach((word) => {
    emotionCount += (content.match(new RegExp(word, 'g')) || []).length;
  });
  const emotionScore = Math.min(15, emotionCount * 2); // 每个情绪词贡献2分

  // 5. 钩子设计评分（0-20分）- 目标：每段结尾都有钩子
  const hookKeywords = ['吗', '？', '...', '竟然', '没想到', '殊不知', '然而'];
  let hookCount = 0;
  hookKeywords.forEach((keyword) => {
    hookCount += (content.match(new RegExp(keyword, 'g')) || []).length;
  });
  const hookScore = Math.min(20, hookCount * 5); // 每个钩子贡献5分

  // 总分（100分制）
  const totalScore = densityScore + lengthScore + sentenceScore + emotionScore + hookScore;

  // 转换为完读率（基础50% + 评分影响）
  // 目标：90%完读率需要90分以上
  const baseRate = 50;
  const completionRate = baseRate + (totalScore / 100) * 50;

  return Math.min(100, Math.max(0, completionRate));
}

/**
 * 优化内容以提升完读率（目标：90%+）
 */
export function optimizeForCompletionRate(content: string): string {
  let optimized = content;

  // 1. 增强爽点表达（使用更强烈的词汇）
  optimized = optimized.replace(/很厉害/g, '炸裂般厉害');
  optimized = optimized.replace(/非常强/g, '恐怖如斯');
  optimized = optimized.replace(/很开心/g, '爽翻天');
  optimized = optimized.replace(/很厉害/g, '无敌般强大');
  optimized = optimized.replace(/很快/g, '闪电般快速');

  // 2. 增强情绪表达（更生动的动词和形容词）
  optimized = optimized.replace(/说/g, '激动地说');
  optimized = optimized.replace(/看着/g, '震惊地看着');
  optimized = optimized.replace(/想着/g, '心中狂喜地想');
  optimized = optimized.replace(/听到/g, '震惊地听到');
  optimized = optimized.replace(/感受到/g, '清晰地感受到');

  // 3. 优化句式（长句拆分为短句，每句不超过25字）
  optimized = optimized.replace(/([^，。！？]{30,50})([，。！？])/g, '$1$2\n');
  optimized = optimized.replace(/([^，。！？]{50,})([，。！？])/g, '$1$2\n');

  // 4. 增加情绪词和网感词
  optimized = optimized.replace(/非常/g, '超级');
  optimized = optimized.replace(/特别/g, '极度');
  optimized = optimized.replace(/真的/g, '难以置信地');

  // 5. 增加悬念钩子（确保每段结尾都有钩子）
  const paragraphs = optimized.split('\n').filter((p) => p.trim().length > 0);
  if (paragraphs.length > 0) {
    const lastPara = paragraphs[paragraphs.length - 1];
    const hookKeywords = ['吗', '？', '...', '竟然', '没想到', '殊不知', '然而', '但是'];
    const hasHook = hookKeywords.some(keyword => lastPara.includes(keyword));

    if (!hasHook) {
      // 根据段落内容选择合适的钩子
      const hooks = [
        '\n\n然而，事情真的这么简单吗？',
        '\n\n他究竟是谁？',
        '\n\n接下来的战斗会怎样？',
        '\n\n这件事背后隐藏着什么秘密？',
        '\n\n主角会做出什么惊人的举动？',
      ];
      const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
      paragraphs[paragraphs.length - 1] = lastPara + randomHook;
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
  const suggestions = generateSuggestions(content, completionRate, qualityScore, shuangdianCount);

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
 * 计算质量评分（0-100分，目标：9.8分+）
 */
function calculateQualityScore(
  content: string,
  completionRate: number,
  shuangdianCount: number
): number {
  const wordCount = content.length;

  // 1. 字数达标（0-20分）- 目标：2000字+
  const lengthScore = wordCount >= 2000 ? 20 : (wordCount / 2000) * 20;

  // 2. 完读率（0-35分）- 目标：90%+
  const completionScore = completionRate * 0.35;

  // 3. 爽点密度（0-25分）- 目标：每500字1.2个
  const density = shuangdianCount / (wordCount / 500);
  const shuangdianScore = Math.min(25, density * 20); // 每个爽点贡献20分

  // 4. 文字质量（0-20分）- 检查语言质量
  const qualityScore = calculateTextQuality(content);

  const totalScore = lengthScore + completionScore + shuangdianScore + qualityScore;

  return Math.min(100, Math.max(0, totalScore));
}

/**
 * 计算文字质量（0-20分）
 */
function calculateTextQuality(content: string): number {
  let score = 10; // 基础分

  // 1. 检查重复词汇
  const words = content.split('');
  const uniqueWords = new Set(words);
  const uniqueRatio = uniqueWords.size / words.length;
  if (uniqueRatio >= 0.7) {
    score += 5;
  } else if (uniqueRatio >= 0.5) {
    score += 3;
  } else {
    score += 1;
  }

  // 2. 检查段落长度多样性
  const paragraphs = content.split('\n').filter((p) => p.trim().length > 0);
  const paraLengths = paragraphs.map(p => p.length);
  const avgLength = paraLengths.reduce((a, b) => a + b, 0) / (paraLengths.length || 1);
  const hasVariety = paraLengths.some(l => Math.abs(l - avgLength) > 50);
  if (hasVariety) {
    score += 5;
  }

  return Math.min(20, score);
}

/**
 * 生成优化建议
 */
function generateSuggestions(
  content: string,
  completionRate: number,
  qualityScore: number,
  shuangdianCount: number
): string[] {
  const suggestions: string[] = [];

  // 完读率建议
  if (completionRate < 70) {
    suggestions.push('⚠️ 完读率偏低，建议增加爽点密度（每500字至少1.2个）');
    suggestions.push('⚠️ 建议在章节结尾增加强力悬念钩子');
    suggestions.push('⚠️ 建议优化段落长度（每段50-150字）');
  } else if (completionRate < 85) {
    suggestions.push('💡 完读率良好，建议进一步增加情绪词和网感词');
  }

  // 质量评分建议
  if (qualityScore < 70) {
    suggestions.push('⚠️ 质量评分偏低，建议增强情绪表达');
    suggestions.push('⚠️ 建议优化句式，长句拆分为短句');
    suggestions.push('⚠️ 建议增加画面感，使用更多动词和细节');
  } else if (qualityScore < 90) {
    suggestions.push('💡 质量评分良好，建议进一步优化爽点表达');
  }

  // 爽点数量建议
  const wordCount = content.length;
  const density = shuangdianCount / (wordCount / 500);
  if (density < 1.0) {
    suggestions.push('⚠️ 爽点密度不足，建议每500字至少1.2个核心爽点');
    suggestions.push('💡 可以增加打脸、爆发、收获、情感等爽点类型');
  }

  // 字数建议
  if (wordCount < 1500) {
    suggestions.push('⚠️ 字数偏少，建议增加至2000字以上');
  }

  // 成功提示
  if (completionRate >= 90 && qualityScore >= 90) {
    suggestions.push('✨ 完美！内容质量优秀，完读率90%+，有望成为爆款！');
  } else if (suggestions.length === 0) {
    suggestions.push('✅ 内容质量优秀，继续保持！');
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
