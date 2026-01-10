/**
 * 双视角评分系统
 * 从编辑视角和读者视角评估内容质量
 * 目标：双视角均达到9.8分+
 */

import { DUAL_PERSPECTIVE_RATING } from './tomatoNovelPrompts';

// ============================================================================
// 评分标准
// ============================================================================

export interface EditorRating {
  perspective: 'editor';
  scores: {
    文笔: number; // 0-15
    结构: number; // 0-20
    人物: number; // 0-15
    情节: number; // 0-20
    创新: number; // 0-10
    商业: number; // 0-20
  };
  totalScore: number; // 0-100
  level: '优秀' | '良好' | '中等' | '较差' | '不合格';
  comments: string[];
}

export interface ReaderRating {
  perspective: 'reader';
  scores: {
    爽感: number; // 0-25
    代入: number; // 0-20
    节奏: number; // 0-15
    悬念: number; // 0-15
    人物: number; // 0-10
    结局: number; // 0-15
  };
  totalScore: number; // 0-100
  level: '神作' | '佳作' | '好看' | '一般' | '难看' | '弃书';
  comments: string[];
}

export interface DualPerspectiveRating {
  editor: EditorRating;
  reader: ReaderRating;
  overallScore: number; // 双视角平均分
  targetMet: boolean; // 是否达到双视角9.8分+目标
  recommendations: string[];
}

// ============================================================================
// 评分器类
// ============================================================================

