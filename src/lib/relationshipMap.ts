/**
 * 人物关系图谱系统
 * 支持关系可视化、冲突矩阵、情感网络、关系演变
 */

export interface RelationshipGraph {
  id: string;
  userId: string;
  novelId: string;
  characters: CharacterNode[];
  relationships: CharacterRelationship[];
  conflicts: ConflictMatrix;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterNode {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  importance: number; // 1-10，角色重要性
  influence: number; // 1-10，影响力
  traits: string[];
  currentState: string; // 当前状态
  faction?: string; // 所属势力
  position: { x: number; y: number }; // 图谱位置
}

export interface CharacterRelationship {
  id: string;
  sourceId: string; // 源角色ID
  targetId: string; // 目标角色ID
  type: RelationshipType;
  intensity: number; // 1-100，关系强度
  status: 'active' | 'dormant' | 'broken' | 'developing';
  description: string;
  history: RelationshipEvent[];
  conflictLevel: number; // 0-10，冲突程度
  allianceLevel: number; // 0-10，同盟程度
  evolution: RelationshipEvolution[]; // 关系演变历史
}

export type RelationshipType =
  | 'family'
  | 'friend'
  | 'enemy'
  | 'rival'
  | 'mentor'
  | 'student'
  | 'lover'
  | 'spouse'
  | 'ally'
  | 'subordinate'
  | 'superior'
  | 'neutral'
  | 'complicated';

export interface RelationshipEvent {
  chapter: number;
  description: string;
  impact: number; // 对关系的影响 -10到10
  type: 'strengthen' | 'weaken' | 'change' | 'break' | 'reconcile';
}

export interface RelationshipEvolution {
  stage: number;
  chapter: number;
  type: RelationshipType;
  intensity: number;
  description: string;
}

export interface ConflictMatrix {
  pairs: ConflictPair[];
  globalTension: number; // 全局紧张度 0-100
  factions: FactionConflict[];
}

export interface ConflictPair {
  sourceId: string;
  targetId: string;
  type: 'ideology' | 'resource' | 'personal' | 'power' | 'revenge' | 'love';
  intensity: number; // 0-10
  resolution?: string;
  keyMoments: number[]; // 关键冲突章节
}

export interface FactionConflict {
  factionA: string;
  factionB: string;
  tension: number; // 0-100
  reason: string;
  keyCharacters: string[]; // 关键角色ID
}

// 关系类型配色方案
export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  'family': '#3B82F6',      // 蓝色
  'friend': '#10B981',      // 绿色
  'enemy': '#EF4444',       // 红色
  'rival': '#F59E0B',        // 橙色
  'mentor': '#8B5CF6',       // 紫色
  'student': '#A78BFA',      // 浅紫
  'lover': '#EC4899',        // 粉色
  'spouse': '#F472B6',       // 浅粉
  'ally': '#06B6D4',         // 青色
  'subordinate': '#6B7280',  // 灰色
  'superior': '#4B5563',    // 深灰
  'neutral': '#9CA3AF',      // 中灰
  'complicated': '#FBBF24'   // 金黄
};

// 关系强度标签
export const INTENSITY_LABELS = {
  90: '生死之交',
  75: '深厚',
  60: '密切',
  45: '友好',
  30: '一般',
  15: '疏远',
  5: '敌对',
  1: '仇恨'
};

// 冲突类型描述
export const CONFLICT_DESCRIPTIONS = {
  'ideology': '意识形态冲突，价值观对立',
  'resource': '资源争夺，利益冲突',
  'personal': '个人恩怨，私人仇恨',
  'power': '权力争夺，地位竞争',
  'revenge': '复仇动机，报复行动',
  'love': '情感纠葛，三角关系'
};

// 创建关系节点
export function createRelationshipNode(
  name: string,
  role: CharacterNode['role'],
  importance: number
): CharacterNode {
  return {
    id: `char-${Date.now()}-${Math.random()}`,
    name,
    role,
    importance,
    influence: Math.min(10, importance + 2),
    traits: [],
    currentState: '正常',
    position: { x: Math.random() * 800, y: Math.random() * 600 }
  };
}

