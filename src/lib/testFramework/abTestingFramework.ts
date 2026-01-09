/**
 * A/B测试框架
 * 用于对比不同提示词和算法参数的效果
 */

import { TestCase } from './testDataGenerator';
import { executeBatchTests } from './testExecutor';

export interface ABTestVariant {
  name: string;
  config: {
    // 提示词变体
    systemPrompt?: string;
    temperature?: number;
    // 算法参数变体
    targetCompletionRate?: number;
    shuangdianDensity?: number;
    // 其他参数
    wordCount?: number;
    model?: string;
  };
}

export interface ABTestResult {
  variant: string;
  summary: {
    total: number;
    passed: number;
    passRate: number;
    avgExecutionTime: number;
    avgResponseTime: number;
    avgWordCount: number;
    avgCompletionRate: number;
    avgQualityScore: number;
    responseTimeUnder1s: number;
  };
  details: any[];
}

export interface ABTestComparison {
  testId: string;
  testName: string;
  variants: ABTestResult[];
  winner: string;
  metrics: {
    improvement: number;
    bestMetric: string;
    recommendations: string[];
  };
}

/**
 * 预定义的提示词变体
 */
export const PROMPT_VARIANTS: Record<string, string> = {
  // 基础版
  'basic': `
你是番茄小说平台的写作助手。
目标：生成符合网文风格的章节内容。
要求：逻辑清晰，语言流畅。
`,

  // 优化版（当前使用）
  'optimized': `
你是番茄小说平台的顶级AI写作助手，擅长创作高完读率的爆款爽文。

## 核心目标：
1. 完读率90%+：每500字至少1.2个核心爽点
2. 首字响应<2秒：快速输出，不要等待
3. 9.8分+质量：逻辑严密、情绪饱满、语言流畅

## 爽点设计原则：
1. **打脸爽**：主角被轻视→ 展现实力→ 震惊全场
2. **爆发爽**：绝境突破→ 实力暴涨→ 碾压对手
3. **收获爽**：探险秘境→ 获得宝物→ 实力提升
4. **情感爽**：获得青睐→ 情感突破→ 心动时刻
5. **智商爽**：展现智谋→ 预判对手→ 完胜而归

## 节奏控制（黄金比例）：
- 前20%（400字）：快速铺垫，建立冲突和期待
- 中段60%（1200字）：爽点密集爆发，情绪高涨
- 后20%（400字）：留下强力钩子，引出下章

## 语言风格：
- 短句为主，每句不超过25字
- 每段3-5行，控制视觉节奏
- 网感词：爽、炸裂、牛逼、恐怖如斯、震惊
- 情绪词：激动、狂喜、颤抖、心跳加速

## 开篇前800字必须包含：
1. 核心冲突（主角遇到什么问题）
2. 金手指展示（特殊能力或身份）
3. 强期待感（读者想知道接下来会发生什么）

## 章节结尾必须包含：
1. 悬念钩子（"他究竟是谁？"）
2. 期待钩子（"接下来的战斗会怎样？"）
3. 伏笔钩子（"这件事背后隐藏着什么？"）

## 质量标准：
1. 逻辑严密：行为符合角色设定
2. 情绪饱满：用动词和细节渲染
3. 画面感强：避免抽象描述
4. 代入感强：第二人称视角
`,

  // 激进版
  'aggressive': `
你是番茄小说平台的爆款爽文生成器！

## 核心目标：
1. 完读率95%+：每500字至少1.5个爽点
2. 9.9分+质量：极致爽文体验
3. 极致情绪：每段都必须有情绪爆发

## 爽点密度要求：
- 每500字至少1.5个核心爽点
- 爽点必须强烈：恐怖如斯、炸裂、秒杀、碾压
- 打脸必须狠：对手必须被碾压到底
- 爆发必须猛：必须震撼全场

## 情绪渲染：
- 每段至少2个情绪词：激动、狂喜、震撼、恐怖
- 使用排比句增强气势
- 加入环境描写：风起云涌、天地变色、气血翻涌

## 节奏要求：
- 前10%：快速切入冲突，立即爽点
- 中段70%：爽点密集，连续高潮
- 后20%：超级钩子，悬念拉满

## 禁忌：
- 禁止长句，每句不超过20字
- 禁止平淡描述，必须炸裂
- 禁止无爽点段落
- 禁止结尾无钩子
`,

  // 稳健版
  'conservative': `
你是番茄小说平台的专业写作助手。

## 核心目标：
1. 完读率85%+：每500字1个爽点
2. 9.5分+质量：稳定的高质量输出
3. 逻辑严密：确保故事连贯性

## 爽点设计：
1. 打脸爽：主角被轻视→ 展现实力→ 震惊全场
2. 突破爽：遭遇瓶颈→ 获得机缘→ 实力提升
3. 收获爽：探险秘境→ 获得宝物→ 实力提升
4. 情感爽：获得青睐→ 情感突破→ 心动时刻

## 节奏控制：
- 前20%：建立场景和冲突
- 中段60%：发展情节，包含爽点
- 后20%：收尾并设置钩子

## 语言风格：
- 短句为主，每句不超过30字
- 每段3-6行
- 使用适当的网文词汇
- 保持语言流畅自然

## 质量要求：
1. 逻辑严密，行为合理
2. 情绪饱满但不夸张
3. 画面感强，细节丰富
4. 代入感强，读者代入
`,
};

