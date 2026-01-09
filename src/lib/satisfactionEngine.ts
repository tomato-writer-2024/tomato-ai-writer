/**
 * 爽点优化引擎
 * 支持高潮计算、期待值管理、爽点密度分析、打脸节奏
 */

export interface SatisfactionAnalysis {
  id: string;
  userId: string;
  novelId: string;
  chapterNumber: number;
  content: string;
  satisfactionScore: number; // 爽点评分 0-100
  satisfactionPoints: SatisfactionPoint[];
  climaxPoints: ClimaxPoint[];
  tensionCurve: TensionSegment[];
  readerExpectations: ReaderExpectation[];
  suggestions: SatisfactionSuggestion[];
  improvementPotential: number; // 提升空间 0-100
  createdAt: Date;
}

export interface SatisfactionPoint {
  id: string;
  type: SatisfactionType;
  location: string; // 位置描述
  description: string;
  intensity: number; // 爽点强度 1-100
  category: 'emotional' | 'intellectual' | 'action' | 'social' | 'growth';
  buildup: number; // 铺垫程度 0-100
  payOff: number; // 收获程度 0-100
  effectiveness: number; // 整体效果 0-100
}

export type SatisfactionType =
  | 'face-slapping' // 打脸
  | 'breakthrough' // 突破
  | 'reward' // 奖励
  | 'upgrade' // 升级
  | 'discovery' // 发现
  | 'confession' // 告白
  | 'revenge' // 复仇
  | 'protection' // 保护
  | 'revelation' // 揭秘
  | 'alliance' // 结盟
  | 'recognition' // 认可
  | 'suppression' // 镇压
  | 'underestimated' // 被低估后反击
  | 'hidden-identity' // 隐藏身份暴露
  | 'skill-master' // 技术碾压
  | 'resource-control' // 资源控制;

export interface ClimaxPoint {
  id: string;
  chapter: number;
  location: string;
  type: ClimaxType;
  intensity: number; // 强度 1-100
  buildupChapters: number; // 铺垫章节数
  payoffChapters: number; // 收获章节数
  globalImpact: number; // 全局影响 1-10
  description: string;
}

export type ClimaxType =
  | 'final-battle'
  | 'emotional-peak'
  | 'major-revelation'
  | 'power-breakthrough'
  | 'relationship-breakthrough'
  | 'sacrifice'
  | 'betrayal'
  | 'reunion'
  | 'revenge-completed'
  | 'goal-achieved';

export interface TensionSegment {
  startPosition: number;
  endPosition: number;
  tensionLevel: number; // 0-100
  type: 'rising' | 'falling' | 'plateau' | 'spike';
  purpose: string;
}

export interface ReaderExpectation {
  id: string;
  content: string;
  fulfillment: number; // 满足度 0-100
  delay: number; // 延迟章节数
  impact: number; // 影响 1-10
  status: 'pending' | 'fulfilled' | 'subverted' | 'abandoned';
}

export interface SatisfactionSuggestion {
  priority: 'high' | 'medium' | 'low';
  type: 'add' | 'enhance' | 'restructure' | 'remove';
  description: string;
  location?: string;
  expectedImprovement: number; // 预期提升 0-20
  difficulty: 'easy' | 'medium' | 'hard';
  example?: string;
}