// 建立角色关系
export function createRelationship(
  sourceId: string,
  targetId: string,
  type: RelationshipType,
  description: string,
  intensity: number = 50
): CharacterRelationship {
  return {
    id: `rel-${Date.now()}-${Math.random()}`,
    sourceId,
    targetId,
    type,
    intensity,
    status: 'active',
    description,
    history: [],
    conflictLevel: type === 'enemy' || type === 'rival' ? Math.floor(intensity / 10) : 0,
    allianceLevel: type === 'ally' || type === 'friend' ? Math.floor(intensity / 10) : 0,
    evolution: [
      {
        stage: 0,
        chapter: 1,
        type,
        intensity,
        description: '关系确立'
      }
    ]
  };
}

// 计算关系网络中心性
export function calculateNetworkCentrality(graph: RelationshipGraph): Map<string, number> {
  const centrality = new Map<string, number>();

  // 初始化所有角色的中心性为0
  graph.characters.forEach(char => {
    centrality.set(char.id, 0);
  });

  // 计算每个角色的度中心性（连接数）和加权中心性
  graph.relationships.forEach(rel => {
    const weight = rel.intensity / 10;

    const sourceScore = (centrality.get(rel.sourceId) || 0) + weight;
    centrality.set(rel.sourceId, sourceScore);

    const targetScore = (centrality.get(rel.targetId) || 0) + weight;
    centrality.set(rel.targetId, targetScore);
  });

  return centrality;
}

// 分析关系网络的冲突密度
export function analyzeConflictDensity(graph: RelationshipGraph): {
  density: number; // 冲突密度 0-100
  hotspots: Array<{ source: string; target: string; intensity: number }>;
} {
  const hotspots: Array<{ source: string; target: string; intensity: number }> = [];

  graph.relationships.forEach(rel => {
    if (rel.conflictLevel >= 5) {
      const sourceChar = graph.characters.find(c => c.id === rel.sourceId);
      const targetChar = graph.characters.find(c => c.id === rel.targetId);
      if (sourceChar && targetChar) {
        hotspots.push({
          source: sourceChar.name,
          target: targetChar.name,
          intensity: rel.conflictLevel
        });
      }
    }
  });

  const density = hotspots.length > 0
    ? hotspots.reduce((sum, h) => sum + h.intensity, 0) / (hotspots.length * 10) * 100
    : 0;

  return {
    density,
    hotspots: hotspots.sort((a, b) => b.intensity - a.intensity)
  };
}

// 检测孤立角色
export function detectIsolatedCharacters(graph: RelationshipGraph): string[] {
  const connectedIds = new Set<string>();

  graph.relationships.forEach(rel => {
    connectedIds.add(rel.sourceId);
    connectedIds.add(rel.targetId);
  });

  return graph.characters
    .filter(char => !connectedIds.has(char.id))
    .map(char => char.name);
}

// 检测核心角色圈
export function detectCoreCircle(graph: RelationshipGraph, threshold: number = 50): {
  core: string[];
  peripheral: string[];
} {
  const centrality = calculateNetworkCentrality(graph);
  const core: string[] = [];
  const peripheral: string[] = [];

  graph.characters.forEach(char => {
    const score = centrality.get(char.id) || 0;
    if (score >= threshold) {
      core.push(char.name);
    } else {
      peripheral.push(char.name);
    }
  });

  return { core, peripheral };
}

