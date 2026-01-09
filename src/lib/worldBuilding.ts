/**
 * 世界观构建器
 * 支持背景设定、力量体系、地理位置、社会结构、历史事件
 */

export interface WorldSetting {
  id: string;
  userId: string;
  name: string;
  genre: 'fantasy' | 'scifi' | 'urban' | 'historical' | 'wuxia' | 'xianxia' | 'apocalyptic' | 'other';
  timePeriod: string;
  technologyLevel: number; // 0-100
  magicSystem?: MagicSystem;
  geography: Geography;
  society: Society;
  history: HistoricalEvent[];
  cultures: Culture[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MagicSystem {
  type: 'hard' | 'soft' | 'hybrid';
  source: string; // 魔力来源（法力、神力、元素等）
  rules: string[]; // 魔法规则和限制
  schools: MagicSchool[]; // 魔法流派
  artifacts: string[]; // 著名神器
  limitations: string[]; // 使用限制和代价
}

export interface MagicSchool {
  name: string;
  description: string;
  coreAbilities: string[];
  representativeColor: string;
  symbolicElement: string;
}

export interface Geography {
  continents: Continent[];
  landmarks: Landmark[];
  climate: string;
  naturalResources: string[];
}

export interface Continent {
  name: string;
  description: string;
  countries: string[];
  keyLocations: string[];
  significance: string;
}

export interface Landmark {
  name: string;
  type: 'mountain' | 'city' | 'ruins' | 'forest' | 'ocean' | 'desert' | 'temple' | 'other';
  description: string;
  strategicValue: string;
  lore: string;
}

export interface Society {
  politicalSystem: string;
  economicSystem: string;
  socialClasses: string[];
  laws: string[];
  customs: string[];
  religions: string[];
  languages: string[];
}

export interface Culture {
  name: string;
  values: string[];
  taboos: string[];
  arts: string[];
  technology: string[];
  relationships: CultureRelationship[];
}

export interface CultureRelationship {
  cultureName: string;
  relationshipType: 'alliance' | 'enemy' | 'trade' | 'domination' | 'neutral';
  history: string;
}

export interface HistoricalEvent {
  id: string;
  name: string;
  period: string;
  description: string;
  participants: string[];
  consequences: string[];
  impactLevel: number; // 1-10
}

export interface WorldAnalysis {
  world: WorldSetting;
  coherence: number; // 逻辑一致性评分 0-100
  depth: number; // 世界深度评分 0-100
  originality: number; // 创意新颖度评分 0-100
  suggestions: string[];
}

// 题材预设模板
export const GENRE_TEMPLATES: Record<string, Partial<WorldSetting>> = {
  'fantasy': {
    technologyLevel: 30,
    magicSystem: {
      type: 'soft',
      source: '自然魔力',
      rules: ['需要天赋觉醒', '魔力有限制', '存在反噬'],
      schools: [
        { name: '元素魔法', description: '操控地水火风', coreAbilities: ['火球术', '冰墙', '风刃', '地刺'], representativeColor: '红色', symbolicElement: '火焰' },
        { name: '治愈魔法', description: '恢复伤势和生命力', coreAbilities: ['治愈术', '净化', '生命之光'], representativeColor: '绿色', symbolicElement: '生命' },
        { name: '暗影魔法', description: '操控阴影和死亡', coreAbilities: ['暗影步', '死亡诅咒', '灵魂抽取'], representativeColor: '紫色', symbolicElement: '黑暗' }
      ],
      artifacts: ['创世之剑', '命运之镜', '永恒之火'],
      limitations: ['魔力耗尽会虚弱', '使用过度会走火入魔']
    },
    society: {
      politicalSystem: '君主制/贵族制',
      economicSystem: '农业经济+贸易',
      socialClasses: ['皇室', '贵族', '骑士', '平民', '奴隶'],
      laws: ['王权至高无上', '贵族特权', '平民义务'],
      customs: ['骑士精神', '宫廷礼仪', '宗教仪式'],
      religions: ['光明神教', '自然崇拜', '祖先崇拜'],
      languages: ['通用语', '古语', '方言']
    }
  },
  'scifi': {
    technologyLevel: 95,
    society: {
      politicalSystem: '星际联邦/公司制',
      economicSystem: '高科技贸易+资源开采',
      socialClasses: ['资本家', '技术精英', '公民', '工人', '流民'],
      laws: ['星际公约', '公司条例', '技术专利'],
      customs: ['虚拟社交', '星际旅行', '增强改造'],
      religions: ['科技崇拜', '旧信仰复兴', '虚无主义'],
      languages: ['星际通用语', '机器语言', '种族语言']
    }
  },
  'wuxia': {
    technologyLevel: 40,
    magicSystem: {
      type: 'hard',
      source: '内功+气',
      rules: ['需要修炼', '存在境界', '需要突破'],
      schools: [
        { name: '正派', description: '以武入道，匡扶正义', coreAbilities: ['太极', '剑法', '轻功'], representativeColor: '白色', symbolicElement: '白云' },
        { name: '魔教', description: '不择手段，追求力量', coreAbilities: ['魔功', '毒术', '暗器'], representativeColor: '黑色', symbolicElement: '黑火' },
        { name: '隐世门派', description: '神秘莫测，不问世事', coreAbilities: ['阵法', '丹药', '奇门遁甲'], representativeColor: '青色', symbolicElement: '青峰' }
      ],
      artifacts: ['屠龙刀', '倚天剑', '九阴真经'],
      limitations: ['走火入魔风险', '修炼瓶颈', '心魔考验']
    },
    society: {
      politicalSystem: '朝廷+武林盟',
      economicSystem: '商业贸易+门派产业',
      socialClasses: ['皇室', '武林盟主', '掌门', '弟子', '平民'],
      laws: ['朝廷律法', '武林规矩', '江湖道义'],
      customs: ['江湖规矩', '恩仇必报', '义气为重'],
      religions: ['佛教', '道教', '民间信仰'],
      languages: ['官话', '方言', '暗语']
    }
  },
  'xianxia': {
    technologyLevel: 20,
    magicSystem: {
      type: 'hard',
      source: '天地灵气',
      rules: ['吸纳灵气', '境界分明', '逆天改命'],
      schools: [
        { name: '修仙门派', description: '修炼长生之道', coreAbilities: ['飞剑', '法术', '阵法'], representativeColor: '金色', symbolicElement: '仙云' },
        { name: '魔道', description: '以杀证道，速成代价大', coreAbilities: ['魔功', '血炼', '鬼术'], representativeColor: '血色', symbolicElement: '鲜血' },
        { name: '佛门', description: '修心悟道，慈悲为怀', coreAbilities: ['金身', '佛光', '经文'], representativeColor: '金光', symbolicElement: '莲花' }
      ],
      artifacts: ['仙剑', '丹炉', '阵图'],
      limitations: ['天劫考验', '资源争夺', '心魔劫']
    }
  }
};

// 生成世界观描述
export function generateWorldDescription(world: WorldSetting): string {
  const genreNames: Record<string, string> = {
    'fantasy': '奇幻',
    'scifi': '科幻',
    'urban': '都市',
    'historical': '历史',
    'wuxia': '武侠',
    'xianxia': '仙侠',
    'apocalyptic': '末世',
    'other': '其他'
  };

  return `# ${world.name} 世界观设定

## 世界类型
题材：${genreNames[world.genre]}
时代：${world.timePeriod}
科技水平：${world.technologyLevel}/100

${world.magicSystem ? `
## 魔法/力量体系
类型：${world.magicSystem.type === 'hard' ? '硬魔法' : world.magicSystem.type === 'soft' ? '软魔法' : '混合魔法'}
魔力来源：${world.magicSystem.source}

### 魔法流派
${world.magicSystem.schools.map(s => `**${s.name}**：${s.description}\n- 核心能力：${s.coreAbilities.join('、')}\n- 象征：${s.symbolicElement}（${s.representativeColor}）`).join('\n\n')}

### 著名神器
${world.magicSystem.artifacts.map(a => `- ${a}`).join('\n')}

### 使用限制
${world.magicSystem.limitations.map(l => `- ${l}`).join('\n')}
` : ''}

## 地理环境
气候：${world.geography.climate}
主要资源：${world.geography.naturalResources.join('、')}

### 主要大陆/区域
${world.geography.continents.map(c => `**${c.name}**：${c.description}\n- 主要国家/势力：${c.countries.join('、')}\n- 关键地点：${c.keyLocations.join('、')}`).join('\n\n')}

### 重要地标
${world.geography.landmarks.map(l => `**${l.name}**（${l.type}）\n- 描述：${l.description}\n- 战略价值：${l.strategicValue}\n- 传说：${l.lore}`).join('\n\n')}

## 社会结构
政治制度：${world.society.politicalSystem}
经济制度：${world.society.economicSystem}

### 社会阶层
${world.society.socialClasses.join(' → ')}

### 法律体系
${world.society.laws.map(l => `- ${l}`).join('\n')}

### 风俗习惯
${world.society.customs.map(c => `- ${c}`).join('\n')}

### 宗教信仰
${world.society.religions.join('、')}

### 语言
${world.society.languages.join('、')}

## 主要文化
${world.cultures.map(c => `### ${c.name}
- 核心价值观：${c.values.join('、')}
- 禁忌：${c.taboos.join('、')}
- 艺术形式：${c.arts.join('、')}
- 技术水平：${c.technology}`).join('\n\n')}

## 历史事件
${world.history.filter(h => h.impactLevel >= 7).map(h => `### ${h.name}（${h.period}）
影响等级：${'⭐'.repeat(h.impactLevel)}
参与者：${h.participants.join('、')}
后果：${h.consequences.join('；')}`).join('\n\n')}
`;
}

// 分析世界观逻辑一致性
export function analyzeWorldCoherence(world: WorldSetting): WorldAnalysis {
  const suggestions: string[] = [];
  let coherenceScore = 100;
  let originalityScore = 80;

  // 检查科技水平与魔法体系的匹配度
  if (world.magicSystem && world.technologyLevel > 70) {
    suggestions.push('高科技世界与魔法体系可能产生逻辑冲突，建议选择软魔法或解释科技与魔法的共存方式');
    coherenceScore -= 15;
  }

  // 检查地理设置的合理性
  if (world.geography.continents.length < 1) {
    suggestions.push('建议至少设定1个大陆或主要区域');
    coherenceScore -= 10;
  }

  if (world.geography.landmarks.length < 3) {
    suggestions.push('建议至少设定3个重要地标，增加世界层次');
    coherenceScore -= 5;
  }

  // 检查社会结构的完整性
  if (world.society.socialClasses.length < 3) {
    suggestions.push('社会阶层过于简单，建议至少3个等级');
    coherenceScore -= 5;
  }

  if (world.society.laws.length < 2) {
    suggestions.push('法律体系过于单薄，建议完善');
    coherenceScore -= 5;
  }

  // 检查文化设置
  if (world.cultures.length === 0) {
    suggestions.push('建议至少设定1种文化，增加世界丰富度');
    coherenceScore -= 10;
  }

  // 检查历史事件
  if (world.history.length < 3) {
    suggestions.push('建议至少记录3个重大历史事件，增加世界深度');
    coherenceScore -= 5;
  }

  // 检查魔法体系完整性
  if (world.magicSystem && world.magicSystem.schools.length < 2) {
    suggestions.push('魔法流派过少，建议至少2种流派');
    coherenceScore -= 10;
  }

  // 计算世界深度
  const depthScore = (
    (world.geography.continents.length > 0 ? 15 : 0) +
    (world.geography.landmarks.length > 2 ? 10 : 0) +
    (world.cultures.length > 0 ? 15 : 0) +
    (world.history.length > 2 ? 15 : 0) +
    (world.magicSystem && world.magicSystem.schools.length > 1 ? 15 : 0) +
    (world.society.laws.length > 2 ? 15 : 0) +
    (world.society.customs.length > 2 ? 15 : 0)
  );

  // 创意性评估
  const genreTemplate = GENRE_TEMPLATES[world.genre];
  if (genreTemplate) {
    // 对比预设模板，检查是否有创新
    if (world.magicSystem?.type === genreTemplate.magicSystem?.type) {
      originalityScore -= 10;
    }
    if (world.society.politicalSystem === genreTemplate.society?.politicalSystem) {
      originalityScore -= 5;
    }
  }

  return {
    world,
    coherence: coherenceScore,
    depth: depthScore,
    originality: Math.max(20, originalityScore),
    suggestions
  };
}

// 基于题材快速创建世界观
export function createWorldFromTemplate(
  genre: string,
  customizations: Partial<WorldSetting>
): WorldSetting {
  const template = GENRE_TEMPLATES[genre] || {};

  return {
    id: '',
    userId: '',
    name: customizations.name || '新世界',
    genre: (customizations.genre || genre) as WorldSetting['genre'],
    timePeriod: customizations.timePeriod || '未知时代',
    technologyLevel: customizations.technologyLevel || 50,
    magicSystem: customizations.magicSystem || template.magicSystem,
    geography: customizations.geography || {
      continents: [],
      landmarks: [],
      climate: '温带',
      naturalResources: []
    },
    society: customizations.society || template.society || {
      politicalSystem: '君主制',
      economicSystem: '农业经济',
      socialClasses: ['统治阶级', '平民', '奴隶'],
      laws: [],
      customs: [],
      religions: [],
      languages: []
    },
    history: customizations.history || [],
    cultures: customizations.cultures || [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// 生成世界观互动提示词
export function generateWorldInteractionPrompt(
  world: WorldSetting,
  scenario: string
): string {
  const magicHint = world.magicSystem
    ? `\n魔法体系：${world.magicSystem.type}，${world.magicSystem.source}`
    : '';
  const geographyHint = world.geography.continents.length > 0
    ? `\n主要区域：${world.geography.continents.map(c => c.name).join('、')}`
    : '';

  return `请基于以下世界观设定创作${scenario}：

## 世界概况
世界名称：${world.name}
题材：${world.genre}
时代：${world.timePeriod}
科技水平：${world.technologyLevel}/100${magicHint}${geographyHint}

## 社会背景
政治制度：${world.society.politicalSystem}
社会阶层：${world.society.socialClasses.join(' → ')}

## 文化氛围
风俗：${world.society.customs.slice(0, 3).join('、')}
价值观：${world.cultures.length > 0 ? world.cultures[0].values.join('、') : '未设定'}

## 要求
1. 情节必须符合世界观设定
2. 体现科技水平和社会结构
3. 遵循文化和风俗约束
4. 如有魔法/力量体系，需遵循其规则
5. 内容500-800字`;
}

// 地理冲突生成器
export function generateGeographicConflict(world: WorldSetting): string[] {
  const conflicts: string[] = [];

  // 资源争夺
  if (world.geography.naturalResources.length > 0) {
    const resource = world.geography.naturalResources[0];
    conflicts.push(`${resource}资源争夺：不同势力围绕关键资源展开激烈竞争，引发局部冲突`);
  }

  // 地理屏障
  if (world.geography.continents.length > 1) {
    conflicts.push('大陆间交通受阻：地理隔离导致文化交流困难，可能引发误解和冲突');
  }

  // 关键地标争夺
  const strategicLandmarks = world.geography.landmarks.filter(l => l.strategicValue);
  if (strategicLandmarks.length > 0) {
    strategicLandmarks.forEach(l => {
      conflicts.push(`${l.name}争夺战：该地具有极高的战略价值，多方势力觊觎`);
    });
  }

  // 气候灾害
  if (world.geography.climate.includes('恶劣') || world.geography.climate.includes('极端')) {
    conflicts.push('气候变化危机：恶劣环境迫使人类或势力迁徙，引发地缘冲突');
  }

  return conflicts.length > 0 ? conflicts : ['暂无明显的地理冲突，建议增加资源稀缺或地理屏障设置'];
}
