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

// POST /api/characters - 创建新角色（AI生成）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.characterName || !body.genre) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 使用LLM生成角色设定
    const llmClient = new LLMClient();

    const systemPrompt = '你是一个专业的小说角色设定创作助手。请根据提供的信息，生成立体饱满、独特鲜明的角色设定。';

    const roleLabels: Record<string, string> = {
      protagonist: '主角',
      secondary: '配角',
      antagonist: '反派',
      supporting: '辅助角色'
    };

    const genreLabels: Record<string, string> = {
      xuanhuan: '玄幻',
      wuxia: '武侠',
      xianxia: '仙侠',
      dushi: '都市',
      lishi: '历史',
      junshi: '军事',
      kehuan: '科幻',
      lingyi: '灵异'
    };

    const userPrompt = `请为以下角色生成完整设定：

角色名称：${body.characterName}
角色定位：${roleLabels[body.role] || body.role}
小说题材：${genreLabels[body.genre] || body.genre}
故事背景：${body.storyContext || '无额外背景'}

请生成以下内容（以JSON格式返回）：
{
  "name": "角色名称",
  "role": "角色定位的详细描述",
  "personality": "性格特点的详细描述",
  "backstory": "角色背景故事的详细描述（200-500字）",
  "motivations": ["动机1", "动机2", "动机3"],
  "abilities": ["能力1", "能力2", "能力3"],
  "traits": ["性格特质1", "性格特质2", "性格特质3"],
  "relationships": {"角色名": "关系描述"}
}

确保角色设定符合${genreLabels[body.genre] || body.genre}题材的特点，逻辑严谨，细节丰富。`;

    const response = await llmClient.generateText(systemPrompt, userPrompt);

    // 尝试解析JSON响应
    let characterData;
    try {
      // 尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        characterData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析JSON');
      }
    } catch (error) {
      // 如果解析失败，创建一个基础的角色设定
      characterData = {
        name: body.characterName,
        role: roleLabels[body.role] || '未设定',
        personality: '性格鲜明，富有个性',
        backstory: response.substring(0, 500),
        motivations: ['追求成长', '实现目标'],
        abilities: ['智慧', '勇气'],
        traits: ['坚韧', '正义'],
        relationships: {}
      };
    }

    // 创建角色
    const character = {
      id: `char-${Date.now()}`,
      name: characterData.name || body.characterName,
      role: characterData.role || roleLabels[body.role] || '未设定',
      personality: characterData.personality || '性格鲜明，富有个性',
      backstory: characterData.backstory || '待补充',
      motivations: Array.isArray(characterData.motivations) ? characterData.motivations : ['追求成长', '实现目标'],
      abilities: Array.isArray(characterData.abilities) ? characterData.abilities : [],
      traits: Array.isArray(characterData.traits) ? characterData.traits : [],
      relationships: characterData.relationships || {},
      arcProgress: 0
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