// 预测关系演变
export function predictRelationshipEvolution(
  relationship: CharacterRelationship,
  storyProgress: number // 0-100，故事进度百分比
): RelationshipEvolution[] {
  const predictions: RelationshipEvolution[] = [];
  const currentIntensity = relationship.intensity;
  const currentStage = relationship.evolution?.length || 0;

  // 根据不同关系类型预测演变
  if (relationship.type === 'enemy' && relationship.conflictLevel >= 7) {
    predictions.push({
      stage: currentStage + 1,
      chapter: Math.floor(storyProgress * 0.7), // 70%进度
      type: 'enemy',
      intensity: Math.min(100, currentIntensity + 20),
      description: '冲突升级至顶点，准备决战'
    });
    predictions.push({
      stage: currentStage + 2,
      chapter: Math.floor(storyProgress * 0.95), // 95%进度
      type: storyProgress > 80 ? 'neutral' : 'enemy', // 后期可能和解
      intensity: storyProgress > 80 ? 20 : Math.min(100, currentIntensity + 30),
      description: storyProgress > 80 ? '冲突最终解决' : '最终对决'
    });
  } else if (relationship.type === 'rival') {
    predictions.push({
      stage: currentStage + 1,
      chapter: Math.floor(storyProgress * 0.6),
      type: 'rival',
      intensity: Math.min(100, currentIntensity + 10),
      description: '竞争进入白热化'
    });
    predictions.push({
      stage: currentStage + 2,
      chapter: Math.floor(storyProgress * 0.85),
      type: relationship.conflictLevel < 5 ? 'ally' : 'rival',
      intensity: relationship.conflictLevel < 5 ? 60 : Math.min(100, currentIntensity + 15),
      description: relationship.conflictLevel < 5 ? '化敌为友，携手合作' : '最终胜负揭晓'
    });
  } else if (relationship.type === 'friend') {
    predictions.push({
      stage: currentStage + 1,
      chapter: Math.floor(storyProgress * 0.5),
      type: 'friend',
      intensity: Math.min(100, currentIntensity + 15),
      description: '友情经受考验，更加坚固'
    });
  } else if (relationship.type === 'lover') {
    predictions.push({
      stage: currentStage + 1,
      chapter: Math.floor(storyProgress * 0.6),
      type: 'lover',
      intensity: Math.min(100, currentIntensity + 20),
      description: '感情升温，确立关系'
    });
    predictions.push({
      stage: currentStage + 2,
      chapter: Math.floor(storyProgress * 0.9),
      type: 'lover',
      intensity: 95,
      description: '面临重大考验，感情升华或破裂'
    });
  }

  return predictions;
}

// 生成关系冲突矩阵
export function generateConflictMatrix(
  graph: RelationshipGraph
): ConflictMatrix {
  const pairs: ConflictPair[] = [];
  const factions = new Map<string, Set<string>>();

  // 按势力分组
  graph.characters.forEach(char => {
    if (char.faction) {
      if (!factions.has(char.faction)) {
        factions.set(char.faction, new Set());
      }
      factions.get(char.faction)!.add(char.id);
    }
  });

  // 生成冲突对
  graph.relationships.forEach(rel => {
    if (rel.conflictLevel >= 3) {
      const sourceChar = graph.characters.find(c => c.id === rel.sourceId);
      const targetChar = graph.characters.find(c => c.id === rel.targetId);

      if (sourceChar && targetChar) {
        pairs.push({
          sourceId: sourceChar.id,
          targetId: targetChar.id,
          type: 'personal',
          intensity: rel.conflictLevel,
          keyMoments: rel.history.map(e => e.chapter)
        });
      }
    }
  });

  // 生成势力冲突
  const factionConflicts: FactionConflict[] = [];
  const factionList = Array.from(factions.keys());

  for (let i = 0; i < factionList.length; i++) {
    for (let j = i + 1; j < factionList.length; j++) {
      const factionA = factionList[i];
      const factionB = factionList[j];

      // 计算两势力间的冲突强度
      let tension = 0;
      const keyCharacters: string[] = [];

      pairs.forEach(pair => {
        const charA = graph.characters.find(c => c.id === pair.sourceId);
        const charB = graph.characters.find(c => c.id === pair.targetId);

        if (charA?.faction === factionA && charB?.faction === factionB) {
          tension += pair.intensity;
          keyCharacters.push(pair.sourceId, pair.targetId);
        } else if (charA?.faction === factionB && charB?.faction === factionA) {
          tension += pair.intensity;
          keyCharacters.push(pair.sourceId, pair.targetId);
        }
      });

      if (tension > 0) {
        factionConflicts.push({
          factionA,
          factionB,
          tension: Math.min(100, tension * 10),
          reason: '利益冲突、意识形态对立或历史恩怨',
          keyCharacters: Array.from(new Set(keyCharacters))
        });
      }
    }
  }

  // 计算全局紧张度
  const globalTension = pairs.length > 0
    ? pairs.reduce((sum, p) => sum + p.intensity, 0) / (pairs.length * 10) * 100
    : 0;

  return {
    pairs,
    globalTension,
    factions: factionConflicts
  };
}

