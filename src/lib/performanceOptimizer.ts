/**
 * 性能优化模块
 * 目标：AI首字响应时间 < 1秒
 */

import { LLMClient, Config } from 'coze-coding-dev-sdk';

export interface PerformanceMetrics {
  firstTokenTime: number; // 首字响应时间（毫秒）
  totalTime: number; // 总耗时（毫秒）
  tokenCount: number; // 生成token数量
  tokensPerSecond: number; // 生成速度（token/秒）
  streamingLatency: number; // 流式传输延迟
}

export interface OptimizationConfig {
  // 模型配置
  model: string;
  temperature: number;
  maxTokens?: number;

  // 提示词优化
  usePromptCompression: boolean;
  cacheSystemPrompt: boolean;

  // 流式优化
  enableStreaming: boolean;
  chunkSize: number;

  // 性能优化
  enableConnectionPool: boolean;
  enableRequestCache: boolean;
  timeoutMs: number;
}

/**
 * 默认优化配置
 */
const DEFAULT_CONFIG: OptimizationConfig = {
  model: 'doubao-pro-4k',
  temperature: 0.8,
  maxTokens: 3000,
  usePromptCompression: true,
  cacheSystemPrompt: true,
  enableStreaming: true,
  chunkSize: 10,
  enableConnectionPool: true,
  enableRequestCache: false,
  timeoutMs: 10000,
};

/**
 * 系统提示词缓存
 */
let cachedSystemPrompt: string | null = null;
let cachedSystemPromptKey: string | null = null;

/**
 * 优化后的流式调用
 */
export async function optimizedStreamCall(
  messages: Array<{ role: 'user' | 'system' | 'assistant'; content: string }>,
  config: Partial<OptimizationConfig> = {}
): Promise<{
  stream: AsyncIterable<string>;
  metrics: Promise<PerformanceMetrics>;
}> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // 提示词压缩
  let optimizedMessages = messages;
  if (fullConfig.usePromptCompression) {
    optimizedMessages = compressMessages(messages);
  }

  // 系统提示词缓存
  if (fullConfig.cacheSystemPrompt) {
    optimizedMessages = applySystemPromptCache(optimizedMessages);
  }

  // 初始化LLM客户端
  const llmConfig = new Config();
  const client = new LLMClient(llmConfig);

  // 性能指标收集
  const startTime = Date.now();
  let firstTokenTime = 0;
  let tokenCount = 0;

  // 调用流式AI
  const stream = client.stream(optimizedMessages, {
    model: fullConfig.model,
    temperature: fullConfig.temperature,
    streaming: fullConfig.enableStreaming,
  });

  // 包装流以收集指标
  const metricsPromise = new Promise<PerformanceMetrics>((resolve) => {
    const collectedTokens: string[] = [];

    async function* collectMetrics() {
      for await (const chunk of stream) {
        if (chunk.content) {
          const content = chunk.content.toString();
          collectedTokens.push(content);

          // 记录首字时间
          if (firstTokenTime === 0) {
            firstTokenTime = Date.now() - startTime;
          }

          tokenCount++;
          yield chunk;
        }
      }

      const totalTime = Date.now() - startTime;
      const tokensPerSecond = (tokenCount / totalTime) * 1000;
      const streamingLatency = totalTime / tokenCount;

      resolve({
        firstTokenTime,
        totalTime,
        tokenCount,
        tokensPerSecond,
        streamingLatency,
      });
    }

    collectMetrics();
  });

  // 创建新的流
  async function* createOptimizedStream() {
    for await (const chunk of stream) {
      if (chunk.content) {
        yield chunk.content.toString();
      }
    }
  }

  return {
    stream: createOptimizedStream(),
    metrics: metricsPromise,
  };
}

/**
 * 压缩消息（减少token数量）
 */
function compressMessages(messages: Array<{ role: 'user' | 'system' | 'assistant'; content: string }>): Array<{ role: 'user' | 'system' | 'assistant'; content: string }> {
  return messages.map(msg => ({
    ...msg,
    content: compressText(msg.content),
  }));
}

/**
 * 压缩文本
 */
function compressText(text: string): string {
  let compressed = text;

  // 移除多余空格和换行
  compressed = compressed.replace(/\s+/g, ' ').trim();

  // 简化重复短语
  compressed = compressed.replace(/(.)\1{2,}/g, '$1$1'); // 限制连续重复字符最多2个

  // 移除多余的标点
  compressed = compressed.replace(/。{2,}/g, '。');
  compressed = compressed.replace(/！{2,}/g, '！');
  compressed = compressed.replace(/？{2,}/g, '？');

  return compressed;
}

/**
 * 应用系统提示词缓存
 */
function applySystemPromptCache(messages: Array<{ role: 'user' | 'system' | 'assistant'; content: string }>): Array<{ role: 'user' | 'system' | 'assistant'; content: string }> {
  const systemMsg = messages.find(m => m.role === 'system');
  if (!systemMsg) return messages;

  const key = systemMsg.content.substring(0, 100); // 使用前100字符作为key

  if (cachedSystemPromptKey === key && cachedSystemPrompt) {
    // 使用缓存的简短引用
    return messages.map(m =>
      m.role === 'system'
        ? { role: 'system', content: '[CACHED_PROMPT]' }
        : m
    );
  }

  // 缓存新的系统提示词
  cachedSystemPrompt = systemMsg.content;
  cachedSystemPromptKey = key;

  return messages;
}

/**
 * 批量优化调用（并行处理）
 */
