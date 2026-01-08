/**
 * 9.8分+内容智能优化算法
 *
 * 目标：达成番茄小说平台各题材爽文TOP3，书评和章评达9.8分+
 * 视角：番茄小说平台算法 + 十年老书虫读者
 */

import type { ContentScore, OptimizationSuggestion } from './types/user';

/**
 * 爽点类型枚举
 */
enum ShuangdianType {
  POWER_UP = 'power_up',           // 实力提升
  REVENGE = 'revenge',             // 复仇打脸
  TREASURE = 'treasure',           // 获得宝物
  STATUS = 'status',               // 身份逆袭
  BEAUTY = 'beauty',               // 美女青睐
  RESPECT = 'respect',             // 获得尊重
  MONEY = 'money',                 // 获得财富
  ENEMY_DOWN = 'enemy_down',       // 敌人落败
  REVELATION = 'revelation',       // 揭露真相
  ESCAPE = 'escape',               // 险境逃脱
}

/**
 * 爽点关键词库
 */
const SHUANGDIAN_KEYWORDS: Record<ShuangdianType, string[]> = {
  [ShuangdianType.POWER_UP]: ['突破', '升级', '觉醒', '修炼', '顿悟', '暴涨', '暴涨'],
  [ShuangdianType.REVENGE]: ['打脸', '报复', '反击', '碾压', '碾压', '教训', '清算'],
  [ShuangdianType.TREASURE]: ['获得', '发现', '得到', '捡漏', '神器', '宝物', '秘籍'],
  [ShuangdianType.STATUS]: ['逆袭', '崛起', '称霸', '掌控', '掌权', '登顶', '统领'],
  [ShuangdianType.BEAUTY]: ['美女', '女神', '倾心', '迷恋', '倒追', '爱慕', '青睐'],
  [ShuangdianType.RESPECT]: ['膜拜', '敬仰', '崇拜', '震撼', '惊叹', '敬佩', '仰望'],
  [ShuangdianType.MONEY]: ['暴富', '巨款', '财富', '金币', '资源', '资产', '银两'],
  [ShuangdianType.ENEMY_DOWN]: ['败北', '跪地', '求饶', '惨败', '溃败', '崩溃', '失败'],
  [ShuangdianType.REVELATION]: ['真相', '揭露', '识破', '揭开', '曝光', '证明', '澄清'],
  [ShuangdianType.ESCAPE]: ['逃脱', '险象环生', '死里逃生', '化险为夷', '惊险', '幸存', '躲过'],
};

/**
 * 番茄平台爆款特征库
 */
const FANQIE_TOP_FEATURES = {
  // 开篇特征
  OPENING: [
    '前800字必须抛出核心冲突',
    '1000字内展示金手指',
    '前3章必须有爽点爆发',
    '开篇必须有强烈的期待感',
  ],

  // 角色特征
  CHARACTER: [
    '主角性格要鲜明（腹黑、狂傲、冷静等）',
    '配角要有记忆点',
    '反派要有压迫感',
    '美女角色要有特色',
  ],

  // 剧情特征
  PLOT: [
    '每500字至少1个爽点',
    '剧情推进节奏要快',
    '要有伏笔和期待感',
    '章节结尾要有钩子',
  ],

  // 语言特征
  LANGUAGE: [
    '口语化表达',
    '多用短句',
    '网感强',
    '避免书面语',
    '善用感叹词',
  ],

  // 情绪特征
  EMOTION: [
    '调动读者情绪',
    '制造冲突和对比',
    '营造爽感',
    '强化代入感',
  ],
};

/**
 * 十年老书虫偏好特征
 */
const OLD_READER_PREFERENCES = {
  // 逻辑性
  LOGIC: [
    '剧情逻辑要严密',
    '世界观要统一',
    '设定要自洽',
    '人物行为要合理',
  ],

  // 深度
  DEPTH: [
    '人物要有成长',
    '世界观要有层次',
    '剧情要有深度',
    '主题要有意义',
  ],

  // 创新
  INNOVATION: [
    '套路要新颖',
    '设定要独特',
    '剧情要有新意',
    '人物要立体',
  ],

  // 节奏
  PACING: [
    '节奏要张弛有度',
    '高潮要突出',
    '铺垫要充分',
    '过渡要自然',
  ],
};

/**
 * 计算爽点密度
 */
