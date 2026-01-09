/**
 * 封面描述生成器
 * 支持视觉元素、配色方案、AI绘图提示词生成
 */

export interface CoverDescription {
  id: string;
  novelTitle: string;
  genre: string;
  style: CoverStyle;
  mainElements: CoverElement[];
  colorScheme: ColorScheme;
  composition: Composition;
  mood: string;
  description: string;
  aiPrompts: AIImagePrompt[];
  visualStrengths: string[];
  improvementSuggestions: string[];
  targetAudienceAppeal: string[];
}

export type CoverStyle =
  | 'realistic' // 写实
  | 'illustration' // 插画
  | 'anime' // 动漫
  | 'minimalist' // 极简
  | 'abstract' // 抽象
  | 'digital-art' // 数字艺术
  | 'concept-art' // 概念艺术
  | '3d-render' // 3D渲染
  | 'watercolor' // 水彩
  | 'ink-painting' // 水墨;

export interface CoverElement {
  type: ElementType;
  description: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'background';
  size: 'large' | 'medium' | 'small';
  importance: number; // 重要性 1-10
  details: string[];
}

export type ElementType =
  | 'character' // 角色
  | 'object' // 物品
  | 'symbol' // 符号
  | 'scene' // 场景
  | 'text' // 文字
  | 'effect' // 特效
  | 'texture' // 纹理
  | 'pattern' // 图案;

export interface ColorScheme {
  primaryColor: string; // 主色
  secondaryColor: string; // 辅助色
  accentColor: string; // 强调色
  backgroundColor: string; // 背景色
  mood: string; // 色彩情绪
  harmony: ColorHarmony;
}

export type ColorHarmony =
  | 'complementary' // 互补
  | 'analogous' // 类似
  | 'triadic' // 三角
  | 'monochromatic' // 单色
  | 'split-complementary' // 分裂互补
  | 'tetradic' // 四角;

export interface Composition {
  layout: LayoutType;
  focalPoint: string; // 焦点
  balance: BalanceType;
  movement: MovementType;
  spacing: string;
}

export type LayoutType =
  | 'centered' // 居中
  | 'rule-of-thirds' // 三分法
  | 'golden-ratio' // 黄金比例
  | 'symmetrical' // 对称
  | 'asymmetrical' // 不对称
  | 'diagonal' // 对角线
  | 'dynamic' // 动态;

export type BalanceType =
  | 'symmetrical' // 对称平衡
  | 'asymmetrical' // 不对称平衡
  | 'radial' // 放射平衡;

export type MovementType =
  | 'static' // 静态
  | 'dynamic' // 动态
  | 'flowing' // 流动
  | 'explosive' // 爆发;

export interface AIImagePrompt {
  platform: 'midjourney' | 'stable-diffusion' | 'dall-e' | 'other';
  prompt: string;
  negativePrompt?: string;
  aspectRatio: string;
  styleKeywords: string[];
  qualityKeywords: string[];
}

// 题材风格映射
export const GENRE_COVER_STYLES: Record<string, CoverStyle> = {
  '玄幻': 'illustration',
  '仙侠': 'ink-painting',
  '武侠': 'ink-painting',
  '都市': 'realistic',
  '历史': 'illustration',
  '言情': 'anime',
  '科幻': 'digital-art',
  '悬疑': 'minimalist',
  '恐怖': 'abstract',
  '奇幻': 'concept-art'
};

