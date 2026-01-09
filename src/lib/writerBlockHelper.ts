/**
 * 卡文诊断助手
 * 支持剧情卡点分析、破局建议、灵感触发、情节推进
 */

export interface WriterBlockAnalysis {
  id: string;
  userId: string;
  novelId: string;
  chapterNumber: number;
  currentContent: string;
  blockType: BlockType;
  severity: 'mild' | 'moderate' | 'severe';
  causes: BlockCause[];
  solutions: BlockSolution[];
  alternativeApproaches: AlternativePlot[];
  estimatedRecoveryTime: number; // 预计恢复时间（小时）
  actionPlan: ActionItem[];
  createdAt: Date;
}

export type BlockType =
  | 'plot-stuck'
  | 'character-decision'
  | 'dialogue-block'
  | 'pacing-issue'
  | 'motivation-lack'
  | 'logic-gap'
  | 'creative-burnout'
  | 'ending-dilemma';

export interface BlockCause {
  id: string;
  category: 'internal' | 'external' | 'structural';
  description: string;
  evidence: string[];
  likelihood: number; // 0-100
}

export interface BlockSolution {
  id: string;
  type: 'immediate' | 'short-term' | 'long-term';
  title: string;
  description: string;
  steps: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // 分钟
  successRate: number; // 0-100
}

export interface AlternativePlot {
  title: string;
  description: string;
  keyChanges: string[];
  riskAssessment: string;
  excitement: number; // 1-10，新颖度评分
}

export interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  task: string;
  deadline: string;
  resources: string[];
}

export interface PlotGap {
  location: string; // 卡点位置描述
  gapType: 'information' | 'motivation' | 'causality' | 'logic' | 'pacing';
  description: string;
  impact: number; // 1-10，影响程度
}

export interface InspirationTrigger {
  type: 'question' | 'image' | 'music' | 'random-event' | 'constraint';
  content: string;
  expectedOutcome: string;
}

// 卡文类型识别
export const BLOCK_TYPE_DESCRIPTIONS: Record<BlockType, string> = {
  'plot-stuck': '剧情推进受阻，不知道下一步该怎么写',
  'character-decision': '角色面临选择，但无法确定符合人设的决定',
  'dialogue-block': '对话无法自然展开，角色说话缺乏个性',
  'pacing-issue': '节奏控制失衡，过快或过慢',
  'motivation-lack': '角色动机不明，行为缺乏合理性',
  'logic-gap': '情节逻辑存在漏洞，前后矛盾',
  'creative-burnout': '创作疲劳，缺乏灵感和动力',
  'ending-dilemma': '无法确定合适的结局，多种选择难以取舍'
};

// 常见卡文原因库
export const COMMON_BLOCK_CAUSES = {
  'plot-stuck': [
    { category: 'structural', description: '剧情路线单一，缺乏分支', likelihood: 75 },
    { category: 'internal', description: '过度纠结于完美，害怕写出次品', likelihood: 65 },
    { category: 'external', description: '大纲不完整，缺乏详细规划', likelihood: 80 }
  ],
  'character-decision': [
    { category: 'internal', description: '对角色理解不深入，人设模糊', likelihood: 85 },
    { category: 'structural', description: '选择机会过多，缺乏明确的目标导向', likelihood: 60 },
    { category: 'external', description: '角色关系复杂，决策影响难以评估', likelihood: 70 }
  ],
  'dialogue-block': [
    { category: 'internal', description: '角色口吻把握不准，对话千篇一律', likelihood: 80 },
    { category: 'structural', description: '对话缺乏明确目的，只是填充篇幅', likelihood: 70 },
    { category: 'external', description: '场景氛围营造不足，对话生硬', likelihood: 55 }
  ],
  'pacing-issue': [
    { category: 'structural', description: '情节密度分布不均，部分章节过密或过疏', likelihood: 75 },
    { category: 'internal', description: '对读者期待判断失误，节奏与需求不符', likelihood: 60 },
    { category: 'external', description: '章节划分不合理，节奏被打断', likelihood: 65 }
  ],
  'motivation-lack': [
    { category: 'internal', description: '角色目标设定模糊，缺乏内在驱动力', likelihood: 90 },
    { category: 'structural', description: '外部压力不足，角色缺乏行动理由', likelihood: 70 },
    { category: 'external', description: '前文铺垫不足，动机突然出现', likelihood: 75 }
  ],
  'logic-gap': [
    { category: 'structural', description: '世界规则不一致，出现前后矛盾', likelihood: 80 },
    { category: 'internal', description: '忽视细节连贯性，创作时遗漏伏笔', likelihood: 70 },
    { category: 'external', description: '修改前文导致后续逻辑断裂', likelihood: 85 }
  ],
  'creative-burnout': [
    { category: 'internal', description: '持续高强度创作导致灵感枯竭', likelihood: 85 },
    { category: 'external', description: '现实压力和外部干扰过多', likelihood: 65 },
    { category: 'structural', description: '创作模式僵化，缺乏新鲜感', likelihood: 60 }
  ],
  'ending-dilemma': [
    { category: 'structural', description: '前期铺垫过多，结局难以收束', likelihood: 75 },
    { category: 'internal', description: '对完美结局的执念，选择困难', likelihood: 80 },
    { category: 'external', description: '读者期待与创作意图冲突', likelihood: 65 }
  ]
};

