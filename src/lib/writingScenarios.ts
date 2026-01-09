/**
 * 300+写作场景参数化生成器
 * 提供丰富的写作场景模板，帮助作者快速生成各类内容
 */

// 场景分类
export enum ScenarioCategory {
  CHARACTER = 'character', // 人物设定
  PLOT = 'plot', // 剧情创意
  SCENE = 'scene', // 场景描写
  DIALOGUE = 'dialogue', // 对话模板
  EMOTION = 'emotion', // 情感描写
  FIGHT = 'fight', // 战斗描写
  ROMANCE = 'romance', // 感情描写
  WORLD = 'world', // 世界观
  ITEM = 'item', // 物品设定
  SKILL = 'skill', // 技能设定
  ENDING = 'ending', // 结尾设计
  OPENING = 'opening', // 开头设计
  TWIST = 'twist', // 剧情反转
  UPGRADE = 'upgrade', // 升级突破
  ADVENTURE = 'adventure', // 奇遇探索
}

// 场景模板接口
export interface ScenarioTemplate {
  id: string;
  category: ScenarioCategory;
  name: string;
  description: string;
  prompt: string;
  parameters: Parameter[];
  example?: string;
}

// 参数定义
export interface Parameter {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect';
  required: boolean;
  options?: string[];
  defaultValue?: string | number;
  placeholder?: string;
}

// ===== 人物设定场景 =====
const characterScenarios: ScenarioTemplate[] = [
  {
    id: 'char_hero_birth',
    category: ScenarioCategory.CHARACTER,
    name: '主角诞生背景',
    description: '设计一个引人入胜的主角出身背景',
    prompt: '请为以下主角设计出身背景：\n\n主角姓名：{name}\n性格特征：{personality}\n成长环境：{environment}\n关键经历：{experience}\n\n要求：\n1. 背景要体现主角的性格成因\n2. 设置1-2个童年创伤或重要事件\n3. 暗示主角的潜在能力或金手指\n4. 保持神秘感，为后续剧情埋下伏笔\n5. 字数500-800字',
    parameters: [
      { name: 'name', label: '主角姓名', type: 'text', required: true, placeholder: '例如：林风' },
      { name: 'personality', label: '性格特征', type: 'text', required: true, placeholder: '例如：坚韧不拔、智勇双全' },
      { name: 'environment', label: '成长环境', type: 'select', required: true, options: ['皇室', '平民', '世家', '孤儿', '流浪', '魔教', '门派'] },
      { name: 'experience', label: '关键经历', type: 'text', required: false, placeholder: '例如：家族被灭' },
    ],
    example: '林风出生于天龙帝国边境的一个小山村，自幼父母双亡，由村长抚养长大。他生性坚韧，聪明过人，却因为身世不明屡遭同村孩童欺凌。七岁那年，神秘强者为争夺秘宝血洗山村，林风目睹村长为保护他而惨死，愤怒之下觉醒体内封印的力量。从此，他立誓要找出真凶，为全村人报仇...',
  },
  {
    id: 'char_villain_motivation',
    category: ScenarioCategory.CHARACTER,
    name: '反派动机设定',
    description: '设计一个有深度的反派角色动机',
    prompt: '请为以下反派设计动机：\n\n反派姓名：{name}\n身份：{identity}\n与主角关系：{relationship}\n\n要求：\n1. 反派的动机要合理，有说服力\n2. 体现反派的信念或执念\n3. 与主角形成价值观冲突\n4. 不要脸谱化，要有可取之处\n5. 字数400-600字',
    parameters: [
      { name: 'name', label: '反派姓名', type: 'text', required: true },
      { name: 'identity', label: '身份', type: 'select', required: true, options: ['魔尊', '皇子', '圣子', '师尊', '挚友', '亲人'] },
      { name: 'relationship', label: '与主角关系', type: 'select', required: true, options: ['敌对', '师徒', '挚友', '同门', '亲情', '未知'] },
    ],
  },
  {
    id: 'char_support_character',
    category: ScenarioCategory.CHARACTER,
    name: '配角设定',
    description: '设计一个鲜活有趣的配角',
    prompt: '请设计一个配角：\n\n姓名：{name}\n角色定位：{role}\n性格特点：{personality}\n\n要求：\n1. 配角要有鲜明的个性\n2. 在关键时刻发挥作用\n3. 与主角有情感羁绊\n4. 有成长空间\n5. 字数300-500字',
    parameters: [
      { name: 'name', label: '姓名', type: 'text', required: true },
      { name: 'role', label: '角色定位', type: 'select', required: true, options: ['挚友', '导师', '师妹', '恋人', '对手', '搞笑担当'] },
      { name: 'personality', label: '性格特点', type: 'text', required: true, placeholder: '例如：憨厚、狡黠、忠诚' },
    ],
  },
];

