/**
 * 测试执行器
 * 执行批量测试用例并收集结果
 */

import { TestCase } from './testDataGenerator';
import { calculateCompletionRate, calculateQualityScore, calculateTextQuality } from '@/lib/contentGenerator';

export interface TestResult {
  testCaseId: string;
  type: string;
  success: boolean;
  executionTime: number; // 执行时间（毫秒）
  responseTime: number; // AI首字响应时间（毫秒）
  content?: string;
  metrics?: {
    wordCount: number;
    completionRate: number;
    qualityScore: number;
    shuangdianCount: number;
  };
  passed: boolean;
  errors?: string[];
  warnings?: string[]; // 新增：警告信息
  retryCount?: number; // 新增：重试次数
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  avgExecutionTime: number;
  avgResponseTime: number;
  avgWordCount: number;
  avgCompletionRate: number;
  avgQualityScore: number;
  minResponseTime: number;
  maxResponseTime: number;
  responseTimeUnder1s: number; // < 1秒的比例
  details: TestResult[];
}

/**
 * 执行单个测试用例
 */
export async function executeTestCase(testCase: TestCase, maxRetries: number = 1): Promise<TestResult> {
  const startTime = Date.now();
  const result: TestResult = {
    testCaseId: testCase.id,
    type: testCase.type,
    success: false,
    executionTime: 0,
    responseTime: 0,
    passed: false,
    errors: [],
    warnings: [],
    retryCount: 0,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      let content = '';
      let firstChunkTime = 0;
      let streamComplete = false;
      const attemptStartTime = Date.now();

      // 设置超时（30秒）
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('请求超时（30秒）')), 30000);
      });

      // 根据测试类型调用不同的API
      const apiPromise = executeApiCall(testCase);

      // 使用Promise.race实现超时
      const apiResult = await Promise.race([apiPromise, timeoutPromise]);
      content = apiResult.content;
      firstChunkTime = apiResult.firstChunkTime;
      streamComplete = apiResult.streamComplete;

      // 计算执行时间
      result.executionTime = Date.now() - startTime;
      result.responseTime = firstChunkTime;
      result.success = true;
      result.content = content;

      // 计算指标
      if (content && streamComplete) {
        const shuangdianCount = calculateShuangdianCount(content);
        const wordCount = content.length;

        result.metrics = {
          wordCount,
          completionRate: calculateCompletionRate(content, shuangdianCount, wordCount),
          qualityScore: calculateQualityScore(content, calculateCompletionRate(content, shuangdianCount, wordCount), shuangdianCount),
          shuangdianCount,
        };

        // 添加警告信息
        if (wordCount < testCase.expected.minWordCount * 0.9) {
          result.warnings?.push(`字数接近下限：${wordCount}（期望≥${testCase.expected.minWordCount}）`);
        }
        if (result.metrics.completionRate < testCase.expected.minCompletionRate * 0.95) {
          result.warnings?.push(`完读率接近下限：${result.metrics.completionRate.toFixed(2)}%（期望≥${testCase.expected.minCompletionRate}）`);
        }
        if (result.responseTime > 2000) {
          result.warnings?.push(`响应时间较长：${result.responseTime}ms（建议<2000ms）`);
        }

        // 验证是否通过
        result.passed =
          wordCount >= testCase.expected.minWordCount &&
          result.metrics.completionRate >= testCase.expected.minCompletionRate &&
          result.metrics.qualityScore >= testCase.expected.minQualityScore;
      } else {
        result.errors?.push('内容生成失败');
      }

      result.retryCount = attempt;
      return result;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('未知错误');
      result.retryCount = attempt;

      // 如果不是最后一次尝试，等待1秒后重试
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      // 最后一次尝试仍然失败
      result.executionTime = Date.now() - startTime;
      result.success = false;
      result.errors?.push(lastError.message);
      return result;
    }
  }

  // 理论上不会到达这里，但TypeScript需要返回
  return result;
}

/**
 * 执行API调用
 */
