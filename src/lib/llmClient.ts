/**
 * LLM客户端封装 - 集成豆包大语言模型
 * 提供统一的AI接口调用，支持流式输出
 */

import { LLMClient as CozeLLMClient, Config } from 'coze-coding-dev-sdk';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMStreamOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  thinking?: 'enabled' | 'disabled';
  caching?: 'enabled' | 'disabled';
}

export interface LLMResponse {
  content: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * 豆包大语言模型列表
 */
export const DOUBAO_MODELS = {
  DEFAULT: 'doubao-seed-1-6-251015', // 平衡性能（默认）
  FAST: 'doubao-seed-1-6-flash-250615', // 快速响应
  THINKING: 'doubao-seed-1-6-thinking-250715', // 深度思考
  VISION: 'doubao-seed-1-6-vision-250815', // 视觉模型
  LITE: 'doubao-seed-1-6-lite-251015', // 轻量级
  DEEPSEEK_V3: 'deepseek-v3-2-251201', // DeepSeek V3.2
  DEEPSEEK_R1: 'deepseek-r1-250528', // DeepSeek R1
  KIMI_K2: 'kimi-k2-250905', // Kimi K2（长上下文）
} as const;

/**
 * 根据任务类型推荐模型
 */
export function getModelForTask(task: 'creative' | 'reasoning' | 'fast' | 'vision'): string {
  switch (task) {
    case 'creative':
      return DOUBAO_MODELS.DEFAULT;
    case 'reasoning':
      return DOUBAO_MODELS.THINKING;
    case 'fast':
      return DOUBAO_MODELS.FAST;
    case 'vision':
      return DOUBAO_MODELS.VISION;
    default:
      return DOUBAO_MODELS.DEFAULT;
  }
}

export class LLMClient {
  private client: CozeLLMClient;

  constructor(config?: Config) {
    // 初始化Coze LLM客户端
    this.client = new CozeLLMClient(config || new Config());
  }

  /**
   * 单次调用（非流式）
   */
  async chat(
    messages: LLMMessage[],
    options: LLMStreamOptions = {}
  ): Promise<LLMResponse> {
    try {
      // 转换为Coze SDK的消息格式
      const cozeMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // 调用Coze SDK
      const response = await this.client.invoke(cozeMessages, {
        model: options.model || DOUBAO_MODELS.DEFAULT,
        temperature: options.temperature ?? 0.7,
        thinking: options.thinking || 'disabled',
        caching: options.caching || 'disabled',
      });

      return {
        content: response.content,
      };
    } catch (error) {
      console.error('LLM chat error:', error);
      throw new Error(`LLM调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 流式调用
   */
  async *chatStream(
    messages: LLMMessage[],
    options: LLMStreamOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    try {
      // 转换为Coze SDK的消息格式
      const cozeMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // 调用Coze SDK流式接口
      const stream = this.client.stream(cozeMessages, {
        model: options.model || DOUBAO_MODELS.DEFAULT,
        temperature: options.temperature ?? 0.7,
        thinking: options.thinking || 'disabled',
        caching: options.caching || 'disabled',
      });

      // 流式输出
      for await (const chunk of stream) {
        if (chunk.content) {
          yield chunk.content.toString();
        }
      }
    } catch (error) {
      console.error('LLM stream error:', error);
      throw new Error(`LLM流式调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 流式调用别名方法
   */
  async *stream(
    messages: LLMMessage[],
    options: LLMStreamOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    yield* this.chatStream(messages, options);
  }

  /**
   * 简化流式调用（仅用于单个提示词）
   */
  async *generateTextStream(
    systemPrompt: string,
    userPrompt: string,
    options: LLMStreamOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    yield* this.chatStream(messages, options);
  }

  /**
   * 简化非流式调用
   */
  async generateText(
    systemPrompt: string,
    userPrompt: string,
    options: LLMStreamOptions = {}
  ): Promise<string> {
    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await this.chat(messages, options);
    return response.content;
  }

  /**
   * 创意写作专用方法（高温输出）
   */
  async *creativeWritingStream(
    systemPrompt: string,
    userPrompt: string,
    options: LLMStreamOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    yield* this.generateTextStream(systemPrompt, userPrompt, {
      ...options,
      model: options.model || getModelForTask('creative'),
      temperature: options.temperature ?? 0.9,
    });
  }

  /**
   * 深度推理专用方法（思考模式）
   */
  async *reasoningStream(
    systemPrompt: string,
    userPrompt: string,
    options: LLMStreamOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    yield* this.generateTextStream(systemPrompt, userPrompt, {
      ...options,
      model: options.model || getModelForTask('reasoning'),
      thinking: 'enabled',
      temperature: options.temperature ?? 0.7,
    });
  }

  /**
   * 快速响应专用方法（轻量级模型）
   */
  async *fastResponseStream(
    systemPrompt: string,
    userPrompt: string,
    options: LLMStreamOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    yield* this.generateTextStream(systemPrompt, userPrompt, {
      ...options,
      model: options.model || getModelForTask('fast'),
      temperature: options.temperature ?? 0.5,
    });
  }
}

// 默认实例
export const llmClient = new LLMClient();

// 便捷函数
export async function generateLLMText(
  systemPrompt: string,
  userPrompt: string,
  options?: LLMStreamOptions
): Promise<string> {
  return llmClient.generateText(systemPrompt, userPrompt, options);
}

export async function* generateLLMTextStream(
  systemPrompt: string,
  userPrompt: string,
  options?: LLMStreamOptions
): AsyncGenerator<string, void, unknown> {
  yield* llmClient.generateTextStream(systemPrompt, userPrompt, options);
}

export async function* generateCreativeWritingStream(
  systemPrompt: string,
  userPrompt: string,
  options?: LLMStreamOptions
): AsyncGenerator<string, void, unknown> {
  yield* llmClient.creativeWritingStream(systemPrompt, userPrompt, options);
}

export async function* generateReasoningStream(
  systemPrompt: string,
  userPrompt: string,
  options?: LLMStreamOptions
): AsyncGenerator<string, void, unknown> {
  yield* llmClient.reasoningStream(systemPrompt, userPrompt, options);
}