// 爽点类型定义和关键词
export const SATISFACTION_TYPE_KEYWORDS: Record<SatisfactionType, { keywords: string[]; description: string }> = {
  'face-slapping': {
    keywords: ['打脸', '看不起', '嘲讽', '震惊', '不可能', '竟然', '怎么会', '废物', '垃圾'],
    description: '反派或他人轻视主角，随后被主角实力打脸'
  },
  'breakthrough': {
    keywords: ['突破', '晋升', '升级', '进阶', '领悟', '掌握', '修炼', '成功'],
    description: '主角实力或能力获得显著提升'
  },
  'reward': {
    keywords: ['奖励', '获得', '得到', '收获', '宝藏', '战利品', '发现', '找到'],
    description: '主角获得有价值的资源、物品或信息'
  },
  'upgrade': {
    keywords: ['升级', '提升', '增强', '强化', '进化', '蜕变', '成长'],
    description: '主角能力或装备获得系统性提升'
  },
  'discovery': {
    keywords: ['发现', '发现', '得知', '明白', '了解', '揭开', '真相', '秘密'],
    description: '揭开新的信息或秘密'
  },
  'confession': {
    keywords: ['告白', '表白', '喜欢', '爱', '心意', '情感', '真情'],
    description: '角色表达情感，建立或确认关系'
  },
  'revenge': {
    keywords: ['复仇', '报仇', '报复', '清算', '惩罚', '付出代价'],
    description: '主角对过去的伤害进行报复'
  },
  'protection': {
    keywords: ['保护', '守护', '挡下', '救命', '相助', '援助'],
    description: '主角保护重要的人或事'
  },
  'revelation': {
    keywords: ['揭秘', '真相', '暴露', '显示', '表明', '证明'],
    description: '关键信息的揭示，改变局势'
  },
  'alliance': {
    keywords: ['结盟', '合作', '联手', '联合', '共同', '伙伴', '团队'],
    description: '建立新的合作关系'
  },
  'recognition': {
    keywords: ['认可', '承认', '重视', '尊重', '佩服', '敬仰'],
    description: '主角获得他人认可或地位提升'
  },
  'suppression': {
    keywords: ['碾压', '压制', '镇压', '击败', '战胜', '秒杀'],
    description: '主角以压倒性优势战胜对手'
  },
  'underestimated': {
    keywords: ['低估', '小看', '轻视', '看走眼', '没想到', '竟然'],
    description: '他人低估主角，随后被反击'
  },
  'hidden-identity': {
    keywords: ['身份', '真实身份', '暴露', '原来', '竟然是'],
    description: '主角隐藏的身份被揭示'
  },
  'skill-master': {
    keywords: ['精通', '熟练', '掌握', '完美', '无懈可击', '精湛'],
    description: '主角展示高超的技艺或能力'
  },
  'resource-control': {
    keywords: ['控制', '掌握', '拥有', '垄断', '独占', '支配'],
    description: '主角控制重要资源，获得权力优势'
  }
};

// 分析爽点
export function analyzeSatisfactionPoints(content: string): SatisfactionPoint[] {
  const points: SatisfactionPoint[] = [];
  const paragraphs = content.split('\n\n');

  paragraphs.forEach((paragraph, index) => {
    Object.entries(SATISFACTION_TYPE_KEYWORDS).forEach(([type, info]) => {
      const matchedKeywords = info.keywords.filter(keyword =>
        paragraph.includes(keyword)
      );

      if (matchedKeywords.length > 0) {
        // 计算爽点强度（基于关键词数量和语境）
        const intensity = Math.min(100, 40 + matchedKeywords.length * 10);

        // 确定分类
        const categoryMap: Record<SatisfactionType, SatisfactionPoint['category']> = {
          'face-slapping': 'social',
          'breakthrough': 'growth',
          'reward': 'action',
          'upgrade': 'growth',
          'discovery': 'intellectual',
          'confession': 'emotional',
          'revenge': 'action',
          'protection': 'emotional',
          'revelation': 'intellectual',
          'alliance': 'social',
          'recognition': 'social',
          'suppression': 'action',
          'underestimated': 'social',
          'hidden-identity': 'intellectual',
          'skill-master': 'action',
          'resource-control': 'action'
        };

        points.push({
          id: `sp-${index}-${type}`,
          type: type as SatisfactionType,
          location: `第${index + 1}段`,
          description: `${info.description}：${paragraph.substring(0, 100)}...`,
          intensity,
          category: categoryMap[type as SatisfactionType],
          buildup: estimateBuildup(content, index),
          payOff: estimatePayOff(content, index),
          effectiveness: calculateEffectiveness(intensity, 50, 50) // 简化计算
        });
      }
    });
  });

  return points;
}

// 估算铺垫程度
function estimateBuildup(content: string, currentIndex: number): number {
  // 检查前面是否有铺垫关键词
  const previousContent = content.substring(0, currentIndex * 200);
  const setupKeywords = ['铺垫', '暗示', '伏笔', '准备', '计划', '等待', '终于'];

  const setupCount = setupKeywords.filter(kw => previousContent.includes(kw)).length;
  return Math.min(100, setupCount * 20);
}

// 估算收获程度
function estimatePayOff(content: string, currentIndex: number): number {
  // 检查后续是否有收获描述
  const laterContent = content.substring(currentIndex * 200);
  const payoffKeywords = ['收获', '获得', '成功', '完成', '达成', '实现'];

  const payoffCount = payoffKeywords.filter(kw => laterContent.includes(kw)).length;
  return Math.min(100, payoffCount * 20);
}

// 计算爽点效果
function calculateEffectiveness(intensity: number, buildup: number, payOff: number): number {
  return Math.floor((intensity * 0.5 + buildup * 0.25 + payOff * 0.25));
}

