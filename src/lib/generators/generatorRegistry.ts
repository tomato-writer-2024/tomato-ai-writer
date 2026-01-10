/**
 * 生成器注册中心
 * 管理50+细分生成器，提供统一的调用接口
 */

// ============================================================================
// 生成器元数据
// ============================================================================

export interface GeneratorMetadata {
  id: string;
  name: string;
  description: string;
  category: GeneratorCategory;
  tags: string[];
  isPro: boolean; // 是否需要会员
  minWords?: number;
  maxWords?: number;
  requiresContext?: boolean;
}

export type GeneratorCategory =
  | 'character' // 角色类
  | 'plot' // 情节类
  | 'world' // 世界观类
  | 'dialogue' // 对话类
  | 'scene' // 场景类
  | 'emotion' // 情感类
  | 'style' // 风格类
  | 'structure' // 结构类
  | 'title' // 标题类
  | 'description' // 描述类
  | 'ending' // 结局类
  | 'twist' // 反转类
  | 'system' // 系统类
  | 'relationship' // 关系类
  | 'golden-start' // 黄金开头类
  | 'golden-sentence' // 金句类;

// ============================================================================
// 生成器注册表（50+生成器）
// ============================================================================

export const GENERATORS: GeneratorMetadata[] = [
  // ============ 角色类（8个）============
  {
    id: 'character-basic',
    name: '基础角色设定',
    description: '生成完整的基础角色档案',
    category: 'character',
    tags: ['角色', '人物', '设定'],
    isPro: false,
  },
  {
    id: 'character-batch',
    name: '批量角色生成',
    description: '批量生成多个配角设定',
    category: 'character',
    tags: ['角色', '批量', '配角'],
    isPro: true,
  },
  {
    id: 'character-villain',
    name: '反派角色设计',
    description: '设计有深度、有魅力的反派',
    category: 'character',
    tags: ['角色', '反派', '敌人'],
    isPro: true,
  },
  {
    id: 'character-companion',
    name: '伙伴角色设计',
    description: '设计忠诚可靠的伙伴',
    category: 'character',
    tags: ['角色', '伙伴', '队友'],
    isPro: false,
  },
  {
    id: 'character-love',
    name: '恋爱对象设计',
    description: '设计吸引人的恋爱对象',
    category: 'character',
    tags: ['角色', '恋爱', 'CP'],
    isPro: true,
  },
  {
    id: 'character-mentor',
    name: '导师角色设计',
    description: '设计引导主角的导师',
    category: 'character',
    tags: ['角色', '导师', '指引'],
    isPro: false,
  },
  {
    id: 'character-rival',
    name: '竞争对手设计',
    description: '设计与主角竞争的角色',
    category: 'character',
    tags: ['角色', '竞争', '对手'],
    isPro: true,
  },
  {
    id: 'character-sidekick',
    name: '配角群像设计',
    description: '设计完整的配角群像',
    category: 'character',
    tags: ['角色', '配角', '群像'],
    isPro: true,
  },

  // ============ 情节类（10个）============
  {
    id: 'plot-opening',
    name: '开篇情节设计',
    description: '设计引人入胜的开篇情节',
    category: 'plot',
    tags: ['情节', '开篇', '吸引'],
    isPro: false,
  },
  {
    id: 'plot-climax',
    name: '高潮情节设计',
    description: '设计震撼人心的高潮情节',
    category: 'plot',
    tags: ['情节', '高潮', '震撼'],
    isPro: true,
  },
  {
    id: 'plot-suspense',
    name: '悬念情节设计',
    description: '设计扣人心弦的悬念情节',
    category: 'plot',
    tags: ['情节', '悬念', '扣心'],
    isPro: true,
  },
  {
    id: 'plot-emotional',
    name: '情感情节设计',
    description: '设计感人至深的情感情节',
    category: 'plot',
    tags: ['情节', '情感', '感人'],
    isPro: true,
  },
  {
    id: 'plot-action',
    name: '动作情节设计',
    description: '设计紧张刺激的动作情节',
    category: 'plot',
    tags: ['情节', '动作', '刺激'],
    isPro: true,
  },
  {
    id: 'plot-mystery',
    name: '悬疑情节设计',
    description: '设计扑朔迷离的悬疑情节',
    category: 'plot',
    tags: ['情节', '悬疑', '谜题'],
    isPro: true,
  },
  {
    id: 'plot-romantic',
    name: '浪漫情节设计',
    description: '设计甜蜜浪漫的情感情节',
    category: 'plot',
    tags: ['情节', '浪漫', '甜蜜'],
    isPro: true,
  },
  {
    id: 'plot-conflict',
    name: '冲突情节设计',
    description: '设计激烈的人物冲突情节',
    category: 'plot',
    tags: ['情节', '冲突', '激烈'],
    isPro: true,
  },
  {
    id: 'plot-revelation',
    name: '揭秘情节设计',
    description: '设计震撼的揭秘情节',
    category: 'plot',
    tags: ['情节', '揭秘', '真相'],
    isPro: true,
  },
  {
    id: 'plot-foreshadowing',
    name: '伏笔情节设计',
    description: '设计巧妙的伏笔情节',
    category: 'plot',
    tags: ['情节', '伏笔', '铺垫'],
    isPro: true,
  },

  // ============ 世界观类（5个）============
  {
    id: 'world-magic',
    name: '魔法体系设计',
    description: '设计完整的魔法体系',
    category: 'world',
    tags: ['世界观', '魔法', '体系'],
    isPro: true,
  },
  {
    id: 'world-geography',
    name: '地理环境设计',
    description: '设计世界的地理环境',
    category: 'world',
    tags: ['世界观', '地理', '环境'],
    isPro: true,
  },
  {
    id: 'world-culture',
    name: '文化特色设计',
    description: '设计世界的文化特色',
    category: 'world',
    tags: ['世界观', '文化', '特色'],
    isPro: true,
  },
  {
    id: 'world-faction',
    name: '势力组织设计',
    description: '设计世界的势力组织',
    category: 'world',
    tags: ['世界观', '势力', '组织'],
    isPro: true,
  },
  {
    id: 'world-history',
    name: '历史背景设计',
    description: '设计世界的历史背景',
    category: 'world',
    tags: ['世界观', '历史', '背景'],
    isPro: true,
  },

  // ============ 对话类（5个）============
  {
    id: 'dialogue-flirting',
    name: '暧昧对话生成',
    description: '生成甜蜜暧昧的对话',
    category: 'dialogue',
    tags: ['对话', '暧昧', '甜宠'],
    isPro: true,
  },
  {
    id: 'dialogue-confrontation',
    name: '对峙对话生成',
    description: '生成紧张对峙的对话',
    category: 'dialogue',
    tags: ['对话', '对峙', '冲突'],
    isPro: true,
  },
  {
    id: 'dialogue-teasing',
    name: '调侃对话生成',
    description: '生成轻松调侃的对话',
    category: 'dialogue',
    tags: ['对话', '调侃', '轻松'],
    isPro: false,
  },
  {
    id: 'dialogue-angry',
    name: '愤怒对话生成',
    description: '生成愤怒激动的对话',
    category: 'dialogue',
    tags: ['对话', '愤怒', '激烈'],
    isPro: true,
  },
  {
    id: 'dialogue-instruction',
    name: '指导对话生成',
    description: '生成师徒指导的对话',
    category: 'dialogue',
    tags: ['对话', '指导', '师徒'],
    isPro: false,
  },

  // ============ 场景类（5个）============
  {
    id: 'scene-battle',
    name: '战斗场景描写',
    description: '描写激烈战斗的场景',
    category: 'scene',
    tags: ['场景', '战斗', '刺激'],
    isPro: true,
  },
  {
    id: 'scene-romantic',
    name: '浪漫场景描写',
    description: '描写浪漫甜蜜的场景',
    category: 'scene',
    tags: ['场景', '浪漫', '甜蜜'],
    isPro: true,
  },
  {
    id: 'scene-horror',
    name: '恐怖场景描写',
    description: '描写惊悚恐怖的场景',
    category: 'scene',
    tags: ['场景', '恐怖', '惊悚'],
    isPro: true,
  },
  {
    id: 'scene-suspense',
    name: '悬疑场景描写',
    description: '描写紧张悬疑的场景',
    category: 'scene',
    tags: ['场景', '悬疑', '紧张'],
    isPro: true,
  },
  {
    id: 'scene-peaceful',
    name: '宁静场景描写',
    description: '描写宁静美好的场景',
    category: 'scene',
    tags: ['场景', '宁静', '美好'],
    isPro: false,
  },

  // ============ 情感类（4个）============
  {
    id: 'emotion-heartbreak',
    name: '心碎情感描写',
    description: '描写心碎痛苦的情感',
    category: 'emotion',
    tags: ['情感', '心碎', '痛苦'],
    isPro: true,
  },
  {
    id: 'emotion-joy',
    name: '喜悦情感描写',
    description: '描写喜悦快乐的心理',
    category: 'emotion',
    tags: ['情感', '喜悦', '快乐'],
    isPro: false,
  },
  {
    id: 'emotion-anger',
    name: '愤怒情感描写',
    description: '描写愤怒激动的心理',
    category: 'emotion',
    tags: ['情感', '愤怒', '激动'],
    isPro: true,
  },
  {
    id: 'emotion-tension',
    name: '紧张心理描写',
    description: '描写紧张焦虑的心理',
    category: 'emotion',
    tags: ['情感', '紧张', '焦虑'],
    isPro: true,
  },

  // ============ 风格类（4个）============
  {
    id: 'style-wuxia',
    name: '武侠风格转换',
    description: '转换为武侠小说风格',
    category: 'style',
    tags: ['风格', '武侠', '江湖'],
    isPro: true,
  },
  {
    id: 'style-urban',
    name: '都市风格转换',
    description: '转换为都市小说风格',
    category: 'style',
    tags: ['风格', '都市', '现代'],
    isPro: false,
  },
  {
    id: 'style-historical',
    name: '历史风格转换',
    description: '转换为历史小说风格',
    category: 'style',
    tags: ['风格', '历史', '古代'],
    isPro: true,
  },
  {
    id: 'style-humor',
    name: '幽默风格转换',
    description: '转换为幽默风趣的风格',
    category: 'style',
    tags: ['风格', '幽默', '风趣'],
    isPro: true,
  },

  // ============ 结构类（3个）============
  {
    id: 'structure-chapter',
    name: '章节结构设计',
    description: '设计章节的结构框架',
    category: 'structure',
    tags: ['结构', '章节', '框架'],
    isPro: false,
  },
  {
    id: 'structure-arc',
    name: '故事弧线设计',
    description: '设计完整的故事弧线',
    category: 'structure',
    tags: ['结构', '弧线', '完整'],
    isPro: true,
  },
  {
    id: 'structure-arc-arc',
    name: '多线情节设计',
    description: '设计多线并行的情节',
    category: 'structure',
    tags: ['结构', '多线', '并行'],
    isPro: true,
  },

  // ============ 标题类（3个）============
  {
    id: 'title-novel',
    name: '小说标题生成',
    description: '生成吸引人的小说标题',
    category: 'title',
    tags: ['标题', '小说', '吸引'],
    isPro: false,
  },
  {
    id: 'title-chapter',
    name: '章节标题生成',
    description: '生成章节的标题',
    category: 'title',
    tags: ['标题', '章节', '简短'],
    isPro: false,
  },
  {
    id: 'title-variant',
    name: '标题变体生成',
    description: '生成标题的多种变体',
    category: 'title',
    tags: ['标题', '变体', '多样'],
    isPro: true,
  },

  // ============ 描述类（4个）============
  {
    id: 'description-appearance',
    name: '外貌描写生成',
    description: '生成人物外貌描写',
    category: 'description',
    tags: ['描写', '外貌', '人物'],
    isPro: false,
  },
  {
    id: 'description-weapon',
    name: '武器描写生成',
    description: '生成武器装备描写',
    category: 'description',
    tags: ['描写', '武器', '装备'],
    isPro: true,
  },
  {
    id: 'description-environment',
    name: '环境描写生成',
    description: '生成环境场景描写',
    category: 'description',
    tags: ['描写', '环境', '场景'],
    isPro: false,
  },
  {
    id: 'description-detailed',
    name: '细节描写生成',
    description: '生成精致的细节描写',
    category: 'description',
    tags: ['描写', '细节', '精致'],
    isPro: true,
  },

  // ============ 结局类（3个）============
  {
    id: 'ending-happy',
    name: '大团圆结局',
    description: '设计完美的圆满结局',
    category: 'ending',
    tags: ['结局', '圆满', '大团圆'],
    isPro: true,
  },
  {
    id: 'ending-tragic',
    name: '悲剧结局',
    description: '设计感人的悲剧结局',
    category: 'ending',
    tags: ['结局', '悲剧', '感人'],
    isPro: true,
  },
  {
    id: 'ending-open',
    name: '开放式结局',
    description: '设计引人遐想的开放式结局',
    category: 'ending',
    tags: ['结局', '开放式', '遐想'],
    isPro: true,
  },

  // ============ 反转类（3个）============
  {
    id: 'twist-revelation',
    name: '身份反转',
    description: '设计震撼的身份反转',
    category: 'twist',
    tags: ['反转', '身份', '震撼'],
    isPro: true,
  },
  {
    id: 'twist-truth',
    name: '真相反转',
    description: '设计意想不到的真相反转',
    category: 'twist',
    tags: ['反转', '真相', '意外'],
    isPro: true,
  },
  {
    id: 'twist-time',
    name: '时间反转',
    description: '设计时间线的反转',
    category: 'twist',
    tags: ['反转', '时间', '重构'],
    isPro: true,
  },

  // ============ 系统类（2个）============
  {
    id: 'system-design',
    name: '金手指系统设计',
    description: '设计独特的金手指系统',
    category: 'system',
    tags: ['系统', '金手指', '设定'],
    isPro: true,
  },
  {
    id: 'system-quest',
    name: '任务系统设计',
    description: '设计系统任务体系',
    category: 'system',
    tags: ['系统', '任务', '设计'],
    isPro: true,
  },

  // ============ 关系类（2个）============
  {
    id: 'relationship-chart',
    name: '关系图谱生成',
    description: '生成角色关系图谱',
    category: 'relationship',
    tags: ['关系', '图谱', '可视化'],
    isPro: true,
  },
  {
    id: 'relationship-network',
    name: '社交网络分析',
    description: '分析角色社交网络',
    category: 'relationship',
    tags: ['关系', '网络', '分析'],
    isPro: true,
  },

  // ============ 黄金开头类（2个）============
  {
    id: 'golden-start-3s',
    name: '黄金3秒开头',
    description: '生成黄金3秒的开头',
    category: 'golden-start',
    tags: ['开头', '黄金3秒', '吸引'],
    isPro: false,
  },
  {
    id: 'golden-start-500',
    name: '黄金500字开头',
    description: '生成黄金500字的开头',
    category: 'golden-start',
    tags: ['开头', '黄金500字', '完整'],
    isPro: true,
  },

  // ============ 金句类（2个）============
  {
    id: 'golden-sentence-emotion',
    name: '情感金句生成',
    description: '生成情感共鸣的金句',
    category: 'golden-sentence',
    tags: ['金句', '情感', '共鸣'],
    isPro: true,
  },
  {
    id: 'golden-sentence-philosophy',
    name: '哲理金句生成',
    description: '生成富含哲理的金句',
    category: 'golden-sentence',
    tags: ['金句', '哲理', '深度'],
    isPro: true,
  },
];