export function calculateShuangdianDensity(content: string): {
  density: number;
  shuangdianCount: number;
  shuangdianTypes: ShuangdianType[];
} {
  let shuangdianCount = 0;
  const detectedTypes: ShuangdianType[] = [];

  // 检测每种爽点类型
  for (const [type, keywords] of Object.entries(SHUANGDIAN_KEYWORDS)) {
    let typeCount = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'g');
      const matches = content.match(regex);
      if (matches) {
        typeCount += matches.length;
      }
    }

    if (typeCount > 0) {
      shuangdianCount += typeCount;
      detectedTypes.push(type as ShuangdianType);
    }
  }

  // 计算密度（每1000字的爽点数）
  const wordCount = content.length;
  const density = wordCount > 0 ? (shuangdianCount / wordCount) * 1000 : 0;

  return {
    density: Math.round(density * 100) / 100,
    shuangdianCount,
    shuangdianTypes: [...new Set(detectedTypes)], // 去重
  };
}

/**
 * 检测番茄平台适配度
 */
export function detectFanqieAdaptation(content: string): {
  score: number;
  details: {
    opening: boolean;
    pacing: boolean;
    language: boolean;
    emotion: boolean;
  };
  suggestions: string[];
} {
  let score = 100;
  const suggestions: string[] = [];

  // 开篇检测（假设是前1000字）
  const openingContent = content.slice(0, 1000);

  // 1. 开篇冲突检测
  const conflictKeywords = ['冲突', '矛盾', '敌对', '仇恨', '复仇', '仇人'];
  const hasConflict = conflictKeywords.some(keyword => openingContent.includes(keyword));
  if (!hasConflict && openingContent.length > 500) {
    score -= 10;
    suggestions.push('开篇缺少核心冲突，建议在前800字内抛出核心冲突');
  }

  // 2. 金手指展示检测
  const cheatKeywords = ['金手指', '系统', '外挂', '天赋', '神器', '机缘'];
  const hasCheat = cheatKeywords.some(keyword => openingContent.includes(keyword));
  if (!hasCheat && openingContent.length > 800) {
    score -= 10;
    suggestions.push('开篇缺少金手指展示，建议在前1000字内展示金手指功能');
  }

  // 3. 爽点密度检测
  const { density: shuangdianDensity } = calculateShuangdianDensity(content);
  if (shuangdianDensity < 5) {
    score -= 15;
    suggestions.push(`爽点密度偏低（${shuangdianDensity.toFixed(1)}/千字），建议达到5/千字以上`);
  }

  // 4. 句长检测（短句比例）
  const sentences = content.split(/[。！？.!?]/);
  let shortSentenceCount = 0;
  for (const sentence of sentences) {
    if (sentence.length <= 30 && sentence.length > 0) {
      shortSentenceCount++;
    }
  }
  const shortSentenceRatio = sentences.length > 0 ? shortSentenceCount / sentences.length : 0;
  if (shortSentenceRatio < 0.5) {
    score -= 10;
    suggestions.push(`短句比例偏低（${(shortSentenceRatio * 100).toFixed(0)}%），建议提高到50%以上`);
  }

  // 5. 网感检测（口语化程度）
  const colloquialWords = ['啊', '呢', '吧', '嘛', '哦', '哇', '卧槽', '牛逼', '屌', '爽'];
  let colloquialCount = 0;
  for (const word of colloquialWords) {
    const regex = new RegExp(word, 'g');
    const matches = content.match(regex);
    if (matches) {
      colloquialCount += matches.length;
    }
  }
  const colloquialDensity = content.length > 0 ? (colloquialCount / content.length) * 1000 : 0;
  if (colloquialDensity < 5) {
    score -= 10;
    suggestions.push(`网感偏弱，建议增加口语化表达和感叹词`);
  }

  // 6. 章节结尾钩子检测
  const lastSentences = sentences.slice(-3);
  const hookKeywords = ['震惊', '意外', '突然', '想不到', '岂料', '竟然', '居然', '原来'];
  const hasHook = lastSentences.some(sentence =>
    hookKeywords.some(keyword => sentence.includes(keyword))
  );
  if (!hasHook) {
    score -= 5;
    suggestions.push('章节结尾缺少钩子，建议增加悬念或冲突');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    details: {
      opening: hasConflict && hasCheat,
      pacing: shuangdianDensity >= 5,
      language: shortSentenceRatio >= 0.5,
      emotion: colloquialDensity >= 5,
    },
    suggestions,
  };
}

