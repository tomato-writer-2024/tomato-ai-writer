/**
 * 拆书分析功能
 * 深度拆解爆款小说，提炼可复制的成功模板
 */

// ============================================================================
// 拆书分析维度
// ============================================================================

export interface AnalysisDimensions {
  // 叙事结构
  structure: {
    pacing: string; // 节奏分析
    arcs: string[]; // 故事弧线
    hooks: string[]; // 钩子设计
    foreshadowing: string[]; // 伏笔铺垫
  };

  // 人物塑造
  characters: {
    protagonist: CharacterAnalysis; // 主角分析
    supporting: CharacterAnalysis[]; // 配角分析
    antagonists: CharacterAnalysis[]; // 反派分析
    relationships: RelationshipAnalysis[]; // 关系分析
  };

  // 情节设计
  plot: {
    incitingIncident: string; // 激励事件
    conflicts: string[]; // 冲突设置
    climaxes: string[]; // 高潮设计
    resolutions: string[]; // 结局设计
  };

  // 写作技巧
  techniques: {
    perspective: string; // 视角选择
    dialogue: string; // 对话技巧
    description: string; // 描写技巧
    suspense: string; // 悬念设置
  };

  // 商业元素
  commercial: {
    hotSpots: string[]; // 爽点分析
    marketFit: string; // 市场契合度
    audience: string; // 目标读者
    monetization: string; // 变现方式
  };
}

// ============================================================================
// 人物分析
// ============================================================================

export interface CharacterAnalysis {
  name: string;
  role: 'protagonist' | 'supporting' | 'antagonist';
  personality: string[]; // 性格特点
  motivations: string[]; // 动机驱动
  growthArc: string; // 成长弧光
  distinctiveTraits: string[]; // 独特特质
  relationshipWithProtagonist?: string; // 与主角关系
}

// ============================================================================
// 关系分析
// ============================================================================

export interface RelationshipAnalysis {
  characters: string[]; // 涉及人物
  type: string; // 关系类型（师徒、恋人、敌对等）
  dynamic: string; // 关系动态（紧张、甜蜜、对立）
  arc: string; // 关系弧光（从敌对到朋友等）
  significance: string; // 重要性
}

// ============================================================================
// 爆款公式
// ============================================================================

export const EXPLOSIVE_FORMULAS = [
  {
    name: '重生复仇公式',
    description: '主角前世遭受不公，重生归来，手撕渣男、逆袭成功',
    structure: [
      '前5章：前世悲惨遭遇，重生归来',
      '第5-10章：利用前世信息，开始复仇',
      '第10-30章：逐个复仇，打脸爽文',
      '第30-50章：弥补遗憾，幸福生活',
    ],
    keyElements: [
      '重生金手指：前世信息',
      '复仇目标：前世伤害自己的人',
      '爽点密集：每章都有打脸',
      '情感治愈：弥补前世遗憾',
    ],
    hotSpots: [
      '重生瞬间',
      '首次复仇',
      '彻底反击',
      '弥补遗憾',
    ],
  },
  {
    name: '系统金手指公式',
    description: '主角获得系统，完成任务获得奖励，快速升级',
    structure: [
      '前3章：激活系统，获得金手指',
      '第3-10章：完成新手任务，初步变强',
      '第10-30章：完成系统任务，快速成长',
      '第30-50章：系统升级，称霸天下',
    ],
    keyElements: [
      '系统任务：明确目标',
      '奖励机制：获得资源和能力',
      '升级体系：实力持续提升',
      '打脸爽文：展示实力',
    ],
    hotSpots: [
      '系统激活',
      '首次完成任务',
      '获得奖励',
      '展示实力',
    ],
  },
  {
    name: '废柴逆袭公式',
    description: '主角是废柴，遭遇退婚/嘲讽，觉醒血脉/金手指，逆袭成功',
    structure: [
      '前3章：废柴主角，遭遇退婚/嘲讽',
      '第3-10章：觉醒血脉/获得金手指',
      '第10-30章：快速修炼，超越同阶',
      '第30-50章：打脸众人，逆袭成功',
    ],
    keyElements: [
      '废柴开局：制造对比',
      '觉醒转折：获得金手指',
      '修炼升级：实力提升',
      '打脸爽文：证明自己',
    ],
    hotSpots: [
      '废柴开局',
      '觉醒时刻',
      '首次突破',
      '彻底逆袭',
    ],
  },
  {
    name: '甜宠公式',
    description: '霸道总裁宠妻无度，甜蜜日常，甜度爆表',
    structure: [
      '前5章：男女主相遇，一见钟情',
      '第5-20章：甜蜜日常，宠溺无度',
      '第20-30章：小波折，感情升温',
      '第30-40章：误会解除，幸福结局',
    ],
    keyElements: [
      '霸总人设：完美男主',
      '甜宠日常：宠溺无度',
      '误会消除：感情升温',
      '圆满结局：幸福美满',
    ],
    hotSpots: [
      '初遇瞬间',
      '首次宠溺',
      '误会消除',
      '表白求婚',
    ],
  },
  {
    name: '权谋公式',
    description: '主角穿越到古代，利用现代知识，权谋争霸',
    structure: [
      '前5章：穿越古代，立足朝堂',
      '第5-20章：展现才华，步步高升',
      '第20-40章：权谋博弈，掌控朝堂',
      '第40-50章：登临巅峰，名垂青史',
    ],
    keyElements: [
      '穿越金手指：现代知识',
      '权谋博弈：智商在线',
      '改革变法：施展抱负',
      '争霸天下：成就伟业',
    ],
    hotSpots: [
      '穿越瞬间',
      '首次展现才华',
      '权谋博弈',
      '掌控朝堂',
    ],
  },
];