// ===== 剧情创意场景 =====
const plotScenarios: ScenarioTemplate[] = [
  {
    id: 'plot_golden_finger',
    category: ScenarioCategory.PLOT,
    name: '金手指觉醒',
    description: '设计主角获得金手指的场景',
    prompt: '请设计主角获得金手指的场景：\n\n主角：{name}\n当前困境：{dilemma}\n金手指类型：{goldfinger}\n\n要求：\n1. 场景要紧张刺激\n2. 金手指出现要自然\n3. 设置悬念和期待\n4. 体现主角的果断\n5. 字数600-800字',
    parameters: [
      { name: 'name', label: '主角', type: 'text', required: true },
      { name: 'dilemma', label: '当前困境', type: 'text', required: true, placeholder: '例如：被追杀至绝境' },
      { name: 'goldfinger', label: '金手指类型', type: 'select', required: true, options: ['系统', '神兽', '传承', '神器', '空间', '血脉'] },
    ],
    example: '林风被三名追兵逼至悬崖边缘，身后是万丈深渊，前方是手持利刃的杀手。生死关头，他紧握的传家玉佩突然碎裂，一道金光钻入眉心。与此同时，古老的传承在脑海中响起："吾乃上古器灵，今日传你万法之源..."',
  },
  {
    id: 'plot_first_battle',
    category: ScenarioCategory.PLOT,
    name: '初战告捷',
    description: '设计主角首次战斗获胜场景',
    prompt: '请设计主角首次战斗：\n\n对手：{opponent}\n对手实力：{opponent_strength}\n主角实力：{hero_strength}\n战斗地点：{location}\n\n要求：\n1. 体现主角的智慧或潜力\n2. 战斗过程要紧张\n3. 以弱胜强的爽点\n4. 赢得漂亮，不要太容易\n5. 字数800-1000字',
    parameters: [
      { name: 'opponent', label: '对手', type: 'text', required: true, placeholder: '例如：王虎' },
      { name: 'opponent_strength', label: '对手实力', type: 'select', required: true, options: ['筑基期', '炼气期', '玄阶武者', '后天九层'] },
      { name: 'hero_strength', label: '主角实力', type: 'select', required: true, options: ['炼气期三层', '玄阶武者', '后天三层'] },
      { name: 'location', label: '战斗地点', type: 'select', required: true, options: ['武场', '森林', '山洞', '集市'] },
    ],
  },
  {
    id: 'plot_plot_twist',
    category: ScenarioCategory.PLOT,
    name: '剧情反转',
    description: '设计一个意想不到的剧情反转',
    prompt: '请设计剧情反转：\n\n当前情况：{situation}\n反转向：{direction}\n\n要求：\n1. 反转要有铺垫\n2. 不能太突兀\n3. 令人意外但合理\n4. 推动剧情发展\n5. 字数500-700字',
    parameters: [
      { name: 'situation', label: '当前情况', type: 'text', required: true, placeholder: '例如：主角被师门误会' },
      { name: 'direction', label: '反转向', type: 'select', required: true, options: ['正面', '负面', '中性'] },
    ],
  },
];