/**
 * 检测老书虫偏好适配度
 */
export function detectOldReaderAdaptation(content: string): {
  score: number;
  details: {
    logic: boolean;
    depth: boolean;
    innovation: boolean;
    pacing: boolean;
  };
  suggestions: string[];
} {
  let score = 100;
  const suggestions: string[] = [];

  // 1. 逻辑一致性检测（简单检测）
  const sentences = content.split(/[。！？.!?]/);

  // 检测明显的前后矛盾（简单示例）
  const contradictions = [
    { pattern: /他死了.*他又活了/g, msg: '存在明显的前后矛盾：角色死亡后复活' },
    { pattern: /这是他的.*那不是他的/g, msg: '存在明显的前后矛盾：物品归属不一致' },
  ];

  for (const { pattern, msg } of contradictions) {
    const matches = content.match(pattern);
    if (matches) {
      score -= 15;
      suggestions.push(msg);
    }
  }

  // 2. 人物深度检测（通过心理活动描写）
  const psychologicalKeywords = ['心里', '心中', '内心', '思绪', '情感', '感受'];
  let psychologicalCount = 0;
  for (const keyword of psychologicalKeywords) {
    const regex = new RegExp(keyword, 'g');
    const matches = content.match(regex);
    if (matches) {
      psychologicalCount += matches.length;
    }
  }
  const psychologicalDensity = content.length > 0 ? (psychologicalCount / content.length) * 1000 : 0;
  if (psychologicalDensity < 2) {
    score -= 10;
    suggestions.push('人物心理活动描写偏少，建议增加心理活动，丰富人物形象');
  }

  // 3. 设定深度检测（通过世界观元素）
  const worldBuildingKeywords = ['世界', '大陆', '势力', '宗门', '家族', '国家', '时代', '历史'];
  let worldBuildingCount = 0;
  for (const keyword of worldBuildingKeywords) {
    const regex = new RegExp(keyword, 'g');
    const matches = content.match(regex);
    if (matches) {
      worldBuildingCount += matches.length;
    }
  }
  if (worldBuildingCount < 3) {
    score -= 10;
    suggestions.push('世界观构建偏弱，建议增加世界观元素，提升故事深度');
  }

  // 4. 创新性检测（避免过多套路）
  const cliches = [
    '废物逆袭',
    '退婚',
    '家破人亡',
    '天才陨落',
    '被看不起',
  ];
  let clicheCount = 0;
  for (const cliche of cliches) {
    if (content.includes(cliche)) {
      clicheCount++;
    }
  }
  if (clicheCount > 3) {
    score -= 15;
    suggestions.push('套路过多，建议增加创新元素，避免过度使用常见套路');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    details: {
      logic: score >= 70,
      depth: psychologicalDensity >= 2 && worldBuildingCount >= 3,
      innovation: clicheCount <= 3,
      pacing: true, // 简化处理
    },
    suggestions,
  };
}

/**
 * 综合评分系统
 */
export function calculateOverallScore(content: string): ContentScore {
  // 1. 爽点密度评分
  const { density: shuangdianDensity, shuangdianCount, shuangdianTypes } = calculateShuangdianDensity(content);
  const shuangdianScore = Math.min(100, shuangdianDensity * 20);

  // 2. 番茄平台适配评分
  const fanqieAdaptation = detectFanqieAdaptation(content);
  const fanqieScore = fanqieAdaptation.score;

  // 3. 老书虫偏好评分
  const oldReaderAdaptation = detectOldReaderAdaptation(content);
  const oldReaderScore = oldReaderAdaptation.score;

  // 4. 原创性评分（使用originality.ts中的函数）
  // 这里简化处理，实际应该调用calculateOriginalityScore

  // 5. 完读率潜力评分（基于以上指标）
  const completionRateScore = (shuangdianScore * 0.4) + (fanqieScore * 0.4) + (oldReaderScore * 0.2);

  // 6. 综合评分
  const overallScore =
    (shuangdianScore * 0.3) +
    (fanqieScore * 0.3) +
    (oldReaderScore * 0.2) +
    (completionRateScore * 0.2);

  return {
    overall: Math.round(overallScore * 100) / 100,
    shuangdianScore: Math.round(shuangdianScore * 100) / 100,
    fanqieScore: Math.round(fanqieScore * 100) / 100,
    oldReaderScore: Math.round(oldReaderScore * 100) / 100,
    completionRateScore: Math.round(completionRateScore * 100) / 100,
    details: {
      shuangdian: {
        density: shuangdianDensity,
        count: shuangdianCount,
        types: shuangdianTypes,
      },
      fanqie: fanqieAdaptation,
      oldReader: oldReaderAdaptation,
    },
  };
}

