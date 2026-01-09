/**
 * 情节反转建议器
 * 支持反转类型库、反转预判、反转效果预测
 */

export interface PlotTwist {
  id: string;
  type: TwistType;
  category: TwistCategory;
  description: string;
  foreshadowingRequired: string[]; // 需要的伏笔
  impactLevel: number; // 影响等级 1-10
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  examples: TwistExample[];
  setupSteps: string[];
  payoffDescription: string;
  riskLevel: number; // 风险等级 1-10
  readerReaction: string; // 预期读者反应
}

export type TwistType =
  | 'identity-twist' // 身份反转
  | 'ally-betrayal' // 盟友背叛
  | 'enemy-alliance' // 敌人结盟
  | 'power-reversal' // 力量反转
  | 'truth-revelation' // 真相揭露
  | 'time-twist' // 时间反转
  | 'perspective-twist' // 视角反转
  | 'goal-change' // 目标转换
  | 'moral-ambiguity' // 道德模糊
  | 'sacrifice-twist' // 牺牲反转
  | 'survival-twist' // 存活反转
  | 'origin-twist' // 起源反转;

export type TwistCategory =
  | 'character'
  | 'plot'
  | 'setting'
  | 'theme'
  | 'structure';

export interface TwistExample {
  scenario: string;
  before: string;
  after: string;
  explanation: string;
}

export interface TwistAnalysis {
  currentPlot: string;
  potentialTwists: PlotTwist[];
  recommendedTwists: PlotTwist[];
  setupChecklist: string[];
  riskAssessment: string;
  readerExpectations: string[];
}

export interface TwistSetup {
  twistId: string;
  setupChapter: number;
  payoffChapter: number;
  foreshadowingPoints: ForeshadowingPoint[];
  alternativeOutcomes: string[];
  contingencyPlans: string[];
}

export interface ForeshadowingPoint {
  chapter: number;
  content: string;
  subtlety: 'obvious' | 'subtle' | 'hidden';
  purpose: string;
}

// 反转类型定义
export const TWIST_TYPES: Record<TwistType, { description: string; category: TwistCategory; difficulty: string }> = {
  'identity-twist': {
    description: '角色身份与表面形象不同，揭示隐藏身份',
    category: 'character',
    difficulty: 'medium'
  },
  'ally-betrayal': {
    description: '看似可靠的盟友突然背叛主角',
    category: 'character',
    difficulty: 'hard'
  },
  'enemy-alliance': {
    description: '死敌因共同目标而暂时结盟',
    category: 'character',
    difficulty: 'medium'
  },
  'power-reversal': {
    description: '弱者变强，强者变弱，力量对比反转',
    category: 'plot',
    difficulty: 'easy'
  },
  'truth-revelation': {
    description: '揭露关键真相，改变整个故事格局',
    category: 'plot',
    difficulty: 'medium'
  },
  'time-twist': {
    description: '时间线非线性，过去影响未来',
    category: 'structure',
    difficulty: 'hard'
  },
  'perspective-twist': {
    description: '从反派或其他视角重新解读事件',
    category: 'structure',
    difficulty: 'medium'
  },
  'goal-change': {
    description: '主角目标发生根本性改变',
    category: 'plot',
    difficulty: 'medium'
  },
  'moral-ambiguity': {
    description: '善恶界限模糊，角色道德立场反转',
    category: 'theme',
    difficulty: 'hard'
  },
  'sacrifice-twist': {
    description: '角色牺牲但意外存活，或意外死亡',
    category: 'character',
    difficulty: 'medium'
  },
  'survival-twist': {
    description: '被认为死亡的角色重新出现',
    category: 'character',
    difficulty: 'medium'
  },
  'origin-twist': {
    description: '角色或世界的起源与认知不同',
    category: 'setting',
    difficulty: 'hard'
  }
};