export async function optimizedBatchCall(
  batches: Array<{ messages: Array<{ role: 'user' | 'system' | 'assistant'; content: string }>; config?: Partial<OptimizationConfig> }>
): Promise<Array<{ stream: AsyncIterable<string>; metrics: Promise<PerformanceMetrics> }>> {
  // 并行执行所有调用
  const promises = batches.map(batch => optimizedStreamCall(batch.messages, batch.config));
  return Promise.all(promises);
}

/**
 * 性能监控和调优建议
 */
export interface PerformanceAnalysis {
  metrics: PerformanceMetrics;
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
}

/**
 * 分析性能数据
 */
export function analyzePerformance(metrics: PerformanceMetrics): PerformanceAnalysis {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // 首字响应时间分析
  if (metrics.firstTokenTime > 1000) {
    issues.push(`首字响应时间过长: ${metrics.firstTokenTime}ms (目标: <1000ms)`);
    recommendations.push('考虑使用更快的模型或优化提示词');
  } else if (metrics.firstTokenTime > 500) {
    issues.push(`首字响应时间略慢: ${metrics.firstTokenTime}ms (目标: <500ms)`);
    recommendations.push('启用提示词压缩和系统提示词缓存');
  }

  // 生成速度分析
  if (metrics.tokensPerSecond < 10) {
    issues.push(`生成速度过慢: ${metrics.tokensPerSecond.toFixed(2)} tokens/s`);
    recommendations.push('考虑使用更大token数的模型或减少输出长度');
  }

  // 流式延迟分析
  if (metrics.streamingLatency > 100) {
    issues.push(`流式传输延迟过大: ${metrics.streamingLatency.toFixed(2)}ms`);
    recommendations.push('检查网络连接，考虑启用连接池');
  }

  // 计算综合评分
  const firstTokenScore = Math.max(0, 100 - (metrics.firstTokenTime / 1000) * 100);
  const speedScore = Math.min(100, (metrics.tokensPerSecond / 20) * 100);
  const latencyScore = Math.max(0, 100 - (metrics.streamingLatency / 100) * 100);

  const totalScore = (firstTokenScore * 0.5 + speedScore * 0.3 + latencyScore * 0.2);

  return {
    metrics,
    score: totalScore,
    issues,
    recommendations,
  };
}

/**
 * 自动调优配置
 */
export function autoTuneConfig(
  metrics: PerformanceMetrics,
  currentConfig: OptimizationConfig
): OptimizationConfig {
  const tunedConfig = { ...currentConfig };

  // 根据首字响应时间调整
  if (metrics.firstTokenTime > 1000) {
    // 启用所有优化选项
    tunedConfig.usePromptCompression = true;
    tunedConfig.cacheSystemPrompt = true;
    tunedConfig.enableConnectionPool = true;
  }

  // 根据生成速度调整
  if (metrics.tokensPerSecond < 10) {
    // 减少max_tokens
    tunedConfig.maxTokens = Math.max(1000, (currentConfig.maxTokens || 3000) * 0.8);
  }

  // 根据延迟调整
  if (metrics.streamingLatency > 100) {
    tunedConfig.chunkSize = Math.max(5, tunedConfig.chunkSize - 2);
  }

  return tunedConfig;
}

/**
 * 性能基准测试
 */
export async function benchmarkPerformance(
  messages: Array<{ role: 'user' | 'system' | 'assistant'; content: string }>,
  iterations: number = 10
): Promise<{
  averageMetrics: PerformanceMetrics;
  minMetrics: PerformanceMetrics;
  maxMetrics: PerformanceMetrics;
}> {
  const metricsList: PerformanceMetrics[] = [];

  for (let i = 0; i < iterations; i++) {
    const { stream, metrics } = await optimizedStreamCall(messages);

    // 消费流
    for await (const chunk of stream) {
      // 等待流完成
    }

    const metric = await metrics;
    metricsList.push(metric);

    // 避免过载
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 计算统计数据
  const averageMetrics: PerformanceMetrics = {
    firstTokenTime: metricsList.reduce((sum, m) => sum + m.firstTokenTime, 0) / metricsList.length,
    totalTime: metricsList.reduce((sum, m) => sum + m.totalTime, 0) / metricsList.length,
    tokenCount: metricsList.reduce((sum, m) => sum + m.tokenCount, 0) / metricsList.length,
    tokensPerSecond: metricsList.reduce((sum, m) => sum + m.tokensPerSecond, 0) / metricsList.length,
    streamingLatency: metricsList.reduce((sum, m) => sum + m.streamingLatency, 0) / metricsList.length,
  };

  const minMetrics: PerformanceMetrics = {
    firstTokenTime: Math.min(...metricsList.map(m => m.firstTokenTime)),
    totalTime: Math.min(...metricsList.map(m => m.totalTime)),
    tokenCount: Math.min(...metricsList.map(m => m.tokenCount)),
    tokensPerSecond: Math.min(...metricsList.map(m => m.tokensPerSecond)),
    streamingLatency: Math.min(...metricsList.map(m => m.streamingLatency)),
  };

  const maxMetrics: PerformanceMetrics = {
    firstTokenTime: Math.max(...metricsList.map(m => m.firstTokenTime)),
    totalTime: Math.max(...metricsList.map(m => m.totalTime)),
    tokenCount: Math.max(...metricsList.map(m => m.tokenCount)),
    tokensPerSecond: Math.max(...metricsList.map(m => m.tokensPerSecond)),
    streamingLatency: Math.max(...metricsList.map(m => m.streamingLatency)),
  };

  return {
    averageMetrics,
    minMetrics,
    maxMetrics,
  };
}

/**
 * 清理缓存
 */
export function clearPromptCache(): void {
  cachedSystemPrompt = null;
  cachedSystemPromptKey = null;
}
