import { NextRequest, NextResponse } from 'next/server';
import { WorldSetting, generateWorldDescription, GENRE_TEMPLATES } from '@/lib/worldBuilding';
import { generateCreativeWritingStream, generateReasoningStream } from '@/lib/llmClient';

// GET /api/world-building - 获取用户的世界观列表
export async function GET(request: NextRequest) {
  try {
    // TODO: 从数据库获取用户的世界观列表
    const worlds: WorldSetting[] = [];

    return NextResponse.json({ success: true, data: worlds });
  } catch (error) {
    console.error('获取世界观列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取世界观列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/world-building - 创建新世界观
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.name || !body.genre) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 获取题材模板
    const template = GENRE_TEMPLATES[body.genre] || {};

    // 创建世界观
    const world: WorldSetting = {
      id: `world-${Date.now()}`,
      userId: body.userId || '',
      name: body.name,
      genre: body.genre,
      timePeriod: body.timePeriod || '现代',
      technologyLevel: body.technologyLevel || template.technologyLevel || 50,
      magicSystem: body.magicSystem || template.magicSystem,
      geography: body.geography || {
        continents: [],
        landmarks: [],
        climate: '温带',
        naturalResources: []
      },
      society: body.society || template.society || {
        politicalSystem: '君主制',
        economicSystem: '农业经济',
        socialClasses: [],
        laws: [],
        customs: [],
        religions: [],
        languages: []
      },
      history: body.history || [],
      cultures: body.cultures || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // TODO: 保存到数据库

    return NextResponse.json({ success: true, data: world });
  } catch (error) {
    console.error('创建世界观失败:', error);
    return NextResponse.json(
      { success: false, error: '创建世界观失败' },
      { status: 500 }
    );
  }
}

// POST /api/world-building/generate - 生成世界观详情
export async function generateWorldDetails(request: NextRequest) {
  try {
    const body = await request.json();
    const { world } = body;

    if (!world) {
      return NextResponse.json(
        { success: false, error: '缺少世界观信息' },
        { status: 400 }
      );
    }

    const description = generateWorldDescription(world);

    // 使用LLM生成详细描述
    const systemPrompt = '你是一个专业的世界观设定创作助手。请根据提供的世界观基础信息，生成详细、完整的世界观设定。';
    const userPrompt = `请为以下世界观生成详细设定，包括：
1. 力量体系的详细规则和限制
2. 地理环境的详细描述
3. 社会结构和政治体系
4. 历史事件和文化传统
5. 各势力的关系和冲突

世界观基础信息：
${description}

请以Markdown格式输出，确保逻辑严谨、细节丰富。`;

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
          console.error('生成世界观详情失败:', error);
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
    console.error('生成世界观详情失败:', error);
    return NextResponse.json(
      { success: false, error: '生成世界观详情失败' },
      { status: 500 }
    );
  }
}

// POST /api/world-building/analyze - 分析世界观一致性
export async function analyzeWorld(request: NextRequest) {
  try {
    const body = await request.json();
    const { world } = body;

    if (!world) {
      return NextResponse.json(
        { success: false, error: '缺少世界观信息' },
        { status: 400 }
      );
    }

    // TODO: 实现分析逻辑
    const analysis = {
      world,
      coherence: 85,
      depth: 80,
      originality: 75,
      suggestions: []
    };

    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    console.error('分析世界观失败:', error);
    return NextResponse.json(
      { success: false, error: '分析世界观失败' },
      { status: 500 }
    );
  }
}

// POST /api/world-building/optimize - 优化世界观设定
export async function optimizeWorld(request: NextRequest) {
  try {
    const body = await request.json();
    const { world } = body;

    if (!world) {
      return NextResponse.json(
        { success: false, error: '缺少世界观信息' },
        { status: 400 }
      );
    }

    // 使用LLM生成优化建议
    const systemPrompt = '你是一个专业的世界观设定优化助手。请分析提供的世界观设定，提出优化建议。';
    const userPrompt = `请分析并优化以下世界观设定：

${JSON.stringify(world, null, 2)}

请提供：
1. 逻辑一致性问题及修正建议
2. 世界深度增强建议
3. 创新性提升方向
4. 具体优化措施

请以Markdown格式输出。`;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = generateReasoningStream(systemPrompt, userPrompt);

          for await (const chunk of generator) {
            const text = chunk || '';
            controller.enqueue(encoder.encode(text));
          }

          controller.enqueue(encoder.encode('[DONE]'));
          controller.close();
        } catch (error) {
          console.error('优化世界观失败:', error);
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
    console.error('优化世界观失败:', error);
    return NextResponse.json(
      { success: false, error: '优化世界观失败' },
      { status: 500 }
    );
  }
}

// POST /api/world-building/from-template - 从模板创建世界观
export async function createFromTemplate(request: NextRequest) {
  try {
    const body = await request.json();
    const { genre, name, customizations } = body;

    if (!genre || !name) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const template = GENRE_TEMPLATES[genre];

    if (!template) {
      return NextResponse.json(
        { success: false, error: '不支持的题材类型' },
        { status: 400 }
      );
    }

    const world: WorldSetting = {
      id: `world-${Date.now()}`,
      userId: '',
      name,
      genre: genre as any,
      timePeriod: customizations?.timePeriod || '现代',
      technologyLevel: customizations?.technologyLevel || template.technologyLevel || 50,
      magicSystem: customizations?.magicSystem || template.magicSystem,
      geography: customizations?.geography || template.geography || {
        continents: [],
        landmarks: [],
        climate: '温带',
        naturalResources: []
      },
      society: customizations?.society || template.society || {
        politicalSystem: '君主制',
        economicSystem: '农业经济',
        socialClasses: [],
        laws: [],
        customs: [],
        religions: [],
        languages: []
      },
      history: customizations?.history || [],
      cultures: customizations?.cultures || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return NextResponse.json({ success: true, data: world });
  } catch (error) {
    console.error('从模板创建世界观失败:', error);
    return NextResponse.json(
      { success: false, error: '从模板创建世界观失败' },
      { status: 500 }
    );
  }
}