// 生成破局方案
export function generateSolutions(blockType: BlockType, severity: WriterBlockAnalysis['severity']): BlockSolution[] {
  const solutions: BlockSolution[] = [];

  switch (blockType) {
    case 'plot-stuck':
      solutions.push({
        id: 'sol-1',
        type: 'immediate',
        title: '采用"如果...那么..."思维法',
        description: '通过设定假设条件来突破思路僵局',
        steps: [
          '列出当前角色的3-5个可能选择',
          '对每个选择追问"如果...那么...会怎样"',
          '选择最有趣的发展方向',
          '快速写出300字试写段落'
        ],
        difficulty: 'easy',
        estimatedTime: 15,
        successRate: 75
      });
      solutions.push({
        id: 'sol-2',
        type: 'short-term',
        title: '回溯前文寻找未利用的伏笔',
        description: '检查前20章，找出未回收的伏笔或未展开的线索',
        steps: [
          '快速浏览前20章内容',
          '标记所有未解决的线索',
          '挑选1-2个线索作为新的发展方向',
          '设计3种不同的展开方式'
        ],
        difficulty: 'medium',
        estimatedTime: 45,
        successRate: 85
      });
      solutions.push({
        id: 'sol-3',
        type: 'long-term',
        title: '重新设计角色动机',
        description: '深入分析角色内心，找到更深层的行为驱动力',
        steps: [
          '列出角色的表面动机和深层动机',
          '分析动机之间的矛盾和冲突',
          '设计一个能引发动机冲突的事件',
          '重新规划后续3-5章的剧情走向'
        ],
        difficulty: 'hard',
        estimatedTime: 120,
        successRate: 90
      });
      break;

    case 'character-decision':
      solutions.push({
        id: 'sol-1',
        type: 'immediate',
        title: '使用角色视角模拟法',
        description: '完全代入角色视角，思考"我是XX，我会怎么做"',
        steps: [
          '写下角色的5个核心价值观',
          '列出当前情境下角色的3个本能反应',
          '评估每个反应的代价和收益',
          '选择最符合人设的决定'
        ],
        difficulty: 'easy',
        estimatedTime: 20,
        successRate: 80
      });
      solutions.push({
        id: 'sol-2',
        type: 'short-term',
        title: '参考经典角色的类似选择',
        description: '找3个知名作品中类似角色的类似处境，分析他们的选择',
        steps: [
          '回忆3个知名作品的类似情境',
          '记录那些角色的决定及原因',
          '对比你的角色与他们相同和不同点',
          '设计出既符合人设又有创新的决定'
        ],
        difficulty: 'medium',
        estimatedTime: 40,
        successRate: 75
      });
      break;

    case 'dialogue-block':
      solutions.push({
        id: 'sol-1',
        type: 'immediate',
        title: '采用潜台词对话法',
        description: '让角色"话里有话"，增加对话层次感',
        steps: [
          '确定每个角色对话的表层目的',
          '设计每个角色的隐藏目的或真实想法',
          '通过暗示、隐喻、反讽等方式表达',
          '让读者"听出弦外之音"'
        ],
        difficulty: 'easy',
        estimatedTime: 15,
        successRate: 70
      });
      solutions.push({
        id: 'sol-2',
        type: 'short-term',
        title: '设计对话冲突',
        description: '让角色之间产生意见分歧或利益冲突',
        steps: [
          '确定参与对话的角色及其立场',
          '找出角色之间的矛盾点',
          '设计3轮对话，每轮都推进冲突',
          '以角色妥协或冲突爆发结束'
        ],
        difficulty: 'medium',
        estimatedTime: 30,
        successRate: 85
      });
      break;

    case 'motivation-lack':
      solutions.push({
        id: 'sol-1',
        type: 'immediate',
        title: '强化外部压力',
        description: '增加紧迫性或风险，迫使角色行动',
        steps: [
          '设计一个必须立即解决的危机',
          '设置失败的严重后果',
          '给角色限定时间或资源',
          '让角色面临"必须行动"的处境'
        ],
        difficulty: 'easy',
        estimatedTime: 20,
        successRate: 80
      });
      solutions.push({
        id: 'sol-2',
        type: 'short-term',
        title: '挖掘角色内心创伤',
        description: '找到角色行为背后的深层原因',
        steps: [
          '回忆角色过去的经历',
          '找出影响角色性格的关键事件',
          '设计一个能触动创伤的触发点',
          '让角色在创伤驱使下做出决定'
        ],
        difficulty: 'medium',
        estimatedTime: 60,
        successRate: 85
      });
      break;

    case 'creative-burnout':
      solutions.push({
        id: 'sol-1',
        type: 'immediate',
        title: '暂停创作，换脑放松',
        description: '暂时放下写作，通过其他活动恢复灵感',
        steps: [
          '停止强迫自己写作',
          '进行散步、听音乐、看电影等放松活动',
          '阅读与当前题材无关的内容',
          '等灵感自然回归后再继续'
        ],
        difficulty: 'easy',
        estimatedTime: 120,
        successRate: 90
      });
      solutions.push({
        id: 'sol-2',
        type: 'short-term',
        title: '尝试创作完全不同类型的内容',
        description: '通过改变创作内容来刺激灵感',
        steps: [
          '写一个与主线完全无关的短篇',
          '尝试新的文风或叙事方式',
          '用100字描述一个从未出现的场景',
          '将新想法融入主线'
        ],
        difficulty: 'medium',
        estimatedTime: 90,
        successRate: 75
      });
      break;

    default:
      solutions.push({
        id: 'sol-default',
        type: 'immediate',
        title: 'AI辅助突破',
        description: '使用大语言模型生成多种可能性供参考',
        steps: [
          '提供当前剧情背景和卡点描述',
          '让AI生成3-5种不同的后续发展',
          '选择最符合预期的方案',
          '在此基础上进行二次创作'
        ],
        difficulty: 'easy',
        estimatedTime: 10,
        successRate: 80
      });
  }

  return solutions;
}

