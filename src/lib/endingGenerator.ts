/**
 * 智能结局生成器
 * 支持多结局方案、满意度预测、结局类型库
 */

export interface Ending {
  id: string;
  type: EndingType;
  category: EndingCategory;
  description: string;
  coreEvents: string[];
  characterOutcomes: CharacterOutcome[];
  thematicResolution: string;
  emotionalImpact: number; // 情感冲击 1-100
  satisfactionScore: number; // 读者满意度预测 1-100
  originality: number; // 创新性 1-100
  difficulty: 'easy' | 'medium' | 'hard';
  foreshadowingRequired: string[];
  riskLevel: number; // 风险等级 1-10
  readerReactions: string[];
  alternativeVariations: string[];
}

export type EndingType =
  | 'happy' // 大团圆
  | 'tragic' // 悲剧
  | 'bittersweet' // 苦乐参半
  | 'open' // 开放式
  | 'twist' // 反转结局
  | 'ambiguous' // 模糊结局
  | 'heroic' // 英雄牺牲
  | 'victory' // 胜利
  | 'sacrifice' // 牺牲
  | 'reunion' // 重逢;

export type EndingCategory =
  | 'emotional'
  | 'intellectual'
  | 'spiritual'
  | 'moral'
  | 'existential';

export interface CharacterOutcome {
  characterId: string;
  characterName: string;
  outcome: 'alive' | 'dead' | 'missing' | 'transcended';
  status: string; // 具体状态描述
  growth: string; // 角色成长描述
  happiness: number; // 幸福度 0-100
  fulfillment: number; // 满足感 0-100
}

export interface EndingAnalysis {
  novelTitle: string;
  storyGenre: string;
  storyTheme: string;
  possibleEndings: Ending[];
  recommendedEnding: Ending;
  endingComparison: EndingComparison[];
  satisfactionPrediction: number;
  readerFeedback: string[];
  riskAssessment: string;
}

export interface EndingComparison {
  ending1: EndingType;
  ending2: EndingType;
  differences: string[];
  recommendation: string;
  reason: string;
}

export interface EndingSetup {
  endingType: EndingType;
  setupChapters: number;
  keyEvents: EndingKeyEvent[];
  emotionalArc: string[];
  resolutionSteps: string[];
}

export interface EndingKeyEvent {
  chapter: number;
  event: string;
  purpose: string;
  impact: string;
}

// 结局类型定义
export const ENDING_TYPES: Record<EndingType, { description: string; category: EndingCategory; popularity: number }> = {
  'happy': {
    description: '主角目标达成，所有美好愿望实现',
    category: 'emotional',
    popularity: 90
  },
  'tragic': {
    description: '主角失败或死亡，但精神获得升华',
    category: 'emotional',
    popularity: 40
  },
  'bittersweet': {
    description: '部分成功，部分失败，喜忧参半',
    category: 'emotional',
    popularity: 75
  },
  'open': {
    description: '结局不明确，留给读者想象空间',
    category: 'intellectual',
    popularity: 60
  },
  'twist': {
    description: '意料之外的结局，颠覆读者预期',
    category: 'intellectual',
    popularity: 70
  },
  'ambiguous': {
    description: '结局模糊，有多种解读可能',
    category: 'intellectual',
    popularity: 50
  },
  'heroic': {
    description: '主角牺牲但最终成功，精神永存',
    category: 'moral',
    popularity: 80
  },
  'victory': {
    description: '主角战胜困难，取得胜利',
    category: 'emotional',
    popularity: 85
  },
  'sacrifice': {
    description: '角色做出重大牺牲换取目标',
    category: 'moral',
    popularity: 65
  },
  'reunion': {
    description: '重要角色重逢，情感得到满足',
    category: 'emotional',
    popularity: 70
  }
};

