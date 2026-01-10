import { NextRequest, NextResponse } from 'next/server';
import {
  RelationshipGraph,
  createRelationshipNode,
  createRelationship,
  calculateNetworkCentrality
} from '@/lib/relationshipMap';
import { generateCreativeWritingStream, generateReasoningStream } from '@/lib/llmClient';
import { getSystemPromptForFeature } from '@/lib/tomatoNovelPrompts';

// GET /api/relationship-map - 获取用户的关系图谱
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const novelId = searchParams.get('novelId');

    // TODO: 从数据库获取关系图谱
    const graphs: RelationshipGraph[] = [];

    return NextResponse.json({ success: true, data: graphs });
  } catch (error) {
    console.error('获取关系图谱失败:', error);
    return NextResponse.json(
      { success: false, error: '获取关系图谱失败' },
      { status: 500 }
    );
  }
}

// POST /api/relationship-map - 创建关系图谱
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.novelId) {
      return NextResponse.json(
        { success: false, error: '缺少小说ID' },
        { status: 400 }
      );
    }

    const graph: RelationshipGraph = {
      id: `rel-graph-${Date.now()}`,
      userId: body.userId || '',
      novelId: body.novelId,
      characters: body.characters || [],
      relationships: body.relationships || [],
      conflicts: body.conflicts || {
        pairs: [],
        globalTension: 0,
        factions: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // TODO: 保存到数据库

    return NextResponse.json({ success: true, data: graph });
  } catch (error) {
    console.error('创建关系图谱失败:', error);
    return NextResponse.json(
      { success: false, error: '创建关系图谱失败' },
      { status: 500 }
    );
  }
}

// POST /api/relationship-map/node - 添加角色节点
export async function addNode(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, importance } = body;

    if (!name || !role) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const node = createRelationshipNode(name, role, importance || 5);

    return NextResponse.json({ success: true, data: node });
  } catch (error) {
    console.error('添加角色节点失败:', error);
    return NextResponse.json(
      { success: false, error: '添加角色节点失败' },
      { status: 500 }
    );
  }
}

// POST /api/relationship-map/relationship - 建立角色关系
export async function addRelationship(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId, targetId, type, description, intensity } = body;

    if (!sourceId || !targetId || !type) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const relationship = createRelationship(
      sourceId,
      targetId,
      type,
      description || '',
      intensity || 50
    );

    return NextResponse.json({ success: true, data: relationship });
  } catch (error) {
    console.error('建立角色关系失败:', error);
    return NextResponse.json(
      { success: false, error: '建立角色关系失败' },
      { status: 500 }
    );
  }
}

// POST /api/relationship-map/analyze - 分析关系动态
export async function analyzeRelationships(request: NextRequest) {
  try {
    const body = await request.json();
    const { graph } = body;

    if (!graph) {
      return NextResponse.json(
        { success: false, error: '缺少关系图谱信息' },
        { status: 400 }
      );
    }

    // 计算网络中心性
    const centrality = calculateNetworkCentrality(graph);

    // TODO: 实现冲突检测和动态分析
    const conflicts: any[] = [];
    const dynamics: any = {};

    return NextResponse.json({
      success: true,
      data: {
        centrality: Object.fromEntries(centrality),
        conflicts,
        dynamics
      }
    });
  } catch (error) {
    console.error('分析关系动态失败:', error);
    return NextResponse.json(
      { success: false, error: '分析关系动态失败' },
      { status: 500 }
    );
  }
}

// POST /api/relationship-map/generate - 生成关系故事线
export async function generateRelationshipStoryline(request: NextRequest) {
  try {
    const body = await request.json();
    const { graph, chapterRange } = body;

    if (!graph) {
      return NextResponse.json(
        { success: false, error: '缺少关系图谱信息' },
        { status: 400 }
      );
    }

    // 使用LLM生成故事线（番茄小说风格）
    const systemPrompt = getSystemPromptForFeature('relationship-map');
    const userPrompt = `请为以下番茄小说人物关系图谱生成情节故事线（符合Top3爆款标准），涵盖第${chapterRange?.start || 1}章到第${chapterRange?.end || 50}章：

关系图谱信息：
${JSON.stringify(graph, null, 2)}

【创作要求】
- 确保关系变化推动情节发展，每章都有关系进展
- 关系变化要服务于爽文情节（打脸、装逼、情感升温）
- 动态变化：关系随情节发展而变化，制造期待
- 有意义：每个关系都有作用，避免无效关系

请以Markdown格式输出，包含：
1. 主要关系的演变阶段（每10-20章一个大阶段）
2. 关键冲突点（制造爽点）
3. 情感转折点（增强代入感）
4. 高潮时刻（震撼读者）
5. 每个阶段的章节建议（具体到章数）

【质量目标】
- 编辑视角评分：9.8分+（情节编排、人物塑造、商业价值）
- 读者视角评分：9.8分+（爽感、代入、追读动力）
- 完读率预期：90%+
`;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = generateCreativeWritingStream(systemPrompt, userPrompt);

          for await (const chunk of generator) {
            const text = chunk || '';
            controller.enqueue(encoder.encode(text));
          }

          controller.enqueue(encoder.encode('[DONE]'));
          controller.close();
        } catch (error) {
          console.error('生成关系故事线失败:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('生成关系故事线失败:', error);
    return NextResponse.json(
      { success: false, error: '生成关系故事线失败' },
      { status: 500 }
    );
  }
}