// ============================================================================
// 生成器分类
// ============================================================================

export const GENERATOR_CATEGORIES: Record<
  GeneratorCategory,
  { name: string; icon: string; description: string }
> = {
  character: { name: '角色类', icon: '👤', description: '角色设定、人物关系' },
  plot: { name: '情节类', icon: '📖', description: '情节设计、剧情编排' },
  world: { name: '世界观类', icon: '🌍', description: '世界观、设定体系' },
  dialogue: { name: '对话类', icon: '💬', description: '对话生成、互动场景' },
  scene: { name: '场景类', icon: '🎬', description: '场景描写、环境构建' },
  emotion: { name: '情感类', icon: '❤️', description: '情感描写、心理刻画' },
  style: { name: '风格类', icon: '✨', description: '风格转换、语言特色' },
  structure: { name: '结构类', icon: '🏗️', description: '结构设计、框架搭建' },
  title: { name: '标题类', icon: '📝', description: '标题生成、命名设计' },
  description: { name: '描述类', icon: '🎨', description: '描写技巧、细节刻画' },
  ending: { name: '结局类', icon: '🎯', description: '结局设计、收尾技巧' },
  twist: { name: '反转类', icon: '🔄', description: '情节反转、悬念设置' },
  system: { name: '系统类', icon: '⚙️', description: '系统设计、金手指' },
  relationship: { name: '关系类', icon: '🔗', description: '关系构建、网络分析' },
  'golden-start': { name: '黄金开头', icon: '⭐', description: '开篇设计、吸引力' },
  'golden-sentence': { name: '金句类', icon: '💎', description: '金句生成、亮点提炼' },
};