// 可视化关系图谱数据（用于前端展示）
export function visualizeRelationshipGraph(graph: RelationshipGraph): {
  nodes: Array<{ id: string; label: string; color: string; size: number }>;
  edges: Array<{ source: string; target: string; label: string; color: string; width: number }>;
} {
  const nodes = graph.characters.map(char => {
    const roleColors: Record<CharacterNode['role'], string> = {
      'protagonist': '#10B981',  // 绿色
      'antagonist': '#EF4444',   // 红色
      'supporting': '#3B82F6',  // 蓝色
      'minor': '#9CA3AF'         // 灰色
    };

    return {
      id: char.id,
      label: char.name,
      color: roleColors[char.role],
      size: 10 + char.importance * 2
    };
  });

  const edges = graph.relationships.map(rel => ({
    source: rel.sourceId,
    target: rel.targetId,
    label: `${RELATIONSHIP_TYPE_LABELS[rel.type]} (${Math.floor(rel.intensity)})`,
    color: RELATIONSHIP_COLORS[rel.type],
    width: 1 + (rel.intensity / 100) * 4
  }));

  return { nodes, edges };
}

// 关系类型中文标签
const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  'family': '家人',
  'friend': '朋友',
  'enemy': '敌人',
  'rival': '对手',
  'mentor': '导师',
  'student': '学生',
  'lover': '恋人',
  'spouse': '配偶',
  'ally': '盟友',
  'subordinate': '下属',
  'superior': '上级',
  'neutral': '中立',
  'complicated': '复杂'
};

// 分析关系健康度
export function analyzeRelationshipHealth(
  graph: RelationshipGraph
): {
  healthy: number;
  problematic: number;
  critical: number;
  suggestions: string[];
} {
  const healthy = graph.relationships.filter(r => r.conflictLevel < 3 && r.status === 'active').length;
  const problematic = graph.relationships.filter(r => r.conflictLevel >= 3 && r.conflictLevel < 7).length;
  const critical = graph.relationships.filter(r => r.conflictLevel >= 7).length;

  const suggestions: string[] = [];

  if (critical > graph.relationships.length * 0.3) {
    suggestions.push('高冲突关系比例过高，可能影响故事平衡');
  }
  if (healthy < graph.relationships.length * 0.2) {
    suggestions.push('健康关系偏少，建议增加正向关系');
  }

  const mainChar = graph.characters.find(c => c.role === 'protagonist');
  if (mainChar) {
    const mainCharRels = graph.relationships.filter(r =>
      r.sourceId === mainChar.id || r.targetId === mainChar.id
    );
    if (mainCharRels.length < 3) {
      suggestions.push('主角关系过少，建议至少建立3个人际关系');
    }
  }

  return { healthy, problematic, critical, suggestions };
}

