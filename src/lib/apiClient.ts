import { getToken } from './auth-client';

/**
 * API请求配置选项
 */
export interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * API客户端工具类
 *
 * 自动处理：
 * - Token注入
 * - 错误处理
 * - 统一响应格式
 */
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  /**
   * 创建请求头
   */
  private createHeaders(requireAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 如果需要认证，自动添加Token
    if (requireAuth) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      // 处理错误响应
      if (data.error) {
        throw new Error(data.error);
      }
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    return data as T;
  }

  /**
   * GET请求
   */
  async get<T>(url: string, options?: ApiRequestOptions): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options || {};

    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'GET',
      headers: this.createHeaders(requireAuth),
      ...fetchOptions,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST请求
   */
  async post<T>(url: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options || {};

    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: this.createHeaders(requireAuth),
      body: JSON.stringify(body),
      ...fetchOptions,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT请求
   */
  async put<T>(url: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options || {};

    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers: this.createHeaders(requireAuth),
      body: JSON.stringify(body),
      ...fetchOptions,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE请求
   */
  async delete<T>(url: string, options?: ApiRequestOptions): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options || {};

    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'DELETE',
      headers: this.createHeaders(requireAuth),
      ...fetchOptions,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * 文件上传
   */
  async upload<T>(url: string, file: File, options?: Omit<ApiRequestOptions, 'body'>): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options || {};

    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (requireAuth) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers,
      body: formData,
      ...fetchOptions,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * 流式请求（用于AI生成）
   */
  async stream(
    url: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<ReadableStream> {
    const { requireAuth = true, ...fetchOptions } = options || {};

    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: this.createHeaders(requireAuth),
      body: JSON.stringify(body),
      ...fetchOptions,
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status} ${response.statusText}`);
    }

    return response.body!;
  }
}

// 创建默认实例
export const apiClient = new ApiClient();

// 导出便捷方法
export const api = {
  get: <T>(url: string, options?: ApiRequestOptions) => apiClient.get<T>(url, options),
  post: <T>(url: string, body?: any, options?: ApiRequestOptions) => apiClient.post<T>(url, body, options),
  put: <T>(url: string, body?: any, options?: ApiRequestOptions) => apiClient.put<T>(url, body, options),
  delete: <T>(url: string, options?: ApiRequestOptions) => apiClient.delete<T>(url, options),
  upload: <T>(url: string, file: File, options?: Omit<ApiRequestOptions, 'body'>) => apiClient.upload<T>(url, file, options),
  stream: (url: string, body?: any, options?: ApiRequestOptions) => apiClient.stream(url, body, options),
};