// 题材配色方案
export const GENRE_COLOR_SCHEMES: Record<string, ColorScheme> = {
  '玄幻': {
    primaryColor: '#4A90E2', // 蓝色
    secondaryColor: '#F5A623', // 橙色
    accentColor: '#D0021B', // 红色
    backgroundColor: '#1A1A2E', // 深蓝黑
    mood: '神秘、力量、冒险',
    harmony: 'complementary'
  },
  '仙侠': {
    primaryColor: '#2C3E50', // 深灰
    secondaryColor: '#E74C3C', // 朱红
    accentColor: '#F39C12', // 金色
    backgroundColor: '#ECF0F1', // 浅灰白
    mood: '古典、雅致、空灵',
    harmony: 'complementary'
  },
  '武侠': {
    primaryColor: '#8B4513', // 棕色
    secondaryColor: '#DC143C', // 深红
    accentColor: '#FFD700', // 金色
    backgroundColor: '#F5F5DC', // 米色
    mood: '古朴、豪迈、侠义',
    harmony: 'analogous'
  },
  '都市': {
    primaryColor: '#2C3E50', // 深灰蓝
    secondaryColor: '#3498DB', // 天蓝
    accentColor: '#E74C3C', // 红色
    backgroundColor: '#FFFFFF', // 白色
    mood: '现代、时尚、活力',
    harmony: 'complementary'
  },
  '言情': {
    primaryColor: '#FF69B4', // 粉色
    secondaryColor: '#FFB6C1', // 浅粉
    accentColor: '#FF1493', // 深粉
    backgroundColor: '#FFF0F5', // 浅粉白
    mood: '浪漫、温柔、甜蜜',
    harmony: 'monochromatic'
  },
  '科幻': {
    primaryColor: '#00CED1', // 青色
    secondaryColor: '#4169E1', // 皇家蓝
    accentColor: '#FF4500', // 橙红
    backgroundColor: '#0F0F23', // 深空黑
    mood: '未来、科技、神秘',
    harmony: 'complementary'
  },
  '悬疑': {
    primaryColor: '#2C3E50', // 深灰
    secondaryColor: '#34495E', // 更深的灰
    accentColor: '#F39C12', // 金色
    backgroundColor: '#1C1C1C', // 近黑
    mood: '神秘、紧张、深邃',
    harmony: 'monochromatic'
  },
  '恐怖': {
    primaryColor: '#1C1C1C', // 近黑
    secondaryColor: '#8B0000', // 深红
    accentColor: '#4B0082', // 靛蓝
    backgroundColor: '#0D0D0D', // 黑色
    mood: '恐惧、压抑、诡异',
    harmony: 'analogous'
  }
};

// 常用元素库
export const COMMON_COVER_ELEMENTS: Record<string, CoverElement[]> = {
  '玄幻': [
    {
      type: 'character',
      description: '年轻的主角，穿着古代服饰',
      position: 'center',
      size: 'large',
      importance: 9,
      details: ['眼神坚毅', '手持剑或法器', '背景有祥云或光芒']
    },
    {
      type: 'object',
      description: '神秘的神器或宝物',
      position: 'background',
      size: 'medium',
      importance: 7,
      details: ['发光', '悬浮', '有神秘纹路']
    },
    {
      type: 'scene',
      description: '仙山或玄幻世界',
      position: 'background',
      size: 'large',
      importance: 8,
      details: ['云雾缭绕', '古建筑', '神兽']
    },
    {
      type: 'symbol',
      description: '太极八卦或道纹',
      position: 'bottom',
      size: 'small',
      importance: 6,
      details: ['发光', '纹路清晰', '神秘']
    }
  ],
  '仙侠': [
    {
      type: 'character',
      description: '修仙者，仙风道骨',
      position: 'center',
      size: 'large',
      importance: 9,
      details: ['道袍', '飞剑', '仙气缭绕']
    },
    {
      type: 'scene',
      description: '仙山洞府',
      position: 'background',
      size: 'large',
      importance: 8,
      details: ['云海', '松柏', '仙鹤']
    },
    {
      type: 'object',
      description: '丹炉或法宝',
      position: 'left',
      size: 'medium',
      importance: 7,
      details: ['古朴', '有灵气', '悬浮']
    }
  ],
  '都市': [
    {
      type: 'character',
      description: '现代都市男女主角',
      position: 'center',
      size: 'large',
      importance: 9,
      details: ['时尚', '气质好', '表情自然']
    },
    {
      type: 'scene',
      description: '都市天际线或标志性建筑',
      position: 'background',
      size: 'large',
      importance: 7,
      details: ['夜景', '灯光', '现代建筑']
    },
    {
      type: 'effect',
      description: '光影效果',
      position: 'background',
      size: 'large',
      importance: 6,
      details: ['温暖光线', '柔焦', '氛围感']
    }
  ],
  '言情': [
    {
      type: 'character',
      description: '男女主角深情对视',
      position: 'center',
      size: 'large',
      importance: 9,
      details: ['表情温柔', '服饰精美', '氛围浪漫']
    },
    {
      type: 'symbol',
      description: '爱心、花朵、星空',
      position: 'background',
      size: 'medium',
      importance: 7,
      details: ['发光', '浪漫', '唯美']
    },
    {
      type: 'effect',
      description: '柔和的光线和花瓣',
      position: 'background',
      size: 'large',
      importance: 6,
      details: ['粉色调', '梦幻', '柔焦']
    }
  ],
  '科幻': [
    {
      type: 'character',
      description: '未来感角色',
      position: 'center',
      size: 'large',
      importance: 9,
      details: ['科幻服装', '机械部件', '高科技装备']
    },
    {
      type: 'scene',
      description: '未来城市或太空',
      position: 'background',
      size: 'large',
      importance: 8,
      details: ['赛博朋克', '霓虹灯', '飞行器']
    },
    {
      type: 'object',
      description: '科技设备或飞船',
      position: 'right',
      size: 'medium',
      importance: 7,
      details: ['金属质感', '发光', '复杂结构']
    },
    {
      type: 'effect',
      description: '光束、全息投影',
      position: 'background',
      size: 'large',
      importance: 6,
      details: ['蓝色光', '科技感', '未来感']
    }
  ]
};