// ============================================================================
// 拆书分析方法
// ============================================================================

/**
 * 执行完整拆书分析
 */
export async function performBookAnalysis(
  novelTitle: string,
  content: string,
  genre: string
): Promise<AnalysisDimensions> {
  const analysis: AnalysisDimensions = {
    structure: {
      pacing: '',
      arcs: [],
      hooks: [],
      foreshadowing: [],
    },
    characters: {
      protagonist: {} as CharacterAnalysis,
      supporting: [],
      antagonists: [],
      relationships: [],
    },
    plot: {
      incitingIncident: '',
      conflicts: [],
      climaxes: [],
      resolutions: [],
    },
    techniques: {
      perspective: '',
      dialogue: '',
      description: '',
      suspense: '',
    },
    commercial: {
      hotSpots: [],
      marketFit: '',
      audience: '',
      monetization: '',
    },
  };

  // 1. 分析叙事结构
  analysis.structure = await analyzeStructure(content);

  // 2. 分析人物塑造
  analysis.characters = await analyzeCharacters(content, genre);

  // 3. 分析情节设计
  analysis.plot = await analyzePlot(content);

  // 4. 分析写作技巧
  analysis.techniques = await analyzeTechniques(content);

  // 5. 分析商业元素
  analysis.commercial = await analyzeCommercial(content, genre);

  return analysis;
}

/**
 * 分析叙事结构
 */
async function analyzeStructure(content: string): Promise<AnalysisDimensions['structure']> {
  return {
    pacing: analyzePacing(content),
    arcs: identifyStoryArcs(content),
    hooks: identifyHooks(content),
    foreshadowing: identifyForeshadowing(content),
  };
}

/**
 * 分析人物塑造
 */
async function analyzeCharacters(
  content: string,
  genre: string
): Promise<AnalysisDimensions['characters']> {
  return {
    protagonist: analyzeProtagonist(content, genre),
    supporting: analyzeSupportingCharacters(content),
    antagonists: analyzeAntagonists(content),
    relationships: analyzeRelationships(content),
  };
}

/**
 * 分析情节设计
 */
async function analyzePlot(content: string): Promise<AnalysisDimensions['plot']> {
  return {
    incitingIncident: identifyIncitingIncident(content),
    conflicts: identifyConflicts(content),
    climaxes: identifyClimaxes(content),
    resolutions: identifyResolutions(content),
  };
}

/**
 * 分析写作技巧
 */
async function analyzeTechniques(content: string): Promise<AnalysisDimensions['techniques']> {
  return {
    perspective: identifyPerspective(content),
    dialogue: analyzeDialogue(content),
    description: analyzeDescription(content),
    suspense: analyzeSuspense(content),
  };
}

/**
 * 分析商业元素
 */
async function analyzeCommercial(
  content: string,
  genre: string
): Promise<AnalysisDimensions['commercial']> {
  return {
    hotSpots: identifyHotSpots(content, genre),
    marketFit: evaluateMarketFit(content, genre),
    audience: identifyAudience(content, genre),
    monetization: analyzeMonetization(content, genre),
  };
}

// ============================================================================
// 具体分析方法
// ============================================================================

/**
 * 分析节奏
 */
function analyzePacing(content: string): string {
  // 统计章节长度分布
  const chapters = content.split(/第[一二三四五六七八九十百]+章/);
  const avgLength = chapters.reduce((sum, ch) => sum + ch.length, 0) / chapters.length;

  if (avgLength < 2000) {
    return '节奏极快，每章字数较少，适合快速阅读';
  } else if (avgLength < 3000) {
    return '节奏适中，每章字数合理，阅读体验好';
  } else {
    return '节奏较慢，每章字数较多，适合深度阅读';
  }
}