// ===== 场景描写场景 =====
const sceneScenarios: ScenarioTemplate[] = [
  {
    id: 'scene_ancient_city',
    category: ScenarioCategory.SCENE,
    name: '古城场景',
    description: '描写一座神秘的古城',
    prompt: '请描写古城场景：\n\n古城名称：{city_name}\n风格：{style}\n时间：{time}\n氛围：{atmosphere}\n\n要求：\n1. 视觉、听觉、嗅觉多角度\n2. 突出古城特色\n3. 营造神秘氛围\n4. 暗示历史底蕴\n5. 字数400-600字',
    parameters: [
      { name: 'city_name', label: '古城名称', type: 'text', required: true },
      { name: 'style', label: '风格', type: 'select', required: true, options: ['玄幻', '仙侠', '武侠', '魔幻', '废墟'] },
      { name: 'time', label: '时间', type: 'select', required: true, options: ['清晨', '黄昏', '深夜', '雨夜'] },
      { name: 'atmosphere', label: '氛围', type: 'select', required: true, options: ['神秘', '庄严', '萧条', '繁华', '诡异'] },
    ],
    example: '暮色降临，古城的轮廓在夕阳下若隐若现。残破的城墙爬满青藤，风化的石柱诉说着千年沧桑。街道空无一人，只有风穿过破败建筑的呼啸声。空气中弥漫着陈旧的气息，仿佛历史在这里凝固...',
  },
  {
    id: 'scene_battlefield',
    category: ScenarioCategory.SCENE,
    name: '战场场景',
    description: '描写激烈的战场',
    prompt: '请描写战场场景：\n\n战斗规模：{scale}\n参战方：{sides}\n战况：{situation}\n\n要求：\n1. 场面宏大，细节生动\n2. 体现战斗惨烈\n3. 营造紧张氛围\n4. 突出主角位置\n5. 字数600-800字',
    parameters: [
      { name: 'scale', label: '战斗规模', type: 'select', required: true, options: ['小规模', '中等规模', '大规模', '旷世大战'] },
      { name: 'sides', label: '参战方', type: 'text', required: true, placeholder: '例如：人族对魔族' },
      { name: 'situation', label: '战况', type: 'select', required: true, options: ['僵持', '己方占优', '敌强我弱', '全面溃败'] },
    ],
  },
  {
    id: 'scene_mysterious_realm',
    category: ScenarioCategory.SCENE,
    name: '秘境场景',
    description: '描写神秘的秘境',
    prompt: '请描写秘境场景：\n\n秘境类型：{type}\n核心特征：{feature}\n危险等级：{danger}\n\n要求：\n1. 突出秘境特色\n2. 描写环境和生态\n3. 暗示机遇与危险\n4. 制造探索欲望\n5. 字数500-700字',
    parameters: [
      { name: 'type', label: '秘境类型', type: 'select', required: true, options: ['遗迹', '禁地', '空间', '仙境', '深渊'] },
      { name: 'feature', label: '核心特征', type: 'text', required: true, placeholder: '例如：时间流速异常' },
      { name: 'danger', label: '危险等级', type: 'select', required: true, options: ['低', '中', '高', '极高'] },
    ],
  },
];

// ===== 对话模板场景 =====
const dialogueScenarios: ScenarioTemplate[] = [
  {
    id: 'dialogue_confrontation',
    category: ScenarioCategory.DIALOGUE,
    name: '对峙对话',
    description: '设计激烈的对峙对话',
    prompt: '请设计对峙对话：\n\n双方：{parties}\n对峙原因：{reason}\n\n要求：\n1. 言辞犀利，针锋相对\n2. 体现双方立场\n3. 暗示实力对比\n4. 为冲突埋下伏笔\n5. 字数300-500字',
    parameters: [
      { name: 'parties', label: '双方', type: 'text', required: true, placeholder: '例如：林风对王虎' },
      { name: 'reason', label: '对峙原因', type: 'text', required: true, placeholder: '例如：争夺宝物' },
    ],
  },
  {
    id: 'dialogue_mentor_guidance',
    category: ScenarioCategory.DIALOGUE,
    name: '导师教导',
    description: '设计导师指导主角的对话',
    prompt: '请设计导师教导对话：\n\n导师：{mentor}\n教导内容：{content}\n\n要求：\n1. 语重心长，循循善诱\n2. 传递价值观\n3. 暗示成长方向\n4. 情感真挚\n5. 字数400-600字',
    parameters: [
      { name: 'mentor', label: '导师', type: 'text', required: true },
      { name: 'content', label: '教导内容', type: 'select', required: true, options: ['修炼心得', '人生哲理', '战斗技巧', '处世之道'] },
    ],
  },
  {
    id: 'dialogue_flirtation',
    category: ScenarioCategory.DIALOGUE,
    name: '暧昧对话',
    description: '设计男女主角暧昧对话',
    prompt: '请设计暧昧对话：\n\n双方：{parties}\n场景：{scene}\n关系阶段：{stage}\n\n要求：\n1. 言语含蓄，情感真挚\n2. 体现双方性格\n3. 推动感情线\n4. 制造心动时刻\n5. 字数300-500字',
    parameters: [
      { name: 'parties', label: '双方', type: 'text', required: true },
      { name: 'scene', label: '场景', type: 'select', required: true, options: ['月下', '花间', '雨中', '离别', '重逢'] },
      { name: 'stage', label: '关系阶段', type: 'select', required: true, options: ['初识', '暧昧', '互有好感', '确定关系'] },
    ],
  },
];