// 结局库
export const ENDING_TEMPLATES: Ending[] = [
  {
    id: 'ending-1',
    type: 'happy',
    category: 'emotional',
    description: '主角实现所有目标，与所有重要角色团聚，世界和平美好',
    coreEvents: [
      '主角最终战胜反派',
      '所有重要角色幸存',
      '矛盾得到完美解决',
      '主角获得最大的幸福'
    ],
    characterOutcomes: [],
    thematicResolution: '所有主题得到圆满解决，传达积极向上的价值观',
    emotionalImpact: 85,
    satisfactionScore: 90,
    originality: 60,
    difficulty: 'easy',
    foreshadowingRequired: ['目标明确', '困难设定合理', '努力有回报'],
    riskLevel: 3,
    readerReactions: ['满足', '感动', '欣喜'],
    alternativeVariations: ['大团圆', '完美结局', '童话式结局']
  },
  {
    id: 'ending-2',
    type: 'tragic',
    category: 'emotional',
    description: '主角在最后关头牺牲，但阻止了更大的灾难，精神得到升华',
    coreEvents: [
      '主角面对最终抉择',
      '主角选择牺牲自己',
      '世界得到拯救',
      '其他角色铭记主角'
    ],
    characterOutcomes: [],
    thematicResolution: '通过牺牲诠释崇高主题，展现人性的伟大',
    emotionalImpact: 95,
    satisfactionScore: 75,
    originality: 75,
    difficulty: 'medium',
    foreshadowingRequired: ['性格铺垫', '价值观建立', '牺牲动机'],
    riskLevel: 6,
    readerReactions: ['震撼', '悲伤', '敬佩'],
    alternativeVariations: ['英雄之死', '悲壮牺牲', '精神永存']
  },
  {
    id: 'ending-3',
    type: 'bittersweet',
    category: 'emotional',
    description: '主角部分成功，但付出了代价，有得有失',
    coreEvents: [
      '主角达成主要目标',
      '但失去某些重要事物',
      '部分遗憾无法弥补',
      '角色在得失中成长'
    ],
    characterOutcomes: [],
    thematicResolution: '现实中的成功总有代价，成长需要付出',
    emotionalImpact: 80,
    satisfactionScore: 80,
    originality: 70,
    difficulty: 'medium',
    foreshadowingRequired: ['代价暗示', '得失平衡', '成长弧光'],
    riskLevel: 4,
    readerReactions: ['感慨', '思考', '接受'],
    alternativeVariations: ['有得有失', '代价成功', '成长结局']
  },
  {
    id: 'ending-4',
    type: 'open',
    category: 'intellectual',
    description: '结局留白，读者自行判断和想象',
    coreEvents: [
      '冲突得到部分解决',
      '未来方向暗示但不明确',
      '角色关系保持开放',
      '世界继续演变'
    ],
    characterOutcomes: [],
    thematicResolution: '生活本无定式，每个读者都可以有自己的解读',
    emotionalImpact: 65,
    satisfactionScore: 70,
    originality: 85,
    difficulty: 'hard',
    foreshadowingRequired: ['多条线索', '开放暗示', '平衡感'],
    riskLevel: 7,
    readerReactions: ['好奇', '想象', '讨论'],
    alternativeVariations: ['开放式结局', '留白结局', '思考结局']
  },
  {
    id: 'ending-5',
    type: 'twist',
    category: 'intellectual',
    description: '意料之外的结局，颠覆读者所有预期',
    coreEvents: [
      '看似走向某个结局',
      '突然出现关键反转',
      '所有线索重新解释',
      '读者恍然大悟'
    ],
    characterOutcomes: [],
    thematicResolution: '真相往往隐藏在表象之下，需要更深的思考',
    emotionalImpact: 90,
    satisfactionScore: 85,
    originality: 95,
    difficulty: 'hard',
    foreshadowingRequired: ['早期伏笔', '误导信息', '逻辑合理'],
    riskLevel: 8,
    readerReactions: ['震撼', '惊讶', '赞叹'],
    alternativeVariations: ['惊天反转', '意料之外', '颠覆结局']
  },
  {
    id: 'ending-6',
    type: 'heroic',
    category: 'moral',
    description: '主角为崇高的理想或他人而牺牲，精神获得永恒',
    coreEvents: [
      '主角面临道德抉择',
      '选择牺牲自己',
      '拯救他人或世界',
      '成为精神象征'
    ],
    characterOutcomes: [],
    thematicResolution: '真正的英雄主义在于为他人牺牲',
    emotionalImpact: 95,
    satisfactionScore: 82,
    originality: 80,
    difficulty: 'medium',
    foreshadowingRequired: ['英雄品质', '道德基础', '牺牲意义'],
    riskLevel: 5,
    readerReactions: ['感动', '敬佩', '震撼'],
    alternativeVariations: ['英雄牺牲', '精神永存', '崇高结局']
  },
  {
    id: 'ending-7',
    type: 'victory',
    category: 'emotional',
    description: '主角克服所有困难，取得最终胜利',
    coreEvents: [
      '主角准备最后决战',
      '与反派或困难对抗',
      '取得最终胜利',
      '庆祝和成长'
    ],
    characterOutcomes: [],
    thematicResolution: '坚持和努力终将成功',
    emotionalImpact: 80,
    satisfactionScore: 85,
    originality: 65,
    difficulty: 'easy',
    foreshadowingRequired: ['能力成长', '困难挑战', '最终考验'],
    riskLevel: 3,
    readerReactions: ['兴奋', '满足', '振奋'],
    alternativeVariations: ['胜利', '成功', '凯旋']
  }
];

