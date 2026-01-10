/**
 * 工具函数库
 * 提供各种辅助函数
 */

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 深度克隆
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as T;
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * 格式化数字
 */
export function formatNumber(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}亿`;
  } else if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  } else {
    return num.toString();
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 计算相对时间
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else if (days < 30) {
    return `${Math.floor(days / 7)}周前`;
  } else if (days < 365) {
    return `${Math.floor(days / 30)}个月前`;
  } else {
    return `${Math.floor(days / 365)}年前`;
  }
}

/**
 * 随机字符串
 */
export function randomString(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * 随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 随机数组元素
 */
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 数组去重
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * 数组分组
 */
export function groupBy<T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return array.reduce((result, item) => {
    const group = key(item);
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

/**
 * 数组排序
 */
export function sortBy<T>(
  array: T[],
  key: keyof T | ((item: T) => any),
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const valueA = typeof key === 'function' ? key(a) : a[key];
    const valueB = typeof key === 'function' ? key(b) : b[key];

    if (valueA < valueB) {
      return order === 'asc' ? -1 : 1;
    } else if (valueA > valueB) {
      return order === 'asc' ? 1 : -1;
    } else {
      return 0;
    }
  });
}

/**
 * 数组分页
 */
export function paginate<T>(
  array: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; totalPages: number } {
  const total = array.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = array.slice(startIndex, endIndex);

  return {
    data,
    total,
    totalPages,
  };
}

/**
 * 数组切片
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

/**
 * 对象合并
 */
export function merge<T extends object, U extends object>(
  target: T,
  source: U
): T & U {
  return { ...target, ...source };
}

/**
 * 对象深合并
 */
export function deepMerge<T extends object, U extends object>(
  target: T,
  source: U
): T & U {
  const result = { ...target } as T & U;

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const value = source[key];

      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        (result as any)[key] = deepMerge((result as any)[key] || {}, value);
      } else {
        (result as any)[key] = value;
      }
    }
  }

  return result;
}

/**
 * 对象键转数组
 */
export function keys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * 对象值转数组
 */
export function values<T extends object>(obj: T): Array<T[keyof T]> {
  return Object.values(obj) as Array<T[keyof T]>;
}

/**
 * 对象键值对转数组
 */
export function entries<T extends object>(
  obj: T
): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * 空值检查
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }

  return false;
}

/**
 * 验证邮箱
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 截断文本
 */
export function truncate(text: string, length: number, suffix: string = '...'): string {
  if (text.length <= length) {
    return text;
  }

  return text.substring(0, length) + suffix;
}

/**
 * 高亮文本
 */
export function highlight(text: string, keyword: string): string {
  if (!keyword) return text;

  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * 转义HTML
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * 生成颜色
 */
export function generateColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  ];

  return randomItem(colors);
}

/**
 * 生成渐变色
 */
export function generateGradient(): string {
  const color1 = generateColor();
  const color2 = generateColor();

  return `linear-gradient(135deg, ${color1}, ${color2})`;
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 重试机制
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs);
      return retry(fn, retries - 1, delayMs * 2);
    } else {
      throw error;
    }
  }
}

/**
 * 缓存装饰器
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator
      ? keyGenerator(...args)
      : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  }) as T;
}

/**
 * 类名合并
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default {
  generateId,
  debounce,
  throttle,
  deepClone,
  formatNumber,
  formatFileSize,
  formatDate,
  getRelativeTime,
  randomString,
  randomInt,
  randomItem,
  unique,
  groupBy,
  sortBy,
  paginate,
  chunk,
  merge,
  deepMerge,
  keys,
  values,
  entries,
  isEmpty,
  isValidEmail,
  isValidPhone,
  truncate,
  highlight,
  escapeHtml,
  generateColor,
  generateGradient,
  delay,
  retry,
  memoize,
  cn,
};