// 分析高潮点
export function analyzeClimaxPoints(
  content: string,
  chapterNumber: number,
  previousClimaxes?: ClimaxPoint[]
): ClimaxPoint[] {
  const climaxes: ClimaxPoint[] = [];

  // 检测高潮关键词
  const climaxKeywords = {
    'final-battle': ['决战', '最终', '最后', '巅峰', '终极'],
    'emotional-peak': ['感动', '震撼', '热泪', '激动', '崩溃'],
    'major-revelation': ['真相', '原来', '秘密', '揭露', '揭示'],
    'power-breakthrough': ['突破', '晋升', '觉醒', '顿悟', '蜕变'],
    'relationship-breakthrough': ['告白', '在一起', '承认', '表白', '心意'],
    'sacrifice': ['牺牲', '奉献', '付出', '舍弃', '放弃'],
    'betrayal': ['背叛', '出卖', '反水', '欺骗', '谎言'],
    'reunion': ['重逢', '相见', '见面', '团圆', '相聚'],
    'revenge-completed': ['复仇', '报仇', '清算', '惩罚', '偿还'],
    'goal-achieved': ['达成', '成功', '完成', '实现', '取得']
  };

  Object.entries(climaxKeywords).forEach(([type, keywords]) => {
    const matchedKeywords = keywords.filter(kw => content.includes(kw));

    if (matchedKeywords.length > 0) {
      // 计算高潮强度
      const intensity = Math.min(100, 60 + matchedKeywords.length * 10);

      // 估算铺垫章节数（基于前文线索密度）
      const buildupChapters = estimateBuildupChapters(content, type as ClimaxType);

      climaxes.push({
        id: `climax-${chapterNumber}-${type}`,
        chapter: chapterNumber,
        location: `本章`,
        type: type as ClimaxType,
        intensity,
        buildupChapters,
        payoffChapters: estimatePayOffChapters(type as ClimaxType),
        globalImpact: estimateGlobalImpact(type as ClimaxType, intensity),
        description: `检测到${type}高潮，强度${intensity}/100`
      });
    }
  });

  return climaxes;
}

// 估算铺垫章节数
function estimateBuildupChapters(content: string, type: ClimaxType): number {
  const foreshadowingCount = (content.match(/暗示|铺垫|伏笔/g) || []).length;
  return Math.min(10, 1 + Math.floor(foreshadowingCount / 2));
}

// 估算收获章节数
function estimatePayOffChapters(type: ClimaxType): number {
  const payoffMap: Record<ClimaxType, number> = {
    'final-battle': 3,
    'emotional-peak': 2,
    'major-revelation': 2,
    'power-breakthrough': 2,
    'relationship-breakthrough': 3,
    'sacrifice': 4,
    'betrayal': 3,
    'reunion': 2,
    'revenge-completed': 2,
    'goal-achieved': 2
  };
  return payoffMap[type] || 2;
}

// 估算全局影响
function estimateGlobalImpact(type: ClimaxType, intensity: number): number {
  const baseImpact: Record<ClimaxType, number> = {
    'final-battle': 10,
    'emotional-peak': 7,
    'major-revelation': 8,
    'power-breakthrough': 6,
    'relationship-breakthrough': 7,
    'sacrifice': 9,
    'betrayal': 8,
    'reunion': 6,
    'revenge-completed': 7,
    'goal-achieved': 8
  };
  return Math.min(10, Math.floor(baseImpact[type] * (intensity / 100)));
}

// 生成紧张度曲线
export function generateTensionCurve(content: string): TensionSegment[] {
  const segments: TensionSegment[] = [];
  const paragraphs = content.split('\n\n');
  const segmentLength = Math.max(1, Math.floor(paragraphs.length / 10));

  // 分析每段的紧张度
  for (let i = 0; i < paragraphs.length; i += segmentLength) {
    const segmentContent = paragraphs.slice(i, i + segmentLength).join('\n\n');

    // 检测紧张度关键词
    const tensionKeywords = {
      high: ['危急', '危险', '紧迫', '关键', '最后', '决定', '生死', '决战'],
      medium: ['重要', '需要', '必须', '应该', '可以'],
      low: ['平静', '日常', '轻松', '悠闲', '惬意']
    };

    let tensionLevel = 50;
    if (tensionKeywords.high.some(kw => segmentContent.includes(kw))) {
      tensionLevel = 80;
    } else if (tensionKeywords.medium.some(kw => segmentContent.includes(kw))) {
      tensionLevel = 60;
    } else if (tensionKeywords.low.some(kw => segmentContent.includes(kw))) {
      tensionLevel = 30;
    }

    // 确定曲线类型
    let type: TensionSegment['type'] = 'plateau';
    if (i > 0) {
      const prevTension = segments[segments.length - 1].tensionLevel;
      if (tensionLevel > prevTension + 20) {
        type = 'spike';
      } else if (tensionLevel > prevTension) {
        type = 'rising';
      } else if (tensionLevel < prevTension - 20) {
        type = 'falling';
      }
    }

    segments.push({
      startPosition: i * 200,
      endPosition: (i + segmentLength) * 200,
      tensionLevel,
      type,
      purpose: getTensionPurpose(type, tensionLevel)
    });
  }

  return segments;
}