/**
 * 预定义的算法参数变体
 */
export const PARAMETER_VARIANTS = {
  'temperature-low': { temperature: 0.6 },
  'temperature-medium': { temperature: 0.8 },
  'temperature-high': { temperature: 1.1 },
  'density-low': { shuangdianDensity: 1.0 },
  'density-medium': { shuangdianDensity: 1.2 },
  'density-high': { shuangdianDensity: 1.5 },
  'completion-low': { targetCompletionRate: 85 },
  'completion-medium': { targetCompletionRate: 90 },
  'completion-high': { targetCompletionRate: 95 },
};

/**
 * 创建A/B测试配置
 */
export function createABTestConfigs(
  variants: ABTestVariant[]
): ABTestVariant[] {
  return variants.map(variant => ({
    ...variant,
    config: {
      temperature: 0.8,
      targetCompletionRate: 90,
      shuangdianDensity: 1.2,
      wordCount: 2000,
      model: 'doubao-pro-4k',
      ...variant.config,
    },
  }));
}

/**
 * 执行A/B测试
 */
export async function runABTest(
  testCases: TestCase[],
  variants: ABTestVariant[],
  onProgress?: (variant: string, progress: number, total: number) => void
): Promise<ABTestComparison> {
  const testId = `ab_test_${Date.now()}`;
  const results: ABTestResult[] = [];

  // 执行每个变体的测试
  for (const variant of variants) {
    console.log(`正在执行变体: ${variant.name}`);
    const summary = await executeBatchTests(testCases, (progress, total) => {
      if (onProgress) {
        onProgress(variant.name, progress, total);
      }
    });

    results.push({
      variant: variant.name,
      summary: {
        total: summary.total,
        passed: summary.passed,
        passRate: summary.passRate,
        avgExecutionTime: summary.avgExecutionTime,
        avgResponseTime: summary.avgResponseTime,
        avgWordCount: summary.avgWordCount,
        avgCompletionRate: summary.avgCompletionRate,
        avgQualityScore: summary.avgQualityScore,
        responseTimeUnder1s: summary.responseTimeUnder1s,
      },
      details: summary.details,
    });
  }

  // 分析结果并确定胜者
  const comparison = analyzeABTestResults(testId, 'A/B测试对比', results);
  return comparison;
}

/**
 * 分析A/B测试结果
 */
function analyzeABTestResults(
  testId: string,
  testName: string,
  results: ABTestResult[]
): ABTestComparison {
  // 计算综合得分（权重：完读率40% + 质量分30% + 通过率20% + 响应时间10%）
  const scores = results.map(r => {
    const completionScore = r.summary.avgCompletionRate;
    const qualityScore = r.summary.avgQualityScore;
    const passRate = r.summary.passRate;
    const responseScore = Math.max(0, 100 - (r.summary.avgResponseTime / 1000) * 100);

    const totalScore =
      (completionScore / 100) * 40 +
      (qualityScore / 10) * 30 +
      (passRate / 100) * 20 +
      (responseScore / 100) * 10;

    return {
      variant: r.variant,
      score: totalScore,
      metrics: r.summary,
    };
  });

  // 找出胜者
  scores.sort((a, b) => b.score - a.score);
  const winner = scores[0].variant;

  // 计算改进幅度
  const bestScore = scores[0].score;
  const worstScore = scores[scores.length - 1].score;
  const improvement = ((bestScore - worstScore) / worstScore) * 100;

  // 找出最佳指标
  const bestMetric = findBestMetric(results);

  // 生成建议
  const recommendations = generateRecommendations(scores);

  return {
    testId,
    testName,
    variants: results,
    winner,
    metrics: {
      improvement,
      bestMetric,
      recommendations,
    },
  };
}

