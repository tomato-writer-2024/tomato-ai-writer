/**
 * 原创内容合规检测机制
 * 确保所有生成内容均为原创，动态应对平台审核政策变化，防止侵权
 */

// ============================================================================
// 敏感词库（可动态更新）
// ============================================================================

export const SENSITIVE_KEYWORDS = {
  // 政治敏感词
  political: [
    '政治', '政府', '抗议', '游行', '集会', '政权', '领导人',
    '革命', '政变', '独裁', '民主运动', '敏感事件', '六四',
  ],
  // 暴力血腥词
  violent: [
    '杀害', '谋杀', '虐杀', '屠杀', '恐怖袭击', '炸弹', '爆炸',
    '血肉模糊', '肢解', '斩首', '碎尸', '酷刑', '虐待', '折磨',
    '恐怖组织', 'ISIS', '基地组织',
  ],
  // 色情低俗词
  sexual: [
    '性交', '做爱', '性爱', '淫乱', '乱伦', '强奸', '轮奸',
    '性侵', '猥亵', '色情', '黄色', '成人', '露骨', '裸体',
    '性器官', '性高潮', '性服务', '卖淫', '嫖娼', '援交',
  ],
  // 违法犯罪词
  criminal: [
    '制毒', '贩毒', '吸毒', '毒品', '海洛因', '冰毒', '摇头丸',
    '传销', '诈骗', '盗窃', '抢劫', '绑架', '勒索', '敲诈',
    '洗钱', '贪污', '受贿', '行贿', '逃税', '造假', '盗版',
  ],
  // 宗教迷信词
  religious: [
    '邪教', '法轮功', '全能神', '血水圣灵', '三赎基督',
    '宣扬迷信', '封建迷信', '占卜', '算命', '风水',
  ],
};

// ============================================================================
// 常见套路检测（避免抄袭）
// ============================================================================

export const COMMON_TROPES = {
 玄幻: [
    '废柴开局',
    '退婚打脸',
    '戒指老爷爷',
    '捡到秘籍',
    '家族被灭',
    '复仇之路',
    '觉醒血脉',
    '系统加身',
  ],
 都市: [
    '重生归来',
    '金手指',
    '装逼打脸',
    '美女倒贴',
    '暴富之路',
    '权势滔天',
    '兄弟情深',
    '敌人下跪',
  ],
 言情: [
    '霸道总裁',
    '豪门恩怨',
    '虐恋情深',
    '先婚后爱',
    '破镜重圆',
    '欢喜冤家',
    '甜宠日常',
    '误会重重',
  ],
};

// ============================================================================
// 版权声明文本
// ============================================================================

export const COPYRIGHT_DECLARATION = `
版权声明

本内容由用户使用番茄小说AI写作助手生成，用户声明如下：

1. 原创性保证
   - 本内容为用户独立创作，未抄袭他人作品
   - 所有情节、人物、设定均为原创或合理借鉴
   - 不侵犯任何第三方的版权、肖像权、名誉权等合法权益

2. 法律责任
   - 用户对本内容的版权和法律后果承担全部责任
   - 如发生版权纠纷，用户承诺独立承担所有法律后果
   - 平台不承担内容版权责任，仅提供技术辅助

3. 使用限制
   - 用户不得使用本工具生成违法、违规内容
   - 不得用于诽谤、侮辱、威胁他人
   - 不得传播虚假信息或谣言

4. 内容审核
   - 本内容已通过原创性检测（原创性评分XX分）
   - 已通过敏感内容检测（未检测到敏感词）
   - 建议用户在发布前进行人工审核

生成时间：${new Date().toLocaleString('zh-CN')}
`;

// ============================================================================
// 合规检查接口
// ============================================================================

