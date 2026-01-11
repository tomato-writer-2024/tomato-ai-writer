/**
 * 功能分类配置
 * 将所有工具按照创作流程进行分类，符合创作者使用习惯
 */

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  tools: Tool[];
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  icon?: string;
  isNew?: boolean;
  isPro?: boolean;
  isHot?: boolean;
}

export const toolCategories: ToolCategory[] = [
  {
    id: 'character',
    name: '角色设定',
    description: '人物创作全流程工具',
    icon: '👤',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    tools: [
      {
        id: 'characters',
        name: '角色生成器',
        description: '一键创建立体角色，包含外貌、性格、背景等',
        href: '/characters',
        icon: '✨',
        isHot: true,
      },
      {
        id: 'relationship-map',
        name: '人物关系图',
        description: '可视化角色关系，理清复杂人物网络',
        href: '/relationship-map',
        icon: '🔗',
      },
    ],
  },
  {
    id: 'plot',
    name: '情节设计',
    description: '剧情创作工具集',
    icon: '📖',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    tools: [
      {
        id: 'outline-generator',
        name: '大纲生成',
        description: '生成完整小说大纲，分章规划',
        href: '/outline-generator',
        icon: '📋',
        isHot: true,
      },
      {
        id: 'plot-twist',
        name: '情节反转',
        description: '生成意想不到的剧情反转点',
        href: '/plot-twist',
        icon: '🔄',
      },
      {
        id: 'world-building',
        name: '世界观设定',
        description: '构建完整的小说世界观',
        href: '/world-building',
        icon: '🌍',
      },
      {
        id: 'ending-generator',
        name: '结局生成',
        description: '设计满意的小说结局',
        href: '/ending-generator',
        icon: '🏁',
      },
    ],
  },
  {
    id: 'writing',
    name: '智能写作',
    description: 'AI辅助创作工具',
    icon: '✍️',
    color: 'cyan',
    gradient: 'from-cyan-500 to-teal-600',
    tools: [
      {
        id: 'continue',
        name: '智能续写',
        description: '根据上下文智能续写内容',
        href: '/continue',
        icon: '🚀',
        isHot: true,
      },
      {
        id: 'workspace',
        name: '精修润色',
        description: '润色优化文章质量',
        href: '/workspace',
        icon: '⭐',
        isNew: true,
      },
      {
        id: 'style-simulator',
        name: '文风模拟',
        description: '模拟不同作者风格',
        href: '/style-simulator',
        icon: '🎨',
      },
    ],
  },
  {
    id: 'optimization',
    name: '润色优化',
    description: '内容质量提升工具',
    icon: '💎',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    tools: [
      {
        id: 'satisfaction-engine',
        name: '爽点引擎',
        description: '识别并增强爽点密度',
        href: '/satisfaction-engine',
        icon: '🎯',
        isHot: true,
      },
      {
        id: 'writer-block',
        name: '卡文诊断',
        description: '诊断创作卡顿问题',
        href: '/writer-block',
        icon: '💡',
      },
      {
        id: 'explosive-analyze',
        name: '爆款拆解',
        description: '分析爆款小说成功要素',
        href: '/explosive-analyze',
        icon: '📊',
        isNew: true,
      },
    ],
  },
  {
    id: 'creative',
    name: '创意工具',
    description: '激发创作灵感',
    icon: '🎪',
    color: 'rose',
    gradient: 'from-rose-500 to-red-600',
    tools: [
      {
        id: 'title-generator',
        name: '书名生成',
        description: '生成吸引眼球的小说标题',
        href: '/title-generator',
        icon: '📚',
      },
      {
        id: 'cover-generator',
        name: '封面描述',
        description: '生成封面描述，助力封面设计',
        href: '/cover-generator',
        icon: '🖼️',
      },
    ],
  },
  {
    id: 'materials',
    name: '素材资源',
    description: '素材库与参考资源',
    icon: '📦',
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-600',
    tools: [
      {
        id: 'materials',
        name: '百万素材库',
        description: '古代常识、民俗神话、写作技巧',
        href: '/materials',
        icon: '💾',
        isHot: true,
      },
    ],
  },
  {
    id: 'management',
    name: '作品管理',
    description: '创作项目管理',
    icon: '📁',
    color: 'slate',
    gradient: 'from-slate-500 to-gray-600',
    tools: [
      {
        id: 'works',
        name: '我的作品',
        description: '管理所有创作作品',
        href: '/works',
        icon: '📝',
      },
      {
        id: 'stats',
        name: '数据统计',
        description: '查看创作数据统计',
        href: '/stats',
        icon: '📈',
      },
      {
        id: 'profile',
        name: '个人中心',
        description: '账号设置与管理',
        href: '/profile',
        icon: '⚙️',
      },
    ],
  },
];

// 快捷工具（高频使用）
export const quickTools: Tool[] = [
  {
    id: 'continue',
    name: '智能续写',
    description: '快速续写内容',
    href: '/continue',
    icon: '🚀',
    isHot: true,
  },
  {
    id: 'workspace',
    name: '精修润色',
    description: '润色优化',
    href: '/workspace',
    icon: '⭐',
    isNew: true,
  },
  {
    id: 'characters',
    name: '角色生成',
    description: '创建角色',
    href: '/characters',
    icon: '👤',
  },
  {
    id: 'outline-generator',
    name: '大纲生成',
    description: '生成大纲',
    href: '/outline-generator',
    icon: '📋',
    isHot: true,
  },
  {
    id: 'materials',
    name: '素材库',
    description: '查找素材',
    href: '/materials',
    icon: '💾',
  },
];

// 新功能展示
export const newFeatures: Tool[] = [
  {
    id: 'workspace',
    name: '精修润色',
    description: '专业润色工具，提升作品质量',
    href: '/workspace',
    icon: '⭐',
    isNew: true,
  },
  {
    id: 'explosive-analyze',
    name: '爆款拆解',
    description: '深度分析爆款成功要素',
    href: '/explosive-analyze',
    icon: '📊',
    isNew: true,
  },
  {
    id: 'editor-review',
    name: '模拟审稿',
    description: '双视角专业审稿',
    href: '/editor-review',
    icon: '👁️',
    isNew: true,
  },
];

// 获取分类颜色映射
export const getCategoryColor = (categoryId: string): string => {
  const category = toolCategories.find(cat => cat.id === categoryId);
  return category?.color || 'gray';
};

// 获取分类渐变映射
export const getCategoryGradient = (categoryId: string): string => {
  const category = toolCategories.find(cat => cat.id === categoryId);
  return category?.gradient || 'from-gray-500 to-gray-600';
};