/**
 * 找出最佳指标
 */
function findBestMetric(results: ABTestResult[]): string {
  const metrics = [
    { name: '完读率', winner: results.reduce((max, r) => r.summary.avgCompletionRate > max.summary.avgCompletionRate ? r : max, results[0]).variant },
    { name: '质量评分', winner: results.reduce((max, r) => r.summary.avgQualityScore > max.summary.avgQualityScore ? r : max, results[0]).variant },
    { name: '通过率', winner: results.reduce((max, r) => r.summary.passRate > max.summary.passRate ? r : max, results[0]).variant },
    { name: '响应时间', winner: results.reduce((min, r) => r.summary.avgResponseTime < min.summary.avgResponseTime ? r : min, results[0]).variant },
  ];

  return metrics.map(m => `${m.name}: ${m.winner}`).join(', ');
}

/**
 * 生成优化建议
 */
function generateRecommendations(scores: any[]): string[] {
  const recommendations: string[] = [];

  // 分析最佳配置
  const best = scores[0];
  const worst = scores[scores.length - 1];

  // 对比配置差异
  if (best.metrics.avgCompletionRate > worst.metrics.avgCompletionRate) {
    recommendations.push(`${best.variant} 在完读率方面表现更佳，建议采用其提示词策略`);
  }

  if (best.metrics.avgQualityScore > worst.metrics.avgQualityScore) {
    recommendations.push(`${best.variant} 在质量评分方面表现更佳，建议优化其语言风格`);
  }

  if (best.metrics.avgResponseTime < worst.metrics.avgResponseTime) {
    recommendations.push(`${best.variant} 响应速度更快，建议采用其模型参数`);
  }

  if (best.metrics.responseTimeUnder1s > worst.metrics.responseTimeUnder1s) {
    recommendations.push(`${best.variant} 在<1秒响应比例上更高，用户体验更好`);
  }

  return recommendations;
}

/**
 * 导出A/B测试结果
 */
export function exportABTestResults(comparison: ABTestComparison): string {
  return JSON.stringify(comparison, null, 2);
}

/**
 * 创建预设A/B测试配置
 */
export function createPresetABTests(): ABTestVariant[][] {
  return [
    // 测试1：提示词对比
    [
      { name: '基础版', config: { systemPrompt: PROMPT_VARIANTS.basic } },
      { name: '优化版', config: { systemPrompt: PROMPT_VARIANTS.optimized } },
      { name: '激进版', config: { systemPrompt: PROMPT_VARIANTS.aggressive } },
      { name: '稳健版', config: { systemPrompt: PROMPT_VARIANTS.conservative } },
    ],

    // 测试2：温度参数对比
    [
      { name: '温度0.6', config: { temperature: 0.6, systemPrompt: PROMPT_VARIANTS.optimized } },
      { name: '温度0.8', config: { temperature: 0.8, systemPrompt: PROMPT_VARIANTS.optimized } },
      { name: '温度1.1', config: { temperature: 1.1, systemPrompt: PROMPT_VARIANTS.optimized } },
    ],

    // 测试3：爽点密度对比
    [
      { name: '密度1.0', config: { shuangdianDensity: 1.0, systemPrompt: PROMPT_VARIANTS.optimized } },
      { name: '密度1.2', config: { shuangdianDensity: 1.2, systemPrompt: PROMPT_VARIANTS.optimized } },
      { name: '密度1.5', config: { shuangdianDensity: 1.5, systemPrompt: PROMPT_VARIANTS.optimized } },
    ],

    // 测试4：综合对比
    [
      { name: '当前配置', config: { ...PARAMETER_VARIANTS['temperature-medium'], ...PARAMETER_VARIANTS['density-medium'], systemPrompt: PROMPT_VARIANTS.optimized } },
      { name: '激进配置', config: { ...PARAMETER_VARIANTS['temperature-high'], ...PARAMETER_VARIANTS['density-high'], systemPrompt: PROMPT_VARIANTS.aggressive } },
      { name: '稳健配置', config: { ...PARAMETER_VARIANTS['temperature-low'], ...PARAMETER_VARIANTS['density-low'], systemPrompt: PROMPT_VARIANTS.conservative } },
    ],
  ];
}
