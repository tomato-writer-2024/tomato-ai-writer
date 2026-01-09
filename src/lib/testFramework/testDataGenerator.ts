/**
 * 测试数据生成器
 * 支持生成千例以上多样化的测试用例
 */

export interface TestCase {
  id: string;
  type: 'generate' | 'continue' | 'polish';
  input: {
    prompt?: string;
    content?: string;
    context?: string;
    characters?: string;
    outline?: string;
    wordCount?: number;
    genre?: string;
  };
  expected: {
    minWordCount: number;
    minCompletionRate: number;
    minQualityScore: number;
  };
  metadata: {
    createdAt: string;
    genre: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

/**
 * 流派配置
 */
const GENRE_CONFIGS = {
  '玄幻': {
    keywords: ['修仙', '法宝', '灵力', '突破', '境界', '渡劫', '飞升'],
    shuangdianTypes: ['打脸', '收获', '突破', '装逼'],
    pacing: 'medium',
  },
  '都市': {
    keywords: ['职场', '富豪', '逆袭', '美女', '装逼', '赚钱', '打脸'],
    shuangdianTypes: ['打脸', '装逼', '收获', '情感'],
    pacing: 'fast',
  },
  '武侠': {
    keywords: ['江湖', '武功', '秘籍', '复仇', '侠义', '门派', '剑法'],
    shuangdianTypes: ['打脸', '突破', '装逼', '情感'],
    pacing: 'slow',
  },
  '历史': {
    keywords: ['权谋', '帝王', '谋士', '战争', '改革', '治国', '朝堂'],
    shuangdianTypes: ['智商', '打脸', '装逼', '收获'],
    pacing: 'slow',
  },
  '科幻': {
    keywords: ['科技', '未来', '宇宙', '外星人', '基因', '机甲', '进化'],
    shuangdianTypes: ['突破', '收获', '智商', '打脸'],
    pacing: 'medium',
  },
  '仙侠': {
    keywords: ['仙尊', '道法', '仙人', '渡劫', '飞升', '灵石', '丹药'],
    shuangdianTypes: ['打脸', '突破', '装逼', '收获'],
    pacing: 'medium',
  },
  '系统': {
    keywords: ['系统', '任务', '奖励', '升级', '金手指', '抽奖', '商城'],
    shuangdianTypes: ['收获', '突破', '装逼', '打脸'],
    pacing: 'fast',
  },
  '重生': {
    keywords: ['重生', '逆袭', '前世', '改变', '复仇', '遗憾', '弥补'],
    shuangdianTypes: ['打脸', '装逼', '收获', '情感'],
    pacing: 'fast',
  },
};

/**
 * 角色模板
 */
const CHARACTER_TEMPLATES = [
  {
    name: '林天',
    type: '主角',
    personality: '沉稳、果断、重情义',
    background: '出身寒微，天赋异禀，屡遭打压',
    ability: '拥有特殊修炼功法或系统',
  },
  {
    name: '萧炎',
    type: '主角',
    personality: '坚韧、不屈、热血',
    background: '天才陨落，遭受家族排挤',
    ability: '拥有神秘老师或异火',
  },
  {
    name: '叶辰',
    type: '主角',
    personality: '冷静、理智、腹黑',
    background: '穿越重生，掌握未来信息',
    ability: '拥有系统或特殊记忆',
  },
];

/**
 * 情节模板
 */
const PLOT_TEMPLATES = [
  {
    type: '打脸',
    description: '主角被轻视→ 展现实力→ 震惊全场',
    scene: '主角参加比武大会，被对手嘲讽，最终碾压对手',
  },
  {
    type: '突破',
    description: '遭遇瓶颈→ 获得机缘→ 实力暴涨',
    scene: '主角在秘境中突破境界，实力翻倍',
  },
  {
    type: '收获',
    description: '探险秘境→ 获得宝物→ 实力提升',
    scene: '主角在遗迹中发现神器或功法',
  },
  {
    type: '装逼',
    description: '展示实力→ 众人震惊→ 获得崇拜',
    scene: '主角公开展示特殊能力，引发轰动',
  },
  {
    type: '情感',
    description: '遇见美女→ 互有好感→ 心动时刻',
    scene: '主角与女主相遇，产生情感纠葛',
  },
  {
    type: '智商',
    description: '展现智谋→ 预判对手→ 完胜而归',
    scene: '主角用计谋击败强敌',
  },
];

/**
 * 生成章节标题
 */
function generateChapterTitle(genre: string, chapterNum: number): string {
  const templates = [
    `第${chapterNum}章 震惊全场`,
    `第${chapterNum}章 实力碾压`,
    `第${chapterNum}章 众人哗然`,
    `第${chapterNum}章 绝境突破`,
    `第${chapterNum}章 获得宝物`,
    `第${chapterNum}章 美女倾心`,
    `第${chapterNum}章 智胜强敌`,
    `第${chapterNum}章 身份曝光`,
    `第${chapterNum}章 惊人底牌`,
    `第${chapterNum}章 轰动全城`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * 生成故事背景
 */
function generateStoryContext(genre: string): string {
  const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS] || GENRE_CONFIGS['玄幻'];
  const contextTemplates = [
    `主角身处${genre}世界，目标是成为最强存在，目前遭遇强敌阻拦，需要展现实力`,
    `在${genre}世界中，主角凭借特殊能力一路逆袭，现在面临重要考验`,
    `${genre}大陆风云变幻，主角在多方势力中周旋，需要展示强大实力`,
    `主角在${genre}修仙之路历经磨难，今日迎来关键一战，必须全力以赴`,
    `${genre}世界中隐藏着无数秘密，主角正在揭开惊天的真相`,
  ];

  return contextTemplates[Math.floor(Math.random() * contextTemplates.length)];
}

/**
 * 生成角色信息
 */
function generateCharacters(genre: string): string {
  const mainChar = CHARACTER_TEMPLATES[Math.floor(Math.random() * CHARACTER_TEMPLATES.length)];
  const plot = PLOT_TEMPLATES[Math.floor(Math.random() * PLOT_TEMPLATES.length)];

  return `
主角：${mainChar.name}
类型：${mainChar.type}
性格：${mainChar.personality}
背景：${mainChar.background}
能力：${mainChar.ability}

当前情节：${plot.type}
场景：${plot.scene}
`.trim();
}

/**
 * 生成章节大纲
 */
function generatePlotOutline(genre: string): string {
  const plot = PLOT_TEMPLATES[Math.floor(Math.random() * PLOT_TEMPLATES.length)];
  return `
章节主线：${plot.description}
核心爽点：${plot.type}
预期效果：读者情绪高涨，期待下章
`.trim();
}

/**
 * 生成测试用例
 */
export function generateTestCases(
  count: number = 1000,
  types: ('generate' | 'continue' | 'polish')[] = ['generate', 'continue', 'polish']
): TestCase[] {
  const testCases: TestCase[] = [];
  const genres = Object.keys(GENRE_CONFIGS);

  for (let i = 0; i < count; i++) {
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const difficulty = Math.random() > 0.7 ? 'hard' : (Math.random() > 0.4 ? 'medium' : 'easy');

    const testCase: TestCase = {
      id: `test_${Date.now()}_${i}`,
      type,
      input: {
        genre,
        wordCount: difficulty === 'hard' ? 2500 : (difficulty === 'medium' ? 2000 : 1500),
      },
      expected: {
        minWordCount: difficulty === 'hard' ? 2400 : (difficulty === 'medium' ? 1900 : 1400),
        minCompletionRate: difficulty === 'hard' ? 90 : (difficulty === 'medium' ? 85 : 80),
        minQualityScore: difficulty === 'hard' ? 9.8 : (difficulty === 'medium' ? 9.5 : 9.0),
      },
      metadata: {
        createdAt: new Date().toISOString(),
        genre,
        difficulty,
      },
    };

    // 根据类型填充输入
    if (type === 'generate') {
      const chapterNum = Math.floor(Math.random() * 100) + 1;
      testCase.input.prompt = generateChapterTitle(genre, chapterNum);
      testCase.input.context = generateStoryContext(genre);
      testCase.input.characters = generateCharacters(genre);
      testCase.input.outline = generatePlotOutline(genre);
    } else if (type === 'continue' || type === 'polish') {
      // 生成一段前文内容
      testCase.input.content = generateSampleContent(genre, 500);
      testCase.input.context = generateStoryContext(genre);
      testCase.input.characters = generateCharacters(genre);
    }

    testCases.push(testCase);
  }

  return testCases;
}

/**
 * 生成示例内容
 */
function generateSampleContent(genre: string, wordCount: number): string {
  const config = GENRE_CONFIGS[genre as keyof typeof GENRE_CONFIGS] || GENRE_CONFIGS['玄幻'];
  let content = '';

  const sentences = [
    `这是一个${genre}世界，实力决定一切`,
    `主角展现实力，震惊全场`,
    `众人难以置信，这怎么可能`,
    `恐怖如斯，太强了`,
    `终于突破，实力暴涨`,
    `获得宝物，心中狂喜`,
    `美女眼中闪过一丝崇拜`,
    `对手颤抖，不敢相信`,
    `主角淡然一笑，碾压全场`,
    `众人哗然，太震撼了`,
  ];

  for (let i = 0; i < wordCount / 20; i++) {
    content += sentences[Math.floor(Math.random() * sentences.length)] + '。';
    if (i % 3 === 0) content += '\n';
  }

  return content;
}

/**
 * 导出测试用例为JSON
 */
export function exportTestCases(testCases: TestCase[]): string {
  return JSON.stringify(testCases, null, 2);
}

/**
 * 从JSON导入测试用例
 */
export function importTestCases(json: string): TestCase[] {
  try {
    return JSON.parse(json) as TestCase[];
  } catch (error) {
    console.error('导入测试用例失败:', error);
    return [];
  }
}