export class DualPerspectiveRatingSystem {
  /**
   * 从编辑视角评分
   */
  rateFromEditorPerspective(content: string, metadata: any): EditorRating {
    const scores = {
      文笔: this.rateWritingStyle(content),
      结构: this.rateStructure(content),
      人物: this.rateCharacter(content),
      情节: this.ratePlot(content),
      创新: this.rateInnovation(content, metadata),
      商业: this.rateCommercialPotential(content, metadata),
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const level = this.getEditorLevel(totalScore);
    const comments = this.generateEditorComments(scores, totalScore);

    return {
      perspective: 'editor',
      scores,
      totalScore,
      level,
      comments,
    };
  }

  /**
   * 从读者视角评分
   */
  rateFromReaderPerspective(content: string, metadata: any): ReaderRating {
    const scores = {
      爽感: this.rateShuangdian(content),
      代入: this.rateImmersion(content),
      节奏: this.ratePacing(content),
      悬念: this.rateSuspense(content),
      人物: this.rateCharacterAppeal(content),
      结局: this.rateEnding(content),
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const level = this.getReaderLevel(totalScore);
    const comments = this.generateReaderComments(scores, totalScore);

    return {
      perspective: 'reader',
      scores,
      totalScore,
      level,
      comments,
    };
  }

  /**
   * 双视角综合评分
   */
  rateDualPerspective(content: string, metadata: any): DualPerspectiveRating {
    const editor = this.rateFromEditorPerspective(content, metadata);
    const reader = this.rateFromReaderPerspective(content, metadata);
    const overallScore = (editor.totalScore + reader.totalScore) / 2;
    const targetMet = editor.totalScore >= 98 && reader.totalScore >= 98;
    const recommendations = this.generateRecommendations(editor, reader, targetMet);

    return {
      editor,
      reader,
      overallScore,
      targetMet,
      recommendations,
    };
  }

  // ============================================================================
  // 编辑视角评分方法
  // ============================================================================

  private rateWritingStyle(content: string): number {
    let score = 8; // 基础分

    // 文字流畅度
    if (content.length > 500) score += 2;
    if (content.length > 1000) score += 2;

    // 用词准确性
    const accurateWords = ['展现', '描述', '刻画', '突出', '体现'];
    const accurateCount = accurateWords.filter(word => content.includes(word)).length;
    score += accurateCount;

    // 表现力
    const expressiveWords = ['震撼', '惊艳', '绝妙', '精妙', '深刻'];
    const expressiveCount = expressiveWords.filter(word => content.includes(word)).length;
    score += expressiveCount * 0.5;

    return Math.min(15, score);
  }

  private rateStructure(content: string): number {
    let score = 10; // 基础分

    // 章节结构
    const hasOpening = content.length > 0;
    const hasDevelopment = content.length > 200;
    const hasClimax = content.includes('高潮') || content.includes('巅峰');
    const hasEnding = content.length > 500;

    if (hasOpening) score += 2;
    if (hasDevelopment) score += 2;
    if (hasClimax) score += 3;
    if (hasEnding) score += 3;

    return Math.min(20, score);
  }

  private rateCharacter(content: string): number {
    let score = 8; // 基础分

    // 人物塑造
    const characterKeywords = ['性格', '背景', '动机', '成长', '特质'];
    const characterCount = characterKeywords.filter(keyword => content.includes(keyword)).length;
    score += characterCount;

    // 性格描述
    const personalityWords = ['坚韧', '不屈', '智慧', '勇敢', '善良'];
    const personalityCount = personalityWords.filter(word => content.includes(word)).length;
    score += personalityCount * 0.5;

    return Math.min(15, score);
  }

  private ratePlot(content: string): number {
    let score = 10; // 基础分

    // 情节设计
    const plotKeywords = ['冲突', '转折', '高潮', '悬念', '伏笔'];
    const plotCount = plotKeywords.filter(keyword => content.includes(keyword)).length;
    score += plotCount;

    // 吸引力
    const attractiveWords = ['震撼', '惊人', '意外', '精彩', '激动'];
    const attractiveCount = attractiveWords.filter(word => content.includes(word)).length;
    score += attractiveCount * 0.5;

    return Math.min(20, score);
  }

  private rateInnovation(content: string, metadata: any): number {
    let score = 5; // 基础分

    // 创新点
    const innovationKeywords = ['独特', '新颖', '创新', '原创', '首创'];
    const innovationCount = innovationKeywords.filter(keyword => content.includes(keyword)).length;
    score += innovationCount;

    // 差异化
    if (metadata?.genre) {
      score += 2;
    }

    return Math.min(10, score);
  }

  private rateCommercialPotential(content: string, metadata: any): number {
    let score = 10; // 基础分

    // 爆款属性
    const blockbusterWords = ['爽', '炸', '燃', '爆', '火'];
    const blockbusterCount = blockbusterWords.filter(word => content.includes(word)).length;
    score += blockbusterCount * 2;

    // 商业价值
    const commercialWords = ['爆款', '热门', '畅销', '排行', '推荐'];
    const commercialCount = commercialWords.filter(word => content.includes(word)).length;
    score += commercialCount;

    return Math.min(20, score);
  }

  private getEditorLevel(score: number): EditorRating['level'] {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '中等';
    if (score >= 60) return '较差';
    return '不合格';
  }

  private generateEditorComments(scores: Record<string, number>, totalScore: number): string[] {
    const comments: string[] = [];

    if (totalScore >= 90) {
      comments.push('具备爆款潜力，强烈推荐签约');
    } else if (totalScore >= 80) {
      comments.push('质量优秀，有潜力成为爆款');
    } else if (totalScore >= 70) {
      comments.push('质量尚可，需要优化');
    } else {
      comments.push('存在明显问题，需要大幅修改');
    }

    // 具体建议
    if (scores.文笔 < 12) {
      comments.push('建议提升用词准确性和表现力');
    }
    if (scores.结构 < 16) {
      comments.push('建议优化章节结构和节奏把控');
    }
    if (scores.人物 < 12) {
      comments.push('建议增强人物塑造和性格刻画');
    }
    if (scores.情节 < 16) {
      comments.push('建议优化情节设计和冲突设置');
    }
    if (scores.创新 < 8) {
      comments.push('建议增加创新点和差异化');
    }
    if (scores.商业 < 16) {
      comments.push('建议提升商业潜力和爆款属性');
    }

    return comments;
  }

  // ============================================================================
  // 读者视角评分方法
  // ============================================================================

  private rateShuangdian(content: string): number {
    let score = 10; // 基础分

    // 爽点密度
    const shuangdianKeywords = [
      '打脸', '装逼', '突破', '收获', '碾压',
      '震惊', '轰爆', '恐怖', '逆天', '绝世',
    ];
    const shuangdianCount = shuangdianKeywords.filter(keyword => content.includes(keyword)).length;
    score += shuangdianCount * 1.5;

    return Math.min(25, score);
  }

  private rateImmersion(content: string): number {
    let score = 10; // 基础分

    // 代入感
    const immersionWords = ['主角', '我', '我们', '本人', '亲自'];
    const immersionCount = immersionWords.filter(word => content.includes(word)).length;
    score += immersionCount * 1;

    // 情感共鸣
    const emotionWords = ['感动', '震撼', '激动', '热血', '热血沸腾'];
    const emotionCount = emotionWords.filter(word => content.includes(word)).length;
    score += emotionCount * 1;

    return Math.min(20, score);
  }

  private ratePacing(content: string): number {
    let score = 8; // 基础分

    // 节奏快慢
    if (content.length > 500) score += 2;
    if (content.length > 1000) score += 2;

    // 阅读流畅度
    const flowWords = ['流畅', '顺畅', '自然', '连贯', '一气呵成'];
    const flowCount = flowWords.filter(word => content.includes(word)).length;
    score += flowCount;

    return Math.min(15, score);
  }

  private rateSuspense(content: string): number {
    let score = 8; // 基础分

    // 悬念设置
    const suspenseWords = ['悬念', '期待', '好奇', '未知', '谜团'];
    const suspenseCount = suspenseWords.filter(word => content.includes(word)).length;
    score += suspenseCount * 1.5;

    // 追读动力
    const motivationWords = ['追读', '期待', '想知道', '继续', '后续'];
    const motivationCount = motivationWords.filter(word => content.includes(word)).length;
    score += motivationCount * 1;

    return Math.min(15, score);
  }

  private rateCharacterAppeal(content: string): number {
    let score = 5; // 基础分

    // 人物魅力
    const charmWords = ['魅力', '吸引', '喜欢', '崇拜', '敬佩'];
    const charmCount = charmWords.filter(word => content.includes(word)).length;
    score += charmCount * 1;

    // 好感度
    const favorWords = ['好感', '爱慕', '倾心', '迷恋', '痴迷'];
    const favorCount = favorWords.filter(word => content.includes(word)).length;
    score += favorCount * 0.5;

    return Math.min(10, score);
  }

  private rateEnding(content: string): number {
    let score = 8; // 基础分

    // 结局满意度
    const satisfactionWords = ['圆满', '完美', '满意', '精彩', '震撼'];
    const satisfactionCount = satisfactionWords.filter(word => content.includes(word)).length;
    score += satisfactionCount * 1.5;

    // 意犹未尽感
    const aftertasteWords = ['回味', '意犹未尽', '期待', '续集', '继续'];
    const aftertasteCount = aftertasteWords.filter(word => content.includes(word)).length;
    score += aftertasteCount * 1;

    return Math.min(15, score);
  }

  private getReaderLevel(score: number): ReaderRating['level'] {
    if (score >= 95) return '神作';
    if (score >= 90) return '佳作';
    if (score >= 80) return '好看';
    if (score >= 70) return '一般';
    if (score >= 60) return '难看';
    return '弃书';
  }

  private generateReaderComments(scores: Record<string, number>, totalScore: number): string[] {
    const comments: string[] = [];

    if (totalScore >= 95) {
      comments.push('追读动力极强，愿意付费订阅');
    } else if (totalScore >= 90) {
      comments.push('追读动力强，推荐给朋友');
    } else if (totalScore >= 80) {
      comments.push('追读动力较好，会持续关注');
    } else if (totalScore >= 70) {
      comments.push('追读动力一般，可读可不读');
    } else {
      comments.push('追读动力弱，可能弃书');
    }

    // 具体建议
    if (scores.爽感 < 20) {
      comments.push('建议增加爽点密度');
    }
    if (scores.代入 < 16) {
      comments.push('建议增强主角代入感和情感共鸣');
    }
    if (scores.节奏 < 12) {
      comments.push('建议优化节奏和阅读流畅度');
    }
    if (scores.悬念 < 12) {
      comments.push('建议增强悬念设置和追读动力');
    }
    if (scores.人物 < 8) {
      comments.push('建议提升人物魅力和好感度');
    }
    if (scores.结局 < 12) {
      comments.push('建议提升结局满意度和意犹未尽感');
    }

    return comments;
  }

  // ============================================================================
  // 综合推荐
  // ============================================================================

  private generateRecommendations(
    editor: EditorRating,
    reader: ReaderRating,
    targetMet: boolean
  ): string[] {
    const recommendations: string[] = [];

    if (targetMet) {
      recommendations.push('✅ 已达成双视角9.8分+目标，具备Top3爆款潜力');
    } else {
      recommendations.push('❌ 未达成双视角9.8分+目标，需要进一步优化');

      if (editor.totalScore < 98) {
        recommendations.push(`编辑视角分数：${editor.totalScore.toFixed(1)}分，需提升至98分+`);
        recommendations.push(`  - 重点关注：${this.getWeakItems(editor.scores)}`);
      }

      if (reader.totalScore < 98) {
        recommendations.push(`读者视角分数：${reader.totalScore.toFixed(1)}分，需提升至98分+`);
        recommendations.push(`  - 重点关注：${this.getWeakItems(reader.scores)}`);
      }
    }

    // 共同建议
    if (editor.scores.商业 < 18 || reader.scores.爽感 < 23) {
      recommendations.push('增强爽点密度，每1000字至少1个爽点');
    }

    if (editor.scores.情节 < 18 || reader.scores.悬念 < 13) {
      recommendations.push('增强悬念设置，每章结尾必须有悬念');
    }

    if (reader.scores.代入 < 18) {
      recommendations.push('增强主角代入感，用具体事件展现性格');
    }

    return recommendations;
  }

  private getWeakItems(scores: Record<string, number>): string {
    const threshold = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length * 0.8;
    const weakItems = Object.entries(scores)
      .filter(([key, value]) => value < threshold)
      .map(([key]) => key);

    return weakItems.join('、');
  }
}

// ============================================================================
// 导出实例
// ============================================================================

export const dualPerspectiveRatingSystem = new DualPerspectiveRatingSystem();