/**
 * 生成优化建议
 */
export function generateOptimizationSuggestions(content: string): OptimizationSuggestion {
  const score = calculateOverallScore(content);

  const suggestions: {
    category: string;
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    reason: string;
    action: string;
  }[] = [];

  // 1. 爽点密度优化
  if (score.details.shuangdian.density < 5) {
    suggestions.push({
      category: '爽点密度',
      priority: 'high',
      suggestion: '提升爽点密度至5/千字以上',
      reason: `当前爽点密度仅为${score.details.shuangdian.density.toFixed(1)}/千字，低于番茄平台爆款标准`,
      action: '在剧情中增加打脸、逆袭、获得宝物等爽点情节，缩短爽点之间的间隔',
    });
  }

  // 2. 番茄平台适配优化
  if (score.details.fanqie.suggestions.length > 0) {
    for (const suggestion of score.details.fanqie.suggestions) {
      suggestions.push({
        category: '番茄平台适配',
        priority: 'high',
        suggestion: '优化番茄平台适配度',
        reason: suggestion,
        action: '根据番茄平台算法要求，优化开篇冲突、金手指展示、短句比例等',
      });
    }
  }

  // 3. 老书虫偏好优化
  if (score.details.oldReader.suggestions.length > 0) {
    for (const suggestion of score.details.oldReader.suggestions) {
      suggestions.push({
        category: '老书虫偏好',
        priority: 'medium',
        suggestion: '提升内容深度',
        reason: suggestion,
        action: '增加人物心理描写、世界观构建、剧情创新等元素',
      });
    }
  }

  // 4. 综合优化建议
  if (score.overall < 90) {
    suggestions.push({
      category: '综合优化',
      priority: 'high',
      suggestion: '提升综合评分至90分以上',
      reason: `当前综合评分为${score.overall.toFixed(1)}分，距离9.8分+目标还有差距`,
      action: '根据以上建议，逐项优化内容，重点提升爽点密度和番茄平台适配度',
    });
  }

  // 5. 针对性优化建议
  if (score.details.shuangdian.types.length < 5) {
    suggestions.push({
      category: '爽点类型',
      priority: 'medium',
      suggestion: '丰富爽点类型',
      reason: `当前爽点类型过少（${score.details.shuangdian.types.length}种），容易让读者产生审美疲劳`,
      action: '增加不同类型的爽点，如实力提升、复仇打脸、获得宝物、身份逆袭等',
    });
  }

  return {
    score,
    suggestions: suggestions.sort((a, b) => {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      return priorityMap[b.priority] - priorityMap[a.priority];
    }),
  };
}

/**
 * 预测完读率
 */
export function predictCompletionRate(content: string): {
  predictedRate: number;
  confidence: number;
  factors: {
    factor: string;
    impact: number;
    description: string;
  }[];
} {
  const score = calculateOverallScore(content);

  // 基于综合评分预测完读率
  // 假设：100分 = 70%完读率，90分 = 50%完读率，80分 = 30%完读率，70分 = 10%完读率
  let predictedRate = 0;
  if (score.overall >= 90) {
    predictedRate = 50 + (score.overall - 90) * 2;
  } else if (score.overall >= 80) {
    predictedRate = 30 + (score.overall - 80) * 2;
  } else if (score.overall >= 70) {
    predictedRate = 10 + (score.overall - 70) * 2;
  } else {
    predictedRate = score.overall / 7;
  }

  // 影响因素分析
  const factors = [
    {
      factor: '爽点密度',
      impact: score.details.shuangdian.density * 10,
      description: `爽点密度每提高1/千字，完读率约提高10%`,
    },
    {
      factor: '番茄平台适配',
      impact: score.details.fanqie.score * 0.5,
      description: `番茄平台适配度每提高10分，完读率约提高5%`,
    },
    {
      factor: '老书虫偏好',
      impact: score.details.oldReader.score * 0.3,
      description: `老书虫偏好度每提高10分，完读率约提高3%`,
    },
  ];

  // 计算置信度（基于内容长度和评分稳定性）
  const contentLength = content.length;
  let confidence = 0.5; // 基础置信度
  if (contentLength >= 2000) {
    confidence += 0.3;
  } else if (contentLength >= 1000) {
    confidence += 0.2;
  } else if (contentLength >= 500) {
    confidence += 0.1;
  }

  // 评分稳定性（各项评分差异越小，置信度越高）
  const scores = [
    score.shuangdianScore,
    score.fanqieScore,
    score.oldReaderScore,
  ];
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length;
  if (variance < 100) {
    confidence += 0.2;
  }

  return {
    predictedRate: Math.round(predictedRate * 100) / 100,
    confidence: Math.min(0.95, Math.max(0.5, confidence)),
    factors,
  };
}

