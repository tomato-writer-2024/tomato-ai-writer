import { NextRequest, NextResponse } from 'next/server';
import { optimizedStreamCall, analyzePerformance, benchmarkPerformance, autoTuneConfig } from '@/lib/performanceOptimizer';

/**
 * 执行性能测试
 */
export async function POST(request: NextRequest) {
  try {
    const {
      type = 'single',
      iterations = 10,
      messages = null,
      autoTune = false,
    } = await request.json();

    // 验证参数
    if (type === 'benchmark' && (!Number.isInteger(iterations) || iterations < 1 || iterations > 100)) {
      return NextResponse.json(
        { success: false, error: '迭代次数必须在1-100之间' },
        { status: 400 }
      );
    }

    // 默认测试消息
    const testMessages = messages || [
      {
        role: 'system',
        content: '你是番茄小说平台的顶级AI写作助手。目标：完读率90%+，质量9.8分+。',
      },
      {
        role: 'user',
        content: '生成一个2000字的玄幻小说章节，主角突破境界，震惊全场。',
      },
    ];

    if (type === 'single') {
      // 单次性能测试
      console.log('开始单次性能测试...');
      const startTime = Date.now();

      const { stream, metrics } = await optimizedStreamCall(testMessages);

      // 消费流
      let content = '';
      for await (const chunk of stream) {
        content += chunk;
      }

      const metric = await metrics;
      const totalTime = Date.now() - startTime;

      // 分析性能
      const analysis = analyzePerformance(metric);

      console.log(`单次测试完成，首字响应: ${metric.firstTokenTime}ms`);

      return NextResponse.json({
        success: true,
        data: {
          type: 'single',
          metrics: {
            firstTokenTime: `${metric.firstTokenTime}ms`,
            totalTime: `${metric.totalTime}ms`,
            tokenCount: metric.tokenCount,
            tokensPerSecond: `${metric.tokensPerSecond.toFixed(2)} tokens/s`,
            streamingLatency: `${metric.streamingLatency.toFixed(2)}ms`,
          },
          analysis: {
            score: analysis.score.toFixed(2),
            issues: analysis.issues,
            recommendations: analysis.recommendations,
          },
          contentLength: content.length,
          executionTime: `${totalTime}ms`,
          meetsGoal: metric.firstTokenTime < 1000,
        },
      });

    } else if (type === 'benchmark') {
      // 基准测试（多次迭代）
      console.log(`开始基准测试，迭代次数: ${iterations}...`);
      const startTime = Date.now();

      const benchmark = await benchmarkPerformance(testMessages, iterations);

      const totalTime = Date.now() - startTime;
      const averageFirstTokenTime = benchmark.averageMetrics.firstTokenTime;

      // 分析平均性能
      const analysis = analyzePerformance(benchmark.averageMetrics);

      console.log(`基准测试完成，平均首字响应: ${averageFirstTokenTime}ms`);

      return NextResponse.json({
        success: true,
        data: {
          type: 'benchmark',
          iterations,
          average: {
            firstTokenTime: `${benchmark.averageMetrics.firstTokenTime.toFixed(0)}ms`,
            totalTime: `${benchmark.averageMetrics.totalTime.toFixed(0)}ms`,
            tokenCount: Math.round(benchmark.averageMetrics.tokenCount),
            tokensPerSecond: `${benchmark.averageMetrics.tokensPerSecond.toFixed(2)} tokens/s`,
            streamingLatency: `${benchmark.averageMetrics.streamingLatency.toFixed(2)}ms`,
          },
          min: {
            firstTokenTime: `${benchmark.minMetrics.firstTokenTime}ms`,
            totalTime: `${benchmark.minMetrics.totalTime}ms`,
            tokenCount: benchmark.minMetrics.tokenCount,
            tokensPerSecond: `${benchmark.minMetrics.tokensPerSecond.toFixed(2)} tokens/s`,
            streamingLatency: `${benchmark.minMetrics.streamingLatency.toFixed(2)}ms`,
          },
          max: {
            firstTokenTime: `${benchmark.maxMetrics.firstTokenTime}ms`,
            totalTime: `${benchmark.maxMetrics.totalTime}ms`,
            tokenCount: benchmark.maxMetrics.tokenCount,
            tokensPerSecond: `${benchmark.maxMetrics.tokensPerSecond.toFixed(2)} tokens/s`,
            streamingLatency: `${benchmark.maxMetrics.streamingLatency.toFixed(2)}ms`,
          },
          analysis: {
            score: analysis.score.toFixed(2),
            issues: analysis.issues,
            recommendations: analysis.recommendations,
          },
          executionTime: `${(totalTime / 1000).toFixed(2)}秒`,
          meetsGoal: averageFirstTokenTime < 1000,
        },
      });

    } else if (type === 'autotune') {
      // 自动调优测试
      console.log('开始自动调优测试...');
      const startTime = Date.now();

      // 第一次测试
      const { stream: stream1, metrics: metrics1 } = await optimizedStreamCall(testMessages);
      for await (const chunk of stream1) {
        // 消费流
      }
      const metric1 = await metrics1;

      // 分析并调优
      const analysis1 = analyzePerformance(metric1);
      const tunedConfig = autoTuneConfig(metric1, {
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
      });

      console.log('应用调优配置...');

      // 第二次测试（调优后）
      const { stream: stream2, metrics: metrics2 } = await optimizedStreamCall(testMessages, tunedConfig);
      for await (const chunk of stream2) {
        // 消费流
      }
      const metric2 = await metrics2;

      const totalTime = Date.now() - startTime;
      const improvement = ((metric1.firstTokenTime - metric2.firstTokenTime) / metric1.firstTokenTime) * 100;

      console.log(`自动调优完成，首字响应优化: ${improvement.toFixed(2)}%`);

      return NextResponse.json({
        success: true,
        data: {
          type: 'autotune',
          before: {
            firstTokenTime: `${metric1.firstTokenTime}ms`,
            totalTime: `${metric1.totalTime}ms`,
            tokenCount: metric1.tokenCount,
            tokensPerSecond: `${metric1.tokensPerSecond.toFixed(2)} tokens/s`,
          },
          after: {
            firstTokenTime: `${metric2.firstTokenTime}ms`,
            totalTime: `${metric2.totalTime}ms`,
            tokenCount: metric2.tokenCount,
            tokensPerSecond: `${metric2.tokensPerSecond.toFixed(2)} tokens/s`,
          },
          improvement: {
            firstTokenTime: `${improvement.toFixed(2)}%`,
            totalTime: `${((metric1.totalTime - metric2.totalTime) / metric1.totalTime * 100).toFixed(2)}%`,
          },
          tunedConfig: {
            temperature: tunedConfig.temperature,
            maxTokens: tunedConfig.maxTokens,
            usePromptCompression: tunedConfig.usePromptCompression,
            cacheSystemPrompt: tunedConfig.cacheSystemPrompt,
            chunkSize: tunedConfig.chunkSize,
          },
          executionTime: `${(totalTime / 1000).toFixed(2)}秒`,
        },
      });

    } else {
      return NextResponse.json(
        { success: false, error: '无效的测试类型' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('性能测试失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '性能测试失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取性能测试配置
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      description: '性能测试API - 用于验证和优化AI响应时间',
      endpoints: {
        POST: {
          description: '执行性能测试',
          parameters: {
            type: '测试类型 (single/benchmark/autotune, 默认single)',
            iterations: '迭代次数 (仅benchmark, 1-100, 默认10)',
            messages: '自定义测试消息 (可选)',
            autoTune: '是否自动调优 (默认false)',
          },
          response: {
            type: '测试类型',
            metrics: '性能指标',
            analysis: '性能分析',
            executionTime: '执行时间',
            meetsGoal: '是否达到目标(<1秒)',
          },
        },
      },
      targets: {
        firstTokenTime: '<1000ms (优化目标: <500ms)',
        tokensPerSecond: '>10 tokens/s',
        streamingLatency: '<100ms',
      },
    },
  });
}
