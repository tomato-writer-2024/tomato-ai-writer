/**
 * 多平台适配系统
 * 支持起点、晋江、知乎、番茄等多个网文平台的风格适配
 */

// ============================================================================
// 平台信息
// ============================================================================

export interface PlatformInfo {
  id: string;
  name: string;
  company: string;
  monetization: string;
  audience: string;
  features: string[];
  hotGenres: GenreInfo[];
  reviewStandards: ReviewStandards;
  submissionGuide: SubmissionGuide;
}

export interface GenreInfo {
  name: string;
  tags: string[];
  features: string;
  target: string;
  avgLength: string;
  popularElements: string[];
}

export interface ReviewStandards {
  basic: string[];
  content: string[];
  commercial: string[];
  platform: string[];
}

export interface SubmissionGuide {
  conditions: string[];
  benefits: string[];
  process: string[];
}

// ============================================================================
// 平台配置
// ============================================================================

export const PLATFORMS: Record<string, PlatformInfo> = {
  // ============ 番茄小说 ============
  tomato: {
    id: 'tomato',
    name: '番茄小说',
    company: '字节跳动',
    monetization: '免费阅读+广告+会员',
    audience: '年轻读者群体，偏爱爽文、快节奏、强代入感',
    features: [
      '算法推荐为主，完读率影响流量',
      '日更要求高，稳定更新是关键',
      '首章完读率60%以上更容易推荐',
      '签约门槛相对较低，适合新人',
      '免费阅读模式，读者粘性高',
    ],
    hotGenres: [
      {
        name: '都市爽文',
        tags: ['都市', '重生', '逆袭', '系统', '神医', '首富'],
        features: '快节奏、强爽点、打脸装逼',
        target: '18-35岁男性读者',
        avgLength: '100-200万字',
        popularElements: ['重生复仇', '系统金手指', '神医医术', '首富之路', '打脸爽文'],
      },
      {
        name: '玄幻爽文',
        tags: ['玄幻', '修仙', '升级', '打怪', '争霸'],
        features: '升级流、快节奏、热血爽文',
        target: '15-30岁男性读者',
        avgLength: '200-300万字',
        popularElements: ['废柴逆袭', '戒指老爷爷', '金手指', '打脸升级', '争霸天下'],
      },
      {
        name: '甜宠文',
        tags: ['甜宠', '言情', '总裁', '豪门', '宠妻'],
        features: '甜度爆表、宠溺无度、幸福日常',
        target: '16-35岁女性读者',
        avgLength: '50-100万字',
        popularElements: ['总裁宠妻', '豪门甜宠', '一见钟情', '甜宠日常', '宠溺无度'],
      },
    ],
    reviewStandards: {
      basic: [
        '原创度90%以上',
        '格式规范，标点正确',
        '逻辑连贯，不前后矛盾',
        '语句通顺，阅读流畅',
      ],
      content: [
        '节奏明快，不拖沓',
        '爽点密集，每章至少1个爽点',
        '开头吸引人，3章内有小高潮',
        '情绪饱满，代入感强',
      ],
      commercial: [
        '符合市场热点',
        '有独特卖点',
        '结构完整，情节饱满',
        '有爆款潜力',
      ],
      platform: [
        '首章完读率60%+',
        '日更2-4章，每章2000-3000字',
        '稳定更新，不断更',
        '积极回复读者评论',
      ],
    },
    submissionGuide: {
      conditions: [
        '10万字以上可申请签约',
        '质量评分80分以上',
        '稳定更新30天以上',
        '读者好评率70%以上',
      ],
      benefits: [
        '全勤奖：日更4000字，每月1200-2000元',
        '分成比例：作者50%，平台50%',
        '推荐资源：签约作品优先推荐',
        '编辑指导：专业编辑一对一指导',
      ],
      process: [
        '准备作品：完成10万字以上',
        '提交申请：填写基本信息',
        '审核等待：等待编辑审核',
        '签约洽谈：洽谈签约细节',
        '正式签约：签署合同',
      ],
    },
  },

  // ============ 起点中文网 ============
  qidian: {
    id: 'qidian',
    name: '起点中文网',
    company: '阅文集团',
    monetization: '付费阅读+版权运营',
    audience: '深度阅读爱好者，偏爱长篇、高质量作品',
    features: [
      '付费阅读模式，用户粘性高',
      '版权运营能力强，影视动漫改编多',
      '签约门槛较高，质量要求严格',
      '编辑专业，指导到位',
      '作者福利好，分成比例高',
    ],
    hotGenres: [
      {
        name: '仙侠修真',
        tags: ['仙侠', '修真', '玄幻', '升级'],
        features: '世界观宏大，修炼体系完整',
        target: '18-35岁男性读者',
        avgLength: '300-500万字',
        popularElements: ['修仙升级', '渡劫飞升', '法宝神器', '宗门势力', '争霸天下'],
      },
      {
        name: '都市异能',
        tags: ['都市', '异能', '系统', '进化'],
        features: '都市背景+异能设定，新颖有趣',
        target: '18-30岁男性读者',
        avgLength: '200-400万字',
        popularElements: ['异能觉醒', '系统任务', '基因进化', '都市争霸', '打脸爽文'],
      },
      {
        name: '历史架空',
        tags: ['历史', '穿越', '架空', '权谋'],
        features: '历史考据严谨，权谋逻辑清晰',
        target: '25-40岁读者',
        avgLength: '200-350万字',
        popularElements: ['穿越架空', '权谋争霸', '科技兴国', '改革变法', '名垂青史'],
      },
    ],
    reviewStandards: {
      basic: [
        '原创度95%以上',
        '格式规范，无错别字',
        '逻辑严密，前后呼应',
        '文笔优秀，语言流畅',
      ],
      content: [
        '世界观完整，设定新颖',
        '人物立体，性格鲜明',
        '情节紧凑，节奏合理',
        '创新性强，有独特性',
      ],
      commercial: [
        '符合平台调性',
        '有版权开发潜力',
        '质量上乘，口碑好',
        '可持续更新能力强',
      ],
      platform: [
        '首章订阅率30%+',
        '日更6000字以上',
        '稳定更新，不断更',
        '付费转化率15%+',
      ],
    },
    submissionGuide: {
      conditions: [
        '15万字以上可申请签约',
        '质量评分85分以上',
        '稳定更新30天以上',
        '读者好评率75%以上',
      ],
      benefits: [
        '全勤奖：日更6000字，每月3000-5000元',
        '分成比例：作者60%，平台40%',
        '版权开发：优先考虑影视动漫改编',
        '编辑指导：资深编辑一对一指导',
      ],
      process: [
        '准备作品：完成15万字以上',
        '提交申请：在起点作家中心提交',
        '审核等待：等待编辑审核（5-10个工作日）',
        '签约洽谈：洽谈分成和版权条款',
        '正式签约：签署电子合同',
      ],
    },
  },

  // ============ 晋江文学城 ============
  jjwxc: {
    id: 'jjwxc',
    name: '晋江文学城',
    company: '晋江原创网络',
    monetization: '付费阅读+积分系统',
    audience: '女性读者群体，偏爱言情、耽美题材',
    features: [
      '女性读者为主，言情题材丰富',
      '积分系统独特，互动性强',
      '签约门槛中等，适合新人',
      '社区氛围好，读者粘性高',
      '审核相对宽松，创作自由度高',
    ],
    hotGenres: [
      {
        name: '现代言情',
        tags: ['现代', '言情', '甜宠', '总裁'],
        features: '都市背景，情感细腻',
        target: '18-35岁女性读者',
        avgLength: '50-100万字',
        popularElements: ['总裁宠妻', '豪门恩怨', '甜蜜日常', '破镜重圆', '一见钟情'],
      },
      {
        name: '古代言情',
        tags: ['古代', '言情', '宫斗', '权谋'],
        features: '古代背景，情感真挚',
        target: '18-35岁女性读者',
        avgLength: '80-150万字',
        popularElements: ['宫斗权谋', '帝王之恋', '宫廷斗争', '破镜重圆', '穿越架空'],
      },
      {
        name: '耽美题材',
        tags: ['耽美', 'BL', '纯爱', '情感'],
        features: '男性情感，细腻真挚',
        target: '18-30岁女性读者',
        avgLength: '50-100万字',
        popularElements: ['纯爱甜宠', '虐恋情深', '破镜重圆', '校园青春', '都市情感'],
      },
    ],
    reviewStandards: {
      basic: [
        '原创度90%以上',
        '格式规范，标点正确',
        '情感真挚，不虚假',
        '语句通顺，阅读流畅',
      ],
      content: [
        '情感描写细腻',
        '人物性格鲜明',
        '情节设计合理',
        '符合平台调性',
      ],
      commercial: [
        '符合女性读者口味',
        '情感共鸣强',
        '互动性好',
        '有IP潜力',
      ],
      platform: [
        '首章收藏率20%+',
        '日更3000字以上',
        '稳定更新，不断更',
        '读者评论活跃',
      ],
    },
    submissionGuide: {
      conditions: [
        '10万字以上可申请签约',
        '质量评分80分以上',
        '稳定更新30天以上',
        '读者好评率70%以上',
      ],
      benefits: [
        '全勤奖：日更3000字，每月1000-2000元',
        '分成比例：作者50%，平台50%',
        '积分系统：读者积分兑换奖励',
        '编辑指导：专业编辑一对一指导',
      ],
      process: [
        '准备作品：完成10万字以上',
        '提交申请：在晋江作家中心提交',
        '审核等待：等待编辑审核（3-7个工作日）',
        '签约洽谈：洽谈分成和积分条款',
        '正式签约：签署电子合同',
      ],
    },
  },

  // ============ 知乎盐选 ============
  zhihu: {
    id: 'zhihu',
    name: '知乎盐选专栏',
    company: '知乎',
    monetization: '付费订阅+专栏分成',
    audience: '知识型读者，偏爱高质量、有深度的内容',
    features: [
      '知识型平台，用户素质高',
      '付费订阅模式，用户粘性强',
      '内容质量要求高，深度优先',
      '作者福利好，分成比例高',
      '社区氛围好，讨论活跃',
    ],
    hotGenres: [
      {
        name: '悬疑推理',
        tags: ['悬疑', '推理', '犯罪', '侦探'],
        features: '逻辑严密，情节紧凑',
        target: '20-40岁读者',
        avgLength: '10-50万字',
        popularElements: ['悬疑推理', '犯罪案件', '侦探破案', '逻辑推理', '真相揭秘'],
      },
      {
        name: '历史人文',
        tags: ['历史', '人文', '传记', '纪实'],
        features: '历史考据严谨，人文情怀深厚',
        target: '25-50岁读者',
        avgLength: '20-80万字',
        popularElements: ['历史传记', '人文纪实', '历史反思', '文化传承', '人物故事'],
      },
      {
        name: '科幻未来',
        tags: ['科幻', '未来', '技术', '宇宙'],
        features: '科技感强，未来感足',
        target: '20-40岁读者',
        avgLength: '15-60万字',
        popularElements: ['科幻未来', '技术突破', '宇宙探索', '文明进化', '未来世界'],
      },
    ],
    reviewStandards: {
      basic: [
        '原创度95%以上',
        '深度足够，有思考',
        '逻辑严密，论证充分',
        '文笔优秀，表达准确',
      ],
      content: [
        '有深度，有思考',
        '逻辑严密，论证充分',
        '内容质量高',
        '有知识价值',
      ],
      commercial: [
        '符合知乎调性',
        '有知识价值',
        '深度足够',
        '可持续性强',
      ],
      platform: [
        '用户收藏率30%+',
        '更新频率灵活',
        '内容质量优先',
        '用户讨论活跃',
      ],
    },
    submissionGuide: {
      conditions: [
        '5万字以上可申请签约',
        '质量评分85分以上',
        '内容有深度',
        '读者好评率75%以上',
      ],
      benefits: [
        '分成比例：作者60%，平台40%',
        '专栏推广：知乎推荐',
        '作者权益：作者权益保护',
        '编辑指导：专业编辑一对一指导',
      ],
      process: [
        '准备作品：完成5万字以上',
        '提交申请：在知乎专栏提交',
        '审核等待：等待编辑审核（5-10个工作日）',
        '签约洽谈：洽谈分成和推广',
        '正式签约：签署电子合同',
      ],
    },
  },
};