// 生成结局方案
export function generateEndingOptions(
  novelTitle: string,
  storyGenre: string,
  storyTheme: string,
  mainCharacters: Array<{ name: string; goal: string; traits: string[] }>,
  currentProgress: number // 0-100
): EndingAnalysis {
  // 根据题材和主题筛选合适的结局
  let possibleEndings = [...ENDING_TEMPLATES];

  // 根据题材筛选
  if (storyGenre.includes('玄幻') || storyGenre.includes('武侠')) {
    // 玄幻武侠适合英雄、胜利、大团圆
    possibleEndings = possibleEndings.filter(e =>
      e.type === 'happy' ||
      e.type === 'heroic' ||
      e.type === 'victory' ||
      e.type === 'twist'
    );
  } else if (storyGenre.includes('现实') || storyGenre.includes('都市')) {
    // 现实都市适合苦乐参半、开放式
    possibleEndings = possibleEndings.filter(e =>
      e.type === 'bittersweet' ||
      e.type === 'open' ||
      e.type === 'twist' ||
      e.type === 'happy'
    );
  } else if (storyGenre.includes('悬疑') || storyGenre.includes('推理')) {
    // 悬疑推理适合反转、开放式
    possibleEndings = possibleEndings.filter(e =>
      e.type === 'twist' ||
      e.type === 'open' ||
      e.type === 'ambiguous'
    );
  }

  // 根据主题筛选
  if (storyTheme.includes('成长') || storyTheme.includes('奋斗')) {
    // 成长奋斗主题适合胜利、大团圆
    possibleEndings = possibleEndings.filter(e =>
      e.type === 'happy' ||
      e.type === 'victory' ||
      e.type === 'heroic'
    );
  } else if (storyTheme.includes('牺牲') || storyTheme.includes('责任')) {
    // 牺牲责任主题适合英雄、悲剧
    possibleEndings = possibleEndings.filter(e =>
      e.type === 'heroic' ||
      e.type === 'tragic' ||
      e.type === 'sacrifice'
    );
  }

  // 根据进度筛选
  if (currentProgress < 70) {
    // 早期，提供多种可能
    // 不筛选
  } else if (currentProgress < 90) {
    // 中后期，筛选影响力大的
    possibleEndings = possibleEndings.filter(e => e.emotionalImpact >= 80);
  } else {
    // 后期，只推荐最优的
    possibleEndings = possibleEndings.filter(e => e.satisfactionScore >= 80);
  }

  // 推荐结局（综合评分最高）
  const recommendedEnding = possibleEndings
    .map(e => ({
      ending: e,
      score: (e.satisfactionScore * 0.4 + e.originality * 0.3 + e.emotionalImpact * 0.3)
    }))
    .sort((a, b) => b.score - a.score)[0]?.ending || possibleEndings[0];

  // 结局对比
  const endingComparison: EndingComparison[] = [];
  if (possibleEndings.length >= 2) {
    for (let i = 0; i < Math.min(3, possibleEndings.length - 1); i++) {
      endingComparison.push({
        ending1: possibleEndings[i].type,
        ending2: possibleEndings[i + 1].type,
        differences: [
          `情感冲击：${possibleEndings[i].emotionalImpact} vs ${possibleEndings[i + 1].emotionalImpact}`,
          `满意度：${possibleEndings[i].satisfactionScore} vs ${possibleEndings[i + 1].satisfactionScore}`,
          `创新性：${possibleEndings[i].originality} vs ${possibleEndings[i + 1].originality}`
        ],
        recommendation: recommendedEnding?.type === possibleEndings[i].type ? '推荐前者' : '推荐后者',
        reason: '综合评分和主题匹配度'
      });
    }
  }

  // 满意度预测
  const satisfactionPrediction = recommendedEnding?.satisfactionScore || 75;

  // 读者反馈
  const readerFeedback = [
    `预期情感冲击：${recommendedEnding?.emotionalImpact || 80}/100`,
    `预期读者反应：${recommendedEnding?.readerReactions?.join('、') || '满足'}`,
    `推荐理由：${recommendedEnding?.description || ''}`
  ];

  // 风险评估
  const riskLevel = recommendedEnding?.riskLevel || 5;
  let riskAssessment = '';
  if (riskLevel < 4) {
    riskAssessment = '低风险：结局设计合理，读者接受度高';
  } else if (riskLevel < 7) {
    riskAssessment = '中风险：结局有一定风险，需要充分铺垫';
  } else {
    riskAssessment = '高风险：结局风险较大，需要精心设计';
  }

  return {
    novelTitle,
    storyGenre,
    storyTheme,
    possibleEndings,
    recommendedEnding: recommendedEnding || ENDING_TEMPLATES[0],
    endingComparison,
    satisfactionPrediction,
    readerFeedback,
    riskAssessment
  };
}

