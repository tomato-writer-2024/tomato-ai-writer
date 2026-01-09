/**
 * 书名生成器
 * 支持爆款标题公式、测试工具、多维度优化
 */

export interface TitleOption {
  id: string;
  title: string;
  type: TitleType;
  formula: TitleFormula;
  description: string;
  appealScore: number; // 吸引力评分 0-100
  memorability: number; // 记忆度 0-100
  clarity: number; // 清晰度 0-100
  uniqueness: number; // 独特性 0-100
  targetAudience: string[];
  keywords: string[];
  predictedPerformance: PerformancePrediction;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
}

export type TitleType =
  | 'descriptive' // 描述性
  | 'symbolic' // 象征性
  | 'character-focused' // 角色为主
  | 'setting-focused' // 场景为主
  | 'theme-focused' // 主题为主
  | 'action-oriented' // 动作导向
  | 'mystery' // 神秘感
  | 'provocative' // 挑衅性
  | 'punchy' // 短小有力
  | 'narrative' // 叙事性;

export type TitleFormula =
  | 'nouns-stack' // 名词堆叠
  | 'adjective-noun' // 形容词+名词
  | 'verb-object' // 动词+宾语
  | 'prepositional-phrase' // 介词短语
  | 'character-role' // 角色+身份
  | 'setting-action' // 场景+动作
  | 'metaphorical' // 比喻
  | 'contrasting' // 对比
  | 'question' // 问句
  | 'number-element' // 数字+元素;

export interface PerformancePrediction {
  clickRate: number; // 点击率预测 0-100
  conversionRate: number; // 转化率预测 0-100
  retentionRate: number; // 留存率预测 0-100
  viralPotential: number; // 传播潜力 0-100
  overallScore: number; // 综合评分 0-100
}

export interface TitleAnalysis {
  bookTitle: string;
  genre: string;
  targetAudience: string;
  analyzedTitle: TitleOption;
  alternativeTitles: TitleOption[];
  marketComparison: MarketComparison[];
  abTestSuggestions: ABTestSuggestion[];
}

export interface MarketComparison {
  title: string;
  similarity: number; // 相似度 0-100
  competitionLevel: 'low' | 'medium' | 'high';
  differentiation: string;
}

export interface ABTestSuggestion {
  titleA: string;
  titleB: string;
  testGoal: string;
  expectedOutcome: string;
  testDuration: string;
}

// 标题类型定义
export const TITLE_TYPES: Record<TitleType, { description: string; bestFor: string[] }> = {
  'descriptive': {
    description: '直接描述故事内容或主题',
    bestFor: ['现实题材', '历史题材', '传记']
  },
  'symbolic': {
    description: '使用象征或隐喻表达主题',
    bestFor: ['文学性作品', '深度题材', '哲学思考']
  },
  'character-focused': {
    description: '以角色名字或身份为核心',
    bestFor: ['个人成长', '角色驱动', '传记']
  },
  'setting-focused': {
    description: '以场景或地点为焦点',
    bestFor: ['冒险故事', '奇幻世界', '科幻']
  },
  'theme-focused': {
    description: '突出核心主题或概念',
    bestFor: ['思想性作品', '哲学探讨', '社会议题']
  },
  'action-oriented': {
    description: '暗示动作或冲突',
    bestFor: ['动作故事', '冒险', '惊悚']
  },
  'mystery': {
    description: '制造神秘感和悬念',
    bestFor: ['悬疑', '惊悚', '推理']
  },
  'provocative': {
    description: '引发好奇和争议',
    bestFor: ['热点话题', '社会议题', '新颖题材']
  },
  'punchy': {
    description: '短小精悍，冲击力强',
    bestFor: ['大众题材', '轻松阅读', '网络文学']
  },
  'narrative': {
    description: '讲述故事或情景',
    bestFor: ['叙事性作品', '情节驱动', '冒险']
  }
};

