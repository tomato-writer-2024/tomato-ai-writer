/**
 * 文风模拟器
 * 支持知名作者风格学习、风格切换、语言特征分析
 */

export interface AuthorStyle {
  id: string;
  name: string;
  era: string; // 时代
  genre: string; // 主要题材
  characteristics: StyleCharacteristics;
  sampleText: string;
  promptTemplate: string;
  createdAt: Date;
}

export interface StyleCharacteristics {
  // 句子特征
  avgSentenceLength: number;
  sentenceStructure: 'simple' | 'compound' | 'complex' | 'mixed';
  paragraphLength: number;

  // 词汇特征
  vocabularyLevel: 'elementary' | 'intermediate' | 'advanced' | 'literary';
  rhetoricalDevices: string[]; // 修辞手法
  idiomsUsage: number; // 成语使用频率 0-100
  archaisms: boolean; // 是否使用古语

  // 叙事特征
  perspective: 'first' | 'second' | 'third-limited' | 'third-omniscient';
  pacing: 'slow' | 'moderate' | 'fast';
  descriptionLevel: 'minimal' | 'balanced' | 'detailed' | 'elaborate';
  dialogueRatio: number; // 对话占比 0-100

  // 情感特征
  emotionalTone: 'cold' | 'neutral' | 'warm' | 'passionate';
  humorLevel: number; // 幽默程度 0-100
  seriousness: number; // 严肃程度 0-100

  // 主题特征
  themes: string[];
  symbolism: boolean; // 是否使用象征
  philosophy: string; // 哲学倾向
}

export interface StyleAnalysis {
  content: string;
  matchedStyles: StyleMatch[];
  dominantStyle: string;
  styleFeatures: StyleFeature[];
  suggestions: StyleSuggestion[];
  confidence: number;
}

export interface StyleMatch {
  styleName: string;
  similarity: number; // 相似度 0-100
  matchedFeatures: string[];
  suggestions: string[];
}

export interface StyleFeature {
  feature: string;
  value: number | string;
  description: string;
  example: string;
}

export interface StyleSuggestion {
  type: 'enhance' | 'modify' | 'maintain';
  feature: string;
  current: string;
  recommended: string;
  reason: string;
}