// 创建结局设置
export function createEndingSetup(
  ending: Ending,
  totalChapters: number,
  endingChapterStart: number
): EndingSetup {
  const setupChapters = totalChapters - endingChapterStart + 1;
  const keyEvents: EndingKeyEvent[] = [];

  // 根据结局类型生成关键事件
  if (ending.type === 'happy' || ending.type === 'victory') {
    const climaxChapter = Math.floor(endingChapterStart + setupChapters * 0.7);

    keyEvents.push({
      chapter: endingChapterStart,
      event: '进入最终阶段，明确最终目标',
      purpose: '为结局做铺垫',
      impact: '提高读者期待'
    });

    keyEvents.push({
      chapter: climaxChapter,
      event: '高潮对决，主角面临最大考验',
      purpose: '制造情感冲击',
      impact: '情感达到顶点'
    });

    keyEvents.push({
      chapter: totalChapters - 2,
      event: '解决主要冲突',
      purpose: '完成核心目标',
      impact: '满足读者期待'
    });

    keyEvents.push({
      chapter: totalChapters,
      event: '圆满结局，角色团聚',
      purpose: '提供情感满足',
      impact: '情感升华'
    });
  } else if (ending.type === 'tragic' || ending.type === 'heroic' || ending.type === 'sacrifice') {
    const sacrificeChapter = Math.floor(endingChapterStart + setupChapters * 0.8);

    keyEvents.push({
      chapter: endingChapterStart,
      event: '进入最终阶段，暗示可能的牺牲',
      purpose: '为悲剧做铺垫',
      impact: '制造悬念'
    });

    keyEvents.push({
      chapter: sacrificeChapter,
      event: '主角做出最终选择',
      purpose: '展现角色品质',
      impact: '情感冲击'
    });

    keyEvents.push({
      chapter: totalChapters - 1,
      event: '牺牲发生，世界得到拯救',
      purpose: '完成主题',
      impact: '震撼读者'
    });

    keyEvents.push({
      chapter: totalChapters,
      event: '其他角色继承遗志，精神永存',
      purpose: '升华主题',
      impact: '精神升华'
    });
  } else if (ending.type === 'twist') {
    const twistChapter = totalChapters - 1;

    keyEvents.push({
      chapter: endingChapterStart,
      event: '看似走向某个结局',
      purpose: '误导读者',
      impact: '降低读者防备'
    });

    keyEvents.push({
      chapter: twistChapter - 3,
      event: '提供部分线索',
      purpose: '为反转做铺垫',
      impact: '读者开始怀疑'
    });

    keyEvents.push({
      chapter: twistChapter,
      event: '关键反转发生',
      purpose: '颠覆预期',
      impact: '震撼读者'
    });

    keyEvents.push({
      chapter: totalChapters,
      event: '重新解释所有线索',
      purpose: '逻辑自洽',
      impact: '恍然大悟'
    });
  } else {
    // 开放式或其他
    keyEvents.push({
      chapter: endingChapterStart,
      event: '进入最终阶段',
      purpose: '为结局做铺垫',
      impact: '提高期待'
    });

    keyEvents.push({
      chapter: totalChapters - 1,
      event: '部分解决冲突',
      purpose: '推进剧情',
      impact: '部分满足'
    });

    keyEvents.push({
      chapter: totalChapters,
      event: '留白，开放结局',
      purpose: '留给读者想象空间',
      impact: '引发思考'
    });
  }

  // 情感弧线
  const emotionalArc: string[] = [];
  if (ending.emotionalImpact >= 90) {
    emotionalArc.push('期待 → 紧张 → 震撼 → 感动 → 升华');
  } else if (ending.emotionalImpact >= 70) {
    emotionalArc.push('期待 → 紧张 → 满足 → 平静');
  } else {
    emotionalArc.push('期待 → 平稳 → 满足');
  }

  // 解决步骤
  const resolutionSteps: string[] = [
    '回顾主要线索和冲突',
    '明确角色命运和成长',
    '回应核心主题',
    '提供情感满足'
  ];

  return {
    endingType: ending.type,
    setupChapters,
    keyEvents,
    emotionalArc,
    resolutionSteps
  };
}