/**
 * 识别故事弧线
 */
function identifyStoryArcs(content: string): string[] {
  const arcs: string[] = [];

  // 检测常见的弧线模式
  if (content.includes('重生') || content.includes('穿越')) {
    arcs.push('重生/穿越弧线：从平凡到崛起');
  }
  if (content.includes('修炼') || content.includes('升级')) {
    arcs.push('修炼弧线：从弱小到强大');
  }
  if (content.includes('复仇') || content.includes('逆袭')) {
    arcs.push('复仇弧线：从屈辱到成功');
  }
  if (content.includes('恋爱') || content.includes('爱情')) {
    arcs.push('恋爱弧线：从陌生到相爱');
  }

  return arcs;
}

/**
 * 识别钩子
 */
function identifyHooks(content: string): string[] {
  const hooks: string[] = [];

  // 前3章是关键
  const firstThreeChapters = content.slice(0, 5000);

  // 检测常见钩子
  if (firstThreeChapters.includes('重生') || firstThreeChapters.includes('穿越')) {
    hooks.push('重生/穿越钩子：主角身份转变');
  }
  if (firstThreeChapters.includes('退婚') || firstThreeChapters.includes('嘲讽')) {
    hooks.push('冲突钩子：主角遭遇不公');
  }
  if (firstThreeChapters.includes('金手指') || firstThreeChapters.includes('系统')) {
    hooks.push('金手指钩子：主角获得优势');
  }
  if (firstThreeChapters.includes('觉醒') || firstThreeChapters.includes('突破')) {
    hooks.push('突破钩子：主角实力提升');
  }

  return hooks;
}

/**
 * 识别伏笔
 */
function identifyForeshadowing(content: string): string[] {
  const foreshadowings: string[] = [];

  // 检测伏笔模式
  if (content.includes('身世') || content.includes('来历')) {
    foreshadowings.push('身世伏笔：主角身世不简单');
  }
  if (content.includes('秘籍') || content.includes('宝物')) {
    foreshadowings.push('宝物伏笔：获得重要道具');
  }
  if (content.includes('阴谋') || content.includes('计划')) {
    foreshadowings.push('阴谋伏笔：隐藏的阴谋');
  }

  return foreshadowings;
}

/**
 * 分析主角
 */
function analyzeProtagonist(content: string, genre: string): CharacterAnalysis {
  return {
    name: '主角',
    role: 'protagonist',
    personality: ['性格鲜明', '成长性强'],
    motivations: ['追求强大', '实现目标'],
    growthArc: '从弱小到强大，从平凡到不凡',
    distinctiveTraits: ['金手指', '成长快'],
  };
}

/**
 * 分析配角
 */
function analyzeSupportingCharacters(content: string): CharacterAnalysis[] {
  return [
    {
      name: '伙伴1',
      role: 'supporting',
      personality: ['忠诚', '可靠'],
      motivations: ['帮助主角'],
      growthArc: '与主角共同成长',
      distinctiveTraits: ['独特技能'],
    },
  ];
}

/**
 * 分析反派
 */
function analyzeAntagonists(content: string): CharacterAnalysis[] {
  return [
    {
      name: '主要反派',
      role: 'antagonist',
      personality: ['狡猾', '强大'],
      motivations: ['阻止主角'],
      growthArc: '与主角对抗',
      distinctiveTraits: ['强大实力'],
      relationshipWithProtagonist: '敌对关系',
    },
  ];
}

/**
 * 分析关系
 */
function analyzeRelationships(content: string): RelationshipAnalysis[] {
  return [
    {
      characters: ['主角', '伙伴'],
      type: '伙伴关系',
      dynamic: '忠诚互助',
      arc: '从陌生到朋友',
      significance: '重要',
    },
  ];
}

/**
 * 识别激励事件
 */
function identifyIncitingIncident(content: string): string {
  const firstChapter = content.slice(0, 2000);

  if (firstChapter.includes('重生') || firstChapter.includes('穿越')) {
    return '重生/穿越事件';
  } else if (firstChapter.includes('退婚') || firstChapter.includes('嘲讽')) {
    return '遭遇不公事件';
  } else if (firstChapter.includes('觉醒') || firstChapter.includes('突破')) {
    return '实力突破事件';
  } else {
    return '命运转折事件';
  }
}

/**
 * 识别冲突
 */
function identifyConflicts(content: string): string[] {
  const conflicts: string[] = [];

  if (content.includes('退婚')) conflicts.push('退婚冲突');
  if (content.includes('打脸')) conflicts.push('打脸冲突');
  if (content.includes('比武')) conflicts.push('比武冲突');
  if (content.includes('争夺')) conflicts.push('争夺冲突');
  if (content.includes('复仇')) conflicts.push('复仇冲突');

  return conflicts;
}