// 知名作者风格库
export const FAMOUS_AUTHOR_STYLES: AuthorStyle[] = [
  {
    id: 'style-jinyong',
    name: '金庸',
    era: '20世纪',
    genre: '武侠',
    characteristics: {
      avgSentenceLength: 25,
      sentenceStructure: 'mixed',
      paragraphLength: 150,
      vocabularyLevel: 'literary',
      rhetoricalDevices: ['比喻', '排比', '对偶', '典故'],
      idiomsUsage: 75,
      archaisms: true,
      perspective: 'third-omniscient',
      pacing: 'moderate',
      descriptionLevel: 'detailed',
      dialogueRatio: 35,
      emotionalTone: 'passionate',
      humorLevel: 40,
      seriousness: 80,
      themes: ['侠义', '爱情', '家国', '成长'],
      symbolism: true,
      philosophy: '儒释道融合'
    },
    sampleText: '风清扬微微一笑，说道："独孤九剑，有进无退！招招都是进攻，攻敌之不得不守。你自己也不必守，变敌之不得不守。"',
    promptTemplate: '请以金庸风格创作以下内容：要求文笔古朴典雅，善用成语典故，融合儒释道思想，注重侠义精神和情感描写，节奏适中，对话简洁有力，{prompt}'
  },
  {
    id: 'style-gulong',
    name: '古龙',
    era: '20世纪',
    genre: '武侠',
    characteristics: {
      avgSentenceLength: 10,
      sentenceStructure: 'simple',
      paragraphLength: 50,
      vocabularyLevel: 'intermediate',
      rhetoricalDevices: ['短句', '重复', '对比', '悬念'],
      idiomsUsage: 40,
      archaisms: false,
      perspective: 'third-limited',
      pacing: 'fast',
      descriptionLevel: 'minimal',
      dialogueRatio: 45,
      emotionalTone: 'cold',
      humorLevel: 50,
      seriousness: 70,
      themes: ['友情', '复仇', '孤独', '正义'],
      symbolism: true,
      philosophy: '存在主义'
    },
    sampleText: '风。冷风。冷风吹在身上，就像刀割一样。他站在风中，一动也不动，仿佛已和这冷风融成了一体。',
    promptTemplate: '请以古龙风格创作以下内容：要求短句为主，节奏快速，善用重复和对比制造悬念，描写简洁有力，对话富有哲理，人物形象鲜明，{prompt}'
  },
  {
    id: 'style-mo-yan',
    name: '莫言',
    era: '当代',
    genre: '现实主义',
    characteristics: {
      avgSentenceLength: 35,
      sentenceStructure: 'complex',
      paragraphLength: 300,
      vocabularyLevel: 'advanced',
      rhetoricalDevices: ['比喻', '夸张', '拟人', '魔幻'],
      idiomsUsage: 50,
      archaisms: false,
      perspective: 'first',
      pacing: 'slow',
      descriptionLevel: 'elaborate',
      dialogueRatio: 25,
      emotionalTone: 'passionate',
      humorLevel: 60,
      seriousness: 90,
      themes: ['历史', '苦难', '人性', '乡土'],
      symbolism: true,
      philosophy: '魔幻现实主义'
    },
    sampleText: '高密东北乡的土地是黑色的，像铁一样坚硬，又像女人的皮肤一样柔软。阳光照射下来，土地就变得像融化的金子一样流动。',
    promptTemplate: '请以莫言风格创作以下内容：要求语言华丽而粗犷，善用魔幻现实主义手法，详细描写乡土风情和人物心理，情感浓烈，思想深刻，{prompt}'
  },
  {
    id: 'style-yu-hua',
    name: '余华',
    era: '当代',
    genre: '现实主义',
    characteristics: {
      avgSentenceLength: 20,
      sentenceStructure: 'simple',
      paragraphLength: 100,
      vocabularyLevel: 'intermediate',
      rhetoricalDevices: ['白描', '冷峻', '反讽', '象征'],
      idiomsUsage: 30,
      archaisms: false,
      perspective: 'first',
      pacing: 'moderate',
      descriptionLevel: 'balanced',
      dialogueRatio: 40,
      emotionalTone: 'neutral',
      humorLevel: 55,
      seriousness: 85,
      themes: ['苦难', '命运', '生存', '人性'],
      symbolism: true,
      philosophy: '存在主义'
    },
    sampleText: '我走进那间屋子，看到桌上放着一碗粥。粥是凉的，已经结了一层皮。我用勺子搅了搅，那层皮就破了，露出下面白色的米粒。',
    promptTemplate: '请以余华风格创作以下内容：要求语言朴实，白描为主，冷峻克制，细节精准，情感隐而不发，关注小人物的苦难和尊严，{prompt}'
  },
  {
    id: 'style-chen-dong',
    name: '辰东',
    era: '当代',
    genre: '玄幻',
    characteristics: {
      avgSentenceLength: 22,
      sentenceStructure: 'mixed',
      paragraphLength: 120,
      vocabularyLevel: 'intermediate',
      rhetoricalDevices: ['夸张', '排比', '比喻', '对比'],
      idiomsUsage: 55,
      archaisms: true,
      perspective: 'third-limited',
      pacing: 'fast',
      descriptionLevel: 'detailed',
      dialogueRatio: 30,
      emotionalTone: 'passionate',
      humorLevel: 45,
      seriousness: 65,
      themes: ['修炼', '冒险', '成长', '热血'],
      symbolism: false,
      philosophy: '适者生存'
    },
    sampleText: '轰隆隆！九条龙影冲天而起，每一条都如山岳般巨大，龙鳞闪烁着寒光，龙吟声响彻九霄。叶凡一步踏出，如天神降临，镇压诸天！',
    promptTemplate: '请以辰东风格创作以下内容：要求场面宏大，气势磅礴，善用夸张和排比，热血沸腾，描写细腻而富有画面感，{prompt}'
  },
  {
    id: 'style-tian-can-tu-dou',
    name: '天蚕土豆',
    era: '当代',
    genre: '玄幻',
    characteristics: {
      avgSentenceLength: 18,
      sentenceStructure: 'simple',
      paragraphLength: 80,
      vocabularyLevel: 'intermediate',
      rhetoricalDevices: ['比喻', '夸张', '对比'],
      idiomsUsage: 45,
      archaisms: true,
      perspective: 'third-limited',
      pacing: 'fast',
      descriptionLevel: 'balanced',
      dialogueRatio: 40,
      emotionalTone: 'warm',
      humorLevel: 50,
      seriousness: 60,
      themes: ['修炼', '逆袭', '成长', '热血'],
      symbolism: false,
      philosophy: '努力终有回报'
    },
    sampleText: '萧炎紧握着黑尺，眼中满是坚定。三十年河东，三十年河西，莫欺少年穷！今日之耻，他日必十倍奉还！',
    promptTemplate: '请以天蚕土豆风格创作以下内容：要求节奏明快，情节紧凑，人物励志热血，对话口语化，打斗场面精彩，{prompt}'
  },
  {
    id: 'style-wo-cao-xi-nong',
    name: '我吃西红柿',
    era: '当代',
    genre: '玄幻',
    characteristics: {
      avgSentenceLength: 20,
      sentenceStructure: 'mixed',
      paragraphLength: 100,
      vocabularyLevel: 'intermediate',
      rhetoricalDevices: ['比喻', '夸张', '排比'],
      idiomsUsage: 50,
      archaisms: true,
      perspective: 'third-limited',
      pacing: 'fast',
      descriptionLevel: 'detailed',
      dialogueRatio: 35,
      emotionalTone: 'passionate',
      humorLevel: 40,
      seriousness: 70,
      themes: ['修炼', '冒险', '探索', '成长'],
      symbolism: false,
      philosophy: '人定胜天'
    },
    sampleText: '盘古开天地，混沌化太极。宇宙无垠，强者如云。林雷凝视着星空，心中涌起无尽的向往。他要以武入道，成就无敌！',
    promptTemplate: '请以我吃西红柿风格创作以下内容：要求世界观宏大，设定严谨，描写细腻，人物成长脉络清晰，{prompt}'
  },
  {
    id: 'style-jiang-nan',
    name: '江南',
    era: '当代',
    genre: '奇幻',
    characteristics: {
      avgSentenceLength: 25,
      sentenceStructure: 'complex',
      paragraphLength: 150,
      vocabularyLevel: 'advanced',
      rhetoricalDevices: ['比喻', '象征', '反讽', '抒情'],
      idiomsUsage: 40,
      archaisms: false,
      perspective: 'first',
      pacing: 'moderate',
      descriptionLevel: 'elaborate',
      dialogueRatio: 30,
      emotionalTone: 'passionate',
      humorLevel: 55,
      seriousness: 75,
      themes: ['青春', '孤独', '成长', '爱情'],
      symbolism: true,
      philosophy: '浪漫主义'
    },
    sampleText: '那一年，我们站在世界的尽头，看着夕阳一点点沉入大海。风吹过，带走了所有的喧嚣，只剩下心跳的声音。我们知道，这一刻将永远留在记忆里。',
    promptTemplate: '请以江南风格创作以下内容：要求文笔优美细腻，善用比喻和象征，情感真挚浓烈，富有诗意和哲思，{prompt}'
  },
  {
    id: 'style-feng-huo-xi-zhu-ling',
    name: '烽火戏诸侯',
    era: '当代',
    genre: '玄幻',
    characteristics: {
      avgSentenceLength: 30,
      sentenceStructure: 'complex',
      paragraphLength: 200,
      vocabularyLevel: 'literary',
      rhetoricalDevices: ['典故', '排比', '对比', '哲理'],
      idiomsUsage: 65,
      archaisms: true,
      perspective: 'third-limited',
      pacing: 'slow',
      descriptionLevel: 'elaborate',
      dialogueRatio: 25,
      emotionalTone: 'neutral',
      humorLevel: 30,
      seriousness: 95,
      themes: ['权谋', '人性', '命运', '江湖'],
      symbolism: true,
      philosophy: '现实主义'
    },
    sampleText: '江湖如棋，众生皆子。徐凤年站在城头，目光越过山川河流，落在那遥远的北凉。他想起父亲说过的话，天下虽大，终究逃不过人心二字。',
    promptTemplate: '请以烽火戏诸侯风格创作以下内容：要求文笔厚重，富有哲理，善用典故，人物刻画细腻，权谋布局精妙，{prompt}'
  },
  {
    id: 'style-mao-ning',
    name: '猫腻',
    era: '当代',
    genre: '玄幻',
    characteristics: {
      avgSentenceLength: 28,
      sentenceStructure: 'mixed',
      paragraphLength: 140,
      vocabularyLevel: 'literary',
      rhetoricalDevices: ['比喻', '象征', '反讽', '哲理'],
      idiomsUsage: 60,
      archaisms: true,
      perspective: 'third-omniscient',
      pacing: 'moderate',
      descriptionLevel: 'detailed',
      dialogueRatio: 35,
      emotionalTone: 'passionate',
      humorLevel: 45,
      seriousness: 80,
      themes: ['权谋', '人性', '成长', '理想'],
      symbolism: true,
      philosophy: '理想主义'
    },
    sampleText: '李青山抬头望着漫天星辰，心中默念。他想，这世间或许并没有什么绝对的善恶，只有立场不同。每个人都有自己的道理，每个道理都有它的价值。',
    promptTemplate: '请以猫腻风格创作以下内容：要求文笔优美，哲理深刻，人物立体，情节曲折，富有思想性，{prompt}'
  }
];