// 标题公式库
export const TITLE_FORMULAS: Record<TitleFormula, { pattern: string; examples: string[]; effectiveness: number }> = {
  'nouns-stack': {
    pattern: '名词1 + 名词2 + 名词3',
    examples: ['三体', '哈利波特', '龙族', '完美世界', '遮天'],
    effectiveness: 90
  },
  'adjective-noun': {
    pattern: '形容词 + 名词',
    examples: ['平凡的世界', '活着', '围城', '倾城之恋', '黄金时代'],
    effectiveness: 85
  },
  'verb-object': {
    pattern: '动词 + 宾语',
    examples: ['活着', '追风筝的人', '看见', '看见', '三体'],
    effectiveness: 80
  },
  'prepositional-phrase': {
    pattern: '介词 + 名词',
    examples: ['在云端', '在路上', '在别处', '在水一方', '在黑暗中'],
    effectiveness: 75
  },
  'character-role': {
    pattern: '角色名 + 身份',
    examples: ['哈利波特与魔法石', '指环王', '射雕英雄传', '神雕侠侣', '天龙八部'],
    effectiveness: 85
  },
  'setting-action': {
    pattern: '场景 + 动作',
    examples: ['荒野猎人', '海上钢琴师', '海上钢琴师', '海上钢琴师', '海上钢琴师'],
    effectiveness: 80
  },
  'metaphorical': {
    pattern: '比喻性表达',
    examples: ['围城', '活着', '兄弟', '红楼梦', '西游记'],
    effectiveness: 90
  },
  'contrasting': {
    pattern: '对比元素',
    examples: ['倾城之恋', '生死疲劳', '平凡的世界', '光荣与梦想', '爱与哀愁'],
    effectiveness: 85
  },
  'question': {
    pattern: '问句形式',
    examples: ['活着是为了什么', '谁是凶手', '真相是什么', '明天会更好吗', '为什么'],
    effectiveness: 70
  },
  'number-element': {
    pattern: '数字 + 元素',
    examples: ['三体', '九品芝麻官', '七剑下天山', '十二生肖', '四大名著'],
    effectiveness: 88
  }
};

// 爆款标题关键词
export const HOT_KEYWORDS: Record<string, string[]> = {
  '玄幻': ['战', '神', '帝', '天', '魔', '仙', '道', '尊', '圣', '皇', '王', '龙', '凤', '灵', '魂', '剑', '道', '术', '法', '宝'],
  '都市': ['CEO', '总裁', '重生', '系统', '神豪', '赘婿', '豪门', '兵王', '战神', '医仙'],
  '仙侠': ['剑', '仙', '道', '魔', '神', '妖', '圣', '尊', '王', '天', '地', '人', '修', '练'],
  '武侠': ['侠', '剑', '刀', '武', '江湖', '恩怨', '英雄', '豪杰', '门派', '秘籍'],
  '历史': ['帝', '王', '皇', '朝', '代', '国', '战', '将', '相', '策', '谋'],
  '言情': ['爱', '恋', '情', '缘', '缘', '心', '梦', '月', '花', '春', '夏', '秋', '冬'],
  '悬疑': ['疑', '谜', '案', '杀', '死', '真相', '秘密', '隐藏', '黑暗', '背后'],
  '科幻': ['星', '宇', '宙', '时间', '空间', '未来', '科技', '机器', '人', '进化']
};

// 生成书名选项
export function generateTitleOptions(
  genre: string,
  theme: string,
  mainCharacter?: string,
  keyElements?: string[],
  setting?: string
): TitleOption[] {
  const options: TitleOption[] = [];
  const keywords = HOT_KEYWORDS[genre] || [];

  // 使用不同公式生成标题
  Object.entries(TITLE_FORMULAS).forEach(([formulaType, formulaInfo]) => {
    const generatedTitles = generateTitleByFormula(
      formulaType as TitleFormula,
      genre,
      theme,
      mainCharacter,
      keyElements,
      setting,
      keywords
    );

    generatedTitles.forEach(title => {
      const option = analyzeTitle(title, genre);
      options.push(option);
    });
  });

  // 按综合评分排序
  return options
    .sort((a, b) => b.predictedPerformance.overallScore - a.predictedPerformance.overallScore)
    .slice(0, 15);
}