// 生成角色结局
export function generateCharacterOutcomes(
  characters: Array<{ name: string; role: string; traits: string[] }>,
  endingType: EndingType
): CharacterOutcome[] {
  const outcomes: CharacterOutcome[] = [];

  characters.forEach(char => {
    let outcome: CharacterOutcome['outcome'];
    let status: string;
    let growth: string;
    let happiness: number;
    let fulfillment: number;

    if (char.role === 'protagonist') {
      if (endingType === 'happy' || endingType === 'victory') {
        outcome = 'alive';
        status = '达成目标，获得幸福';
        growth = '经历考验，成长成熟';
        happiness = 90;
        fulfillment = 85;
      } else if (endingType === 'tragic' || endingType === 'heroic' || endingType === 'sacrifice') {
        outcome = 'dead';
        status = '牺牲自我，精神永存';
        growth = '完成使命，精神升华';
        happiness = 0;
        fulfillment = 100;
      } else if (endingType === 'bittersweet') {
        outcome = 'alive';
        status = '部分成功，有得有失';
        growth = '在得失中成长';
        happiness = 60;
        fulfillment = 70;
      } else {
        outcome = 'alive';
        status = '继续前行';
        growth = '经历一切，有所感悟';
        happiness = 70;
        fulfillment = 75;
      }
    } else if (char.role === 'antagonist') {
      if (endingType === 'happy' || endingType === 'victory') {
        outcome = 'dead';
        status = '被击败，正义伸张';
        growth = '无法成长';
        happiness = 0;
        fulfillment = 0;
      } else if (endingType === 'twist') {
        outcome = 'alive';
        status = '反转后的新状态';
        growth = '获得新的理解';
        happiness = 50;
        fulfillment = 40;
      } else {
        outcome = 'dead';
        status = '被击败或消失';
        growth = '无法成长';
        happiness = 0;
        fulfillment = 0;
      }
    } else {
      // 配角
      if (endingType === 'happy') {
        outcome = 'alive';
        status = '获得幸福或成长';
        growth = '陪伴主角成长';
        happiness = 80;
        fulfillment = 75;
      } else if (endingType === 'tragic' || endingType === 'sacrifice') {
        // 部分配角可能牺牲
        outcome = Math.random() > 0.7 ? 'dead' : 'alive';
        status = outcome === 'dead' ? '牺牲' : '继续生活';
        growth = '受到影响';
        happiness = outcome === 'dead' ? 0 : 70;
        fulfillment = outcome === 'dead' ? 60 : 70;
      } else {
        outcome = 'alive';
        status = '继续生活';
        growth = '有所收获';
        happiness = 70;
        fulfillment = 65;
      }
    }

    outcomes.push({
      characterId: `char-${char.name}`,
      characterName: char.name,
      outcome,
      status,
      growth,
      happiness,
      fulfillment
    });
  });

  return outcomes;
}

