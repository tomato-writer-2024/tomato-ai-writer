import type { OriginalityCheckResult } from './types/user';

/**
 * 常用模板短语库
 */
const COMMON_TEMPLATES = [
  '他深吸了一口气',
  '她的脸瞬间红了',
  '这一刻，时间仿佛静止了',
  '他紧紧握住拳头',
  '眼中闪过一丝寒意',
  '嘴角上扬',
  '露出了微笑',
  '心里咯噔一下',
  '心中涌起一股暖流',
  '感觉身体被掏空',
  '倒吸一口凉气',
  '心里五味杂陈',
  '百感交集',
  '如遭雷击',
  '仿佛置身梦中',
  '心中大骇',
  '心中狂喜',
  '心如刀割',
  '怒火中烧',
  '咬牙切齿',
  '面如土色',
  '面红耳赤',
  '面不改色',
  '心平气和',
  '气急败坏',
  '喜极而泣',
  '痛哭流涕',
  '泪流满面',
  '热泪盈眶',
  '泪如雨下',
  '泣不成声',
  '号啕大哭',
  '破涕为笑',
  '捧腹大笑',
];

/**
 * 计算原创性评分
 */
export async function calculateOriginalityScore(
  content: string,
  existingWorks?: string[]
): Promise<OriginalityCheckResult> {
  let score = 100; // 初始满分
  const duplicateSentences: string[] = [];
  const templatePhrasesUsed: string[] = [];

  // 1. 重复句子检测
  const sentences = content.split(/[。！？.!?]/);
  for (const sentence of sentences) {
    if (sentence.length < 10) continue;

    // 检查与其他作品的重叠
    if (existingWorks) {
      for (const work of existingWorks) {
        if (work.includes(sentence) && sentence.length > 30) {
          duplicateSentences.push(sentence);
          score -= 5;
        }
      }
    }
  }

  // 2. 常用模板检测
  for (const template of COMMON_TEMPLATES) {
    if (content.includes(template)) {
      templatePhrasesUsed.push(template);
      score -= 2;
    }
  }

  // 3. 文本多样性分析
  const words = content.split(/\s+/);
  const uniqueWords = new Set(words);
  const totalWords = words.length;
  const diversity = totalWords > 0 ? uniqueWords.size / totalWords : 0;
  score += (diversity - 0.5) * 20;

  // 4. 句子长度多样性
  const sentenceLengths = sentences.map((s) => s.length).filter((l) => l > 0);
  const avgLength =
    sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance =
    sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) /
    sentenceLengths.length;
  const sentenceVariety = Math.min(variance / 100, 1); // 归一化到0-1
  score += sentenceVariety * 10;

  // 评分范围限制
  score = Math.max(0, Math.min(100, score));

  return {
    score: Math.round(score * 100) / 100,
    duplicateSentences: duplicateSentences.length,
    templatePhrases: templatePhrasesUsed.length,
    diversityScore: Math.round(diversity * 100) / 100,
    details: {
      duplicateContent: duplicateSentences.slice(0, 5), // 最多返回5个
      templatePhrasesUsed: templatePhrasesUsed.slice(0, 5),
      uniqueWordRatio: diversity,
      sentenceVariety,
    },
  };
}

/**
 * 添加版权声明
 */
export function addCopyrightNotice(content: string, userId: string): string {
  const timestamp = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const copyright = `\n\n---\n版权声明\n本内容由用户 ID: ${userId} 使用番茄小说AI写作助手生成于 ${timestamp}\n用户拥有本内容的完整版权，但需确保内容不侵犯他人权益。\n---\n`;

  return content + copyright;
}

/**
 * 获取免责条款
 */
export function getDisclaimer(): string {
  return `
免责条款

1. 本工具仅提供写作辅助，不生成具有版权的内容
2. 用户对生成内容的版权和法律后果负全部责任
3. 用户承诺生成的内容均为原创，不侵犯他人权益
4. 如发生版权纠纷，用户需承担全部法律责任
5. 本工具不对生成内容的原创性提供担保

使用本工具即表示您同意以上条款。
`;
}

/**
 * 原创性声明文本
 */
export function getOriginalityDeclaration(): string {
  return `
⚠️ 内容原创性声明

我郑重声明：
1. 我使用本工具生成的内容均为本人原创
2. 我拥有生成内容的完整版权
3. 我不会抄袭、复制他人作品
4. 我对生成内容的版权和法律后果负全部责任
5. 本工具仅提供写作辅助，不承担内容版权责任

☑️ 我已阅读并同意以上声明
`;
}

/**
 * 检测敏感内容
 */
export function detectSensitiveContent(content: string): {
  hasSensitive: boolean;
  categories: string[];
  details: string[];
} {
  const categories: string[] = [];
  const details: string[] = [];

  // 暴力内容检测
  const violentKeywords = ['杀', '砍', '刺', '血', '死', '尸', '残'];
  for (const keyword of violentKeywords) {
    if (content.includes(keyword)) {
      if (!categories.includes('暴力')) {
        categories.push('暴力');
      }
      details.push(`包含敏感词：${keyword}`);
    }
  }

  // 色情内容检测
  const sexualKeywords = ['性', '情', '淫', '色', '欲'];
  for (const keyword of sexualKeywords) {
    if (content.includes(keyword)) {
      if (!categories.includes('色情')) {
        categories.push('色情');
      }
      details.push(`包含敏感词：${keyword}`);
    }
  }

  // 政治敏感词检测
  const politicalKeywords = ['政治', '政府', '抗议', '游行'];
  for (const keyword of politicalKeywords) {
    if (content.includes(keyword)) {
      if (!categories.includes('政治敏感')) {
        categories.push('政治敏感');
      }
      details.push(`包含敏感词：${keyword}`);
    }
  }

  return {
    hasSensitive: categories.length > 0,
    categories,
    details,
  };
}

/**
 * 内容过滤建议
 */
export async function getContentFilterSuggestion(content: string): Promise<{
  shouldBlock: boolean;
  warning?: string;
  suggestions: string[];
}> {
  const sensitiveCheck = detectSensitiveContent(content);
  const suggestions: string[] = [];

  if (sensitiveCheck.hasSensitive) {
    if (sensitiveCheck.categories.includes('色情')) {
      suggestions.push('建议减少色情相关描写');
    }
    if (sensitiveCheck.categories.includes('暴力')) {
      suggestions.push('建议减少暴力相关描写');
    }
    if (sensitiveCheck.categories.includes('政治敏感')) {
      suggestions.push('建议避免政治敏感话题');
    }
  }

  // 原创性评分
  const originalityCheck = await calculateOriginalityScore(content);
  if (originalityCheck.score < 60) {
    suggestions.push('原创性评分较低，建议增加原创内容');
  }
  if (originalityCheck.templatePhrases > 5) {
    suggestions.push('使用了过多的模板短语，建议使用更生动的表达');
  }

  return {
    shouldBlock: sensitiveCheck.categories.includes('色情') || sensitiveCheck.categories.includes('政治敏感'),
    warning: sensitiveCheck.hasSensitive ? `检测到${sensitiveCheck.categories.join('、')}内容` : undefined,
    suggestions,
  };
}