// 反转库
export const PLOT_TWISTS: PlotTwist[] = [
  {
    id: 'twist-1',
    type: 'identity-twist',
    category: 'character',
    description: '长期追随主角的忠诚伙伴，实际上是反派安插的卧底',
    foreshadowingRequired: [
      '伙伴对主角某些重要事件反应异常',
      '伙伴在关键时刻犹豫或失误',
      '伙伴对某些信息表现出过度关注'
    ],
    impactLevel: 9,
    difficulty: 'hard',
    examples: [
      {
        scenario: '背叛揭露',
        before: '伙伴一直对主角忠心耿耿，多次帮助主角',
        after: '伙伴在关键时刻背叛，揭露真实身份',
        explanation: '前期需要埋下伏笔，但不能过于明显'
      }
    ],
    setupSteps: [
      '早期展示伙伴的忠诚和能力',
      '埋下2-3个可疑但可合理解释的细节',
      '在关键冲突前增加伙伴的异常行为',
      '选择最具戏剧性的时机揭露真相'
    ],
    payoffDescription: '读者震惊，主角陷入绝境，需要重新评估所有过往事件',
    riskLevel: 8,
    readerReaction: '震惊、愤怒、同情主角'
  },
  {
    id: 'twist-2',
    type: 'power-reversal',
    category: 'plot',
    description: '一直被看不起的主角突然展现压倒性实力，打脸众人',
    foreshadowingRequired: [
      '主角隐藏实力的理由',
      '主角在某个时刻暗示过自己的真实能力',
      '他人低估主角的合理原因'
    ],
    impactLevel: 7,
    difficulty: 'easy',
    examples: [
      {
        scenario: '实力展示',
        before: '主角一直表现平平，被众人轻视',
        after: '主角突然展现强大实力，震惊所有人',
        explanation: '爽点型反转，读者期待度高'
      }
    ],
    setupSteps: [
      '确立主角被轻视的状态',
      '暗示主角有特殊背景或隐藏能力',
      '安排一个需要展示实力的场合',
      '选择最具戏剧性的一刻揭露实力'
    ],
    payoffDescription: '读者爽快感爆棚，主角地位迅速提升',
    riskLevel: 3,
    readerReaction: '爽快、兴奋、期待主角后续表现'
  },
  {
    id: 'twist-3',
    type: 'truth-revelation',
    category: 'plot',
    description: '一直以为是敌人的反派，实际上是主角的保护者',
    foreshadowingRequired: [
      '反派对主角的"攻击"总是点到为止',
      '反派在某些场合帮助过主角',
      '反派阻止其他更危险的敌人'
    ],
    impactLevel: 8,
    difficulty: 'medium',
    examples: [
      {
        scenario: '真相揭露',
        before: '反派一直追杀主角，给主角制造困难',
        after: '揭露反派的追杀实际上是在保护主角',
        explanation: '需要前期足够的误解铺垫'
      }
    ],
    setupSteps: [
      '让反派多次"伤害"主角但未造成致命伤害',
      '在某个关键事件中，反派暗中帮助主角',
      '埋下反派行为矛盾的细节',
      '在故事后期或高潮前揭露真相'
    ],
    payoffDescription: '读者震惊，主角世界观崩塌重建',
    riskLevel: 6,
    readerReaction: '震惊、困惑、恍然大悟'
  },
  {
    id: 'twist-4',
    type: 'sacrifice-twist',
    category: 'character',
    description: '被认为死亡的重要角色，实际上活着并将在关键时刻回归',
    foreshadowingRequired: [
      '死亡场景有可合理解释的漏洞',
      '有其他人或机制可完成"死亡"',
      '角色回归的动机和条件'
    ],
    impactLevel: 8,
    difficulty: 'medium',
    examples: [
      {
        scenario: '回归',
        before: '角色在剧情中"死亡"，主角悲痛欲绝',
        after: '角色在关键时刻回归，扭转局势',
        explanation: '需要前期埋下活着的线索'
      }
    ],
    setupSteps: [
      '创造一个看似确定但可疑的死亡场景',
      '埋下2-3个角色可能活着的线索',
      '在角色缺席期间，保持其影响力',
      '选择最需要帮助的时刻安排回归'
    ],
    payoffDescription: '读者感动和惊喜，主角获得强力助力',
    riskLevel: 5,
    readerReaction: '惊喜、感动、期待后续发展'
  },
  {
    id: 'twist-5',
    type: 'goal-change',
    category: 'plot',
    description: '主角在追求目标的过程中，发现自己的目标一开始就是错误的',
    foreshadowingRequired: [
      '目标存在模糊或矛盾之处',
      '有角色暗示目标可能有问题',
      '主角在追求过程中产生怀疑'
    ],
    impactLevel: 9,
    difficulty: 'hard',
    examples: [
      {
        scenario: '目标改变',
        before: '主角一直为某个目标努力奋斗',
        after: '发现目标错误，转向新的目标',
        explanation: '需要前期埋下目标和现实的矛盾'
      }
    ],
    setupSteps: [
      '明确主角的初始目标',
      '埋下目标可能存在问题的线索',
      '让主角在追求过程中遇到困难或质疑',
      '在故事中期或后期让主角觉醒'
    ],
    payoffDescription: '读者世界观改变，主角成长',
    riskLevel: 7,
    readerReaction: '震惊、思考、认同主角的新选择'
  },
  {
    id: 'twist-6',
    type: 'enemy-alliance',
    category: 'character',
    description: '死敌因更大的共同敌人或利益而被迫合作',
    foreshadowingRequired: [
      '双方存在共同利益或敌人',
      '双方在某些价值观或目标上有交集',
      '双方单独都无法对抗新威胁'
    ],
    impactLevel: 7,
    difficulty: 'medium',
    examples: [
      {
        scenario: '暂时结盟',
        before: '双方是死敌，势不两立',
        after: '因更大威胁而被迫合作',
        explanation: '需要前期建立足够仇恨'
      }
    ],
    setupSteps: [
      '确立双方的仇恨关系',
      '引入更大的共同威胁或利益',
      '让双方意识到单打独斗无法对抗',
      '安排一个需要合作的紧急情况',
      '在合作中保持紧张和不信任'
    ],
    payoffDescription: '读者好奇两人如何合作，冲突和张力并存',
    riskLevel: 5,
    readerReaction: '好奇、期待、紧张'
  },
  {
    id: 'twist-7',
    type: 'moral-ambiguity',
    category: 'theme',
    description: '一直被认为是"邪恶"的反派，实际上有合理的动机和行为',
    foreshadowingRequired: [
      '反派的行为有某种逻辑',
      '反派在某些方面表现出"人性"',
      '主角的世界观存在局限'
    ],
    impactLevel: 8,
    difficulty: 'hard',
    examples: [
      {
        scenario: '道德模糊',
        before: '反派被塑造成纯粹邪恶',
        after: '揭露反派的动机和苦衷',
        explanation: '需要前期避免将反派过度扁平化'
      }
    ],
    setupSteps: [
      '前期让反派表现出足够的邪恶',
      '埋下反派行为背后原因的线索',
      '在某个关键事件中，让主角理解反派',
      '可能引发主角的道德困惑'
    ],
    payoffDescription: '读者思考，故事深度提升',
    riskLevel: 6,
    readerReaction: '思考、理解、矛盾'
  },
  {
    id: 'twist-8',
    type: 'time-twist',
    category: 'structure',
    description: '故事的时间线是非线性的，过去事件影响未来发展',
    foreshadowingRequired: [
      '早期埋下时间异常的暗示',
      '某些事件在不同时间重复出现',
      '角色对某些信息的异常反应'
    ],
    impactLevel: 9,
    difficulty: 'extreme',
    examples: [
      {
        scenario: '时间异常',
        before: '故事正常发展',
        after: '揭露时间线的异常或循环',
       解释: '需要精心设计时间线和线索'
      }
    ],
    setupSteps: [
      '埋下时间异常的早期暗示',
      '在不同章节重复某些细节或事件',
      '让角色对时间或记忆产生困惑',
      '在故事后期揭露真相',
      '解释所有异常现象'
    ],
    payoffDescription: '读者震撼，需要重新理解整个故事',
    riskLevel: 9,
    readerReaction: '震撼、困惑、恍然大悟'
  },
  {
    id: 'twist-9',
    type: 'origin-twist',
    category: 'setting',
    description: '主角或世界的起源与主角认知的完全不同',
    foreshadowingRequired: [
      '主角身世有可疑或未解之处',
      '世界的某些规则或历史存在矛盾',
      '有其他角色暗示过真相'
    ],
    impactLevel: 9,
    difficulty: 'hard',
    examples: [
      {
        scenario: '起源揭露',
        before: '主角相信自己知道自己的身世',
        after: '揭露主角的真实起源',
        解释: '需要前期埋下矛盾线索'
      }
    ],
    setupSteps: [
      '埋下主角身世或世界起源的矛盾线索',
      '让其他角色暗示或直接提及真相',
      '在故事后期或高潮时揭露',
      '解释为何前期信息是错误的'
    ],
    payoffDescription: '读者世界观崩塌重建',
    riskLevel: 7,
    readerReaction: '震撼、困惑、恍然大悟'
  }
];