/**
 * 预测签约成功率
 */
export function predictContractSuccess(content: string): {
  probability: number;
  level: 'low' | 'medium' | 'high' | 'excellent';
  suggestions: string[];
} {
  const score = calculateOverallScore(content);
  const completionRate = predictCompletionRate(content);

  // 基于综合评分和完读率预测签约成功率
  // 假设：签约成功率 = (综合评分 * 0.6 + 完读率 * 0.4) / 100 * 100
  const probability = (score.overall * 0.6 + completionRate.predictedRate * 0.4);

  // 判断等级
  let level: 'low' | 'medium' | 'high' | 'excellent';
  if (probability >= 80) {
    level = 'excellent';
  } else if (probability >= 60) {
    level = 'high';
  } else if (probability >= 40) {
    level = 'medium';
  } else {
    level = 'low';
  }

  // 生成建议
  const suggestions: string[] = [];
  if (probability < 60) {
    suggestions.push('综合评分偏低，建议优化爽点密度和番茄平台适配度');
    suggestions.push('完读率预测偏低，建议加强开篇吸引力和剧情节奏');
  } else if (probability < 80) {
    suggestions.push('内容质量良好，但仍有提升空间');
    suggestions.push('建议继续优化细节，冲击高分');
  } else {
    suggestions.push('内容质量优秀，签约成功率较高');
    suggestions.push('建议保持质量，持续创作');
  }

  return {
    probability: Math.round(probability * 100) / 100,
    level,
    suggestions,
  };
}

/**
 * 生成9.8分+优化提示词
 */
export function generate9point8OptimizationPrompt(content: string): string {
  const optimization = generateOptimizationSuggestions(content);

  let prompt = `请根据以下优化建议，重新撰写或优化当前内容，目标是将内容质量提升至9.8分+标准：

## 当前评分
- 综合评分：${optimization.score.overall}分
- 爽点评分：${optimization.score.shuangdianScore}分
- 番茄适配：${optimization.score.fanqieScore}分
- 老书虫评分：${optimization.score.oldReaderScore}分

## 优化建议（按优先级排序）
`;

  for (const suggestion of optimization.suggestions.slice(0, 5)) {
    prompt += `
### ${suggestion.category}（${suggestion.priority === 'high' ? '高优先级' : '中优先级'}）
- 建议：${suggestion.suggestion}
- 原因：${suggestion.reason}
- 行动：${suggestion.action}
`;
  }

  prompt += `
## 优化重点
1. **爽点密度**：确保每500字至少包含一个爽点（打脸、逆袭、装逼等）
2. **番茄平台适配**：前800字抛出核心冲突，前1000字展示金手指，章节结尾留钩子
3. **老书虫偏好**：增加心理描写、世界观构建、创新元素
4. **网感增强**：使用口语化表达、短句、感叹词，增强代入感
5. **节奏控制**：剧情推进要快，避免冗长描写，营造紧张感

## 输出要求
- 保持原有核心剧情和人物设定不变
- 根据优化建议，逐项改进内容
- 确保逻辑连贯，不出现前后矛盾
- 爽点密度达到5/千字以上
- 短句比例达到50%以上
- 章节结尾留下强烈悬念或冲突
- 直接返回优化后的内容，不要包含任何分析或说明文字
`;

  return prompt;
}