// 根据公式生成标题
function generateTitleByFormula(
  formula: TitleFormula,
  genre: string,
  theme: string,
  mainCharacter?: string,
  keyElements?: string[],
  setting?: string,
  keywords?: string[]
): string[] {
  const titles: string[] = [];

  switch (formula) {
    case 'nouns-stack':
      if (keyElements && keyElements.length >= 2) {
        titles.push(keyElements.slice(0, 3).join(''));
      }
      if (keywords && keywords.length >= 2) {
        titles.push(keywords.slice(0, 3).join(''));
      }
      break;

    case 'adjective-noun':
      if (keyElements && keyElements.length >= 1) {
        const adjectives = ['伟大的', '平凡的', '神秘的', '永恒的', '破碎的', '完美的', '黑暗的', '光明的'];
        titles.push(...adjectives.map(adj => adj + keyElements[0]));
      }
      break;

    case 'verb-object':
      const verbs = ['追寻', '寻找', '守护', '征服', '穿越', '探索', '征服', '征服'];
      const objects = keyElements || keywords || ['梦想', '真相', '力量', '自由'];
      titles.push(...verbs.slice(0, 3).map(v => v + objects[0]));
      break;

    case 'character-role':
      if (mainCharacter) {
        const roles = ['传', '纪', '记', '传奇', '故事'];
        titles.push(mainCharacter + roles[0]);
        if (keywords && keywords.length > 0) {
          titles.push(mainCharacter + '与' + keywords[0]);
        }
      }
      break;

    case 'setting-action':
      if (setting) {
        const actions = ['之战', '传说', '故事', '传奇', '纪事'];
        titles.push(setting + actions[0]);
      }
      break;

    case 'metaphorical':
      const metaphors = ['之梦', '之歌', '之殇', '之谜', '之光', '之影', '之翼', '之路'];
      const metaphorsFor = keyElements || keywords || [theme];
      titles.push(...metaphors.slice(0, 3).map(m => metaphorsFor[0] + m));
      break;

    case 'contrasting':
      if (keyElements && keyElements.length >= 2) {
        titles.push(keyElements[0] + '与' + keyElements[1]);
      }
      if (keywords && keywords.length >= 2) {
        titles.push(keywords[0] + '与' + keywords[1]);
      }
      break;

    case 'number-element':
      const numbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万'];
      const elements = keyElements || keywords || ['世界', '界', '道', '神'];
      titles.push(...numbers.slice(0, 5).map(n => n + elements[0]));
      break;

    default:
      // 默认生成简单标题
      if (keyElements && keyElements.length > 0) {
        titles.push(keyElements[0]);
      }
      if (keywords && keywords.length > 0) {
        titles.push(keywords[0]);
      }
  }

  return [...new Set(titles)].slice(0, 5);
}

// 分析标题
export function analyzeTitle(title: string, genre: string): TitleOption {
  // 计算各项评分
  const appealScore = calculateAppealScore(title);
  const memorability = calculateMemorability(title);
  const clarity = calculateClarity(title);
  const uniqueness = calculateUniqueness(title, genre);

  // 识别标题类型
  const type = identifyTitleType(title);

  // 识别使用的公式
  const formula = identifyFormula(title);

  // 提取关键词
  const keywords = extractKeywords(title, genre);

  // 预测性能
  const predictedPerformance = predictPerformance(title, genre);

  // 分析优点和缺点
  const strengths = analyzeStrengths(title);
  const weaknesses = analyzeWeaknesses(title);

  // 生成改进建议
  const improvementSuggestions = generateImprovements(title, strengths, weaknesses);

  return {
    id: `title-${Date.now()}-${Math.random()}`,
    title,
    type,
    formula,
    description: `${TITLE_TYPES[type].description}，使用${TITLE_FORMULAS[formula].pattern}公式`,
    appealScore,
    memorability,
    clarity,
    uniqueness,
    targetAudience: determineTargetAudience(title, genre),
    keywords,
    predictedPerformance,
    strengths,
    weaknesses,
    improvementSuggestions
  };
}