// 生成封面描述
export function generateCoverDescription(
  novelTitle: string,
  genre: string,
  storySummary: string,
  mainCharacters?: Array<{ name: string; description: string }>,
  keyElements?: string[],
  preferredStyle?: CoverStyle
): CoverDescription {
  // 确定风格
  const style = preferredStyle || GENRE_COVER_STYLES[genre] || 'illustration';

  // 确定配色方案
  const colorScheme = GENRE_COLOR_SCHEMES[genre] || {
    primaryColor: '#4A90E2',
    secondaryColor: '#F5A623',
    accentColor: '#D0021B',
    backgroundColor: '#FFFFFF',
    mood: '神秘、冒险',
    harmony: 'complementary'
  };

  // 选择主要元素
  let mainElements = COMMON_COVER_ELEMENTS[genre] || COMMON_COVER_ELEMENTS['玄幻'];

  // 如果提供了关键元素，可以定制化
  if (keyElements && keyElements.length > 0) {
    const customElements: CoverElement[] = keyElements.map((element, index) => ({
      type: 'symbol',
      description: element,
      position: index % 2 === 0 ? 'left' : 'right',
      size: 'medium',
      importance: 6,
      details: []
    }));
    mainElements = [...mainElements.slice(0, 2), ...customElements];
  }

  // 确定构图
  const composition = determineComposition(style, genre);

  // 确定情绪
  const mood = determineMood(genre, style);

  // 生成描述
  const description = generateDescriptionText(
    novelTitle,
    genre,
    mainElements,
    colorScheme,
    composition,
    mood
  );

  // 生成AI提示词
  const aiPrompts = generateAIImagePrompts(
    novelTitle,
    genre,
    style,
    mainElements,
    colorScheme,
    composition
  );

  // 分析视觉优点
  const visualStrengths = analyzeVisualStrengths(mainElements, colorScheme, composition);

  // 生成改进建议
  const improvementSuggestions = generateImprovementSuggestions(mainElements, colorScheme);

  // 确定目标受众吸引力
  const targetAudienceAppeal = determineTargetAudienceAppeal(genre, style, colorScheme);

  return {
    id: `cover-${Date.now()}`,
    novelTitle,
    genre,
    style,
    mainElements,
    colorScheme,
    composition,
    mood,
    description,
    aiPrompts,
    visualStrengths,
    improvementSuggestions,
    targetAudienceAppeal
  };
}