// 生成反转建议
export function generateTwistSuggestions(
  currentPlot: string,
  storyGenre: string,
  characterCount: number,
  chapterProgress: number // 0-100
): TwistAnalysis {
  // 基于当前剧情筛选合适的反转
  let potentialTwists = [...PLOT_TWISTS];

  // 根据故事进度筛选
  if (chapterProgress < 30) {
    // 早期，主要适合铺垫型反转
    potentialTwists = potentialTwists.filter(t => t.difficulty === 'easy' || t.difficulty === 'medium');
  } else if (chapterProgress < 70) {
    // 中期，所有类型都适合
    // 不筛选
  } else {
    // 后期，只适合影响大的反转
    potentialTwists = potentialTwists.filter(t => t.impactLevel >= 7);
  }

  // 根据题材筛选
  if (storyGenre.includes('玄幻') || storyGenre.includes('武侠')) {
    // 玄幻武侠适合实力、身份、起源反转
    potentialTwists = potentialTwists.filter(t =>
      t.type === 'power-reversal' ||
      t.type === 'identity-twist' ||
      t.type === 'origin-twist' ||
      t.type === 'truth-revelation'
    );
  } else if (storyGenre.includes('都市') || storyGenre.includes('现实')) {
    // 都市现实适合关系、真相反转
    potentialTwists = potentialTwists.filter(t =>
      t.type === 'ally-betrayal' ||
      t.type === 'enemy-alliance' ||
      t.type === 'truth-revelation' ||
      t.type === 'goal-change'
    );
  }

  // 根据角色数量筛选
  if (characterCount < 3) {
    // 角色少，不适合背叛或结盟
    potentialTwists = potentialTwists.filter(t =>
      t.type !== 'ally-betrayal' &&
      t.type !== 'enemy-alliance'
    );
  }

  // 推荐最具戏剧性的反转（高影响、中低难度）
  const recommendedTwists = potentialTwists
    .filter(t => t.impactLevel >= 7 && t.difficulty !== 'extreme')
    .sort((a, b) => b.impactLevel - a.impactLevel)
    .slice(0, 3);

  // 生成设置清单
  const setupChecklist: string[] = [];
  recommendedTwists.forEach(twist => {
    setupChecklist.push(`## ${TWIST_TYPES[twist.type].description}设置清单`);
    twist.foreshadowingRequired.forEach((foreshadowing, index) => {
      setupChecklist.push(`${index + 1}. ${foreshadowing} - [ ]`);
    });
  });

  // 风险评估
  const avgRisk = recommendedTwists.reduce((sum, t) => sum + t.riskLevel, 0) / recommendedTwists.length;
  let riskAssessment = '';
  if (avgRisk < 4) {
    riskAssessment = '低风险：反转设计合理，读者接受度较高';
  } else if (avgRisk < 7) {
    riskAssessment = '中风险：反转有一定风险，需要充分铺垫';
  } else {
    riskAssessment = '高风险：反转风险较大，需要精心设计';
  }

  // 读者期待
  const readerExpectations = [
    '期待剧情有出人意料的转折',
    '希望反转合情合理，不突兀',
    '喜欢看到角色关系的复杂性',
    '期待反转能带来新的冲突和张力'
  ];

  return {
    currentPlot,
    potentialTwists,
    recommendedTwists,
    setupChecklist,
    riskAssessment,
    readerExpectations
  };
}

