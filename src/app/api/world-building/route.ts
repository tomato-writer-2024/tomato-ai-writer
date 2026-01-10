import { NextRequest, NextResponse } from 'next/server';
import { WorldSetting, generateWorldDescription, GENRE_TEMPLATES } from '@/lib/worldBuilding';
import { LLMClient } from '@/lib/llmClient';
import { getSystemPromptForFeature } from '@/lib/tomatoNovelPrompts';

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

// POST /api/world-building - 创建新世界观（AI生成）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.worldName || !body.worldType) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 使用LLM生成世界观设定（番茄小说风格）
    const llmClient = new LLMClient();

    const systemPrompt = getSystemPromptForFeature('world-building');

    const typeLabels: Record<string, string> = {
      fantasy: '奇幻',
      scifi: '科幻',
      wuxia: '武侠',
      xianxia: '仙侠',
      urban: '都市',
      apocalyptic: '末世'
    };

    const userPrompt = `请为以下番茄小说世界观生成完整设定（符合Top3爆款标准）：

世界名称：${body.worldName}
世界类型：${typeLabels[body.worldType] || body.worldType}
主题风格：${body.theme || '无特定主题'}
故事背景：${body.storyContext || '无额外背景'}

【创作要求】
- 确保世界观符合${typeLabels[body.worldType] || body.worldType}题材的爽文特征
- 逻辑严谨，细节丰富，能支撑100-300万字的长篇小说
- 为主角成长提供足够空间和挑战
- 力量体系有规则、限制和代价，避免过于容易突破
- 势力设置要有层次感，从底层到顶层完整

请生成以下内容（以JSON格式返回）：
{
  "name": "世界名称",
  "type": "世界类型",
  "magicSystem": "魔法/力量体系的详细描述（包含规则、限制、代价）",
  "geography": ["地理特征1（适合主角冒险）", "地理特征2（隐藏秘境）", "地理特征3（危险禁区）"],
  "culture": ["文化特色1", "文化特色2", "文化特色3"],
  "history": "世界历史背景的详细描述（300-500字，包含重大事件和传说）",
  "factions": [
    {"name": "势力名称1", "description": "势力描述（包含实力层级、核心利益）"},
    {"name": "势力名称2", "description": "势力描述（包含实力层级、核心利益）"}
  ],
  "rules": ["规则1", "规则2", "规则3"],
  "conflicts": ["核心冲突1（驱动主线）", "核心冲突2（制造矛盾）", "核心冲突3（提供成长机会）"]
}

【质量目标】
- 编辑视角评分：9.8分+（逻辑严谨、创新性、完整性）
- 读者视角评分：9.8分+（代入感、期待感、追读动力）
- 完读率预期：90%+
`;

    const response = await llmClient.generateText(systemPrompt, userPrompt);

    // 尝试解析JSON响应
    let worldData;
    try {
      // 尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        worldData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析JSON');
      }
    } catch (error) {
      // 如果解析失败，创建一个基础的世界观设定
      worldData = {
        name: body.worldName,
        type: typeLabels[body.worldType] || body.worldType,
        magicSystem: '完善的力量体系',
        geography: ['多样的地理环境'],
        culture: ['丰富的文化特色'],
        history: response.substring(0, 500),
        factions: [{ name: '主要势力', description: '势力描述' }],
        rules: ['核心规则'],
        conflicts: ['核心冲突']
      };
    }

    // 创建世界观
    const world = {
      id: `world-${Date.now()}`,
      name: worldData.name || body.worldName,
      type: worldData.type || typeLabels[body.worldType] || body.worldType,
      magicSystem: worldData.magicSystem || '待补充',
      geography: Array.isArray(worldData.geography) ? worldData.geography : [],
      culture: Array.isArray(worldData.culture) ? worldData.culture : [],
      history: worldData.history || '待补充',
      factions: Array.isArray(worldData.factions) ? worldData.factions : [],
      rules: Array.isArray(worldData.rules) ? worldData.rules : [],
      conflicts: Array.isArray(worldData.conflicts) ? worldData.conflicts : []
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

    // 使用LLM生成详细描述（番茄小说风格）
    const systemPrompt = getSystemPromptForFeature('world-building');
    const userPrompt = `请为以下番茄小说世界观生成详细设定（符合Top3爆款标准），包括：

1. 力量体系的详细规则和限制（为主角成长提供清晰路径）
2. 地理环境的详细描述（标注适合冒险、隐藏秘境、危险禁区）
3. 社会结构和政治体系（有层次感，主角可逐步攀爬）
4. 历史事件和文化传统（包含重大事件和传说，可推动情节）
5. 各势力的关系和冲突（为主角提供对手和盟友）

世界观基础信息：
${description}

【创作要求】
- 确保符合番茄小说快节奏、强代入感的特征
- 每个设定都要考虑如何服务爽文情节（打脸、突破、装逼）
- 为主角成长提供清晰的晋升路径和挑战
- 势力关系要有动态变化，可推动情节发展
- 细节丰富但主线清晰，避免过于复杂

【质量目标】
- 编辑视角评分：9.8分+（逻辑严谨、完整性、商业价值）
- 读者视角评分：9.8分+（期待感、追读动力、爽感）
- 完读率预期：90%+

请以Markdown格式输出，结构清晰，易于实施。`;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const llmClient = new LLMClient();
          const generator = llmClient.generateTextStream(systemPrompt, userPrompt);

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
          const llmClient = new LLMClient();
          const generator = llmClient.generateTextStream(systemPrompt, userPrompt);

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