// 确定构图
function determineComposition(style: CoverStyle, genre: string): Composition {
  let layout: LayoutType;
  let balance: BalanceType;
  let movement: MovementType;

  switch (style) {
    case 'minimalist':
      layout = 'centered';
      balance = 'symmetrical';
      movement = 'static';
      break;
    case 'digital-art':
    case 'concept-art':
      layout = 'rule-of-thirds';
      balance = 'asymmetrical';
      movement = 'dynamic';
      break;
    case 'ink-painting':
      layout = 'golden-ratio';
      balance = 'asymmetrical';
      movement = 'flowing';
      break;
    case 'anime':
      layout = 'centered';
      balance = 'symmetrical';
      movement = 'dynamic';
      break;
    default:
      layout = 'rule-of-thirds';
      balance = 'asymmetrical';
      movement = 'dynamic';
  }

  return {
    layout,
    focalPoint: '角色或主要视觉元素',
    balance,
    movement,
    spacing: '适中，留白合理'
  };
}

// 确定情绪
function determineMood(genre: string, style: CoverStyle): string {
  const moodMap: Record<string, string> = {
    '玄幻': '神秘、冒险、力量',
    '仙侠': '古典、空灵、超凡',
    '武侠': '豪迈、侠义、江湖',
    '都市': '现代、时尚、活力',
    '言情': '浪漫、温柔、甜蜜',
    '科幻': '未来、科技、神秘',
    '悬疑': '神秘、紧张、深邃',
    '恐怖': '恐惧、压抑、诡异'
  };

  return moodMap[genre] || '神秘、冒险';
}

// 生成描述文本
function generateDescriptionText(
  novelTitle: string,
  genre: string,
  mainElements: CoverElement[],
  colorScheme: ColorScheme,
  composition: Composition,
  mood: string
): string {
  return `# ${novelTitle} 封面设计

## 整体风格
风格：${composition.layout}构图，${composition.balance}平衡，${composition.mood}动势
情绪：${mood}
配色：${colorScheme.mood}（${colorScheme.harmony}和谐）

## 主要元素
${mainElements.map((element, index) => `
### 元素${index + 1}
类型：${element.type}
描述：${element.description}
位置：${element.position}
大小：${element.size}
重要性：${element.importance}/10
${element.details.length > 0 ? `细节：${element.details.join('、')}` : ''}
`).join('')}

## 配色方案
- 主色：${colorScheme.primaryColor}
- 辅助色：${colorScheme.secondaryColor}
- 强调色：${colorScheme.accentColor}
- 背景色：${colorScheme.backgroundColor}

## 设计建议
- 焦点放在${composition.focalPoint}
- 使用${colorScheme.harmony}色彩和谐度
- 保持整体${mood}的情绪基调
- 确保元素之间的层次和对比`;
}

// 生成AI图像提示词
export function generateAIImagePrompts(
  novelTitle: string,
  genre: string,
  style: CoverStyle,
  mainElements: CoverElement[],
  colorScheme: ColorScheme,
  composition: Composition
): AIImagePrompt[] {
  const prompts: AIImagePrompt[] = [];

  // Midjourney提示词
  const midjourneyPrompt = generateMidjourneyPrompt(
    novelTitle,
    genre,
    style,
    mainElements,
    colorScheme,
    composition
  );
  prompts.push({
    platform: 'midjourney',
    prompt: midjourneyPrompt,
    aspectRatio: '2:3',
    styleKeywords: getStyleKeywords(style),
    qualityKeywords: ['high quality', 'detailed', 'masterpiece']
  });

  // Stable Diffusion提示词
  const stableDiffusionPrompt = generateStableDiffusionPrompt(
    novelTitle,
    genre,
    style,
    mainElements,
    colorScheme
  );
  prompts.push({
    platform: 'stable-diffusion',
    prompt: stableDiffusionPrompt,
    negativePrompt: 'low quality, blurry, distorted, ugly, bad anatomy',
    aspectRatio: '2:3',
    styleKeywords: getStyleKeywords(style),
    qualityKeywords: ['best quality', 'ultra detailed', '8k']
  });

  // DALL-E提示词
  const dallEPrompt = generateDallEPrompt(novelTitle, genre, style, mainElements, colorScheme);
  prompts.push({
    platform: 'dall-e',
    prompt: dallEPrompt,
    aspectRatio: '2:3',
    styleKeywords: getStyleKeywords(style),
    qualityKeywords: ['high quality', 'detailed']
  });

  return prompts;
}

