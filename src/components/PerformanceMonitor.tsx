'use client';

import { Analytics } from '@vercel/analytics/react';

/**
 * 性能监控组件
 *
 * 使用 Vercel Analytics 进行性能监控和数据收集
 *
 * 功能：
 * - 页面浏览量统计
 * - Web Vitals 收集（LCP, FID, CLS）
 * - 用户行为分析
 * - 性能指标追踪
 */
export default function PerformanceMonitor() {
  return <Analytics />;
}

/**
 * Web Vitals 说明
 *
 * 1. LCP (Largest Contentful Paint): 最大内容绘制
 *    - 目标: < 2.5秒
 *    - 意义: 衡量页面主要内容加载速度
 *
 * 2. FID (First Input Delay): 首次输入延迟
 *    - 目标: < 100毫秒
 *    - 意义: 衡量页面首次交互响应速度
 *
 * 3. CLS (Cumulative Layout Shift): 累积布局偏移
 *    - 目标: < 0.1
 *    - 意义: 衡量页面布局稳定性
 *
 * 4. FCP (First Contentful Paint): 首次内容绘制
 *    - 目标: < 1.8秒
 *    - 意义: 衡量首次渲染内容的时间
 *
 * 5. TTFB (Time to First Byte): 首字节时间
 *    - 目标: < 600毫秒
 *    - 意义: 衡量服务器响应速度
 */