// 计算吸引力评分
function calculateAppealScore(title: string): number {
  let score = 50;

  // 长度适中
  if (title.length >= 2 && title.length <= 6) {
    score += 20;
  } else if (title.length > 6) {
    score -= 10;
  }

  // 包含热点关键词
  const hotKeywords = ['战', '神', '帝', '天', '仙', '龙', '凤', '剑', '道', '宝', '系统', '重生'];
  if (hotKeywords.some(kw => title.includes(kw))) {
    score += 15;
  }

  // 使用数字
  if (/\d/.test(title)) {
    score += 10;
  }

  // 使用对比
  if (title.includes('与') || title.includes('和')) {
    score += 10;
  }

  return Math.min(100, score);
}

// 计算记忆度
function calculateMemorability(title: string): number {
  let score = 50;

  // 简短易记
  if (title.length <= 4) {
    score += 20;
  }

  // 有节奏感
  if (/^[一-龥]{2,4}$/.test(title)) {
    score += 15;
  }

  // 有特色
  const uniqueChars = ['三', '九', '龙', '凤', '剑', '神', '仙', '道', '宝'];
  if (uniqueChars.some(char => title.includes(char))) {
    score += 10;
  }

  return Math.min(100, score);
}

// 计算清晰度
function calculateClarity(title: string): number {
  let score = 50;

  // 字数适中
  if (title.length >= 2 && title.length <= 6) {
    score += 20;
  }

  // 词语常见
  const commonWords = ['世界', '传说', '传奇', '故事', '剑', '神', '仙', '道'];
  if (commonWords.some(word => title.includes(word))) {
    score += 15;
  }

  // 语法清晰
  if (!title.includes('?') && !title.includes('！')) {
    score += 10;
  }

  return Math.min(100, score);
}

// 计算独特性
function calculateUniqueness(title: string, genre: string): number {
  let score = 50;

  // 检查常见程度
  const commonTitles = ['三体', '完美世界', '遮天', '斗破苍穹', '凡人修仙传'];
  if (!commonTitles.includes(title)) {
    score += 20;
  }

  // 组合独特
  if (title.includes('与') || title.includes('之')) {
    score += 10;
  }

  // 使用数字但不常见
  if (/\d/.test(title) && !['一', '二', '三'].some(n => title.includes(n))) {
    score += 10;
  }

  return Math.min(100, score);
}

// 识别标题类型
function identifyTitleType(title: string): TitleType {
  if (/^[一-龥]{2,4}$/.test(title)) {
    return 'punchy';
  }
  if (title.includes('与') || title.includes('和')) {
    return 'symbolic'; // 使用symbolic代替contrasting
  }
  if (title.includes('传') || title.includes('记') || title.includes('纪')) {
    return 'character-focused';
  }
  if (title.includes('之')) {
    return 'symbolic';
  }
  if (/\d/.test(title)) {
    return 'symbolic';
  }
  if (/^(追寻|寻找|守护|征服)/.test(title)) {
    return 'action-oriented';
  }

  return 'descriptive';
}

// 识别使用的公式
function identifyFormula(title: string): TitleFormula {
  if (/\d/.test(title)) {
    return 'number-element';
  }
  if (title.includes('与') || title.includes('和')) {
    return 'symbolic'; // 使用symbolic代替contrasting
  }
  if (title.includes('传') || title.includes('纪')) {
    return 'character-role';
  }
  if (title.includes('之')) {
    return 'metaphorical';
  }
  if (/^(追寻|寻找|守护)/.test(title)) {
    return 'verb-object';
  }
  if (/^[伟大的|平凡的|神秘的]/.test(title)) {
    return 'adjective-noun';
  }

  return 'nouns-stack';
}

// 提取关键词
function extractKeywords(title: string, genre: string): string[] {
  const keywords: string[] = [];
  const genreKeywords = HOT_KEYWORDS[genre] || [];

  genreKeywords.forEach(kw => {
    if (title.includes(kw)) {
      keywords.push(kw);
    }
  });

  return keywords;
}