// 分析文风特征
export function analyzeStyleFeatures(content: string): StyleFeature[] {
  const features: StyleFeature[] = [];

  // 句子长度分析
  const sentences = content.split(/[。！？；\n]/).filter(s => s.trim());
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;

  features.push({
    feature: '平均句长',
    value: Math.floor(avgLength),
    description: avgLength < 15 ? '短句为主，节奏明快' : avgLength < 25 ? '句长适中，节奏平衡' : '长句为主，节奏舒缓',
    example: sentences[0]?.substring(0, 50) + '...'
  });

  // 段落长度分析
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  const avgParaLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;

  features.push({
    feature: '平均段落长度',
    value: Math.floor(avgParaLength),
    description: avgParaLength < 80 ? '段落短小，视觉轻盈' : avgParaLength < 150 ? '段落适中，阅读舒适' : '段落较长，描写详细',
    example: paragraphs[0]?.substring(0, 80) + '...'
  });

  // 对话占比
  const dialogueMatches = content.match(/[「」""''].+?[「」""'']/g);
  const dialogueLength = dialogueMatches?.join('').length || 0;
  const dialogueRatio = (dialogueLength / content.length) * 100;

  features.push({
    feature: '对话占比',
    value: Math.floor(dialogueRatio) + '%',
    description: dialogueRatio < 20 ? '叙述为主，对话较少' : dialogueRatio < 40 ? '叙述与对话平衡' : '对话为主，人物互动频繁',
    example: dialogueMatches?.[0]?.substring(0, 50) || '无对话'
  });

  // 成语使用
  const idiomMatches = content.match(/[一-龥]{4,}/g) || [];
  const idiomCount = idiomMatches.length;
  const idiomDensity = (idiomCount / (content.length / 1000)) * 100;

  features.push({
    feature: '成语使用频率',
    value: Math.floor(idiomDensity),
    description: idiomDensity < 30 ? '成语使用较少，语言朴素' : idiomDensity < 60 ? '成语使用适中，语言典雅' : '成语使用频繁，文采斐然',
    example: idiomMatches?.[0] || '无'
  });

  // 修辞手法检测
  const rhetoric: StyleFeature[] = [];
  if (content.includes('像') || content.includes('如同') || content.includes('仿佛')) {
    rhetoric.push({
      feature: '比喻',
      value: '存在',
      description: '使用了比喻手法',
      example: content.match(/.+?(像|如同|仿佛).+?(。|，)/)?.[0] || '例句未找到'
    });
  }
  if (content.match(/.+?，.+?，.+?/) || content.match(/.+?；.+?；.+?/)) {
    rhetoric.push({
      feature: '排比',
      value: '存在',
      description: '使用了排比手法',
      example: '例句未找到'
    });
  }
  if (content.includes('但是') || content.includes('然而') || content.includes('虽然')) {
    rhetoric.push({
      feature: '对比',
      value: '存在',
      description: '使用了对比手法',
      example: '例句未找到'
    });
  }

  features.push(...rhetoric);

  return features;
}

