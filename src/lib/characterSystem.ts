/**
 * 角色设定系统
 * 支持人物小传、性格建模、技能体系、成长弧光
 */

export interface CharacterProfile {
  id: string;
  userId: string;
  name: string;
  nickname?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  appearance: string;
  personality: PersonalityTraits;
  background: string;
  motivation: string;
  skills: Skill[];
  flaws: string[];
  strengths: string[];
  backstory: string;
  growthArc: 'hero' | 'anti-hero' | 'villain' | 'tragic' | 'growth' | 'flat';
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  relationships: Relationship[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalityTraits {
  // 大五人格模型
  openness: number;      // 开放性 0-100
  conscientiousness: number; // 尽责性 0-100
  extraversion: number;   // 外向性 0-100
  agreeableness: number;  // 宜人性 0-100
  neuroticism: number;    // 神经质 0-100

  // 扩展维度
  humor: number;          // 幽默感 0-100
  loyalty: number;        // 忠诚度 0-100
  ambition: number;       // 野心 0-100
  courage: number;        // 勇气 0-100
  empathy: number;        // 共情能力 0-100
}

export interface Skill {
  id: string;
  name: string;
  category: 'combat' | 'magic' | 'intellectual' | 'social' | 'artistic' | 'technical';
  proficiency: number;    // 熟练度 0-100
  description: string;
  specialAbilities: string[];
}

export interface Relationship {
  characterId: string;
  characterName: string;
  type: 'ally' | 'enemy' | 'rival' | 'family' | 'friend' | 'mentor' | 'lover';
  intensity: number;      // 关系强度 0-100
  description: string;
  conflictPoints: string[];
}

export interface CharacterAnalysis {
  character: CharacterProfile;
  consistency: number;    // 角色一致性评分 0-100
  depth: number;          // 角色深度评分 0-100
  potential: number;      // 角色潜力评分 0-100
  suggestions: string[];  // 优化建议
}

// 性格类型库
export const PERSONALITY_TYPES = {
  MBTI: [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ],
  Enneagram: [
    '1 - 改革者', '2 - 助人者', '3 - 成就者',
    '4 - 个人主义者', '5 - 探索者', '6 - 忠诚者',
    '7 - 热情者', '8 - 挑战者', '9 - 和平者'
  ]
};

// 角色原型库
export const CHARACTER_ARCHETYPES = [
  {
    name: '英雄',
    description: '勇敢、正义，为正义事业而战',
    traits: { courage: 90, empathy: 70, ambition: 60 },
    commonFlaws: ['过于理想主义', '缺乏灵活性', '自我牺牲倾向']
  },
  {
    name: '反英雄',
    description: '有缺陷的主角，可能在道德上灰暗',
    traits: { courage: 70, empathy: 50, ambition: 80 },
    commonFlaws: ['道德灰色', '自私倾向', '信任问题']
  },
  {
    name: '导师',
    description: '智慧的长者，指引主角成长',
    traits: { conscientiousness: 90, openness: 80, empathy: 85 },
    commonFlaws: ['过于保守', '难以放手', '过去创伤']
  },
  {
    name: '反派',
    description: '与主角对立的角色',
    traits: { ambition: 95, courage: 75, empathy: 20 },
    commonFlaws: ['过于执着', '缺乏信任', '控制欲强']
  },
  {
    name: '变形者',
    description: '立场不明确，可能在善恶之间转换',
    traits: { openness: 85, neuroticism: 60, agreeableness: 40 },
    commonFlaws: ['不可预测', '道德模糊', '信任问题']
  }
];

// 生成角色小传
export function generateCharacterBackstory(profile: CharacterProfile): string {
  const prompts = [
    `角色姓名：${profile.name}`,
    `年龄：${profile.age}岁，性别：${profile.gender === 'male' ? '男' : profile.gender === 'female' ? '女' : '其他'}`,
    `外貌特征：${profile.appearance}`,
    `性格特点：开放性${profile.personality.openness}，尽责性${profile.personality.conscientiousness}，外向性${profile.personality.extraversion}，宜人性${profile.personality.agreeableness}`,
    `技能特长：${profile.skills.map(s => s.name).join('、')}`,
    `成长弧光：${profile.growthArc}`,
    `角色定位：${profile.role}`,
    `人生目标：${profile.motivation}`,
    `核心缺陷：${profile.flaws.join('、')}`
  ];

  return `请基于以下信息为${profile.name}创作详细的角色小传，包括童年经历、成长背景、性格形成原因、关键转折点等：

${prompts.join('\n')}

要求：
1. 人物立体丰满，有血有肉
2. 性格与经历逻辑自洽
3. 预埋成长空间和改变可能
4. 500-1000字`;
}

// 分析角色一致性
export function analyzeCharacterConsistency(profile: CharacterProfile): CharacterAnalysis {
  const suggestions: string[] = [];
  let consistencyScore = 100;

  // 检查性格与成长弧光的匹配度
  if (profile.growthArc === 'hero' && profile.personality.courage < 50) {
    suggestions.push('英雄角色的勇气值偏低，建议提升至70以上');
    consistencyScore -= 10;
  }

  if (profile.growthArc === 'anti-hero' && profile.personality.agreeableness > 60) {
    suggestions.push('反英雄角色的宜人性偏高，建议降低至50以下');
    consistencyScore -= 10;
  }

  // 检查技能与角色定位的匹配度
  const combatSkills = profile.skills.filter(s => s.category === 'combat' || s.category === 'magic');
  if (profile.role === 'protagonist' && combatSkills.length < 1) {
    suggestions.push('主角建议至少掌握一项战斗或魔法技能');
    consistencyScore -= 5;
  }

  // 检查缺陷与优点的平衡
  if (profile.flaws.length < 2) {
    suggestions.push('角色缺陷过少，建议至少添加2个缺点');
    consistencyScore -= 10;
  }

  if (profile.strengths.length < 2) {
    suggestions.push('角色优点过少，建议至少添加2个优点');
    consistencyScore -= 5;
  }

  // 检查关系设置
  if (profile.relationships.length === 0 && profile.role !== 'minor') {
    suggestions.push('主要角色建议设置至少1个人际关系');
    consistencyScore -= 5;
  }

  // 计算角色深度
  const depthScore = (
    (profile.backstory.length > 100 ? 20 : 0) +
    (profile.motivation.length > 50 ? 20 : 0) +
    (profile.skills.length > 2 ? 15 : 0) +
    (profile.relationships.length > 1 ? 15 : 0) +
    (profile.flaws.length > 2 ? 15 : 0) +
    (profile.strengths.length > 2 ? 15 : 0)
  );

  // 计算角色潜力
  const potentialScore = (
    (profile.growthArc !== 'flat' ? 30 : 10) +
    (profile.flaws.length > 0 ? 25 : 0) +
    (profile.relationships.filter(r => r.conflictPoints.length > 0).length > 0 ? 25 : 0) +
    (profile.motivation.length > 50 ? 20 : 0)
  );

  return {
    character: profile,
    consistency: consistencyScore,
    depth: depthScore,
    potential: potentialScore,
    suggestions
  };
}

// 基于原型快速创建角色
export function createCharacterFromArchetype(
  archetype: string,
  customizations: Partial<CharacterProfile>
): CharacterProfile {
  const baseArchetype = CHARACTER_ARCHETYPES.find(a => a.name === archetype);

  if (!baseArchetype) {
    throw new Error(`未找到角色原型：${archetype}`);
  }

  return {
    id: '',
    userId: '',
    name: customizations.name || '未命名角色',
    nickname: customizations.nickname,
    age: customizations.age || 25,
    gender: customizations.gender || 'male',
    appearance: customizations.appearance || '请填写外貌描述',
    personality: customizations.personality || {
      openness: baseArchetype.traits.openness || 50,
      conscientiousness: baseArchetype.traits.conscientiousness || 50,
      extraversion: baseArchetype.traits.extraversion || 50,
      agreeableness: baseArchetype.traits.agreeableness || 50,
      neuroticism: 50,
      humor: 50,
      loyalty: 50,
      ambition: baseArchetype.traits.ambition || 50,
      courage: baseArchetype.traits.courage || 50,
      empathy: baseArchetype.traits.empathy || 50
    },
    background: customizations.background || '',
    motivation: customizations.motivation || '',
    skills: customizations.skills || [],
    flaws: customizations.flaws || baseArchetype.commonFlaws,
    strengths: customizations.strengths || [],
    backstory: customizations.backstory || '',
    growthArc: customizations.growthArc || 'growth',
    role: customizations.role || 'supporting',
    relationships: customizations.relationships || [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// 预测角色成长路径
export function predictCharacterGrowth(profile: CharacterProfile): string {
  const growthPaths: Record<string, string> = {
    'hero': `${profile.name}将面临多次考验，在挫折中成长，最终战胜自我和外部敌人，完成英雄之旅。关键成长点：接受召唤、跨越门槛、面对深渊、获得恩赐、归途。`,
    'anti-hero': `${profile.name}将经历道德挣扎，可能在善恶之间摇摆，最终找到自己的救赎之路或彻底堕落。关键成长点：内心冲突、道德选择、代价承受、最终抉择。`,
    'villain': `${profile.name}将逐步揭露其邪恶动机，可能展现脆弱的一面，最终自我毁灭或被主角击败。关键成长点：邪恶起源、权力膨胀、对手激化、必然败亡。`,
    'tragic': `${profile.name}虽有美好品质，但致命缺陷将导致悲剧结局，给读者留下深刻印象。关键成长点：缺陷暴露、错误累积、悲剧高潮、命运终局。`,
    'growth': `${profile.name}将经历显著的内在转变，从无知到认知，从软弱到强大，最终实现自我超越。关键成长点：觉醒时刻、技能习得、信念确立、质变升华。`,
    'flat': `${profile.name}作为扁平角色，将保持稳定的性格特征，主要作为推动剧情的工具或象征意义。作用：提供对比、展示理念、引发冲突。`
  };

  return growthPaths[profile.growthArc] || '成长路径待定义';
}

// 生成角色互动对话示例
export function generateCharacterDialogue(
  character: CharacterProfile,
  context: string,
  tone: 'formal' | 'casual' | 'aggressive' | 'romantic' | 'mysterious'
): string {
  const toneModifiers: Record<string, string> = {
    'formal': '使用礼貌用语，句式规范，表达得体',
    'casual': '使用口语化表达，语气轻松自然',
    'aggressive': '语气强势，用词直接，可能带攻击性',
    'romantic': '语气温柔，使用感性词汇，表达细腻',
    'mysterious': '话中有话，留有余地，增加悬念'
  };

  const personalityHints = character.personality.extraversion > 60 ? '性格外向，表达直接' : '性格内向，表达含蓄';

  return `请为${character.name}创作一段对话，要求：\n` +
    `场景：${context}\n` +
    `语气风格：${toneModifiers[tone]}\n` +
    `性格特征：${personalityHints}\n` +
    `性格数值：开放性${character.personality.openoutness}，尽责性${character.personality.conscientiousness}，外向性${character.personality.extraversion}，宜人性${character.personality.agreeableness}\n` +
    `核心动机：${character.motivation}\n` +
    `要求：对话要符合人物性格，体现其价值观和说话方式，200-300字`;
}