// 预测结局满意度
export function predictEndingSatisfaction(
  ending: Ending,
  storyProgress: number,
  readerType: 'casual' | 'hardcore'
): {
  score: number;
  factors: string[];
  suggestions: string[];
} {
  let score = ending.satisfactionScore;

  const factors: string[] = [];
  const suggestions: string[] = [];

  // 根据故事进度调整
  if (storyProgress < 60) {
    score -= 10;
    factors.push('故事未充分展开就急于结局');
    suggestions.push('考虑延长故事，增加情节铺垫');
  } else if (storyProgress > 90) {
    score += 5;
    factors.push('故事充分展开，结局时机成熟');
  }

  // 根据读者类型调整
  if (readerType === 'hardcore') {
    if (ending.originality < 70) {
      score -= 10;
      factors.push('硬核读者要求创新性更高');
      suggestions.push('考虑增加反转或独特元素');
    }
  } else {
    if (ending.difficulty === 'hard') {
      score -= 5;
      factors.push('休闲读者可能难以理解复杂结局');
      suggestions.push('简化结局设计，提高接受度');
    }
  }

  // 根据情感冲击调整
  if (ending.emotionalImpact < 70) {
    factors.push('情感冲击偏低');
    suggestions.push('加强结局的情感渲染');
  }

  // 根据风险等级调整
  if (ending.riskLevel > 7) {
    score -= 15;
    factors.push('高风险结局可能导致读者不满');
    suggestions.push('降低风险，增加合理性说明');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    factors,
    suggestions
  };
}

// AI辅助生成结局
export function generateEndingPrompt(
  novelTitle: string,
  storyGenre: string,
  storyTheme: string,
  endingType: EndingType,
  currentProgress: string
): string {
  const typeInfo = ENDING_TYPES[endingType];

  return `请为以下小说设计${typeInfo.description}的结局：

## 基本信息
标题：${novelTitle}
题材：${storyGenre}
主题：${storyTheme}
当前进度：${currentProgress}
结局类型：${typeInfo.description}

## 结局要求
1. 结局类型：${typeInfo.description}（${typeInfo.category}）
2. 情感冲击目标：${typeInfo.popularity}/100
3. 需要解决的核心冲突：[请根据故事设定]
4. 主要角色的命运走向：[请根据故事设定]
5. 主题的升华和体现
6. 情感满足点的设置
7. 伏笔回收和线索闭合

## 输出格式
1. 结局概述（200-300字）
2. 关键事件序列（3-5个）
3. 主要角色结局（每个角色50-100字）
4. 主题升华说明（100-200字）
5. 情感冲击点（2-3个）
6. 伏笔回收清单（5-10个）
7. 读者预期反应
8. 后续发展建议（如果需要续集）`;
}

// 比较不同结局
export function compareEndings(ending1: Ending, ending2: Ending): {
  winner: Ending;
  reason: string;
  differences: string[];
  recommendation: string;
} {
  const score1 = ending1.satisfactionScore * 0.4 + ending1.originality * 0.3 + ending1.emotionalImpact * 0.3;
  const score2 = ending2.satisfactionScore * 0.4 + ending2.originality * 0.3 + ending2.emotionalImpact * 0.3;

  const winner = score1 > score2 ? ending1 : ending2;
  const loser = score1 > score2 ? ending2 : ending1;

  const differences: string[] = [
    `类型：${ENDING_TYPES[ending1.type].description} vs ${ENDING_TYPES[ending2.type].description}`,
    `情感冲击：${ending1.emotionalImpact} vs ${ending2.emotionalImpact}`,
    `满意度：${ending1.satisfactionScore} vs ${ending2.satisfactionScore}`,
    `创新性：${ending1.originality} vs ${ending2.originality}`,
    `风险等级：${ending1.riskLevel} vs ${ending2.riskLevel}`
  ];

  let recommendation = '';
  let reason = '';

  if (winner.difficulty === 'easy' && loser.difficulty === 'hard') {
    recommendation = `推荐${ENDING_TYPES[winner.type].description}，更容易执行且读者接受度高`;
    reason = '难度适中，风险可控';
  } else if (winner.originality > loser.originality + 15) {
    recommendation = `推荐${ENDING_TYPES[winner.type].description}，更具创新性和话题性`;
    reason = '创新性高，可能引发讨论';
  } else if (winner.satisfactionScore > loser.satisfactionScore + 10) {
    recommendation = `推荐${ENDING_TYPES[winner.type].description}，读者满意度更高`;
    reason = '满意度高，反馈预期良好';
  } else {
    recommendation = '两者各有优势，可根据故事需要选择';
    reason = '综合评分相近';
  }

  return {
    winner,
    reason,
    differences,
    recommendation
  };
}