// 预测性能
function predictPerformance(title: string, genre: string): PerformancePrediction {
  const appealScore = calculateAppealScore(title);
  const memorability = calculateMemorability(title);
  const clarity = calculateClarity(title);
  const uniqueness = calculateUniqueness(title, genre);

  const clickRate = (appealScore * 0.4 + memorability * 0.3 + clarity * 0.3);
  const conversionRate = (clarity * 0.5 + appealScore * 0.3 + uniqueness * 0.2);
  const retentionRate = (memorability * 0.4 + clarity * 0.3 + appealScore * 0.3);
  const viralPotential = (uniqueness * 0.5 + appealScore * 0.3 + memorability * 0.2);
  const overallScore = (clickRate + conversionRate + retentionRate + viralPotential) / 4;

  return {
    clickRate: Math.floor(clickRate),
    conversionRate: Math.floor(conversionRate),
    retentionRate: Math.floor(retentionRate),
    viralPotential: Math.floor(viralPotential),
    overallScore: Math.floor(overallScore)
  };
}

// 分析优点
function analyzeStrengths(title: string): string[] {
  const strengths: string[] = [];

  if (title.length >= 2 && title.length <= 6) {
    strengths.push('长度适中，易于记忆和传播');
  }

  if (/^[一-龥]{2,4}$/.test(title)) {
    strengths.push('节奏感强，朗朗上口');
  }

  const hotKeywords = ['战', '神', '帝', '天', '仙', '龙', '凤'];
  if (hotKeywords.some(kw => title.includes(kw))) {
    strengths.push('包含热点关键词，吸引目标读者');
  }

  if (title.includes('与') || title.includes('和')) {
    strengths.push('使用对比手法，增加吸引力');
  }

  if (/\d/.test(title)) {
    strengths.push('使用数字，提高辨识度');
  }

  if (!strengths.length) {
    strengths.push('简洁明了，直接表达内容');
  }

  return strengths;
}

// 分析缺点
function analyzeWeaknesses(title: string): string[] {
  const weaknesses: string[] = [];

  if (title.length < 2) {
    weaknesses.push('过短，信息不足');
  } else if (title.length > 8) {
    weaknesses.push('过长，记忆困难');
  }

  const commonTitles = ['三体', '完美世界', '遮天', '斗破苍穹'];
  if (commonTitles.includes(title)) {
    weaknesses.push('与知名作品雷同，缺乏独特性');
  }

  if (!/[一-龥]/.test(title)) {
    weaknesses.push('包含非中文字符，可能影响传播');
  }

  return weaknesses;
}

// 生成改进建议
function generateImprovements(title: string, strengths: string[], weaknesses: string[]): string[] {
  const improvements: string[] = [];

  if (weaknesses.some(w => w.includes('过长'))) {
    improvements.push('考虑缩短标题，控制在2-6字');
  }

  if (weaknesses.some(w => w.includes('过短'))) {
    improvements.push('考虑增加一个关键词，丰富信息');
  }

  if (weaknesses.some(w => w.includes('雷同'))) {
    improvements.push('尝试使用不同的关键词或组合方式');
  }

  if (!strengths.some(s => s.includes('热点关键词'))) {
    improvements.push('考虑添加1-2个热点关键词');
  }

  if (!title.includes('与') && !title.includes('和') && title.length <= 4) {
    improvements.push('考虑使用对比手法，如"X与Y"');
  }

  if (!/\d/.test(title)) {
    improvements.push('考虑使用数字，如"三体"、"九界"等');
  }

  return improvements;
}

// 确定目标受众
function determineTargetAudience(title: string, genre: string): string[] {
  const audiences: string[] = [];

  if (genre === '玄幻' || genre === '仙侠') {
    audiences.push('玄幻爱好者', '仙侠读者', '年轻男性读者');
  } else if (genre === '都市') {
    audiences.push('都市小说读者', '职场人士', '年轻读者');
  } else if (genre === '历史') {
    audiences.push('历史爱好者', '文学读者', '成年读者');
  } else if (genre === '言情') {
    audiences.push('女性读者', '言情小说爱好者');
  } else {
    audiences.push('广大读者');
  }

  if (title.includes('少年') || title.includes('青春')) {
    audiences.push('青少年读者');
  }

  return [...new Set(audiences)];
}