export interface ComplianceCheckResult {
  passed: boolean;
  originalityScore: number; // 原创性评分 0-100
  copyrightScore: number; // 版权风险评分 0-100（100表示无风险）
  sensitiveContent: {
    detected: boolean;
    categories: string[];
    details: string[];
  };
  plagiarismRisk: {
    detected: boolean;
    similarSentences: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
  suggestions: string[];
  disclaimer: string;
}

/**
 * 执行完整的合规检查
 */
export async function performComplianceCheck(
  content: string,
  genre?: string,
  existingWorks?: string[]
): Promise<ComplianceCheckResult> {
  const result: ComplianceCheckResult = {
    passed: true,
    originalityScore: 100,
    copyrightScore: 100,
    sensitiveContent: {
      detected: false,
      categories: [],
      details: [],
    },
    plagiarismRisk: {
      detected: false,
      similarSentences: [],
      riskLevel: 'low',
    },
    suggestions: [],
    disclaimer: '',
  };

  // 1. 原创性检查
  const originalityResult = await checkOriginality(content, existingWorks);
  result.originalityScore = originalityResult.score;
  if (originalityResult.score < 70) {
    result.passed = false;
    result.suggestions.push('原创性评分较低，建议修改部分内容');
  }

  // 2. 敏感内容检测
  const sensitiveResult = checkSensitiveContent(content);
  result.sensitiveContent = sensitiveResult;
  if (sensitiveResult.detected) {
    result.passed = false;
    result.suggestions.push('检测到敏感内容，请修改后再发布');
  }

  // 3. 抄袭风险检测
  const plagiarismResult = checkPlagiarismRisk(content, genre);
  result.plagiarismRisk = plagiarismResult;
  if (plagiarismResult.detected) {
    result.copyrightScore -= 20;
    result.suggestions.push('存在抄袭风险，建议修改相似内容');
  }

  // 4. 生成免责声明
  result.disclaimer = generateDisclaimer(result);

  return result;
}

/**
 * 原创性检查
 */
async function checkOriginality(
  content: string,
  existingWorks?: string[]
): Promise<{ score: number; similarSentences: string[] }> {
  let score = 100;
  const similarSentences: string[] = [];

  // 1. 检测与其他作品的相似度
  if (existingWorks) {
    const sentences = content.split(/[。！？.!?]/);
    for (const sentence of sentences) {
      if (sentence.length < 20) continue;

      for (const work of existingWorks) {
        if (work.includes(sentence)) {
          similarSentences.push(sentence);
          score -= 5;
        }
      }
    }
  }

  // 2. 检测常用模板短语
  const templates = [
    '他深吸了一口气',
    '她的脸瞬间红了',
    '这一刻，时间仿佛静止了',
    '他紧紧握住拳头',
    '眼中闪过一丝寒意',
    '嘴角上扬',
  ];

  for (const template of templates) {
    if (content.includes(template)) {
      score -= 2;
    }
  }

  // 3. 文本多样性分析
  const words = content.split(/\s+/);
  const uniqueWords = new Set(words);
  const diversity = words.length > 0 ? uniqueWords.size / words.length : 0;
  score += (diversity - 0.5) * 20;

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    similarSentences,
  };
}

/**
 * 敏感内容检测
 */
function checkSensitiveContent(content: string): {
  detected: boolean;
  categories: string[];
  details: string[];
} {
  const categories: string[] = [];
  const details: string[] = [];

  for (const [category, keywords] of Object.entries(SENSITIVE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        if (!categories.includes(category)) {
          categories.push(category);
        }
        details.push(`包含敏感词：${keyword}`);
      }
    }
  }

  return {
    detected: categories.length > 0,
    categories,
    details,
  };
}

/**
 * 抄袭风险检测
 */
function checkPlagiarismRisk(
  content: string,
  genre?: string
): { detected: boolean; similarSentences: string[]; riskLevel: 'low' | 'medium' | 'high' } {
  const similarSentences: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  // 检测常见套路
  if (genre && COMMON_TROPES[genre as keyof typeof COMMON_TROPES]) {
    const tropes = COMMON_TROPES[genre as keyof typeof COMMON_TROPES];
    for (const trope of tropes) {
      if (content.includes(trope)) {
        similarSentences.push(`使用常见套路：${trope}`);
      }
    }

    if (similarSentences.length > 3) {
      riskLevel = 'high';
    } else if (similarSentences.length > 1) {
      riskLevel = 'medium';
    }
  }

  return {
    detected: similarSentences.length > 0,
    similarSentences,
    riskLevel,
  };
}