// 获取紧张度目的
function getTensionPurpose(type: TensionSegment['type'], level: number): string {
  const purposes: Record<TensionSegment['type'], Record<number, string>> = {
    'rising': { high: '构建冲突，提升期待', medium: '逐步推进，加深悬念', low: '缓慢铺垫' },
    'falling': { high: '释放压力，过渡场景', medium: '调整节奏，准备下一波', low: '平缓收尾' },
    'plateau': { high: '维持紧张，持续施压', medium: '稳定推进，保持节奏', low: '日常描写，舒缓节奏' },
    'spike': { high: '高潮爆发，强烈冲击', medium: '突发事件，打破平衡', low: '小高潮，激发兴趣' }
  };

  const levelKey = level >= 70 ? 'high' : level >= 40 ? 'medium' : 'low';
  return purposes[type][levelKey] || '叙事推进';
}

// 分析读者期待
export function analyzeReaderExpectations(
  content: string,
  chapterNumber: number,
  previousExpectations?: ReaderExpectation[]
): ReaderExpectation[] {
  const expectations: ReaderExpectation[] = [];

  // 检测未满足的期待
  const expectationKeywords = {
    '最终对决': ['决战', '最终', '最后'],
    '真相揭露': ['真相', '秘密', '原来'],
    '实力突破': ['突破', '晋升', '升级'],
    '感情发展': ['感情', '关系', '告白'],
    '复仇成功': ['复仇', '报仇', '清算']
  };

  Object.entries(expectationKeywords).forEach(([content, keywords]) => {
    const hasExpectation = keywords.some(kw => content.includes(kw));

    if (hasExpectation) {
      // 检查是否已经满足
      const isFulfilled = content.includes('成功') || content.includes('完成') || content.includes('达成');

      expectations.push({
        id: `exp-${chapterNumber}-${content}`,
        content,
        fulfillment: isFulfilled ? 100 : 0,
        delay: isFulfilled ? 0 : 1,
        impact: 7,
        status: isFulfilled ? 'fulfilled' : 'pending'
      });
    }
  });

  return expectations;
}

// 生成爽点优化建议
export function generateSatisfactionSuggestions(
  analysis: SatisfactionAnalysis
): SatisfactionSuggestion[] {
  const suggestions: SatisfactionSuggestion[] = [];

  // 检查爽点密度
  const satisfactionDensity = analysis.satisfactionPoints.length / (analysis.content.length / 2000);
  if (satisfactionDensity < 0.3) {
    suggestions.push({
      priority: 'high',
      type: 'add',
      description: '爽点密度偏低，建议添加1-2个爽点场景',
      expectedImprovement: 15,
      difficulty: 'medium',
      example: '可以考虑在对话或行动中加入打脸、突破或奖励元素'
    });
  }

  // 检查高潮设置
  if (analysis.climaxPoints.length === 0) {
    suggestions.push({
      priority: 'medium',
      type: 'add',
      description: '本章未检测到高潮，建议设置1个高潮点',
      expectedImprovement: 10,
      difficulty: 'medium',
      example: '可以在本章结尾或中段安排一个情绪、行动或智力高潮'
    });
  }

  // 检查铺垫与收获
  const lowBuildupPoints = analysis.satisfactionPoints.filter(sp => sp.buildup < 30);
  if (lowBuildupPoints.length > analysis.satisfactionPoints.length * 0.5) {
    suggestions.push({
      priority: 'medium',
      type: 'enhance',
      description: '超过半数爽点铺垫不足，建议加强前期铺垫',
      expectedImprovement: 12,
      difficulty: 'easy',
      example: '在爽点出现前，可以通过对话、环境描写或内心活动进行铺垫'
    });
  }

  // 检查爽点类型多样性
  const typeSet = new Set(analysis.satisfactionPoints.map(sp => sp.type));
  if (typeSet.size < 3) {
    suggestions.push({
      priority: 'low',
      type: 'add',
      description: '爽点类型单一，建议增加多样性',
      expectedImprovement: 8,
      difficulty: 'medium',
      example: '当前爽点主要是打脸，可以加入突破、奖励、发现等类型'
    });
  }

  // 检查期待管理
  const unfulfilledExpectations = analysis.readerExpectations.filter(re =>
    re.status === 'pending' && re.delay > 2
  );
  if (unfulfilledExpectations.length > 2) {
    suggestions.push({
      priority: 'high',
      type: 'restructure',
      description: '多个期待长时间未满足，建议尽快回收或调整',
      expectedImprovement: 15,
      difficulty: 'hard',
      example: '读者期待"最终对决"已延迟3章，建议在本章或下章安排相关情节'
    });
  }

  // 检查紧张度曲线
  const flatTensionSegments = analysis.tensionCurve.filter(ts =>
    ts.type === 'plateau' && ts.tensionLevel < 40
  );
  if (flatTensionSegments.length > analysis.tensionCurve.length * 0.4) {
    suggestions.push({
      priority: 'medium',
      type: 'enhance',
      description: '紧张度曲线过于平缓，建议增加波动',
      expectedImprovement: 10,
      difficulty: 'easy',
      example: '可以在平缓段落加入冲突、悬念或突发事件'
    });
  }

  return suggestions;
}

