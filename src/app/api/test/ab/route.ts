import { NextRequest, NextResponse } from 'next/server';
import { generateTestCases } from '@/lib/testFramework/testDataGenerator';
import { runABTest, createPresetABTests, PROMPT_VARIANTS, PARAMETER_VARIANTS } from '@/lib/testFramework/abTestingFramework';

/**
 * 执行A/B测试
 */
export async function POST(request: NextRequest) {
  try {
    const {
      count = 100,
      testType = 'preset',
      customVariants = null,
      presetIndex = 0,
    } = await request.json();

    // 验证参数
    if (!Number.isInteger(count) || count < 10 || count > 1000) {
      return NextResponse.json(
        { success: false, error: '测试数量必须在10-1000之间' },
        { status: 400 }
      );
    }

    // 生成测试用例（只生成，因为要用于多个变体）
    console.log(`正在生成 ${count} 个测试用例...`);
    const testCases = generateTestCases(count, ['generate', 'continue', 'polish']);
    console.log(`测试用例生成完成: ${testCases.length} 个`);

    // 选择变体配置
    let variants;
    if (testType === 'preset') {
      const presetTests = createPresetABTests();
      variants = presetTests[presetIndex] || presetTests[0];
    } else if (testType === 'custom' && customVariants) {
      variants = customVariants;
    } else {
      return NextResponse.json(
        { success: false, error: '无效的测试类型或变体配置' },
        { status: 400 }
      );
    }

    console.log(`开始执行A/B测试，变体数量: ${variants.length}`);

    // 执行A/B测试
    const startTime = Date.now();
    const comparison = await runABTest(testCases, variants, (variant, progress, total) => {
      const percentage = ((progress / total) * 100).toFixed(2);
      console.log(`[${variant}] 进度: ${progress}/${total} (${percentage}%)`);
    });
    const executionTime = Date.now() - startTime;

    console.log(`A/B测试完成，总耗时: ${(executionTime / 1000).toFixed(2)}秒`);

    // 格式化结果
    const formattedResults = {
      testId: comparison.testId,
      testName: comparison.testName,
      winner: comparison.winner,
      improvement: comparison.metrics.improvement.toFixed(2) + '%',
      bestMetric: comparison.metrics.bestMetric,
      recommendations: comparison.metrics.recommendations,
      variants: comparison.variants.map(v => ({
        name: v.variant,
        summary: {
          total: v.summary.total,
          passed: v.summary.passed,
          passRate: v.summary.passRate.toFixed(2) + '%',
          avgResponseTime: v.summary.avgResponseTime.toFixed(0) + 'ms',
          avgWordCount: Math.round(v.summary.avgWordCount),
          avgCompletionRate: v.summary.avgCompletionRate.toFixed(2) + '%',
          avgQualityScore: v.summary.avgQualityScore.toFixed(2),
          responseTimeUnder1s: v.summary.avgResponseTime.toFixed(2) + '%',
        },
      })),
      executionTime: `${(executionTime / 1000).toFixed(2)}秒`,
    };

    return NextResponse.json({
      success: true,
      data: formattedResults,
    });
  } catch (error) {
    console.error('A/B测试执行失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'A/B测试执行失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取A/B测试配置
 */
export async function GET() {
  const presetTests = createPresetABTests();

  return NextResponse.json({
    success: true,
    data: {
      description: 'A/B测试API - 用于对比不同配置的效果',
      endpoints: {
        POST: {
          description: '执行A/B测试',
          parameters: {
            count: '测试数量 (10-1000, 默认100)',
            testType: '测试类型 (preset/custom, 默认preset)',
            presetIndex: '预设测试索引 (0-3, 默认0)',
            customVariants: '自定义变体配置 (仅当testType=custom时)',
          },
          response: {
            testId: '测试ID',
            testName: '测试名称',
            winner: '胜者变体',
            improvement: '改进幅度',
            bestMetric: '最佳指标',
            recommendations: '优化建议',
            variants: '各变体详细结果',
          },
        },
      },
      presets: presetTests.map((test, index) => ({
        index,
        name: `预设测试${index + 1}`,
        variants: test.map(v => v.name),
      })),
      promptVariants: Object.keys(PROMPT_VARIANTS),
      parameterVariants: Object.keys(PARAMETER_VARIANTS),
    },
  });
}