/**
 * 生成免责声明
 */
function generateDisclaimer(result: ComplianceCheckResult): string {
  let disclaimer = `
免责声明

本内容由用户使用AI写作工具生成，平台声明如下：

1. 原创性声明
   - 原创性评分：${result.originalityScore}分
   - 版权风险评分：${result.copyrightScore}分
   - 用户承诺本内容为原创，不侵犯他人权益

`;

  if (result.sensitiveContent.detected) {
    disclaimer += `
2. 敏感内容提示
   - 检测到以下敏感内容：${result.sensitiveContent.categories.join(', ')}
   - 建议用户修改相关内容后再发布

`;
  }

  if (result.plagiarismRisk.detected) {
    disclaimer += `
3. 抄袭风险提示
   - 风险等级：${result.plagiarismRisk.riskLevel}
   - 检测到${result.plagiarismRisk.similarSentences.length}处相似内容
   - 建议用户进行原创性修改

`;
  }

  disclaimer += `
4. 法律责任
   - 用户对本内容的版权和法律后果承担全部责任
   - 平台仅提供技术辅助，不承担内容版权责任
   - 如发生版权纠纷，用户承诺独立承担所有法律后果

生成时间：${new Date().toLocaleString('zh-CN')}
`;

  return disclaimer;
}

/**
 * 添加版权声明到内容末尾
 */
export function addCopyrightNotice(
  content: string,
  userId: string,
  checkResult: ComplianceCheckResult
): string {
  const timestamp = new Date().toLocaleString('zh-CN');
  const notice = `\n\n---\n` +
    `版权信息\n` +
    `生成用户：${userId}\n` +
    `生成时间：${timestamp}\n` +
    `原创性评分：${checkResult.originalityScore}/100\n` +
    `版权风险评分：${checkResult.copyrightScore}/100\n` +
    `敏感内容：${checkResult.sensitiveContent.detected ? '检测到' : '未检测到'}\n` +
    `抄袭风险：${checkResult.plagiarismRisk.riskLevel}\n` +
    `---\n`;

  return content + notice;
}

/**
 * 生成用户协议文本
 */
export function getUserAgreement(): string {
  return `
用户协议

欢迎使用番茄小说AI写作助手！使用本工具前，请仔细阅读以下协议：

第一章 总则
1.1 本工具是AI辅助写作平台，为小说创作者提供智能写作服务
1.2 使用本工具即表示您同意本协议的全部内容
1.3 本协议构成您与平台之间的法律约束

第二章 用户权利
2.1 用户有权使用本工具生成创作内容
2.2 用户拥有生成内容的完整版权
2.3 用户有权对生成内容进行修改、编辑、发布
2.4 用户享有个性化服务和专属技术支持

第三章 用户义务
3.1 用户承诺生成的内容均为原创，不侵犯他人权益
3.2 用户不得使用本工具生成违法、违规内容
3.3 用户不得用于诽谤、侮辱、威胁他人
4.4 用户不得传播虚假信息或谣言
3.5 用户承诺对本内容的版权和法律后果承担全部责任

第四章 平台责任
4.1 平台提供写作辅助工具，不生成具有版权的内容
4.2 平台不对生成内容的原创性提供担保
4.3 平台不对用户的版权和法律后果承担责任
4.4 平台有权根据法律法规和审核政策调整服务

第五章 合规要求
5.1 用户确保内容符合国家法律法规
5.2 用户确保内容符合平台审核政策
5.3 用户确保内容不侵犯第三方权益
5.4 用户应对内容进行人工审核后再发布

第六章 违约责任
6.1 如用户违反本协议，平台有权终止服务
6.2 如用户生成违法内容，需承担相应法律责任
6.3 如用户侵犯他人权益，需承担全部赔偿责

第七章 其他
7.1 本协议自用户使用本工具之日起生效
7.2 平台有权根据需要修改本协议
7.3 如有争议，双方应友好协商解决

使用本工具即表示您同意以上条款。
`;
}