// 生成情节漏洞分析
export function analyzePlotGaps(content: string, previousContent?: string): PlotGap[] {
  const gaps: PlotGap[] = [];

  // 检查信息缺失
  if (content.includes('突然') && !content.includes('之前')) {
    gaps.push({
      location: '内容中使用"突然"处',
      gapType: 'information',
      description: '事件出现过于突然，缺乏铺垫和过渡',
      impact: 6
    });
  }

  // 检查动机不明
  if (content.match(/想要|想要|打算|决定/g) && !content.match(/因为|由于|为了/g)) {
    gaps.push({
      location: '角色决策处',
      gapType: 'motivation',
      description: '角色行为缺乏明确动机说明',
      impact: 7
    });
  }

  // 检查因果关系
  if (content.match(/结果|因此|所以/g)) {
    const sentences = content.split(/[。！？；]/);
    for (let i = 1; i < sentences.length; i++) {
      if (sentences[i].includes('因此') || sentences[i].includes('所以')) {
        if (sentences[i - 1].length < 20) {
          gaps.push({
            location: `第${i}句`,
            gapType: 'causality',
            description: '前因后果连接不充分，因果链条薄弱',
            impact: 5
          });
        }
      }
    }
  }

  // 检查逻辑矛盾
  const contradictions = [
    { pattern: /不知道|不确定/, opposite: /明白|清楚/ },
    { pattern: /不相信|怀疑/, opposite: /信任/ }
  ];

  contradictions.forEach(({ pattern, opposite }) => {
    const matches1 = content.match(pattern);
    const matches2 = content.match(opposite);
    if (matches1 && matches2) {
      gaps.push({
        location: '全文',
        gapType: 'logic',
        description: '存在可能的态度或认知矛盾',
        impact: 4
      });
    }
  });

  // 检查节奏问题
  const sentences = content.split(/[。！？；]/);
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
  if (avgLength < 10) {
    gaps.push({
      location: '全文',
      gapType: 'pacing',
      description: '句子普遍过短，可能显得节奏急促',
      impact: 3
    });
  } else if (avgLength > 50) {
    gaps.push({
      location: '全文',
      gapType: 'pacing',
      description: '句子普遍过长，可能影响阅读流畅度',
      impact: 3
    });
  }

  return gaps;
}