// 生成关系演变时间线
export function generateRelationshipTimeline(
  graph: RelationshipGraph,
  chapterCount: number
): Array<{ chapter: number; events: string[] }> {
  const timeline: Array<{ chapter: number; events: string[] }> = [];

  // 收集所有关系事件
  const allEvents: Array<{ chapter: number; description: string }> = [];
  graph.relationships.forEach(rel => {
    rel.history.forEach(event => {
      const sourceChar = graph.characters.find(c => c.id === rel.sourceId);
      const targetChar = graph.characters.find(c => c.id === rel.targetId);

      if (sourceChar && targetChar) {
        allEvents.push({
          chapter: event.chapter,
          description: `${sourceChar.name}与${targetChar.name}：${event.description}`
        });
      }
    });

    rel.evolution?.forEach(evo => {
      const sourceChar = graph.characters.find(c => c.id === rel.sourceId);
      const targetChar = graph.characters.find(c => c.id === rel.targetId);

      if (sourceChar && targetChar) {
        allEvents.push({
          chapter: evo.chapter,
          description: `${sourceChar.name}与${targetChar.name}关系演变：${evo.description}`
        });
      }
    });
  });

  // 按章节排序
  allEvents.sort((a, b) => a.chapter - b.chapter);

  // 分组到章节
  let currentChapter = 1;
  for (let i = 0; i <= chapterCount; i++) {
    const eventsInChapter = allEvents.filter(e => e.chapter === i);
    if (eventsInChapter.length > 0) {
      timeline.push({
        chapter: i,
        events: eventsInChapter.map(e => e.description)
      });
    }
  }

  return timeline;
}

// 导出关系图谱为可读格式
export function exportRelationshipGraph(graph: RelationshipGraph): string {
  let output = `# 人物关系图谱\n\n`;

  output += `## 角色列表\n`;
  graph.characters.forEach(char => {
    output += `### ${char.name}（${getRoleLabel(char.role)}）\n`;
    output += `- 重要性：${char.importance}/10\n`;
    output += `- 影响力：${char.influence}/10\n`;
    output += `- 当前状态：${char.currentState}\n`;
    if (char.faction) {
      output += `- 所属势力：${char.faction}\n`;
    }
    output += '\n';
  });

  output += `\n## 关系列表\n`;
  graph.relationships.forEach(rel => {
    const source = graph.characters.find(c => c.id === rel.sourceId);
    const target = graph.characters.find(c => c.id === rel.targetId);

    if (source && target) {
      output += `### ${source.name} - ${target.name}\n`;
      output += `- 关系类型：${RELATIONSHIP_TYPE_LABELS[rel.type]}\n`;
      output += `- 关系强度：${rel.intensity}/100 (${getIntensityLabel(rel.intensity)})\n`;
      output += `- 冲突程度：${rel.conflictLevel}/10\n`;
      output += `- 状态：${getStatusLabel(rel.status)}\n`;
      output += `- 描述：${rel.description}\n`;
      if (rel.history.length > 0) {
        output += `- 关键事件：\n`;
        rel.history.forEach(h => {
          output += `  - 第${h.chapter}章：${h.description}（影响：${h.impact}）\n`;
        });
      }
      output += '\n';
    }
  });

  const conflictMatrix = generateConflictMatrix(graph);
  output += `\n## 冲突分析\n`;
  output += `- 全局紧张度：${Math.floor(conflictMatrix.globalTension)}%\n`;
  output += `- 高冲突热点：${conflictMatrix.pairs.length}个\n`;

  return output;
}

function getRoleLabel(role: CharacterNode['role']): string {
  const labels: Record<CharacterNode['role'], string> = {
    'protagonist': '主角',
    'antagonist': '反派',
    'supporting': '配角',
    'minor': '次要角色'
  };
  return labels[role];
}

function getIntensityLabel(intensity: number): string {
  const entries = Object.entries(INTENSITY_LABELS).sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
  for (const [threshold, label] of entries) {
    if (intensity >= parseInt(threshold)) {
      return label;
    }
  }
  return '未知';
}

function getStatusLabel(status: CharacterRelationship['status']): string {
  const labels: Record<CharacterRelationship['status'], string> = {
    'active': '活跃',
    'dormant': '潜伏',
    'broken': '破裂',
    'developing': '发展中'
  };
  return labels[status];
}