// 匹配作者风格
export function matchAuthorStyle(content: string): StyleMatch[] {
  const matches: StyleMatch[] = [];

  // 分析当前内容特征
  const sentences = content.split(/[。！？；\n]/).filter(s => s.trim());
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  const avgParaLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;
  const dialogueMatches = content.match(/[「」""''].+?[「」""'']/g);
  const dialogueRatio = dialogueMatches ? (dialogueMatches.join('').length / content.length) * 100 : 0;
  const idiomMatches = content.match(/[一-龥]{4,}/g) || [];
  const idiomDensity = (idiomMatches.length / (content.length / 1000)) * 100;

  // 与已知风格对比
  FAMOUS_AUTHOR_STYLES.forEach(style => {
    let similarity = 0;
    const matchedFeatures: string[] = [];

    // 句长匹配
    const lengthDiff = Math.abs(avgLength - style.characteristics.avgSentenceLength);
    const lengthMatch = Math.max(0, 100 - lengthDiff * 3);
    similarity += lengthMatch * 0.2;
    if (lengthMatch > 70) matchedFeatures.push('句长');

    // 段落长度匹配
    const paraDiff = Math.abs(avgParaLength - style.characteristics.paragraphLength);
    const paraMatch = Math.max(0, 100 - paraDiff * 2);
    similarity += paraMatch * 0.15;
    if (paraMatch > 70) matchedFeatures.push('段落长度');

    // 对话占比匹配
    const dialogueDiff = Math.abs(dialogueRatio - style.characteristics.dialogueRatio);
    const dialogueMatch = Math.max(0, 100 - dialogueDiff * 2);
    similarity += dialogueMatch * 0.15;
    if (dialogueMatch > 70) matchedFeatures.push('对话比例');

    // 成语使用匹配
    const idiomDiff = Math.abs(idiomDensity - style.characteristics.idiomsUsage);
    const idiomMatch = Math.max(0, 100 - idiomDiff * 2);
    similarity += idiomMatch * 0.15;
    if (idiomMatch > 70) matchedFeatures.push('成语使用');

    // 修辞手法匹配
    const rhetoricMatch = style.characteristics.rhetoricalDevices.filter(device => {
      if (device === '比喻' && (content.includes('像') || content.includes('如同'))) return true;
      if (device === '排比' && content.match(/.+?，.+?，.+?/)) return true;
      if (device === '对比' && (content.includes('但是') || content.includes('然而'))) return true;
      return false;
    }).length;

    const rhetoricScore = (rhetoricMatch / style.characteristics.rhetoricalDevices.length) * 100;
    similarity += rhetoricScore * 0.2;
    if (rhetoricScore > 50) matchedFeatures.push('修辞手法');

    // 词汇水平匹配（简化处理）
    const charLevelMatch = 85; // 假设匹配
    similarity += charLevelMatch * 0.15;

    if (similarity > 40) {
      matches.push({
        styleName: style.name,
        similarity: Math.floor(similarity),
        matchedFeatures,
        suggestions: [
          `可以尝试使用更多${style.characteristics.rhetoricalDevices.join('、')}等修辞手法`,
          `注意调整句子长度，目标${style.characteristics.avgSentenceLength}字左右`,
          `适当使用成语，目标密度${style.characteristics.idiomsUsage}/100`
        ]
      });
    }
  });

  return matches.sort((a, b) => b.similarity - a.similarity);
}

