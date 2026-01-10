import { NextRequest, NextResponse } from 'next/server';
import { NewFeaturesTestExecutor } from '@/lib/newFeaturesTestExecutor';

// POST /api/test/new-features - 执行新功能模块千例测试
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const testCount = body.testCount || 1000;

    console.log('开始执行新功能模块千例测试...');
    const executor = new NewFeaturesTestExecutor(testCount);
    const reports = await executor.executeAllTests();

    return NextResponse.json({
      success: true,
      data: reports,
      summary: {
        totalFeatures: reports.length,
        totalTests: reports.reduce((sum, r) => sum + r.summary.totalTests, 0),
        totalSuccess: reports.reduce((sum, r) => sum + r.summary.successCount, 0),
        overallSuccessRate: 0,
        avgQualityScore: reports.reduce((sum, r) => sum + r.summary.avgQualityScore, 0) / reports.length,
        avgReadRate: reports.reduce((sum, r) => sum + r.summary.avgReadRate, 0) / reports.length,
      },
    });
  } catch (error) {
    console.error('执行新功能测试失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '执行测试失败' },
      { status: 500 }
    );
  }
}