// A/B测试建议
export function generateABTestSuggestions(topTitles: TitleOption[]): ABTestSuggestion[] {
  const suggestions: ABTestSuggestion[] = [];

  if (topTitles.length >= 2) {
    suggestions.push({
      titleA: topTitles[0].title,
      titleB: topTitles[1].title,
      testGoal: '测试哪个标题点击率更高',
      expectedOutcome: '选择点击率更高的标题',
      testDuration: '7天'
    });
  }

  if (topTitles.length >= 4) {
    suggestions.push({
      titleA: topTitles[0].title,
      titleB: topTitles[3].title,
      testGoal: '测试短标题vs长标题的效果',
      expectedOutcome: '根据受众偏好选择',
      testDuration: '14天'
    });
  }

  return suggestions;
}

// 市场对比
export function generateMarketComparison(title: string, genre: string): MarketComparison[] {
  const comparisons: MarketComparison[] = [];

  // 模拟市场中的相似标题
  const similarTitles = [
    '三体', '完美世界', '遮天', '斗破苍穹', '凡人修仙传',
    '赘婿', '神豪', '战神', '仙尊', '圣王'
  ];

  similarTitles.forEach(similarTitle => {
    const similarity = calculateTitleSimilarity(title, similarTitle);
    if (similarity > 40) {
      comparisons.push({
        title: similarTitle,
        similarity,
        competitionLevel: similarity > 70 ? 'high' : similarity > 50 ? 'medium' : 'low',
        differentiation: similarity > 70 ? '高度相似，需差异化' : '有一定相似度'
      });
    }
  });

  return comparisons;
}

// 计算标题相似度
function calculateTitleSimilarity(title1: string, title2: string): number {
  if (title1 === title2) return 100;

  let similarity = 0;
  const chars1 = new Set(title1.split(''));
  const chars2 = new Set(title2.split(''));

  // 字符重叠度
  const overlap = [...chars1].filter(char => chars2.has(char)).length;
  const union = new Set([...chars1, ...chars2]).size;
  similarity += (overlap / union) * 60;

  // 长度相似度
  const lengthDiff = Math.abs(title1.length - title2.length);
  similarity += Math.max(0, 40 - lengthDiff * 10);

  return Math.floor(similarity);
}

// AI辅助生成标题
export function generateTitlePrompt(
  genre: string,
  theme: string,
  storySummary: string,
  targetAudience: string,
  preferredStyle?: TitleType
): string {
  const styleHint = preferredStyle ? `，偏好${TITLE_TYPES[preferredStyle].description}风格` : '';

  return `请为以下小说生成10个吸引人的标题：

## 基本信息
题材：${genre}
主题：${theme}
目标读者：${targetAudience}
故事概要：${storySummary}${styleHint}

## 标题要求
1. 长度控制在2-6字
2. 包含1-2个热点关键词（根据题材）
3. 朗朗上口，易于记忆
4. 体现故事核心元素
5. 具有吸引力和辨识度

## 输出格式
请按以下格式输出：

1. 标题名称
   - 类型：[描述性/象征性/角色为主等]
   - 公式：[使用的公式，如名词堆叠]
   - 热点关键词：[包含的关键词]
   - 预期效果：[吸引点分析]
   - 目标读者：[主要吸引的读者群]

请生成10个不同风格的标题`;
}

// 优化标题
export function optimizeTitle(
  originalTitle: string,
  genre: string,
  feedback?: string[]
): TitleOption {
  const optimizedTitle = analyzeTitle(originalTitle, genre);

  // 根据反馈调整
  if (feedback && feedback.length > 0) {
    if (feedback.some(f => f.includes('太长'))) {
      // 缩短标题
      if (optimizedTitle.title.length > 6) {
        optimizedTitle.title = optimizedTitle.title.substring(0, 6);
      }
    }

    if (feedback.some(f => f.includes('不吸引'))) {
      // 添加热点关键词
      const keywords = HOT_KEYWORDS[genre];
      if (keywords && keywords.length > 0 && !optimizedTitle.title.includes(keywords[0])) {
        optimizedTitle.title = keywords[0] + optimizedTitle.title;
      }
    }

    if (feedback.some(f => f.includes('太普通'))) {
      // 增加独特性
      if (!optimizedTitle.title.includes('之')) {
        optimizedTitle.title = optimizedTitle.title + '之梦';
      }
    }
  }

  // 重新分析
  return analyzeTitle(optimizedTitle.title, genre);
}
