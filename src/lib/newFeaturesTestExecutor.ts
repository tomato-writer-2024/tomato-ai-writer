/**
 * 新功能模块千例测试执行器
 * 执行11个核心功能模块的批量测试并生成报告
 */

import { FeatureTestConfig, FeatureTestCase, FeatureTestResult, FeatureTestReport } from './newFeaturesTestFramework';
import { NewFeaturesTestDataGenerator } from './newFeaturesTestFramework';
import { LLMClient } from './llmClient';

// ============================================================================
// 测试执行器类
// ============================================================================

export class NewFeaturesTestExecutor {
  private generator: NewFeaturesTestDataGenerator;
  private llmClient: LLMClient;
  private results: FeatureTestResult[] = [];
  private testCount: number;

  constructor(testCount: number = 1000) {
    this.generator = new NewFeaturesTestDataGenerator();
    this.llmClient = new LLMClient();
    this.testCount = testCount;
  }

  /**
   * 执行所有功能模块的测试
   */
  async executeAllTests(): Promise<FeatureTestReport[]> {
    const reports: FeatureTestReport[] = [];

    console.log('='.repeat(80));
    console.log('开始执行新功能模块千例测试');
    console.log(`每个功能测试数量: ${this.testCount}`);
    console.log('='.repeat(80));

    // 执行每个功能的测试
    reports.push(await this.executeCharacterTests());
    reports.push(await this.executeWorldBuildingTests());
    reports.push(await this.executeOutlineTests());
    reports.push(await this.executeRelationshipMapTests());
    reports.push(await this.executeWriterBlockTests());
    reports.push(await this.executeSatisfactionTests());
    reports.push(await this.executeStyleSimulatorTests());
    reports.push(await this.executePlotTwistTests());
    reports.push(await this.executeEndingTests());
    reports.push(await this.executeTitleTests());
    reports.push(await this.executeCoverTests());

    return reports;
  }

  /**
   * 执行角色设定功能测试
   */
  private async executeCharacterTests(): Promise<FeatureTestReport> {
    console.log('\n🎭 执行角色设定功能测试...');
    const featureName = 'characters';
    const testCases = this.generator.generateCharacterTestData(this.testCount);
    const results: FeatureTestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.executeSingleTest(featureName, testCase);
      results.push(result);

      // 每完成100个测试输出一次进度
      if (results.length % 100 === 0) {
        console.log(`  进度: ${results.length}/${this.testCount}`);
      }
    }