// 生成文风转换提示词
export function generateStyleTransferPrompt(
  content: string,
  targetStyle: string
): string {
  const style = FAMOUS_AUTHOR_STYLES.find(s => s.id === targetStyle);

  if (!style) {
    return `请按照以下风格重写内容：${targetStyle}\n\n${content}`;
  }

  return style.promptTemplate.replace('{prompt}', content);
}

// 生成风格优化建议
export function generateStyleSuggestions(analysis: StyleAnalysis): StyleSuggestion[] {
  const suggestions: StyleSuggestion[] = [];

  // 分析当前风格特征
  const avgLengthFeature = analysis.styleFeatures.find(f => f.feature === '平均句长');
  const dialogueFeature = analysis.styleFeatures.find(f => f.feature === '对话占比');
  const idiomFeature = analysis.styleFeatures.find(f => f.feature === '成语使用频率');

  // 基于匹配风格生成建议
  if (analysis.matchedStyles.length > 0) {
    const topStyle = analysis.matchedStyles[0];
    const style = FAMOUS_AUTHOR_STYLES.find(s => s.name === topStyle.styleName);

    if (style && topStyle.similarity < 80) {
      suggestions.push({
        type: 'enhance',
        feature: '修辞手法',
        current: analysis.styleFeatures.filter(f => f.feature === '比喻' || f.feature === '排比').map(f => f.feature).join('、') || '较少',
        recommended: style.characteristics.rhetoricalDevices.join('、'),
        reason: `目标风格"${style.name}"善用多种修辞手法，建议加强`
      });

      if (avgLengthFeature && Math.abs(Number(avgLengthFeature.value) - style.characteristics.avgSentenceLength) > 10) {
        suggestions.push({
          type: 'modify',
          feature: '句长',
          current: avgLengthFeature.value.toString(),
          recommended: style.characteristics.avgSentenceLength.toString(),
          reason: `目标风格"${style.name}"的句长为${style.characteristics.avgSentenceLength}字左右`
        });
      }
    }
  }

  // 通用建议
  if (idiomFeature && Number(idiomFeature.value) < 30) {
    suggestions.push({
      type: 'enhance',
      feature: '成语使用',
      current: idiomFeature.value.toString(),
      recommended: '40-60',
      reason: '适当使用成语可以提升文采，增强语言表现力'
    });
  }

  if (dialogueFeature && Number(dialogueFeature.value) < 20) {
    suggestions.push({
      type: 'enhance',
      feature: '对话比例',
      current: dialogueFeature.value,
      recommended: '30-40%',
      reason: '增加对话可以增强人物互动和情节张力'
    });
  }

  return suggestions;
}