// 计算整体爽点评分
export function calculateSatisfactionScore(analysis: SatisfactionAnalysis): number {
  // 基于多个维度计算
  const densityScore = Math.min(100, analysis.satisfactionPoints.length * 20);
  const climaxScore = analysis.climaxPoints.length > 0 ? 80 : 40;
  const avgEffectiveness = analysis.satisfactionPoints.length > 0
    ? analysis.satisfactionPoints.reduce((sum, sp) => sum + sp.effectiveness, 0) / analysis.satisfactionPoints.length
    : 50;

  // 检查期待满足度
  const fulfilledExpectations = analysis.readerExpectations.filter(re => re.status === 'fulfilled').length;
  const expectationScore = analysis.readerExpectations.length > 0
    ? (fulfilledExpectations / analysis.readerExpectations.length) * 100
    : 70;

  // 综合评分
  const totalScore = (
    densityScore * 0.2 +
    climaxScore * 0.25 +
    avgEffectiveness * 0.3 +
    expectationScore * 0.25
  );

  return Math.floor(totalScore);
}

// AI辅助优化提示词
export function generateOptimizationPrompt(analysis: SatisfactionAnalysis): string {
  const issues = analysis.suggestions
    .filter(s => s.priority === 'high')
    .map(s => s.description)
    .join('；');

  const strengths = analysis.satisfactionPoints
    .filter(sp => sp.effectiveness >= 70)
    .map(sp => sp.type)
    .slice(0, 3)
    .join('、');

  return `请帮我优化以下章节内容的爽点设置：

## 当前内容
${analysis.content.substring(0, 1000)}...

## 爽点分析
- 爽点评分：${analysis.satisfactionScore}/100
- 检测到爽点：${analysis.satisfactionPoints.length}个
- 检测到高潮：${analysis.climaxPoints.length}个
- 主要爽点类型：${strengths || '无'}
${issues ? `\n## 需要改进的问题\n${issues}` : ''}

## 优化要求
1. 在现有爽点基础上增加2-3个新的爽点场景
2. 优化现有爽点的铺垫和收获程度
3. 调整紧张度曲线，增加波峰和波谷
4. 确保每个爽点都有充分的铺垫
5. 维持爽点类型的多样性（打脸、突破、奖励、发现等）
6. 每个爽点场景200-400字

请直接给出优化后的完整内容`;
}

// 爽点密度计算
export function calculateSatisfactionDensity(
  satisfactionPoints: SatisfactionPoint[],
  contentLength: number
): {
  density: number; // 每1000字的爽点数
  rating: 'low' | 'medium' | 'high' | 'excellent';
} {
  const density = (satisfactionPoints.length / contentLength) * 1000;

  let rating: 'low' | 'medium' | 'high' | 'excellent';
  if (density < 0.3) {
    rating = 'low';
  } else if (density < 0.5) {
    rating = 'medium';
  } else if (density < 0.8) {
    rating = 'high';
  } else {
    rating = 'excellent';
  }

  return { density, rating };
}
