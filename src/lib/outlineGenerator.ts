/**
 * 智能大纲生成器
 * 支持三幕式结构、爽点分布、节奏把控、高潮设置
 */

export interface NovelOutline {
  id: string;
  userId: string;
  title: string;
  genre: string;
  targetLength: number; // 目标字数
  estimatedChapters: number;
  structure: 'three-act' | 'four-act' | 'ki-shō-ten-ketsu' | 'episodic'; // 三幕式/四幕式/起承转合/单元剧
  coreConflict: string;
  protagonistGoal: string;
  stakes: string;
  acts: Act[];
  climaxPoints: ClimaxPoint[];
  subplots: Subplot[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Act {
  id: string;
  name: string;
  chapterRange: {
    start: number;
    end: number;
  };
  keyEvents: StoryEvent[];
  climaxLevel: number; // 1-10
  tensionCurve: number[]; // 紧张度曲线 0-100
  wordCountTarget: number;
  summary: string;
}

export interface StoryEvent {
  id: string;
  name: string;
  type: 'inciting-incident' | 'turning-point' | 'climax' | 'revelation' | 'resolution' | 'setup' | 'payoff';
  chapter: number;
  description: string;
  emotionalImpact: number; // 1-10
  foreshadowing: string[];
  payoffTo?: string; // 铺垫呼应的事件ID
}

export interface ClimaxPoint {
  id: string;
  name: string;
  chapter: number;
  type: 'action' | 'emotional' | 'intellectual' | 'moral';
  description: string;
  intensity: number; // 1-100
  consequences: string[];
}

export interface Subplot {
  id: string;
  name: string;
  arc: string;
  mainCharacter: string;
  keyEvents: StoryEvent[];
  relationshipToMain: string; // 与主线的关联
  resolution: string;
}

export interface OutlineAnalysis {
  outline: NovelOutline;
  pacing: number; // 节奏评分 0-100
  tension: number; // 张力评分 0-100
  satisfaction: number; // 满足感预测 0-100
  suggestions: string[];
}

// 结构模板
export const STRUCTURE_TEMPLATES = {
  'three-act': {
    name: '三幕式结构',
    acts: [
      { name: '第一幕：铺垫', proportion: 0.25, description: '设定世界，介绍角色，诱发事件' },
      { name: '第二幕：对抗', proportion: 0.5, description: '主角面对障碍，升级冲突，中点转折' },
      { name: '第三幕：解决', proportion: 0.25, description: '终极对决，角色成长，故事结局' }
    ]
  },
  'four-act': {
    name: '四幕式结构',
    acts: [
      { name: '第一幕：设定', proportion: 0.2, description: '世界观建立，角色介绍' },
      { name: '第二幕：发展', proportion: 0.25, description: '冲突初现，角色动机' },
      { name: '第三幕：高潮', proportion: 0.35, description: '冲突升级，重大考验' },
      { name: '第四幕：结局', proportion: 0.2, description: '终局之战，问题解决' }
    ]
  },
  'ki-shō-ten-ketsu': {
    name: '起承转合',
    acts: [
      { name: '起：开端', proportion: 0.15, description: '人物出场，事件发生' },
      { name: '承：发展', proportion: 0.3, description: '情节展开，关系建立' },
      { name: '转：转折', proportion: 0.35, description: '意外变故，冲突爆发' },
      { name: '合：收束', proportion: 0.2, description: '问题解决，故事总结' }
    ]
  },
  'episodic': {
    name: '单元剧',
    acts: [
      { name: '单元一', proportion: 0.33, description: '独立故事线一' },
      { name: '单元二', proportion: 0.33, description: '独立故事线二' },
      { name: '单元三', proportion: 0.34, description: '独立故事线三' }
    ]
  }
};

// 生成三幕式大纲
export function generateThreeActOutline(
  title: string,
  genre: string,
  targetLength: number,
  coreConflict: string,
  protagonistGoal: string,
  stakes: string
): Partial<NovelOutline> {
  const template = STRUCTURE_TEMPLATES['three-act'];
  const totalChapters = Math.ceil(targetLength / 3000); // 假设每章3000字

  const acts: Act[] = template.acts.map((actTemplate, index) => {
    const startChapter = index === 0 ? 1 : acts[index - 1].chapterRange.end + 1;
    const endChapter = index === template.acts.length - 1
      ? totalChapters
      : Math.floor(startChapter + (totalChapters * actTemplate.proportion) - 1);

    return {
      id: `act-${index + 1}`,
      name: actTemplate.name,
      chapterRange: { start: startChapter, end: endChapter },
      keyEvents: generateKeyEventsForAct(actTemplate.name, startChapter, endChapter),
      climaxLevel: index === 2 ? 10 : index === 1 ? 7 : 4,
      tensionCurve: generateTensionCurve(actTemplate.name, endChapter - startChapter + 1),
      wordCountTarget: Math.floor(targetLength * actTemplate.proportion),
      summary: actTemplate.description
    };
  });

  return {
    title,
    genre,
    targetLength,
    estimatedChapters: totalChapters,
    structure: 'three-act',
    coreConflict,
    protagonistGoal,
    stakes,
    acts,
    climaxPoints: generateClimaxPoints(acts),
    subplots: []
  };
}

// 为每一幕生成关键事件
function generateKeyEventsForAct(
  actName: string,
  startChapter: number,
  endChapter: number
): StoryEvent[] {
  const events: StoryEvent[] = [];

  if (actName.includes('第一幕') || actName.includes('起')) {
    // 开幕：诱发事件
    events.push({
      id: `event-${startChapter}`,
      name: '诱发事件',
      type: 'inciting-incident',
      chapter: startChapter,
      description: '打破主角平静生活的事件，启动整个故事',
      emotionalImpact: 7,
      foreshadowing: [],
      payoffTo: undefined
    });
    // 第一幕高潮
    events.push({
      id: `event-${endChapter}`,
      name: '第一幕高潮',
      type: 'turning-point',
      chapter: endChapter,
      description: '主角决定接受挑战，进入第二幕',
      emotionalImpact: 8,
      foreshadowing: [],
      payoffTo: undefined
    });
  } else if (actName.includes('第二幕') || actName.includes('承')) {
    // 中点转折
    const midChapter = Math.floor((startChapter + endChapter) / 2);
    events.push({
      id: `event-${midChapter}`,
      name: '中点转折',
      type: 'turning-point',
      chapter: midChapter,
      description: '故事局势发生重大变化，主角获得新信息或遭遇重大挫折',
      emotionalImpact: 9,
      foreshadowing: [],
      payoffTo: undefined
    });
    // 第二幕高潮（一无所有时刻）
    events.push({
      id: `event-${endChapter}`,
      name: '一无所有时刻',
      type: 'climax',
      chapter: endChapter,
      description: '主角遭遇最惨重的失败，看似毫无希望',
      emotionalImpact: 10,
      foreshadowing: [],
      payoffTo: undefined
    });
  } else if (actName.includes('第三幕') || actName.includes('合') || actName.includes('结局')) {
    // 高潮对决
    events.push({
      id: `event-${endChapter - 2}`,
      name: '终极高潮',
      type: 'climax',
      chapter: endChapter - 2,
      description: '主角与反派的最终对决，决定命运',
      emotionalImpact: 10,
      foreshadowing: [],
      payoffTo: undefined
    });
    // 结局
    events.push({
      id: `event-${endChapter}`,
      name: '最终结局',
      type: 'resolution',
      chapter: endChapter,
      description: '冲突解决，角色成长，世界秩序恢复或改变',
      emotionalImpact: 8,
      foreshadowing: [],
      payoffTo: undefined
    });
  }

  return events;
}

// 生成紧张度曲线
function generateTensionCurve(actName: string, chapterCount: number): number[] {
  const curve: number[] = [];

  if (actName.includes('第一幕') || actName.includes('起')) {
    // 逐渐上升
    for (let i = 0; i < chapterCount; i++) {
      curve.push(30 + (i / chapterCount) * 40);
    }
  } else if (actName.includes('第二幕') || actName.includes('承') || actName.includes('转')) {
    // 波浪式上升
    const midPoint = Math.floor(chapterCount / 2);
    for (let i = 0; i < chapterCount; i++) {
      if (i < midPoint) {
        curve.push(50 + Math.sin((i / midPoint) * Math.PI) * 20);
      } else {
        curve.push(60 + ((i - midPoint) / (chapterCount - midPoint)) * 30);
      }
    }
  } else {
    // 先升后降
    for (let i = 0; i < chapterCount; i++) {
      curve.push(80 - (i / chapterCount) * 40);
    }
  }

  return curve;
}

// 生成高潮点
function generateClimaxPoints(acts: Act[]): ClimaxPoint[] {
  const climaxPoints: ClimaxPoint[] = [];

  acts.forEach((act, index) => {
    const climaxChapter = Math.floor((act.chapterRange.start + act.chapterRange.end) / 2);

    climaxPoints.push({
      id: `climax-${index + 1}`,
      name: `${act.name.split('：')[0]}高潮`,
      chapter: climaxChapter,
      type: index === acts.length - 1 ? 'action' : index % 2 === 0 ? 'emotional' : 'intellectual',
      description: `本幕的核心高潮，紧张度达到${Math.floor(60 + act.climaxLevel * 4)}%`,
      intensity: act.climaxLevel * 10,
      consequences: ['影响后续剧情走向', '推动角色成长', '提升读者期待']
    });
  });

  return climaxPoints;
}

// 爽点分布计算
export function calculateSatisfactionPoints(
  outline: NovelOutline,
  targetReaders: 'casual' | 'hardcore' | 'mixed'
): {
  recommended: number[]; // 推荐的爽点章节
  density: number; // 爽点密度（每章爽点数）
  suggestions: string[];
} {
  const recommended: number[] = [];
  const densityMap: Record<string, number> = {
    'casual': 0.8,    // 休闲读者：每章0.8个爽点
    'hardcore': 0.3,  // 硬核读者：每章0.3个爽点
    'mixed': 0.5      // 混合读者：每章0.5个爽点
  };
  const density = densityMap[targetReaders] || 0.5;

  // 关键事件位置
  outline.acts.forEach(act => {
    act.keyEvents.forEach(event => {
      recommended.push(event.chapter);
    });
  });

  // 每幕高潮
  outline.climaxPoints.forEach(climax => {
    recommended.push(climax.chapter);
  });

  // 去重并排序
  const uniqueChapters = [...new Set(recommended)].sort((a, b) => a - b);

  // 建议填充
  const suggestions: string[] = [];
  const satisfactionRate = uniqueChapters.length / outline.estimatedChapters;

  if (satisfactionRate < density) {
    const need = Math.floor(outline.estimatedChapters * density) - uniqueChapters.length;
    suggestions.push(`爽点密度偏低，建议额外添加${need}个爽点场景`);
    suggestions.push('推荐爽点类型：打脸、突破、反转、奖励、升级、发现、告白、复仇');
  } else {
    suggestions.push('爽点分布合理，节奏把握良好');
  }

  return {
    recommended: uniqueChapters,
    density: satisfactionRate,
    suggestions
  };
}

// 大纲分析
export function analyzeOutline(outline: NovelOutline): OutlineAnalysis {
  const suggestions: string[] = [];
  let pacingScore = 80;
  let tensionScore = 80;
  let satisfactionScore = 80;

  // 检查幕的结构
  if (outline.acts.length < 3) {
    suggestions.push('建议至少设置3幕，增加故事层次');
    pacingScore -= 15;
  }

  // 检查每幕的长度分布
  const actLengths = outline.acts.map(act =>
    act.chapterRange.end - act.chapterRange.start + 1
  );
  const avgLength = actLengths.reduce((a, b) => a + b, 0) / actLengths.length;
  const variance = actLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / actLengths.length;

  if (variance > avgLength * 2) {
    suggestions.push('各幕长度差异过大，建议调整以保持平衡');
    pacingScore -= 10;
  }

  // 检查关键事件
  const totalEvents = outline.acts.reduce((sum, act) => sum + act.keyEvents.length, 0);
  if (totalEvents < 6) {
    suggestions.push('关键事件过少，建议至少6个转折点');
    tensionScore -= 15;
  }

  // 检查高潮设置
  if (outline.climaxPoints.length < 3) {
    suggestions.push('高潮点过少，建议每幕至少1个高潮');
    tensionScore -= 10;
  }

  // 检查支线
  if (outline.subplots.length === 0) {
    suggestions.push('建议添加1-2条支线，丰富故事层次');
    satisfactionScore -= 10;
  }

  // 检查目标明确性
  if (!outline.protagonistGoal || outline.protagonistGoal.length < 10) {
    suggestions.push('主角目标不够明确，建议重新定义');
    pacingScore -= 10;
  }

  // 检查冲突设置
  if (!outline.coreConflict || outline.coreConflict.length < 10) {
    suggestions.push('核心冲突不够清晰，建议强化冲突设置');
    tensionScore -= 10;
  }

  // 检查风险设置
  if (!outline.stakes || outline.stakes.length < 10) {
    suggestions.push('风险设置不足，建议明确失败的代价');
    satisfactionScore -= 10;
  }

  return {
    outline,
    pacing: Math.max(0, pacingScore),
    tension: Math.max(0, tensionScore),
    satisfaction: Math.max(0, satisfactionScore),
    suggestions
  };
}

// 生成章节大纲
export function generateChapterOutline(
  chapterNumber: number,
  outline: NovelOutline,
  previousChapter?: string
): string {
  // 找到当前章节所属的幕
  const currentAct = outline.acts.find(act =>
    chapterNumber >= act.chapterRange.start && chapterNumber <= act.chapterRange.end
  );

  if (!currentAct) {
    return `章节${chapterNumber}：未定义在现有大纲中`;
  }

  // 检查是否有关键事件
  const keyEvent = currentAct.keyEvents.find(e => e.chapter === chapterNumber);
  const isClimax = outline.climaxPoints.some(c => c.chapter === chapterNumber);

  const basePrompt = `## 章节${chapterNumber}大纲

### 所属幕：${currentAct.name}
章节范围：第${currentAct.chapterRange.start}章 - 第${currentAct.chapterRange.end}章
当前紧张度：${currentAct.tensionCurve[chapterNumber - currentAct.chapterRange.start] || 50}/100

${keyEvent ? `
### 关键事件
事件名称：${keyEvent.name}
事件类型：${keyEvent.type}
情感冲击：${keyEvent.emotionalImpact}/10
` : ''}

${isClimax ? `
### ⚠️ 高潮章节
本章节为全故事关键高潮，需要展现最高级别的紧张感和情感冲击。
` : ''}

${previousChapter ? `
### 上章内容回顾
${previousChapter.substring(0, 200)}...
` : ''}

### 章节任务
${keyEvent ? `完成关键事件：${keyEvent.description}` : `推动剧情发展，为下一章做准备`}

### 推荐情节元素
- 角色决策
- 对话或行动
- 内心活动
- 环境描写
- 悬念设置

### 预估字数：2500-3500字
`;

  return basePrompt;
}

// AI辅助生成大纲提示词
export function generateOutlinePrompt(params: {
  title: string;
  genre: string;
  protagonistGoal: string;
  coreConflict: string;
  structure?: string;
  targetLength?: number;
}): string {
  const structure = params.structure || 'three-act';
  const targetLength = params.targetLength || 100000;
  const template = STRUCTURE_TEMPLATES[structure as keyof typeof STRUCTURE_TEMPLATES];

  return `请为以下小说设定生成详细大纲：

## 基本信息
标题：${params.title}
题材：${params.genre}
主角目标：${params.protagonistGoal}
核心冲突：${params.coreConflict}
目标字数：${targetLength}字
结构类型：${template.name}

## 要求
1. 生成${template.acts.length}幕结构，明确各幕的起止章节
2. 每幕包含3-5个关键事件，说明事件类型和情感冲击
3. 设置3-5个高潮点，区分高潮类型（动作/情感/智力/道德）
4. 设计2-3条支线，说明与主线的关系
5. 估算各幕字数分布，总计${targetLength}字
6. 标注关键爽点位置（打脸、突破、奖励等）

## 输出格式
- 第一幕：[幕名]（第X-Y章，约X字）
  - 关键事件：
    1. [事件名] - 第X章 - [类型] - [描述]
  - 高潮点：[高潮描述]
- 第二幕：...
- 支线1：...
- 爽点分布：第X、Y、Z章`;
}

// 大纲优化建议
export function optimizeOutline(outline: NovelOutline): string[] {
  const suggestions: string[] = [];

  // 节奏优化
  const actRatios = outline.acts.map(act => {
    const length = act.chapterRange.end - act.chapterRange.start + 1;
    return length / outline.estimatedChapters;
  });

  if (actRatios[0] > 0.35) {
    suggestions.push('第一幕过长，建议控制在25%-30%，加快进入主线冲突');
  }
  if (actRatios[1] < 0.4) {
    suggestions.push('第二幕过短，建议扩展到40%-50%，增加对抗和考验');
  }

  // 高潮优化
  const climaxIntensities = outline.climaxPoints.map(c => c.intensity);
  const lastClimax = climaxIntensities[climaxIntensities.length - 1];
  const maxIntensity = Math.max(...climaxIntensities);

  if (lastClimax !== maxIntensity) {
    suggestions.push('最终高潮不是最强，建议提高最终高潮强度');
  }

  // 支线优化
  outline.subplots.forEach((subplot, index) => {
    if (subplot.keyEvents.length < 2) {
      suggestions.push(`支线"${subplot.name}"事件过少，建议至少2个关键事件`);
    }
  });

  return suggestions.length > 0 ? suggestions : ['大纲结构合理，无需重大调整'];
}