// 创建反转设置
export function createTwistSetup(
  twist: PlotTwist,
  currentChapter: number,
  targetChapter: number
): TwistSetup {
  const foreshadowingPoints: ForeshadowingPoint[] = twist.foreshadowingRequired.map((foreshadowing, index) => {
    const chapterOffset = Math.floor((targetChapter - currentChapter) / (twist.foreshadowingRequired.length + 1));
    const setupChapter = currentChapter + (index + 1) * chapterOffset;

    return {
      chapter: setupChapter,
      content: foreshadowing,
      subtlety: index === twist.foreshadowingRequired.length - 1 ? 'obvious' : 'subtle',
      purpose: '埋下伏笔，为反转做铺垫'
    };
  });

  return {
    twistId: twist.id,
    setupChapter: currentChapter,
    payoffChapter: targetChapter,
    foreshadowingPoints,
    alternativeOutcomes: [
      '反转成功，读者震惊',
      '反转失败，读者困惑',
      '反转部分成功，读者接受但有争议'
    ],
    contingencyPlans: [
      '提前铺垫更多信息，确保反转合理',
      '准备多个反转版本，根据读者反馈调整',
      '设计备用反转方案，主反转效果不佳时启用'
    ]
  };
}

// 预测反转效果
export function predictTwistEffect(
  twist: PlotTwist,
  storyProgress: number,
  readerType: 'casual' | 'hardcore'
): {
  successRate: number;
  readerReaction: string;
  potentialIssues: string[];
  improvements: string[];
} {
  let successRate = 70;

  // 根据故事进度调整
  if (storyProgress < 30) {
    successRate -= 10; // 早期反转读者可能不买账
  } else if (storyProgress > 70) {
    successRate += 10; // 后期反转更容易成功
  }

  // 根据读者类型调整
  if (readerType === 'hardcore') {
    successRate -= 5; // 硬核读者要求更高
  } else {
    successRate += 5; // 休闲读者更容易满足
  }

  // 根据难度调整
  if (twist.difficulty === 'easy') {
    successRate += 10;
  } else if (twist.difficulty === 'hard' || twist.difficulty === 'extreme') {
    successRate -= 15;
  }

  const potentialIssues: string[] = [];
  const improvements: string[] = [];

  if (twist.riskLevel > 7) {
    potentialIssues.push('风险等级过高，可能导致读者不满');
    improvements.push('降低风险，增加合理性说明');
  }

  if (twist.foreshadowingRequired.length < 2) {
    potentialIssues.push('伏笔不足，反转可能突兀');
    improvements.push('增加伏笔数量，提高铺垫密度');
  }

  if (twist.difficulty === 'extreme') {
    potentialIssues.push('难度过高，可能超出读者接受范围');
    improvements.push('简化反转设计，降低理解难度');
  }

  return {
    successRate: Math.max(0, Math.min(100, successRate)),
    readerReaction: twist.readerReaction,
    potentialIssues,
    improvements
  };
}

