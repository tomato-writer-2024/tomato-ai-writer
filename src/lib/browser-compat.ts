/**
 * 浏览器兼容性检测工具
 * 用于检测不同浏览器的特性支持情况，特别是360浏览器等国产浏览器
 */

/**
 * 浏览器类型枚举
 */
export enum BrowserType {
  CHROME = 'chrome',
  FIREFOX = 'firefox',
  SAFARI = 'safari',
  EDGE = 'edge',
  IE = 'ie',
  QQ = 'qq',
  SAFARI_MOBILE = 'safari-mobile',
  OPERA = 'opera',
  THREE60 = '360', // 360浏览器
  SOGOU = 'sogou', // 搜狗浏览器
  LIEBAO = 'liebao', // 猎豹浏览器
  MAXTHON = 'maxthon', // 傲游浏览器
  UC = 'uc', // UC浏览器
  OTHER = 'other',
}

/**
 * 浏览器信息接口
 */
export interface BrowserInfo {
  type: BrowserType;
  name: string;
  version: string;
  userAgent: string;
  isMobile: boolean;
  is360: boolean;
  isQQ: boolean;
  isSogou: boolean;
}

/**
 * 检测浏览器类型和版本
 */
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;

  // 检测是否为移动设备
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);

  // 360浏览器检测
  const is360 = /360SE|360EE|360Browser|QIHU|QihooBrowser/i.test(userAgent);

  // QQ浏览器检测
  const isQQ = /QQBrowser|QQ/i.test(userAgent);

  // 搜狗浏览器检测
  const isSogou = /SogouMobileBrowser|SogouExplorer|SE/i.test(userAgent);

  // Chrome/Edge/Safari/Opera检测
  let type = BrowserType.OTHER;
  let name = '未知浏览器';
  let version = '';

  if (is360) {
    type = BrowserType.THREE60;
    name = '360浏览器';
    const match = userAgent.match(/360SE[\/\s](\d+\.?\d*)/i) ||
                 userAgent.match(/360EE[\/\s](\d+\.?\d*)/i) ||
                 userAgent.match(/360Browser[\/\s](\d+\.?\d*)/i);
    version = match ? match[1] : '';
  } else if (isQQ) {
    type = BrowserType.QQ;
    name = 'QQ浏览器';
    const match = userAgent.match(/QQBrowser[\/\s](\d+\.?\d*)/i);
    version = match ? match[1] : '';
  } else if (isSogou) {
    type = BrowserType.SOGOU;
    name = '搜狗浏览器';
    const match = userAgent.match(/SogouExplorer[\/\s](\d+\.?\d*)/i) ||
                 userAgent.match(/SE[\/\s](\d+\.?\d*)/i);
    version = match ? match[1] : '';
  } else if (/Edg/i.test(userAgent) && !isMobile) {
    type = BrowserType.EDGE;
    name = 'Microsoft Edge';
    const match = userAgent.match(/Edg[\/\s](\d+\.?\d*)/i);
    version = match ? match[1] : '';
  } else if (/Chrome/i.test(userAgent) && !isMobile && !/Edg|OPR/i.test(userAgent)) {
    type = BrowserType.CHROME;
    name = 'Chrome';
    const match = userAgent.match(/Chrome[\/\s](\d+\.?\d*)/i);
    version = match ? match[1] : '';
  } else if (/Safari/i.test(userAgent) && isMobile) {
    type = BrowserType.SAFARI_MOBILE;
    name = '移动端Safari';
    const match = userAgent.match(/Version[\/\s](\d+\.?\d*)/i);
    version = match ? match[1] : '';
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    type = BrowserType.SAFARI;
    name = 'Safari';
    const match = userAgent.match(/Version[\/\s](\d+\.?\d*)/i);
    version = match ? match[1] : '';
  } else if (/Firefox/i.test(userAgent)) {
    type = BrowserType.FIREFOX;
    name = 'Firefox';
    const match = userAgent.match(/Firefox[\/\s](\d+\.?\d*)/i);
    version = match ? match[1] : '';
  } else if (/Opera|OPR/i.test(userAgent)) {
    type = BrowserType.OPERA;
    name = 'Opera';
    const match = userAgent.match(/(?:Opera|OPR)[\/\s](\d+\.?\d*)/i);
    version = match ? match[1] : '';
  } else if (/MSIE|Trident/i.test(userAgent)) {
    type = BrowserType.IE;
    name = 'Internet Explorer';
    const match = userAgent.match(/MSIE[\/\s](\d+\.?\d*)/i) ||
                 userAgent.match(/Trident\/.*rv:(\d+\.?\d*)/i);
    version = match ? match[1] : '';
  }

  return {
    type,
    name,
    version,
    userAgent,
    isMobile,
    is360,
    isQQ,
    isSogou,
  };
}