    return this.generateReport(featureName, results);
  }

  /**
   * 执行世界观构建功能测试
   */
  private async executeWorldBuildingTests(): Promise<FeatureTestReport> {
    console.log('\n🌍 执行世界观构建功能测试...');
    const featureName = 'world-building';
    const testCases = this.generator.generateWorldBuildingTestData(this.testCount);
    const results: FeatureTestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.executeSingleTest(featureName, testCase);
      results.push(result);

      if (results.length % 100 === 0) {
        console.log(`  进度: ${results.length}/${this.testCount}`);
      }
    }

    return this.generateReport(featureName, results);
  }

  /**
   * 执行智能大纲功能测试
   */
  private async executeOutlineTests(): Promise<FeatureTestReport> {
    console.log('\n📖 执行智能大纲功能测试...');
    const featureName = 'outline-generator';
    const testCases = this.generator.generateOutlineTestData(this.testCount);
    const results: FeatureTestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.executeSingleTest(featureName, testCase);
      results.push(result);

      if (results.length % 100 === 0) {
        console.log(`  进度: ${results.length}/${this.testCount}`);
      }
    }

    return this.generateReport(featureName, results);
  }

  /**
   * 执行人物关系图谱功能测试
   */
  private async executeRelationshipMapTests(): Promise<FeatureTestReport> {
    console.log('\n🔗 执行人物关系图谱功能测试...');
    const featureName = 'relationship-map';
    const testCases = this.generator.generateRelationshipMapTestData(this.testCount);
    const results: FeatureTestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.executeSingleTest(featureName, testCase);
      results.push(result);

      if (results.length % 100 === 0) {
        console.log(`  进度: ${results.length}/${this.testCount}`);
      }
    }

    return this.generateReport(featureName, results);
  }

  /**
   * 执行卡文诊断功能测试
   */
  private async executeWriterBlockTests(): Promise<FeatureTestReport> {
    console.log('\n💭 执行卡文诊断功能测试...');
    const featureName = 'writer-block';
    const testCases = this.generator.generateWriterBlockTestData(this.testCount);
    const results: FeatureTestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.executeSingleTest(featureName, testCase);
      results.push(result);

      if (results.length % 100 === 0) {
        console.log(`  进度: ${results.length}/${this.testCount}`);
      }
    }

    return this.generateReport(featureName, results);
  }

  /**
   * 执行爽点优化功能测试
   */
  private async executeSatisfactionTests(): Promise<FeatureTestReport> {
    console.log('\n⭐ 执行爽点优化功能测试...');
    const featureName = 'satisfaction-engine';
    const testCases = this.generator.generateSatisfactionTestData(this.testCount);
    const results: FeatureTestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.executeSingleTest(featureName, testCase);
      results.push(result);

      if (results.length % 100 === 0) {
        console.log(`  进度: ${results.length}/${this.testCount}`);
      }
    }

    return this.generateReport(featureName, results);
  }

  /**
   * 执行文风模拟功能测试
   */
  private async executeStyleSimulatorTests(): Promise<FeatureTestReport> {
    console.log('\n✒️ 执行文风模拟功能测试...');
    const featureName = 'style-simulator';
    const testCases = this.generator.generateStyleSimulatorTestData(this.testCount);
    const results: FeatureTestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.executeSingleTest(featureName, testCase);
      results.push(result);

      if (results.length % 100 === 0) {
        console.log(`  进度: ${results.length}/${this.testCount}`);
      }
    }

    return this.generateReport(featureName, results);
  }

  /**
   * 执行情节反转功能测试
   */
  private async executePlotTwistTests(): Promise<FeatureTestReport> {
    console.log('\n🔄 执行情节反转功能测试...');
    const featureName = 'plot-twist';
    const testCases = this.generator.generatePlotTwistTestData(this.testCount);
    const results: FeatureTestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.executeSingleTest(featureName, testCase);
      results.push(result);

      if (results.length % 100 === 0) {
        console.log(`  进度: ${results.length}/${this.testCount}`);
      }
    }

    return this.generateReport(featureName, results);
  }

  /**
   * 执行结局生成功能测试
   */
  private async executeEndingTests(): Promise<FeatureTestReport> {
    console.log('\n🎬 执行结局生成功能测试...');
    const featureName = 'ending-generator';
    const testCases = this.generator.generateEndingTestData(this.testCount);
    const results: FeatureTestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.executeSingleTest(featureName, testCase);
      results.push(result);

      if (results.length % 100 === 0) {
        console.log(`  进度: ${results.length}/${this.testCount}`);
      }
    }

    return this.generateReport(featureName, results);
  }

  /**
   * 执行书名生成功能测试
   */
  private async executeTitleTests(): Promise<FeatureTestReport> {
    console.log('\n📝 执行书名生成功能测试...');
    const featureName = 'title-generator';
    const testCases = this.generator.generateTitleTestData(this.testCount);
    const results: FeatureTestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.executeSingleTest(featureName, testCase);
      results.push(result);

      if (results.length % 100 === 0) {
        console.log(`  进度: ${results.length}/${this.testCount}`);
      }
    }

    return this.generateReport(featureName, results);
  }

  /**
   * 执行封面描述生成功能测试
   */
  private async executeCoverTests(): Promise<FeatureTestReport> {
    console.log('\n🎨 执行封面描述生成功能测试...');
    const featureName = 'cover-generator';
    const testCases = this.generator.generateCoverTestData(this.testCount);
    const results: FeatureTestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.executeSingleTest(featureName, testCase);
      results.push(result);

      if (results.length % 100 === 0) {
        console.log(`  进度: ${results.length}/${this.testCount}`);
      }
    }

    return this.generateReport(featureName, results);
  }

  /**
   * 执行单个测试用例
   */
  private async executeSingleTest(
    featureName: string,
    testCase: FeatureTestCase
  ): Promise<FeatureTestResult> {
    const startTime = Date.now();

    try {
      // 调用API
      const apiUrl = `/api/${featureName}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.input),
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (!response.ok) {
        const error = await response.json();
        return {
          testId: testCase.id,
          featureName,
          genre: testCase.genre,
          status: 'failed',
          responseTime,
          qualityScore: 0,
          readRate: 0,
          generatedContent: '',
          error: error.error || 'API调用失败',
          metrics: {},
        };
      }

      const data = await response.json();

      // 评估生成质量
      const qualityScore = this.evaluateQualityScore(data, featureName);
      const readRate = this.evaluateReadRate(data, featureName);

      const status =
        qualityScore >= testCase.expectedMetrics.minQualityScore &&
        readRate >= testCase.expectedMetrics.minReadRate &&
        responseTime <= testCase.expectedMetrics.maxResponseTime
          ? 'success'
          : 'failed';

      return {
        testId: testCase.id,
        featureName,
        genre: testCase.genre,
        status,
        responseTime,
        qualityScore,
        readRate,
        generatedContent: typeof data === 'string' ? data : JSON.stringify(data),
        metrics: data,
      };
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        testId: testCase.id,
        featureName,
        genre: testCase.genre,
        status: 'failed',
        responseTime,
        qualityScore: 0,
        readRate: 0,
        generatedContent: '',
        error: error instanceof Error ? error.message : '未知错误',
        metrics: {},
      };
    }
  }

  /**
   * 评估质量分数
   */
  private evaluateQualityScore(data: any, featureName: string): number {
    // 基于数据内容评估质量
    let score = 0;

    const content = typeof data === 'string' ? data : JSON.stringify(data);

    // 内容长度评分（基础分）
    if (content.length > 100) score += 20;
    if (content.length > 300) score += 20;
    if (content.length > 500) score += 10;

    // 结构完整性评分
    if (data && typeof data === 'object') {
      if (Object.keys(data).length > 3) score += 10;
      if (Object.keys(data).length > 5) score += 10;
    }

    // 关键词评分
    const keywords = [
      '主角', '能力', '性格', '背景', '目标',
      '世界', '规则', '势力', '历史', '文化',
      '章节', '情节', '高潮', '结局',
      '冲突', '反转', '伏笔', '悬念',
      '爽点', '节奏', '期待', '满足',
    ];
    const keywordCount = keywords.filter(keyword => content.includes(keyword)).length;
    score += keywordCount * 2;

    // 番茄小说风格评分
    const tomatoKeywords = [
      '震惊', '碾压', '全场', '震撼', '轰爆',
      '恐怖', '惊人', '底牌', '逆天', '变态',
      '绝世', '无敌', '至尊', '巅峰', '至高',
    ];
    const tomatoCount = tomatoKeywords.filter(keyword => content.includes(keyword)).length;
    score += tomatoCount * 3;

    return Math.min(100, score);
  }

  /**
   * 评估完读率
   */
  private evaluateReadRate(data: any, featureName: string): number {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    let rate = 50; // 基础完读率

    // 爽点密度影响完读率
    const shuangdianKeywords = [
      '打脸', '装逼', '突破', '收获', '情感',
      '震惊', '碾压', '全场', '震撼', '轰爆',
    ];
    const shuangdianCount = shuangdianKeywords.filter(keyword => content.includes(keyword)).length;
    rate += shuangdianCount * 3;

    // 悬念和反转影响完读率
    const suspenseKeywords = [
      '悬念', '伏笔', '反转', '真相', '揭秘',
      '意外', '震惊', '难以置信', '没想到', '竟然',
    ];
    const suspenseCount = suspenseKeywords.filter(keyword => content.includes(keyword)).length;
    rate += suspenseCount * 2;

    return Math.min(100, rate);
  }

  /**
   * 生成测试报告
   */
  private generateReport(
    featureName: string,
    results: FeatureTestResult[]
  ): FeatureTestReport {
    const summary = {
      totalTests: results.length,
      successCount: results.filter(r => r.status === 'success').length,
      failedCount: results.filter(r => r.status === 'failed').length,
      successRate: 0,
      avgResponseTime: 0,
      avgQualityScore: 0,
      avgReadRate: 0,
    };

    summary.successRate = (summary.successCount / summary.totalTests) * 100;
    summary.avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    summary.avgQualityScore = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
    summary.avgReadRate = results.reduce((sum, r) => sum + r.readRate, 0) / results.length;

    // 按题材分类统计
    const genreBreakdown: Record<string, any> = {};
    results.forEach(result => {
      if (!genreBreakdown[result.genre]) {
        genreBreakdown[result.genre] = {
          totalTests: 0,
          successCount: 0,
          avgQualityScore: 0,
          avgReadRate: 0,
        };
      }
      genreBreakdown[result.genre].totalTests++;
      if (result.status === 'success') {
        genreBreakdown[result.genre].successCount++;
      }
    });

    // 计算各题材的平均分
    Object.keys(genreBreakdown).forEach(genre => {
      const genreResults = results.filter(r => r.genre === genre);
      genreBreakdown[genre].avgQualityScore =
        genreResults.reduce((sum, r) => sum + r.qualityScore, 0) / genreResults.length;
      genreBreakdown[genre].avgReadRate =
        genreResults.reduce((sum, r) => sum + r.readRate, 0) / genreResults.length;
    });

    // 分析问题和建议
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (summary.successRate < 90) {
      issues.push(`成功率偏低，仅${summary.successRate.toFixed(2)}%`);
      recommendations.push('优化AI提示词，提升生成质量');
    }

    if (summary.avgQualityScore < 85) {
      issues.push(`平均质量分数偏低，仅${summary.avgQualityScore.toFixed(2)}分`);
      recommendations.push('增强内容深度和细节描写');
    }

    if (summary.avgReadRate < 65) {
      issues.push(`平均完读率偏低，仅${summary.avgReadRate.toFixed(2)}%`);
      recommendations.push('增加爽点密度，提升情节吸引力');
    }

    if (summary.avgResponseTime > 3000) {
      issues.push(`平均响应时间偏长，${summary.avgResponseTime.toFixed(0)}ms`);
      recommendations.push('优化API性能，减少响应时间');
    }

    return {
      featureName,
      summary,
      genreBreakdown,
      results,
      issues,
      recommendations,
    };
  }
}
