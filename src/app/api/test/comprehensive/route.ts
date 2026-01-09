import { NextRequest, NextResponse } from 'next/server';
import { ComprehensiveTestExecutor } from '@/lib/comprehensiveTestExecutor';
import { FEATURE_MODULES, getStatistics } from '@/lib/featureAudit';

/**
 * 综合测试执行API
 *
 * POST /api/test/comprehensive - 执行所有功能的综合测试
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      testCount = 1000,
      parallelExecutions = 10,
      timeoutMs = 30000,
      verbose = true,
    } = body || {};

    console.log('='.repeat(80));
    console.log('开始执行综合测试');
    console.log('='.repeat(80));

    // 1. 功能审计
    console.log('\n📋 步骤1: 功能审计');
    const stats = getStatistics();
    console.log(`总功能数: ${stats.totalFeatures}`);
    console.log(`已完成: ${stats.completedFeatures}`);
    console.log(`完成率: ${stats.completionRate}%`);

    // 2. 执行综合测试
    console.log('\n🧪 步骤2: 执行综合测试');
    const executor = new ComprehensiveTestExecutor({
      testCount,
      parallelExecutions,
      timeoutMs,
      verbose,
    });

    const testReport = await executor.executeAllTests();

    // 3. 生成详细报告
    console.log('\n📊 步骤3: 生成测试报告');
    const detailedReport = {
      timestamp: new Date().toISOString(),
      featureAudit: {
        modules: FEATURE_MODULES.map(module => ({
          id: module.id,
          name: module.name,
          status: module.status,
          progress: module.progress,
          featureCount: module.features.length,
          completedFeatures: module.features.filter(f => f.status === 'completed').length,
        })),
        statistics: stats,
      },
      testResults: {
        summary: testReport.summary,
        categoryBreakdown: testReport.categoryBreakdown,
        performanceMetrics: testReport.performanceMetrics,
      },
      failedTests: testReport.results.filter(r => r.status === 'failed'),
      timeoutTests: testReport.results.filter(r => r.status === 'timeout'),
      issues: testReport.issues,
      recommendations: testReport.recommendations,
    };

    console.log('\n✅ 测试执行完成');
    console.log(`总测试数: ${testReport.summary.totalTests}`);
    console.log(`通过: ${testReport.summary.passedTests}`);
    console.log(`失败: ${testReport.summary.failedTests}`);
    console.log(`超时: ${testReport.summary.timeoutTests}`);
    console.log(`通过率: ${testReport.summary.passRate}%`);
    console.log(`总耗时: ${(testReport.summary.totalDuration / 1000).toFixed(2)}s`);
    console.log('='.repeat(80));

    return NextResponse.json({
      success: true,
      report: detailedReport,
    });
  } catch (error: any) {
    console.error('综合测试执行失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '测试执行失败',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test/comprehensive - 获取测试状态和历史
 */
export async function GET() {
  return NextResponse.json({
    message: '使用POST方法执行综合测试',
    example: {
      testCount: 1000,
      parallelExecutions: 10,
      timeoutMs: 30000,
      verbose: true,
    },
  });
}