/**
 * 检测localStorage是否可用
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn('[浏览器兼容性] localStorage不可用:', e);
    return false;
  }
}

/**
 * 检测sessionStorage是否可用
 */
export function isSessionStorageAvailable(): boolean {
  try {
    const test = '__test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn('[浏览器兼容性] sessionStorage不可用:', e);
    return false;
  }
}

/**
 * 检测Cookie是否可用
 */
export function isCookieAvailable(): boolean {
  try {
    document.cookie = '__test=test';
    const result = document.cookie.indexOf('__test=') !== -1;
    document.cookie = '__test=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    return result;
  } catch (e) {
    console.warn('[浏览器兼容性] Cookie不可用:', e);
    return false;
  }
}

/**
 * 获取浏览器兼容性问题列表
 */
export function getCompatibilityIssues(): string[] {
  const issues: string[] = [];

  if (!isLocalStorageAvailable()) {
    issues.push('浏览器禁用了localStorage，某些功能可能无法正常使用');
  }

  if (!isSessionStorageAvailable()) {
    issues.push('浏览器禁用了sessionStorage，临时数据无法保存');
  }

  if (!isCookieAvailable()) {
    issues.push('浏览器禁用了Cookie，登录状态可能无法保持');
  }

  const browser = detectBrowser();

  // 360浏览器特定问题
  if (browser.is360) {
    // 检查是否为旧版本
    const versionNum = parseFloat(browser.version);
    if (versionNum > 0 && versionNum < 13) {
      issues.push('360浏览器版本过旧，建议升级到最新版本以获得最佳体验');
    }
  }

  // 检查是否在隐私模式
  try {
    localStorage.setItem('__test__', 'test');
    localStorage.removeItem('__test__');
  } catch (e) {
    if (browser.is360 || browser.isQQ || browser.isSogou) {
      issues.push('检测到可能处于隐私模式或开启了"禁止跟踪"，某些功能可能受限');
    }
  }

  return issues;
}

/**
 * 获取浏览器兼容性提示
 */
export function getCompatibilityTip(): string | null {
  const issues = getCompatibilityIssues();
  const browser = detectBrowser();

  if (issues.length === 0) {
    return null;
  }

  let tip = '检测到浏览器兼容性问题：\n\n';

  if (browser.is360) {
    tip += '• 360浏览器用户：请确保未开启"极速模式"的隐私保护\n';
    tip += '• 建议关闭"禁止跟踪"功能\n';
    tip += '• 建议使用最新版本的360浏览器\n\n';
  } else if (browser.isQQ || browser.isSogou) {
    tip += `• ${browser.name}用户：请检查浏览器隐私设置\n`;
    tip += '• 确保未禁用本地存储功能\n\n';
  }

  tip += '具体问题：\n';
  issues.forEach(issue => {
    tip += `• ${issue}\n`;
  });

  tip += '\n建议：\n• 检查浏览器设置，启用Cookie和本地存储\n';
  tip += '• 尝试关闭隐私模式或无痕模式\n';
  tip += '• 如果问题持续，建议使用Chrome或Edge浏览器';

  return tip;
}

/**
 * 安全地从localStorage读取
 */
export function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`[浏览器兼容性] 无法读取localStorage[${key}]:`, e);
    return null;
  }
}

/**
 * 安全地向localStorage写入
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`[浏览器兼容性] 无法写入localStorage[${key}]:`, e);
    return false;
  }
}

/**
 * 安全地从localStorage删除
 */
export function safeLocalStorageRemove(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.warn(`[浏览器兼容性] 无法删除localStorage[${key}]:`, e);
    return false;
  }
}