// ============================================================================
// 平台适配接口
// ============================================================================

export interface PlatformAdaptation {
  platformId: string;
  genre: string;
  style: string;
  wordCount: number;
  pacing: string;
  hotSpots: string[];
  reviewScore: number;
}

/**
 * 根据平台适配内容
 */
export function adaptToPlatform(
  content: string,
  platformId: string,
  genre: string
): PlatformAdaptation {
  const platform = PLATFORMS[platformId];

  if (!platform) {
    throw new Error(`不支持的平台: ${platformId}`);
  }

  // 查找匹配的题材
  const genreInfo = platform.hotGenres.find((g) =>
    g.tags.some((tag) => genre.includes(tag))
  );

  return {
    platformId,
    genre: genreInfo?.name || genre,
    style: getPlatformStyle(platformId),
    wordCount: parseInt(genreInfo?.avgLength.split('-')[1] || '100'),
    pacing: getPlatformPacing(platformId),
    hotSpots: genreInfo?.popularElements || [],
    reviewScore: calculatePlatformReviewScore(content, platformId),
  };
}

/**
 * 获取平台风格
 */
function getPlatformStyle(platformId: string): string {
  const styles: Record<string, string> = {
    tomato: '爽文风格，快节奏，强爽点',
    qidian: '起点风格，高质量，世界观完整',
    jjwxc: '晋江风格，情感细腻，言情为主',
    zhihu: '知乎风格，有深度，有思考',
  };

  return styles[platformId] || '通用风格';
}