// AI辅助生成反转
export function generateTwistPrompt(
  currentPlot: string,
  twistType: TwistType,
  context: string
): string {
  const typeInfo = TWIST_TYPES[twistType];

  return `请为以下情节设计一个${typeInfo.description}的反转：

## 当前情节
${currentPlot}

## 故事背景
${context}

## 反转要求
1. 反转类型：${typeInfo.description}
2. 反转影响等级：7-9
3. 需要埋设2-4个伏笔
4. 反转要合情合理，不突兀
5. 反转后要引发新的冲突或问题

## 输出格式
1. 反转描述（100-200字）
2. 需要埋设的伏笔（3-5个）
3. 伏笔设置建议（每个伏笔的设置时机和方式）
4. 反转揭露时机（建议章节）
5. 预期读者反应
6. 后续发展建议（反转后的2-3个可能发展方向）`;
}

// 评估反转质量
export function evaluateTwist(twist: PlotTwist): {
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
} {
  let score = 70;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  // 评估影响等级
  if (twist.impactLevel >= 8) {
    score += 10;
    strengths.push('影响等级高，戏剧性强');
  } else if (twist.impactLevel < 6) {
    score -= 10;
    weaknesses.push('影响等级偏低，戏剧性不足');
    suggestions.push('提高反转的影响等级，增加戏剧冲突');
  }

  // 评估伏笔数量
  if (twist.foreshadowingRequired.length >= 3) {
    score += 5;
    strengths.push('伏笔充分，铺垫扎实');
  } else if (twist.foreshadowingRequired.length < 2) {
    score -= 10;
    weaknesses.push('伏笔不足，可能突兀');
    suggestions.push('增加伏笔数量，提高合理性');
  }

  // 评估风险等级
  if (twist.riskLevel <= 5) {
    score += 5;
    strengths.push('风险可控，读者接受度高');
  } else if (twist.riskLevel > 7) {
    score -= 5;
    weaknesses.push('风险等级高，可能引发争议');
    suggestions.push('降低风险，增加合理性说明');
  }

  // 评估难度
  if (twist.difficulty === 'medium') {
    score += 5;
    strengths.push('难度适中，易于执行');
  } else if (twist.difficulty === 'extreme') {
    score -= 10;
    weaknesses.push('难度过高，执行困难');
    suggestions.push('简化反转设计，降低难度');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    strengths,
    weaknesses,
    suggestions
  };
}