// ============================================================================
// 生成器查询工具
// ============================================================================

/**
 * 根据ID获取生成器
 */
export function getGeneratorById(id: string): GeneratorMetadata | undefined {
  return GENERATORS.find((g) => g.id === id);
}

/**
 * 根据分类获取生成器
 */
export function getGeneratorsByCategory(category: GeneratorCategory): GeneratorMetadata[] {
  return GENERATORS.filter((g) => g.category === category);
}

/**
 * 根据标签搜索生成器
 */
export function searchGeneratorsByTag(tag: string): GeneratorMetadata[] {
  return GENERATORS.filter((g) => g.tags.some((t) => t.includes(tag)));
}

/**
 * 获取所有免费生成器
 */
export function getFreeGenerators(): GeneratorMetadata[] {
  return GENERATORS.filter((g) => !g.isPro);
}

/**
 * 获取所有付费生成器
 */
export function getProGenerators(): GeneratorMetadata[] {
  return GENERATORS.filter((g) => g.isPro);
}

/**
 * 获取生成器统计
 */
export function getGeneratorStats() {
  return {
    total: GENERATORS.length,
    free: GENERATORS.filter((g) => !g.isPro).length,
    pro: GENERATORS.filter((g) => g.isPro).length,
    categories: Object.keys(GENERATOR_CATEGORIES).length,
  };
}
