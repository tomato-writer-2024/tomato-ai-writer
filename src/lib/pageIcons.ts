/**
 * 页面Icon系统配置
 * 将public目录下的icon图片映射到各个功能页面
 * 与logo形成统一的VI设计系统（番茄红#FF4757为主色调）
 */

export interface PageIconConfig {
  pagePath: string;
  pageName: string;
  iconFileName: string;
  iconType: 'image' | 'svg' | 'emoji';
  fallbackIcon: string;
  description: string;
  gradient: string;
}

/**
 * 页面图标映射表
 * 根据页面路径分配对应的icon图片
 */
export const pageIconMap: Record<string, PageIconConfig> = {
  // === 角色设定类 ===
  '/characters': {
    pagePath: '/characters',
    pageName: '角色生成器',
    iconFileName: '1.png',
    iconType: 'image',
    fallbackIcon: '👤',
    description: '一键创建立体角色',
    gradient: 'from-blue-500 to-indigo-600',
  },
  '/relationship-map': {
    pagePath: '/relationship-map',
    pageName: '人物关系图',
    iconFileName: '2.png',
    iconType: 'image',
    fallbackIcon: '🔗',
    description: '可视化角色关系',
    gradient: 'from-blue-500 to-indigo-600',
  },

  // === 情节设计类 ===
  '/outline-generator': {
    pagePath: '/outline-generator',
    pageName: '大纲生成器',
    iconFileName: '3.png',
    iconType: 'image',
    fallbackIcon: '📝',
    description: '自动生成完整大纲',
    gradient: 'from-purple-500 to-pink-600',
  },
  '/plot-twist': {
    pagePath: '/plot-twist',
    pageName: '情节反转',
    iconFileName: '4.png',
    iconType: 'image',
    fallbackIcon: '🔄',
    description: '设计剧情反转',
    gradient: 'from-purple-500 to-pink-600',
  },
  '/world-building': {
    pagePath: '/world-building',
    pageName: '世界观构建',
    iconFileName: '5.png',
    iconType: 'image',
    fallbackIcon: '🌍',
    description: '打造世界设定体系',
    gradient: 'from-purple-500 to-pink-600',
  },

  // === 智能写作类 ===
  '/continue': {
    pagePath: '/continue',
    pageName: '智能续写',
    iconFileName: '6.png',
    iconType: 'image',
    fallbackIcon: '🚀',
    description: 'AI智能续写',
    gradient: 'from-red-500 to-orange-600',
  },
  '/golden-start': {
    pagePath: '/golden-start',
    pageName: '黄金开头',
    iconFileName: '7.png',
    iconType: 'image',
    fallbackIcon: '⭐',
    description: '生成吸引人的开头',
    gradient: 'from-red-500 to-orange-600',
  },
  '/ending-generator': {
    pagePath: '/ending-generator',
    pageName: '结局生成',
    iconFileName: '8.png',
    iconType: 'image',
    fallbackIcon: '🏁',
    description: '创作完美结局',
    gradient: 'from-red-500 to-orange-600',
  },
  '/style-simulator': {
    pagePath: '/style-simulator',
    pageName: '风格模拟',
    iconFileName: '9.png',
    iconType: 'image',
    fallbackIcon: '🎨',
    description: '模拟不同作家风格',
    gradient: 'from-red-500 to-orange-600',
  },

  // === 润色优化类 ===
  '/editor-review': {
    pagePath: '/editor-review',
    pageName: '编辑审稿',
    iconFileName: '10.png',
    iconType: 'image',
    fallbackIcon: '📋',
    description: '模拟编辑审稿',
    gradient: 'from-green-500 to-teal-600',
  },
  '/explosive-analyze': {
    pagePath: '/explosive-analyze',
    pageName: '爆款拆解',
    iconFileName: '11.png',
    iconType: 'image',
    fallbackIcon: '🔍',
    description: '拆解爆款要素',
    gradient: 'from-green-500 to-teal-600',
  },
  '/satisfaction-engine': {
    pagePath: '/satisfaction-engine',
    pageName: '爽感引擎',
    iconFileName: '12.png',
    iconType: 'image',
    fallbackIcon: '💥',
    description: '优化情节爽点',
    gradient: 'from-green-500 to-teal-600',
  },

  // === 创意工具类 ===
  '/title-generator': {
    pagePath: '/title-generator',
    pageName: '标题生成',
    iconFileName: '13.png',
    iconType: 'image',
    fallbackIcon: '📚',
    description: '生成吸引人的标题',
    gradient: 'from-yellow-500 to-amber-600',
  },
  '/cover-generator': {
    pagePath: '/cover-generator',
    pageName: '封面生成',
    iconFileName: '14.png',
    iconType: 'image',
    fallbackIcon: '🖼️',
    description: 'AI生成封面图片',
    gradient: 'from-yellow-500 to-amber-600',
  },
  '/writer-block': {
    pagePath: '/writer-block',
    pageName: '卡文助手',
    iconFileName: '15.png',
    iconType: 'image',
    fallbackIcon: '💭',
    description: '打破创作瓶颈',
    gradient: 'from-yellow-500 to-amber-600',
  },

  // === 素材资源类 ===
  '/materials': {
    pagePath: '/materials',
    pageName: '素材库',
    iconFileName: '16.png',
    iconType: 'image',
    fallbackIcon: '📦',
    description: '管理创作素材',
    gradient: 'from-cyan-500 to-blue-600',
  },

  // === 统计分析类 ===
  '/stats': {
    pagePath: '/stats',
    pageName: '创作统计',
    iconFileName: '17.png',
    iconType: 'image',
    fallbackIcon: '📊',
    description: '查看创作数据',
    gradient: 'from-pink-500 to-rose-600',
  },

  // === 作品管理类 ===
  '/works': {
    pagePath: '/works',
    pageName: '我的作品',
    iconFileName: '18.png',
    iconType: 'image',
    fallbackIcon: '📖',
    description: '管理我的作品',
    gradient: 'from-indigo-500 to-purple-600',
  },
  '/works/new': {
    pagePath: '/works/new',
    pageName: '创建作品',
    iconFileName: '19.png',
    iconType: 'image',
    fallbackIcon: '➕',
    description: '创建新作品',
    gradient: 'from-indigo-500 to-purple-600',
  },

  // === 用户中心类 ===
  '/profile': {
    pagePath: '/profile',
    pageName: '个人中心',
    iconFileName: '20.png',
    iconType: 'image',
    fallbackIcon: '👤',
    description: '个人信息管理',
    gradient: 'from-gray-500 to-slate-600',
  },
  '/settings': {
    pagePath: '/settings',
    pageName: '设置',
    iconFileName: '21.png',
    iconType: 'image',
    fallbackIcon: '⚙️',
    description: '系统设置',
    gradient: 'from-gray-500 to-slate-600',
  },

  // === 工作台 ===
  '/workspace': {
    pagePath: '/workspace',
    pageName: '工作台',
    iconFileName: 'logo.png',
    iconType: 'image',
    fallbackIcon: '🏠',
    description: '创作工作台',
    gradient: 'from-red-500 to-pink-600',
  },
};

/**
 * 获取页面的icon配置
 */
export function getPageIconConfig(pagePath: string): PageIconConfig {
  // 移除末尾的斜杠
  const normalizedPath = pagePath.replace(/\/$/, '');

  // 查找精确匹配
  const exactMatch = pageIconMap[normalizedPath];
  if (exactMatch) return exactMatch;

  // 如果没有找到，返回默认配置
  return {
    pagePath: normalizedPath,
    pageName: '默认页面',
    iconFileName: 'logo.png',
    iconType: 'image',
    fallbackIcon: '📄',
    description: '功能页面',
    gradient: 'from-gray-400 to-gray-600',
  };
}

/**
 * 获取页面的icon URL
 */
export function getPageIconUrl(pagePath: string): string {
  const config = getPageIconConfig(pagePath);
  return `/${config.iconFileName}`;
}

/**
 * 获取所有页面icon列表
 */
export function getAllPageIcons(): PageIconConfig[] {
  return Object.values(pageIconMap);
}