// 完整文风分析
export function analyzeStyle(content: string): StyleAnalysis {
  const styleFeatures = analyzeStyleFeatures(content);
  const matchedStyles = matchAuthorStyle(content);
  const dominantStyle = matchedStyles.length > 0 ? matchedStyles[0].styleName : '未识别';
  const confidence = matchedStyles.length > 0 ? matchedStyles[0].similarity : 0;
  const suggestions = generateStyleSuggestions({
    content,
    matchedStyles,
    dominantStyle,
    styleFeatures,
    suggestions: [],
    confidence
  });

  return {
    content,
    matchedStyles,
    dominantStyle,
    styleFeatures,
    suggestions,
    confidence
  };
}

// 生成自定义风格模板
export function createCustomStyle(
  name: string,
  sampleText: string,
  preferences: Partial<StyleCharacteristics>
): AuthorStyle {
  // 简化的特征提取
  const sentences = sampleText.split(/[。！？；\n]/).filter(s => s.trim());
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;

  return {
    id: `style-custom-${Date.now()}`,
    name,
    era: '当代',
    genre: '自定义',
    characteristics: {
      avgSentenceLength: preferences.avgSentenceLength || Math.floor(avgLength),
      sentenceStructure: preferences.sentenceStructure || 'mixed',
      paragraphLength: preferences.paragraphLength || 100,
      vocabularyLevel: preferences.vocabularyLevel || 'intermediate',
      rhetoricalDevices: preferences.rhetoricalDevices || [],
      idiomsUsage: preferences.idiomsUsage || 50,
      archaisms: preferences.archaisms || false,
      perspective: preferences.perspective || 'third-limited',
      pacing: preferences.pacing || 'moderate',
      descriptionLevel: preferences.descriptionLevel || 'balanced',
      dialogueRatio: preferences.dialogueRatio || 35,
      emotionalTone: preferences.emotionalTone || 'neutral',
      humorLevel: preferences.humorLevel || 50,
      seriousness: preferences.seriousness || 70,
      themes: preferences.themes || [],
      symbolism: preferences.symbolism || false,
      philosophy: preferences.philosophy || ''
    },
    sampleText,
    promptTemplate: `请按照自定义风格"${name}"创作：{prompt}。参考特征：${JSON.stringify(preferences)}`,
    createdAt: new Date()
  };
}

// 风格对比
export function compareStyles(contentA: string, contentB: string): {
  similarity: number;
  differences: string[];
} {
  const styleA = analyzeStyle(contentA);
  const styleB = analyzeStyle(contentB);

  const differences: string[] = [];

  // 比较句长
  const avgLengthA = Number(styleA.styleFeatures.find(f => f.feature === '平均句长')?.value);
  const avgLengthB = Number(styleB.styleFeatures.find(f => f.feature === '平均句长')?.value);
  if (Math.abs(avgLengthA - avgLengthB) > 5) {
    differences.push(`句长差异：A=${avgLengthA}字, B=${avgLengthB}字`);
  }

  // 比较对话比例
  const dialogueA = styleA.styleFeatures.find(f => f.feature === '对话占比')?.value || '0%';
  const dialogueB = styleB.styleFeatures.find(f => f.feature === '对话占比')?.value || '0%';
  if (dialogueA !== dialogueB) {
    differences.push(`对话比例差异：A=${dialogueA}, B=${dialogueB}`);
  }

  // 比较风格匹配
  if (styleA.dominantStyle !== styleB.dominantStyle) {
    differences.push(`主要风格差异：A=${styleA.dominantStyle}, B=${styleB.dominantStyle}`);
  }

  const similarity = 100 - differences.length * 15;

  return {
    similarity: Math.max(0, similarity),
    differences
  };
}