function generateMidjourneyPrompt(
  novelTitle: string,
  genre: string,
  style: CoverStyle,
  mainElements: CoverElement[],
  colorScheme: ColorScheme,
  composition: Composition
): string {
  const elementDescriptions = mainElements
    .map(e => e.description)
    .join(', ');

  const styleKeywords = getStyleKeywords(style).join(', ');
  const qualityKeywords = ['high quality', 'detailed', 'masterpiece', 'professional'].join(', ');

  return `${elementDescriptions}, ${styleKeywords}, ${qualityKeywords}, ${colorScheme.mood} mood, ${genre} style --ar 2:3 --v 6`;
}

function generateStableDiffusionPrompt(
  novelTitle: string,
  genre: string,
  style: CoverStyle,
  mainElements: CoverElement[],
  colorScheme: ColorScheme
): string {
  const elementDescriptions = mainElements
    .map(e => e.description)
    .join(', ');

  const styleKeywords = getStyleKeywords(style).join(', ');
  const qualityKeywords = ['best quality', 'ultra detailed', '8k', 'masterpiece'].join(', ');

  return `${elementDescriptions}, ${styleKeywords}, ${qualityKeywords}, ${colorScheme.mood} mood, ${genre} style, book cover`;
}

function generateDallEPrompt(
  novelTitle: string,
  genre: string,
  style: CoverStyle,
  mainElements: CoverElement[],
  colorScheme: ColorScheme
): string {
  const elementDescriptions = mainElements
    .map(e => e.description)
    .join(', ');

  const styleKeywords = getStyleKeywords(style).join(', ');

  return `Book cover for "${novelTitle}", ${genre} genre, ${elementDescriptions}, ${styleKeywords}, ${colorScheme.mood} mood, professional book cover design`;
}

function getStyleKeywords(style: CoverStyle): string[] {
  const keywords: Record<CoverStyle, string[]> = {
    'realistic': ['photorealistic', 'hyper-realistic', 'realistic style'],
    'illustration': ['illustration', 'detailed illustration', 'artistic'],
    'anime': ['anime style', 'manga', 'Japanese anime style'],
    'minimalist': ['minimalist', 'clean', 'simple design'],
    'abstract': ['abstract', 'stylized', 'artistic'],
    'digital-art': ['digital art', 'concept art', 'digital painting'],
    'concept-art': ['concept art', 'detailed concept art', 'conceptual'],
    '3d-render': ['3D render', 'CGI', '3D art'],
    'watercolor': ['watercolor painting', 'watercolor style', 'painted'],
    'ink-painting': ['ink painting', 'Chinese ink wash', 'traditional art']
  };

  return keywords[style] || ['digital art', 'illustration'];
}

// 分析视觉优点
function analyzeVisualStrengths(
  mainElements: CoverElement[],
  colorScheme: ColorScheme,
  composition: Composition
): string[] {
  const strengths: string[] = [];

  // 元素分析
  const mainElement = mainElements.find(e => e.importance >= 9);
  if (mainElement) {
    strengths.push(`主元素"${mainElement.description}"突出，视觉焦点明确`);
  }

  // 配色分析
  if (colorScheme.harmony === 'complementary') {
    strengths.push('使用互补色，对比强烈，视觉冲击力强');
  } else if (colorScheme.harmony === 'monochromatic') {
    strengths.push('使用单色和谐，色调统一，整体感强');
  }

  // 构图分析
  if (composition.layout === 'rule-of-thirds') {
    strengths.push('使用三分法构图，平衡感好，符合视觉习惯');
  } else if (composition.layout === 'golden-ratio') {
    strengths.push('使用黄金比例构图，视觉效果和谐优美');
  }

  // 元素数量分析
  if (mainElements.length >= 3 && mainElements.length <= 5) {
    strengths.push('元素数量适中，层次分明，不拥挤不单调');
  }

  return strengths;
}