// 生成替代情节方案
export function generateAlternativePlots(
  blockType: BlockType,
  currentSituation: string,
  characterGoals: string[]
): AlternativePlot[] {
  const alternatives: AlternativePlot[] = [];

  if (blockType === 'plot-stuck') {
    alternatives.push({
      title: '引入意外变量',
      description: '引入一个未预料的元素，打破当前僵局',
      keyChanges: [
        '添加一个突然出现的角色',
        '触发一个未计划的事件',
        '揭示一个隐藏的信息'
      ],
      riskAssessment: '中等风险，需要确保新元素与主线相关',
      excitement: 7
    });

    alternatives.push({
      title: '改变角色目标',
      description: '让角色在关键时刻改变行动方向',
      keyChanges: [
        '角色发现原有目标存在误导',
        '角色面临新的更紧迫的目标',
        '角色价值观发生变化'
      ],
      riskAssessment: '风险较高，需要充分铺垫',
      excitement: 8
    });

    alternatives.push({
      title: '时间跳跃',
      description: '跳过当前困境，直接展示后续发展',
      keyChanges: [
        '使用时间线跳跃',
        '略过问题的解决过程',
        '在新场景中展示结果'
      ],
      riskAssessment: '低风险，但可能影响连贯性',
      excitement: 5
    });
  } else if (blockType === 'ending-dilemma') {
    alternatives.push({
      title: '开放式结局',
      description: '不给出明确结局，留给读者想象空间',
      keyChanges: [
        '结尾留白',
        '提供多种可能性的暗示',
        '让读者自行判断'
      ],
      riskAssessment: '中等风险，需要确保暗示足够清晰',
      excitement: 6
    });

    alternatives.push({
      title: '反转结局',
      description: '揭示一个关键信息，颠覆读者的预期',
      keyChanges: [
        '揭示隐藏的真相',
        '反派的真正目的',
        '角色身份或关系的转变'
      ],
      riskAssessment: '高风险，需要充分的伏笔支撑',
      excitement: 9
    });

    alternatives.push({
      title: '悲剧结局',
      description: '角色遭遇重大损失，但精神获得升华',
      keyChanges: [
        '主要角色牺牲',
        '目标无法达成但有其他收获',
        '留下深远的影响'
      ],
      riskAssessment: '高风险，可能引发读者不满',
      excitement: 7
    });
  }

  return alternatives;
}

