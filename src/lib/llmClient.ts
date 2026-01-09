/**
 * LLM客户端封装
 * 提供统一的AI接口调用，支持流式输出
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMStreamOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
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

export class LLMClient {
  private botId?: string;

  constructor(botId?: string) {
    this.botId = botId;
  }

  /**
   * 单次调用（非流式）
   */
  async chat(
    messages: LLMMessage[],
    options: LLMStreamOptions = {}
  ): Promise<LLMResponse> {
    // 模拟调用，实际项目中应该替换为真实的SDK调用
    try {
      // 这里使用模拟实现，实际应该集成真实的LLM服务
      const mockResponse = {
        content: '这是AI生成的模拟响应',
        finishReason: 'stop',
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
      };

      return mockResponse;
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
      // 模拟流式响应
      const mockContent = '这是AI生成的流式模拟响应，逐字输出内容...';
      for (const char of mockContent) {
        yield char;
        await new Promise(resolve => setTimeout(resolve, 50)); // 模拟延迟
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