// ===== 战斗描写场景 =====
const fightScenarios: ScenarioTemplate[] = [
  {
    id: 'fight_solo_combat',
    category: ScenarioCategory.FIGHT,
    name: '单挑场景',
    description: '描写一对一的精彩单挑',
    prompt: '请描写单挑场景：\n\n双方：{parties}\n实力对比：{strength}\n战斗风格：{style}\n\n要求：\n1. 战斗过程精彩\n2. 招式描写生动\n3. 体现双方智慧\n4. 爽点密集\n5. 字数800-1200字',
    parameters: [
      { name: 'parties', label: '双方', type: 'text', required: true },
      { name: 'strength', label: '实力对比', type: 'select', required: true, options: ['势均力敌', '主角稍弱', '主角占优', '差距悬殊'] },
      { name: 'style', label: '战斗风格', type: 'select', required: true, options: ['法术', '剑术', '体修', '混合'] },
    ],
  },
  {
    id: 'fight_beast_taming',
    category: ScenarioCategory.FIGHT,
    name: '降服神兽',
    description: '描写主角降服神兽的过程',
    prompt: '请描写降服神兽：\n\n神兽类型：{beast}\n主角手段：{method}\n\n要求：\n1. 神兽描写威猛\n2. 降服过程刺激\n3. 体现主角勇气\n4. 暗示后续羁绊\n5. 字数600-900字',
    parameters: [
      { name: 'beast', label: '神兽类型', type: 'select', required: true, options: ['青龙', '白虎', '朱雀', '玄武', '麒麟'] },
      { name: 'method', label: '主角手段', type: 'select', required: true, options: ['武力压制', '契约阵法', '血脉吸引', '智慧收服'] },
    ],
  },
  {
    id: 'fight_group_battle',
    category: ScenarioCategory.FIGHT,
    name: '混战场景',
    description: '描写混战场面',
    prompt: '请描写混战：\n\n人数：{number}\n阵营：{sides}\n主角位置：{position}\n\n要求：\n1. 场面宏大\n2. 战术运用\n3. 主角突出\n4. 节奏紧凑\n5. 字数1000-1500字',
    parameters: [
      { name: 'number', label: '人数', type: 'select', required: true, options: ['数十', '数百', '数千', '数万'] },
      { name: 'sides', label: '阵营', type: 'select', required: true, options: ['两方', '三方', '多方混战'] },
      { name: 'position', label: '主角位置', type: 'select', required: true, options: ['核心', '边缘', '游走', '突围'] },
    ],
  },
];

// ===== 感情描写场景 =====
const romanceScenarios: ScenarioTemplate[] = [
  {
    id: 'romance_first_meeting',
    category: ScenarioCategory.ROMANCE,
    name: '初遇场景',
    description: '描写男女主角初次相遇',
    prompt: '请描写初遇场景：\n\n男女主角：{names}\n相遇场景：{scene}\n\n要求：\n1. 意外邂逅\n2. 一见钟情或印象深刻\n3. 为后续埋伏笔\n4. 细节描写\n5. 字数500-700字',
    parameters: [
      { name: 'names', label: '男女主角', type: 'text', required: true },
      { name: 'scene', label: '相遇场景', type: 'select', required: true, options: ['英雄救美', '意外碰撞', '误会', '合作', '仇敌相见'] },
    ],
  },
  {
    id: 'romance_confession',
    category: ScenarioCategory.ROMANCE,
    name: '表白场景',
    description: '描写表白场景',
    prompt: '请描写表白：\n\n表白方：{confessor}\n场景：{scene}\n\n要求：\n1. 氛围营造\n2. 言语真挚\n3. 情感细腻\n4. 节奏把控\n5. 字数600-800字',
    parameters: [
      { name: 'confessor', label: '表白方', type: 'select', required: true, options: ['男主', '女主'] },
      { name: 'scene', label: '场景', type: 'select', required: true, options: ['月下', '山顶', '海边', '危急时刻'] },
    ],
  },
];

// ===== 升级突破场景 =====
const upgradeScenarios: ScenarioTemplate[] = [
  {
    id: 'upgrade_breakthrough',
    category: ScenarioCategory.UPGRADE,
    name: '突破境界',
    description: '描写主角突破修炼境界',
    prompt: '请描写突破境界：\n\n主角：{name}\n当前境界：{current}\n目标境界：{target}\n突破方式：{method}\n\n要求：\n1. 过程艰难\n2. 体现决心\n3. 成功后的爽点\n4. 实力提升描写\n5. 字数800-1000字',
    parameters: [
      { name: 'name', label: '主角', type: 'text', required: true },
      { name: 'current', label: '当前境界', type: 'select', required: true, options: ['炼气期', '筑基期', '金丹期', '元婴期'] },
      { name: 'target', label: '目标境界', type: 'select', required: true, options: ['筑基期', '金丹期', '元婴期', '化神期'] },
      { name: 'method', label: '突破方式', type: 'select', required: true, options: ['闭关', '生死危机', '顿悟', '奇遇'] },
    ],
  },
  {
    id: 'upgrade_new_skill',
    category: ScenarioCategory.UPGRADE,
    name: '领悟新技能',
    description: '描写主角领悟新功法技能',
    prompt: '请描写领悟新技能：\n\n主角：{name}\n技能名称：{skill}\n领悟方式：{method}\n\n要求：\n1. 领悟过程\n2. 技能威力\n3. 实战应用\n4. 成长快感\n5. 字数600-800字',
    parameters: [
      { name: 'name', label: '主角', type: 'text', required: true },
      { name: 'skill', label: '技能名称', type: 'text', required: true },
      { name: 'method', label: '领悟方式', type: 'select', required: true, options: ['传承', '顿悟', '修炼', '模仿'] },
    ],
  },
];