// 生成灵感触发器
export function generateInspirationTriggers(blockType: BlockType): InspirationTrigger[] {
  const triggers: InspirationTrigger[] = [];

  if (blockType === 'plot-stuck' || blockType === 'character-decision') {
    triggers.push({
      type: 'question',
      content: '如果这个角色必须在"拯救自己"和"拯救他人"之间选择，他会选什么？',
      expectedOutcome: '通过极端选择揭示角色核心价值观，激发剧情走向'
    });

    triggers.push({
      type: 'random-event',
      content: '引入一个完全意外的访客或信使',
      expectedOutcome: '打破当前僵局，引入新的信息或危机'
    });

    triggers.push({
      type: 'constraint',
      content: '限制本章只能在一个房间内完成',
      expectedOutcome: '通过空间限制激发创造力和对话张力'
    });
  } else if (blockType === 'dialogue-block') {
    triggers.push({
      type: 'constraint',
      content: '让角色只说反话',
      expectedOutcome: '产生独特的对话风格和喜剧效果'
    });

    triggers.push({
      type: 'question',
      content: '这两个角色最不想让对方知道的事情是什么？',
      expectedOutcome: '通过隐瞒信息制造对话张力和冲突'
    });
  } else if (blockType === 'creative-burnout') {
    triggers.push({
      type: 'random-event',
      content: '用3句话描述一个从未见过的场景',
      expectedOutcome: '通过创意练习激活想象力'
    });

    triggers.push({
      type: 'question',
      content: '如果这个故事从反派视角讲述，会如何发展？',
      expectedOutcome: '通过视角转换获得新的创作角度'
    });
  }

  return triggers;
}

// 创建行动计划
export function createActionPlan(
  solutions: BlockSolution[],
  severity: WriterBlockAnalysis['severity']
): ActionItem[] {
  const actionItems: ActionItem[] = [];

  // 根据严重程度分配优先级
  const priorityMap: Record<WriterBlockAnalysis['severity'], ActionItem['priority']> = {
    'mild': 'low',
    'moderate': 'medium',
    'severe': 'high'
  };

  const priority = priorityMap[severity];

  // 选择最适合的解决方案
  const bestSolution = solutions.find(s => s.type === 'immediate') || solutions[0];

  if (bestSolution) {
    actionItems.push({
      priority,
      task: `执行${bestSolution.title}方案`,
      deadline: '1小时内',
      resources: bestSolution.steps
    });
  }

  // 添加辅助行动
  actionItems.push({
    priority: 'medium',
    task: '记录卡文原因和触发条件',
    deadline: '今天内',
    resources: ['写作日志', '情绪追踪']
  });

  actionItems.push({
    priority: 'low',
    task: '准备下次卡文时的备用方案',
    deadline: '本周内',
    resources: ['创意素材库', '灵感卡片']
  });

  return actionItems;
}

// AI辅助诊断提示词生成
export function generateDiagnosisPrompt(
  currentContent: string,
  blockType?: BlockType,
  previousContext?: string
): string {
  const blockHint = blockType ? `\n卡文类型：${BLOCK_TYPE_DESCRIPTIONS[blockType]}` : '';

  return `我正在写小说，遇到了卡文问题，请帮我分析：

${blockHint}

当前内容：
${currentContent}

${previousContext ? `前文背景：\n${previousContext}` : ''}

请帮我：
1. 识别可能的卡文原因（至少3个）
2. 分析内容存在的问题（逻辑、节奏、动机等）
3. 提供3-5个具体的破局建议
4. 生成2-3个替代情节走向
5. 给出后续3个章节的可能发展方案

要求：
- 建议要具体可执行
- 分析要深入有逻辑
- 方案要符合网文创作规律
- 考虑读者期待和爽点设置`;
}

// 估算恢复时间
export function estimateRecoveryTime(
  blockType: BlockType,
  severity: WriterBlockAnalysis['severity']
): number {
  const baseTimes: Record<BlockType, number> = {
    'plot-stuck': 2,
    'character-decision': 1,
    'dialogue-block': 0.5,
    'pacing-issue': 3,
    'motivation-lack': 2,
    'logic-gap': 4,
    'creative-burnout': 24,
    'ending-dilemma': 6
  };

  const severityMultiplier: Record<WriterBlockAnalysis['severity'], number> = {
    'mild': 0.5,
    'moderate': 1,
    'severe': 2
  };

  return baseTimes[blockType] * severityMultiplier[severity];
}