/**
 * 识别高潮
 */
function identifyClimaxes(content: string): string[] {
  const climaxes: string[] = [];

  if (content.includes('决战')) climaxes.push('决战高潮');
  if (content.includes('突破')) climaxes.push('突破高潮');
  if (content.includes('复仇')) climaxes.push('复仇高潮');
  if (content.includes('逆袭')) climaxes.push('逆袭高潮');

  return climaxes;
}

/**
 * 识别结局
 */
function identifyResolutions(content: string): string[] {
  const resolutions: string[] = [];

  if (content.includes('成功') || content.includes('胜利')) {
    resolutions.push('成功结局');
  }
  if (content.includes('称霸') || content.includes('巅峰')) {
    resolutions.push('称霸结局');
  }
  if (content.includes('幸福') || content.includes('圆满')) {
    resolutions.push('圆满结局');
  }

  return resolutions;
}

/**
 * 识别视角
 */
function identifyPerspective(content: string): string {
  if (content.includes('我') && content.includes('我的')) {
    return '第一人称视角';
  } else if (content.includes('他') || content.includes('她')) {
    return '第三人称视角';
  } else {
    return '混合视角';
  }
}

/**
 * 分析对话
 */
function analyzeDialogue(content: string): string {
  if (content.includes('"') || content.includes('"')) {
    return '有对话，口语化程度高';
  } else {
    return '对话较少，叙述为主';
  }
}

/**
 * 分析描写
 */
function analyzeDescription(content: string): string {
  if (content.includes('描写') || content.includes('看到')) {
    return '有详细描写，画面感强';
  } else {
    return '描写较少，节奏明快';
  }
}

/**
 * 分析悬念
 */
function analyzeSuspense(content: string): string {
  if (content.includes('谜') || content.includes('秘密') || content.includes('真相')) {
    return '有悬念设计，吸引读者';
  } else {
    return '悬念较少，情节明快';
  }
}

/**
 * 识别爽点
 */
function identifyHotSpots(content: string, genre: string): string[] {
  const hotSpots: string[] = [];

  // 通用爽点
  if (content.includes('打脸')) hotSpots.push('打脸爽点');
  if (content.includes('突破')) hotSpots.push('突破爽点');
  if (content.includes('收获')) hotSpots.push('收获爽点');
  if (content.includes('装逼')) hotSpots.push('装逼爽点');

  // 题材特定爽点
  if (genre.includes('都市')) {
    if (content.includes('赚钱')) hotSpots.push('赚钱爽点');
    if (content.includes('权势')) hotSpots.push('权势爽点');
    if (content.includes('美女')) hotSpots.push('美女爽点');
  } else if (genre.includes('玄幻')) {
    if (content.includes('境界')) hotSpots.push('境界爽点');
    if (content.includes('法宝')) hotSpots.push('法宝爽点');
    if (content.includes('秘境')) hotSpots.push('秘境爽点');
  }

  return hotSpots;
}

/**
 * 评估市场契合度
 */
function evaluateMarketFit(content: string, genre: string): string {
  const hotSpots = identifyHotSpots(content, genre);

  if (hotSpots.length >= 5) {
    return '市场契合度高，爽点密集，符合市场需求';
  } else if (hotSpots.length >= 3) {
    return '市场契合度中，有一定爽点，可以优化';
  } else {
    return '市场契合度低，爽点不足，需要改进';
  }
}

/**
 * 识别目标读者
 */
function identifyAudience(content: string, genre: string): string {
  if (genre.includes('都市')) {
    return '18-35岁男性读者，喜欢爽文、逆袭';
  } else if (genre.includes('玄幻')) {
    return '15-30岁男性读者，喜欢升级、打怪';
  } else if (genre.includes('甜宠')) {
    return '16-35岁女性读者，喜欢甜宠、浪漫';
  } else if (genre.includes('历史')) {
    return '20-40岁读者，喜欢权谋、历史';
  } else {
    return '年轻读者群体，喜欢爽文、快节奏';
  }
}

/**
 * 分析变现方式
 */
function analyzeMonetization(content: string, genre: string): string {
  return '广告分成+会员订阅，依靠高完读率和稳定更新获得收益';
}

// ============================================================================
// 导出
// ============================================================================

/**
 * 获取爆款公式
 */
export function getExplosiveFormula(formulaName: string) {
  return EXPLOSIVE_FORMULAS.find((f) => f.name === formulaName);
}

/**
 * 获取所有爆款公式
 */
export function getAllExplosiveFormulas() {
  return EXPLOSIVE_FORMULAS;
}
