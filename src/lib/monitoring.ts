/**
 * 监控和告警系统
 *
 * 实现以下功能：
 * 1. 性能监控（Web Vitals）
 * 2. 错误监控
 * 3. 用户行为追踪
 * 4. 自定义指标收集
 */

// ============================================================================
// 性能监控
// ============================================================================

interface WebVitals {
  // Largest Contentful Paint - 最大内容绘制时间
  LCP?: number;
  // First Input Delay - 首次输入延迟
  FID?: number;
  // Cumulative Layout Shift - 累积布局偏移
  CLS?: number;
  // First Contentful Paint - 首次内容绘制
  FCP?: number;
  // Time to First Byte - 首字节时间
  TTFB?: number;
}

class PerformanceMonitor {
  private vitals: Partial<WebVitals> = {};

  /**
   * 记录Web Vitals
   */
  recordVital(name: keyof WebVitals, value: number): void {
    this.vitals[name] = value;

    // 发送到监控系统
    this.sendToMonitoring(name, value);
  }

  /**
   * 获取当前Web Vitals
   */
  getVitals(): WebVitals {
    return { ...this.vitals };
  }

  /**
   * 发送到监控系统
   */
  private sendToMonitoring(name: string, value: number): void {
    // 开发环境只在控制台打印
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value}ms`);
      return;
    }

    // 生产环境发送到Vercel Analytics或其他监控服务
    // Vercel Analytics已自动收集Web Vitals
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', {
        name: 'web_vital',
        data: { [name]: value },
      });
    }
  }

  /**
   * 测量函数执行时间
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    this.sendToMonitoring(`perf_${name}`, duration);

    return { result, duration };
  }

  /**
   * 测量同步函数执行时间
   */
  measureSync<T>(name: string, fn: () => T): { result: T; duration: number } {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    this.sendToMonitoring(`perf_${name}`, duration);

    return { result, duration };
  }
}

// ============================================================================
// 错误监控
// ============================================================================

interface ErrorInfo {
  message: string;
  stack?: string;
  name?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  additionalData?: Record<string, any>;
}

class ErrorMonitor {
  private errorCount: number = 0;
  private maxErrorsPerSession: number = 10;

  /**
   * 捕获错误
   */
  captureError(error: Error | ErrorInfo, context?: Record<string, any>): void {
    // 限制每个会话的错误数量
    if (this.errorCount >= this.maxErrorsPerSession) {
      return;
    }

    this.errorCount++;

    const errorInfo: ErrorInfo = error instanceof Error
      ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
          ...context,
        }
      : error;

    // 添加上下文信息
    if (typeof window !== 'undefined') {
      errorInfo.url = window.location.href;
      errorInfo.userAgent = navigator.userAgent;
    }

    // 开发环境在控制台打印
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Monitor]', errorInfo);
      return;
    }

    // 生产环境发送到监控系统
    this.sendToMonitoring(errorInfo);
  }

  /**
   * 捕获未处理的Promise rejection
   */
  setupGlobalHandlers(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // 捕获未处理的错误
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // 捕获未处理的Promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason || new Error('Unhandled Promise Rejection'), {
        type: 'unhandled_promise_rejection',
      });
    });
  }

  /**
   * 发送错误到监控系统
   */
  private sendToMonitoring(errorInfo: ErrorInfo): void {
    // 发送到Vercel Analytics或其他监控服务
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', {
        name: 'error',
        data: errorInfo,
      });
    }

    // TODO: 集成Sentry等错误监控服务
    // Sentry.captureException(errorInfo);
  }
}

// ============================================================================
// 用户行为追踪
// ============================================================================

interface UserAction {
  type: string;
  timestamp: number;
  page?: string;
  data?: Record<string, any>;
}

class UserBehaviorTracker {
  private actions: UserAction[] = [];
  private maxActions: number = 100;

  /**
   * 追踪用户行为
   */
  track(type: string, data?: Record<string, any>): void {
    const action: UserAction = {
      type,
      timestamp: Date.now(),
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
      data,
    };

    this.actions.push(action);

    // 限制历史记录数量
    if (this.actions.length > this.maxActions) {
      this.actions.shift();
    }

    // 发送到监控系统
    this.sendToMonitoring(action);
  }

  /**
   * 获取用户行为历史
   */
  getActions(filterType?: string): UserAction[] {
    if (filterType) {
      return this.actions.filter(a => a.type === filterType);
    }
    return [...this.actions];
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    this.actions = [];
  }

  /**
   * 发送行为到监控系统
   */
  private sendToMonitoring(action: UserAction): void {
    // 开发环境在控制台打印
    if (process.env.NODE_ENV === 'development') {
      console.log('[User Action]', action.type, action.data);
      return;
    }

    // 生产环境发送到Vercel Analytics
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', {
        name: action.type,
        data: action.data,
      });
    }
  }

  /**
   * 追踪页面浏览
   */
  trackPageView(path: string): void {
    this.track('page_view', { path });
  }

  /**
   * 追踪按钮点击
   */
  trackButtonClick(buttonName: string, context?: Record<string, any>): void {
    this.track('button_click', { button: buttonName, ...context });
  }

  /**
   * 追踪表单提交
   */
  trackFormSubmit(formName: string, success: boolean, context?: Record<string, any>): void {
    this.track('form_submit', { form: formName, success, ...context });
  }

  /**
   * 追踪API调用
   */
  trackApiCall(endpoint: string, success: boolean, duration?: number): void {
    this.track('api_call', { endpoint, success, duration });
  }
}

// ============================================================================
// 自定义指标收集
// ============================================================================

interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

class MetricsCollector {
  private metrics: Metric[] = [];
  private maxMetrics: number = 1000;

  /**
   * 收集指标
   */
  collect(name: string, value: number, tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };

    this.metrics.push(metric);

    // 限制历史记录数量
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * 获取指标
   */
  getMetrics(filterName?: string): Metric[] {
    if (filterName) {
      return this.metrics.filter(m => m.name === filterName);
    }
    return [...this.metrics];
  }

  /**
   * 计数器
   */
  increment(name: string, value: number = 1, tags?: Record<string, string>): void {
    const lastMetric = this.metrics
      .filter(m => m.name === name && JSON.stringify(m.tags) === JSON.stringify(tags))
      .pop();

    const currentValue = lastMetric?.value || 0;
    this.collect(name, currentValue + value, tags);
  }

  /**
   * 直方图（记录分布）
   */
  histogram(name: string, value: number, tags?: Record<string, string>): void {
    this.collect(`${name}_value`, value, tags);
    this.increment(`${name}_count`, 1, tags);
  }

  /**
   * 计时器
   */
  timing(name: string, duration: number, tags?: Record<string, string>): void {
    this.collect(`${name}_duration`, duration, tags);
  }
}

// ============================================================================
// 导出单例实例
// ============================================================================

export const performanceMonitor = new PerformanceMonitor();
export const errorMonitor = new ErrorMonitor();
export const userBehaviorTracker = new UserBehaviorTracker();
export const metricsCollector = new MetricsCollector();

// 自动设置全局错误处理器
if (typeof window !== 'undefined') {
  errorMonitor.setupGlobalHandlers();
}

// ============================================================================
// React Hooks
// ============================================================================

import { useEffect } from 'react';

/**
 * 性能监控Hook
 */
export function usePerformanceMonitor() {
  useEffect(() => {
    // 导入web-vitals库
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric: any) => performanceMonitor.recordVital('CLS', metric.value));
      getFID((metric: any) => performanceMonitor.recordVital('FID', metric.value));
      getFCP((metric: any) => performanceMonitor.recordVital('FCP', metric.value));
      getLCP((metric: any) => performanceMonitor.recordVital('LCP', metric.value));
      getTTFB((metric: any) => performanceMonitor.recordVital('TTFB', metric.value));
    });
  }, []);
}

/**
 * 错误监控Hook
 */
export function useErrorMonitor() {
  useEffect(() => {
    errorMonitor.setupGlobalHandlers();
  }, []);
}

/**
 * 页面浏览追踪Hook
 */
export function usePageTracking() {
  useEffect(() => {
    const path = window.location.pathname;
    userBehaviorTracker.trackPageView(path);
  }, []);
}
