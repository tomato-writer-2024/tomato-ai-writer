import { NextRequest, NextResponse } from 'next/server';
import { generateTestCases, exportTestCases } from '@/lib/testFramework/testDataGenerator';
import { executeBatchTests, exportTestResults } from '@/lib/testFramework/testExecutor';

/**
 * 执行生成功能测试
 */
export async function POST(request: NextRequest) {
  try {
    const { count = 100, types = ['generate'], onServer = false } = await request.json();

    // 验证参数
    if (!Number.isInteger(count) || count < 1 || count > 10000) {
      return NextResponse.json(
        { success: false, error: '测试数量必须在1-10000之间' },
        { status: 400 }
      );
    }

    // 生成测试用例
    console.log(`正在生成 ${count} 个测试用例...`);
    const testCases = generateTestCases(count, types as any);
    console.log(`测试用例生成完成: ${testCases.length} 个`);

    // 执行测试
    console.log('开始执行测试...');
    const startTime = Date.now();
    const summary = await executeBatchTests(testCases, (progress, total) => {
      const percentage = ((progress / total) * 100).toFixed(2);
      console.log(`测试进度: ${progress}/${total} (${percentage}%)`);
    });
    const executionTime = Date.now() - startTime;

    console.log(`测试完成，总耗时: ${(executionTime / 1000).toFixed(2)}秒`);

    // 返回结果
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total: summary.total,
          passed: summary.passed,
          failed: summary.failed,
          passRate: summary.passRate.toFixed(2) + '%',
          avgExecutionTime: summary.avgExecutionTime.toFixed(0) + 'ms',
          avgResponseTime: summary.avgResponseTime.toFixed(0) + 'ms',
          avgWordCount: Math.round(summary.avgWordCount),
          avgCompletionRate: summary.avgCompletionRate.toFixed(2) + '%',
          avgQualityScore: (summary.avgQualityScore).toFixed(2),
          minResponseTime: summary.minResponseTime.toFixed(0) + 'ms',
          maxResponseTime: summary.maxResponseTime.toFixed(0) + 'ms',
          responseTimeUnder1s: summary.responseTimeUnder1s.toFixed(2) + '%',
        },
        executionTime: `${(executionTime / 1000).toFixed(2)}秒`,
        testCaseCount: testCases.length,
      },
    });
  } catch (error) {
    console.error('测试执行失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '测试执行失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取测试配置
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      description: '批量测试API - 用于验证生成功能',
      endpoints: {
        POST: {
          description: '执行批量测试',
          parameters: {
            count: '测试数量 (1-10000, 默认100)',
            types: '测试类型数组 (generate/continue/polish, 默认[generate])',
          },
          response: {
            summary: '测试汇总数据',
            executionTime: '总执行时间',
            testCaseCount: '测试用例数量',
          },
        },
      },
    },
  });
}