async function executeApiCall(testCase: TestCase): Promise<{
  content: string;
  firstChunkTime: number;
  streamComplete: boolean;
}> {
  let content = '';
  let firstChunkTime = 0;
  let streamComplete = false;

  if (testCase.type === 'generate') {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'generate',
        prompt: testCase.input.prompt,
        context: testCase.input.context,
        characters: testCase.input.characters,
        outline: testCase.input.outline,
        wordCount: testCase.input.wordCount,
      }),
    });

    if (!response.ok) {
      throw new Error(`API返回错误: ${response.status}`);
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let chunkReceived = false;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (!chunkReceived) {
          firstChunkTime = Date.now();
          chunkReceived = true;
        }

        content += decoder.decode(value, { stream: true });
      }
    }

    // 移除标记
    content = content.replace(/\[DONE\]/g, '').trim();
    streamComplete = true;

  } else if (testCase.type === 'continue') {
    const response = await fetch('/api/continue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: testCase.input.content,
        context: testCase.input.context,
        characters: testCase.input.characters,
        wordCount: testCase.input.wordCount,
      }),
    });

    if (!response.ok) {
      throw new Error(`API返回错误: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let chunkReceived = false;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (!chunkReceived) {
          firstChunkTime = Date.now();
          chunkReceived = true;
        }

        content += decoder.decode(value, { stream: true });
      }
    }

    content = content.replace(/\[OPTIMIZED\]/g, '').trim();
    streamComplete = true;

  } else if (testCase.type === 'polish') {
    const response = await fetch('/api/polish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: testCase.input.content,
      }),
    });

    if (!response.ok) {
      throw new Error(`API返回错误: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let chunkReceived = false;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (!chunkReceived) {
          firstChunkTime = Date.now();
          chunkReceived = true;
        }

        content += decoder.decode(value, { stream: true });
      }
    }

    content = content.replace(/\[OPTIMIZED\]/g, '').trim();
    streamComplete = true;
  }

  return { content, firstChunkTime, streamComplete };
}

/**
 * 批量执行测试
 */
export async function executeBatchTests(
  testCases: TestCase[],
  onProgress?: (progress: number, total: number, status?: { passed: number; failed: number }) => void
): Promise<TestSummary> {
  const results: TestResult[] = [];
  const total = testCases.length;
  let passed = 0;
  let failed = 0;

  for (let i = 0; i < total; i++) {
    const result = await executeTestCase(testCases[i], 1); // 允许1次重试
    results.push(result);

    // 更新统计
    if (result.passed) {
      passed++;
    } else {
      failed++;
    }

    // 更新进度
    if (onProgress) {
      onProgress(i + 1, total, { passed, failed });
    }

    // 每执行100个测试，休息100ms，避免过载
    if (i > 0 && i % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // 生成汇总报告
  const summary = generateTestSummary(results);
  return summary;
}

/**
 * 生成测试汇总报告
 */
function generateTestSummary(results: TestResult[]): TestSummary {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  const successfulResults = results.filter(r => r.success);
  const avgExecutionTime = successfulResults.length > 0
    ? successfulResults.reduce((sum, r) => sum + r.executionTime, 0) / successfulResults.length
    : 0;

  const avgResponseTime = successfulResults.length > 0
    ? successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length
    : 0;

  const resultsWithMetrics = results.filter(r => r.metrics);
  const avgWordCount = resultsWithMetrics.length > 0
    ? resultsWithMetrics.reduce((sum, r) => sum + (r.metrics?.wordCount || 0), 0) / resultsWithMetrics.length
    : 0;

  const avgCompletionRate = resultsWithMetrics.length > 0
    ? resultsWithMetrics.reduce((sum, r) => sum + (r.metrics?.completionRate || 0), 0) / resultsWithMetrics.length
    : 0;

  const avgQualityScore = resultsWithMetrics.length > 0
    ? resultsWithMetrics.reduce((sum, r) => sum + (r.metrics?.qualityScore || 0), 0) / resultsWithMetrics.length
    : 0;

  const responseTimes = successfulResults.map(r => r.responseTime);
  const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
  const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

  const responseTimeUnder1s = successfulResults.length > 0
    ? successfulResults.filter(r => r.responseTime < 1000).length / successfulResults.length * 100
    : 0;

  return {
    total,
    passed,
    failed,
    passRate: (passed / total) * 100,
    avgExecutionTime,
    avgResponseTime,
    avgWordCount,
    avgCompletionRate,
    avgQualityScore,
    minResponseTime,
    maxResponseTime,
    responseTimeUnder1s,
    details: results,
  };
}

/**
 * 计算爽点数量
 */
function calculateShuangdianCount(content: string): number {
  const shuangdianKeywords = [
    '打脸', '碾压', '震惊', '恐怖', '变态',
    '牛逼', '炸裂', '秒杀', '无敌', '巅峰',
    '突破', '进阶', '蜕变', '觉醒', '爆发',
    '美女', '心动', '脸红', '迷恋', '痴迷',
    '财富', '宝物', '神药', '秘籍', '传承',
    '智商', '算计', '布局', '谋略', '智慧',
    '反差', '逆袭', '翻身', '超越',
  ];

  let count = 0;
  shuangdianKeywords.forEach((keyword) => {
    count += (content.match(new RegExp(keyword, 'g')) || []).length;
  });

  return count;
}

/**
 * 导出测试结果为JSON
 */
export function exportTestResults(summary: TestSummary): string {
  return JSON.stringify(summary, null, 2);
}

/**
 * 从JSON导入测试结果
 */
export function importTestResults(json: string): TestSummary {
  try {
    return JSON.parse(json) as TestSummary;
  } catch (error) {
    console.error('导入测试结果失败:', error);
    throw new Error('无效的测试结果格式');
  }
}