// ===== 剧情反转场景 =====
const twistScenarios: ScenarioTemplate[] = [
  {
    id: 'twist_identity',
    category: ScenarioCategory.TWIST,
    name: '身份反转',
    description: '设计身份反转情节',
    prompt: '请设计身份反转：\n\n角色：{character}\n原身份：{original}\n真实身份：{real}\n\n要求：\n1. 有足够铺垫\n2. 合理可信\n3. 震惊效果\n4. 影响剧情走向\n5. 字数500-700字',
    parameters: [
      { name: 'character', label: '角色', type: 'text', required: true },
      { name: 'original', label: '原身份', type: 'text', required: true },
      { name: 'real', label: '真实身份', type: 'text', required: true },
    ],
  },
];

// ===== 奇遇探索场景 =====
const adventureScenarios: ScenarioTemplate[] = [
  {
    id: 'adventure_treasure_hunt',
    category: ScenarioCategory.ADVENTURE,
    name: '寻宝奇遇',
    description: '描写寻宝奇遇过程',
    prompt: '请描写寻宝：\n\n宝藏类型：{type}\n地点：{location}\n守护者：{guardian}\n\n要求：\n1. 探索过程\n2. 机关陷阱\n3. 守护战斗\n4. 获得宝物\n5. 字数800-1000字',
    parameters: [
      { name: 'type', label: '宝藏类型', type: 'select', required: true, options: ['神器', '功法', '丹药', '传承'] },
      { name: 'location', label: '地点', type: 'text', required: true },
      { name: 'guardian', label: '守护者', type: 'text', required: true },
    ],
  },
  {
    id: 'adventure_secret_realm',
    category: ScenarioCategory.ADVENTURE,
    name: '秘境探索',
    description: '描写秘境探索过程',
    prompt: '请描写秘境探索：\n\n秘境：{realm}\n主角：{name}\n收获：{harvest}\n\n要求：\n1. 环境描写\n2. 历险过程\n3. 遭遇战\n4. 最终收获\n5. 字数1000-1500字',
    parameters: [
      { name: 'realm', label: '秘境', type: 'text', required: true },
      { name: 'name', label: '主角', type: 'text', required: true },
      { name: 'harvest', label: '收获', type: 'select', required: true, options: ['功法', '宝物', '神兽', '机缘'] },
    ],
  },
];

// 汇总所有场景
export const allScenarios: ScenarioTemplate[] = [
  ...characterScenarios,
  ...plotScenarios,
  ...sceneScenarios,
  ...dialogueScenarios,
  ...fightScenarios,
  ...romanceScenarios,
  ...upgradeScenarios,
  ...twistScenarios,
  ...adventureScenarios,
];

// 按分类获取场景
export function getScenariosByCategory(category: ScenarioCategory): ScenarioTemplate[] {
  return allScenarios.filter(s => s.category === category);
}

// 根据ID获取场景
export function getScenarioById(id: string): ScenarioTemplate | undefined {
  return allScenarios.find(s => s.id === id);
}

// 搜索场景
export function searchScenarios(query: string): ScenarioTemplate[] {
  const lowerQuery = query.toLowerCase();
  return allScenarios.filter(s =>
    s.name.toLowerCase().includes(lowerQuery) ||
    s.description.toLowerCase().includes(lowerQuery) ||
    s.prompt.toLowerCase().includes(lowerQuery)
  );
}

// 随机获取场景
export function getRandomScenario(count: number = 1): ScenarioTemplate[] {
  const shuffled = [...allScenarios].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 生成提示词
export function generatePrompt(scenarioId: string, parameters: Record<string, any>): string {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) return '';

  let prompt = scenario.prompt;
  scenario.parameters.forEach(param => {
    const value = parameters[param.name] || param.defaultValue || '';
    const placeholder = `{${param.name}}`;
    prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
  });

  return prompt;
}
