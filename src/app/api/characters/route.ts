import { NextRequest, NextResponse } from 'next/server';
import { CharacterProfile, generateCharacterBackstory, analyzeCharacterConsistency, createCharacterFromArchetype, predictCharacterGrowth, generateCharacterDialogue } from '@/lib/characterSystem';
import { LLMClient } from '@/lib/llmClient';

// GET /api/characters - 获取用户的角色列表
export async function GET(request: NextRequest) {
  try {
    // TODO: 从数据库获取用户的角色列表
    const characters: CharacterProfile[] = [];

    return NextResponse.json({ success: true, data: characters });
  } catch (error) {
    console.error('获取角色列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取角色列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/characters - 创建新角色
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.name || !body.gender || !body.age) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 创建角色
    const character: CharacterProfile = {
      id: `char-${Date.now()}`,
      userId: body.userId || '',
      name: body.name,
      nickname: body.nickname,
      age: body.age,
      gender: body.gender,
      appearance: body.appearance || '请填写外貌描述',
      personality: body.personality || {
        openness: 50,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
        humor: 50,
        loyalty: 50,
        ambition: 50,
        courage: 50,
        empathy: 50
      },
      background: body.background || '',
      motivation: body.motivation || '',
      skills: body.skills || [],
      flaws: body.flaws || [],
      strengths: body.strengths || [],
      backstory: body.backstory || '',
      growthArc: body.growthArc || 'growth',
      role: body.role || 'supporting',
      relationships: body.relationships || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // TODO: 保存到数据库

    return NextResponse.json({ success: true, data: character });
  } catch (error) {
    console.error('创建角色失败:', error);
    return NextResponse.json(
      { success: false, error: '创建角色失败' },
      { status: 500 }
    );
  }
}

// POST /api/characters/generate-backstory - 生成角色小传
export async function generateBackstory(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile } = body;

    if (!profile) {
      return NextResponse.json(
        { success: false, error: '缺少角色信息' },
        { status: 400 }
      );
    }

    // 使用LLM生成角色小传
    const prompt = generateCharacterBackstory(profile);
    const llmClient = new LLMClient();

    // 流式输出
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = llmClient.generateTextStream(
            '你是一个专业的小说角色小传创作助手。',
            prompt
          );

          for await (const chunk of generator) {
            const text = chunk || '';
            controller.enqueue(encoder.encode(text));
          }

          controller.enqueue(encoder.encode('[DONE]'));
          controller.close();
        } catch (error) {
          console.error('生成角色小传失败:', error);
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
    console.error('生成角色小传失败:', error);
    return NextResponse.json(
      { success: false, error: '生成角色小传失败' },
      { status: 500 }
    );
  }
}

// POST /api/characters/analyze - 分析角色一致性
export async function analyzeCharacter(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile } = body;

    if (!profile) {
      return NextResponse.json(
        { success: false, error: '缺少角色信息' },
        { status: 400 }
      );
    }

    const analysis = analyzeCharacterConsistency(profile);

    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    console.error('分析角色失败:', error);
    return NextResponse.json(
      { success: false, error: '分析角色失败' },
      { status: 500 }
    );
  }
}

// POST /api/characters/from-archetype - 从原型创建角色
export async function createFromArchetype(request: NextRequest) {
  try {
    const body = await request.json();
    const { archetype, customizations } = body;

    if (!archetype) {
      return NextResponse.json(
        { success: false, error: '缺少角色原型' },
        { status: 400 }
      );
    }

    const character = createCharacterFromArchetype(archetype, customizations || {});

    return NextResponse.json({ success: true, data: character });
  } catch (error) {
    console.error('从原型创建角色失败:', error);
    return NextResponse.json(
      { success: false, error: '从原型创建角色失败' },
      { status: 500 }
    );
  }
}

// POST /api/characters/predict-growth - 预测角色成长路径
export async function predictGrowth(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile } = body;

    if (!profile) {
      return NextResponse.json(
        { success: false, error: '缺少角色信息' },
        { status: 400 }
      );
    }

    const growthPath = predictCharacterGrowth(profile);

    return NextResponse.json({ success: true, data: growthPath });
  } catch (error) {
    console.error('预测角色成长失败:', error);
    return NextResponse.json(
      { success: false, error: '预测角色成长失败' },
      { status: 500 }
    );
  }
}

// POST /api/characters/generate-dialogue - 生成角色对话示例
export async function generateDialogue(request: NextRequest) {
  try {
    const body = await request.json();
    const { character, context, tone } = body;

    if (!character || !context) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const prompt = generateCharacterDialogue(character, context, tone || 'casual');
    const llmClient = new LLMClient();

    // 流式输出
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = llmClient.generateTextStream(
            '你是一个专业的小说对话创作助手。',
            prompt
          );

          for await (const chunk of generator) {
            const text = chunk || '';
            controller.enqueue(encoder.encode(text));
          }

          controller.enqueue(encoder.encode('[DONE]'));
          controller.close();
        } catch (error) {
          console.error('生成对话失败:', error);
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
    console.error('生成对话失败:', error);
    return NextResponse.json(
      { success: false, error: '生成对话失败' },
      { status: 500 }
    );
  }
}