/**
 * 获取平台节奏
 */
function getPlatformPacing(platformId: string): string {
  const pacing: Record<string, string> = {
    tomato: '极快节奏，每章2000-3000字',
    qidian: '适中节奏，每章3000-4000字',
    jjwxc: '中等节奏，每章2500-3500字',
    zhihu: '慢节奏，注重深度',
  };

  return pacing[platformId] || '标准节奏';
}

/**
 * 计算平台评分
 */
function calculatePlatformReviewScore(content: string, platformId: string): number {
  // 简化评分算法
  let score = 70;

  // 根据平台特点调整评分
  if (platformId === 'tomato') {
    // 番茄小说重视爽点密度
    if (content.includes('打脸') || content.includes('突破')) {
      score += 10;
    }
  } else if (platformId === 'qidian') {
    // 起点重视质量
    if (content.length > 50000) {
      score += 5;
    }
  } else if (platformId === 'jjwxc') {
    // 晋江重视情感
    if (content.includes('爱') || content.includes('情')) {
      score += 10;
    }
  } else if (platformId === 'zhihu') {
    // 知乎重视深度
    if (content.includes('思考') || content.includes('深度')) {
      score += 10;
    }
  }

  return Math.min(100, score);
}

/**
 * 获取所有平台
 */
export function getAllPlatforms(): PlatformInfo[] {
  return Object.values(PLATFORMS);
}

/**
 * 根据ID获取平台
 */
export function getPlatformById(platformId: string): PlatformInfo | undefined {
  return PLATFORMS[platformId];
}

/**
 * 根据题材推荐平台
 */
export function recommendPlatforms(genre: string): PlatformInfo[] {
  const recommendations: PlatformInfo[] = [];

  for (const platform of Object.values(PLATFORMS)) {
    const hasGenre = platform.hotGenres.some((g) =>
      g.tags.some((tag) => genre.includes(tag))
    );

    if (hasGenre) {
      recommendations.push(platform);
    }
  }

  return recommendations;
}

/**
 * 生成平台适配报告
 */
export function generatePlatformAdaptationReport(
  content: string,
  genre: string
): Record<string, PlatformAdaptation> {
  const report: Record<string, PlatformAdaptation> = {};

  for (const platformId of Object.keys(PLATFORMS)) {
    try {
      report[platformId] = adaptToPlatform(content, platformId, genre);
    } catch (error) {
      console.error(`平台适配失败: ${platformId}`, error);
    }
  }

  return report;
}

export default {
  PLATFORMS,
  adaptToPlatform,
  getPlatformById,
  getAllPlatforms,
  recommendPlatforms,
  generatePlatformAdaptationReport,
};