// 生成改进建议
function generateImprovementSuggestions(
  mainElements: CoverElement[],
  colorScheme: ColorScheme
): string[] {
  const suggestions: string[] = [];

  // 元素检查
  const mainElement = mainElements.find(e => e.importance >= 9);
  if (!mainElement) {
    suggestions.push('建议增加一个突出的主元素，作为视觉焦点');
  }

  if (mainElements.length < 3) {
    suggestions.push('元素较少，建议增加1-2个辅助元素丰富画面');
  } else if (mainElements.length > 6) {
    suggestions.push('元素过多，可能显得拥挤，建议精简');
  }

  // 配色检查
  if (colorScheme.mood.includes('压抑') || colorScheme.mood.includes('恐惧')) {
    suggestions.push('色彩情绪较暗沉，可适当增加亮色或暖色平衡');
  }

  // 平衡检查
  const centerElements = mainElements.filter(e => e.position === 'center').length;
  if (centerElements === 0) {
    suggestions.push('缺少中心元素，建议在中心位置安排重要元素');
  }

  return suggestions;
}

// 确定目标受众吸引力
function determineTargetAudienceAppeal(genre: string, style: CoverStyle, colorScheme: ColorScheme): string[] {
  const appeals: string[] = [];

  // 题材吸引力
  if (genre === '玄幻' || genre === '仙侠') {
    appeals.push('吸引玄幻仙侠爱好者，尤其是年轻男性读者');
  } else if (genre === '言情') {
    appeals.push('吸引言情小说爱好者，尤其是女性读者');
  } else if (genre === '科幻') {
    appeals.push('吸引科幻爱好者，对科技和未来感兴趣的读者');
  } else if (genre === '悬疑') {
    appeals.push('吸引悬疑推理爱好者，喜欢谜题和探索的读者');
  }

  // 风格吸引力
  if (style === 'anime') {
    appeals.push('吸引动漫风格爱好者，年轻读者');
  } else if (style === 'realistic') {
    appeals.push('吸引写实风格爱好者，成熟读者');
  } else if (style === 'minimalist') {
    appeals.push('吸引极简风格爱好者，追求简洁美学的读者');
  }

  // 配色吸引力
  if (colorScheme.mood.includes('神秘')) {
    appeals.push('神秘色彩吸引喜欢探索和未知的读者');
  } else if (colorScheme.mood.includes('浪漫')) {
    appeals.push('浪漫色彩吸引感性读者和言情爱好者');
  } else if (colorScheme.mood.includes('科技')) {
    appeals.push('科技色彩吸引科幻迷和年轻读者');
  }

  return appeals;
}

// AI辅助生成封面描述
export function generateCoverPrompt(
  novelTitle: string,
  genre: string,
  storySummary: string,
  preferredStyle?: CoverStyle,
  customRequirements?: string[]
): string {
  const styleHint = preferredStyle ? `，偏好${preferredStyle}风格` : '';

  return `请为以下小说设计封面视觉描述：

## 基本信息
标题：${novelTitle}
题材：${genre}
故事概要：${storySummary}${styleHint}
${customRequirements ? `## 特殊要求\n${customRequirements.join('\n')}` : ''}

## 封面要求
1. 整体风格：${GENRE_COVER_STYLES[genre] || '插画风格'}
2. 主要元素：3-5个核心视觉元素
3. 配色方案：符合题材氛围的配色
4. 构图：视觉焦点明确，层次分明
5. 情绪基调：体现故事核心情绪
6. 目标受众：吸引目标读者群

## 输出格式
### 封面设计概述
[100-200字的封面整体描述]

### 主要元素
1. 元素名称
   - 类型：[角色/物品/符号/场景等]
   - 描述：[详细描述]
   - 位置：[中心/顶部/底部/左右/背景]
   - 大小：[大/中/小]
   - 重要性：[1-10分]
   - 细节：[2-3个关键细节]

### 配色方案
- 主色：[颜色代码和描述]
- 辅助色：[颜色代码和描述]
- 强调色：[颜色代码和描述]
- 背景色：[颜色代码和描述]
- 色彩情绪：[情绪描述]

### 构图建议
- 布局：[居中/三分法/黄金比例等]
- 焦点：[视觉焦点描述]
- 平衡：[对称/不对称等]
- 动势：[静态/动态/流动等]

### AI绘图提示词
- Midjourney提示词：
- Stable Diffusion提示词：
- DALL-E提示词：

### 设计亮点
[列出3-5个设计的优点]

### 改进建议
[列出2-3个可以改进的地方]`;
}
