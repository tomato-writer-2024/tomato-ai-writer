/**
 * 功能分类配置
 * 将所有工具按照创作流程进行分类，符合创作者使用习惯
 * 只包含已存在的页面，确保所有链接可访问
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
    description: '剧情和情节设计工具',
    icon: '📖',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    tools: [
      {
        id: 'outline-generator',
        name: '大纲生成器',
        description: '自动生成完整故事大纲，包含章节规划',
        href: '/outline-generator',
        icon: '📝',
        isHot: true,
      },
      {
        id: 'plot-twist',
        name: '情节反转',
        description: '设计意想不到的剧情反转，增加阅读趣味',
        href: '/plot-twist',
        icon: '🔄',
      },
      {
        id: 'world-building',
        name: '世界观构建',
        description: '打造完整的世界设定体系',
        href: '/world-building',
        icon: '🌍',
      },
    ],
  },
  {
    id: 'writing',
    name: '智能写作',
    description: 'AI辅助写作核心工具',
    icon: '✍️',
    color: 'red',
    gradient: 'from-red-500 to-orange-600',
    tools: [
      {
        id: 'continue',
        name: '智能续写',
        description: 'AI智能续写，保持剧情连贯和风格一致',
        href: '/continue',
        icon: '🚀',
        isHot: true,
      },
      {
        id: 'golden-start',
        name: '黄金开头',
        description: '生成吸引读者的黄金3秒开头',
        href: '/golden-start',
        icon: '⭐',
        isHot: true,
        isPro: true,
      },
      {
        id: 'ending-generator',
        name: '结局生成',
        description: '创作完美的故事结局',
        href: '/ending-generator',
        icon: '🏁',
      },
      {
        id: 'style-simulator',
        name: '风格模拟',
        description: '模拟不同作家的写作风格',
        href: '/style-simulator',
        icon: '🎨',
      },
    ],
  },
  {
    id: 'optimization',
    name: '润色优化',
    description: '内容优化和质量提升',
    icon: '✨',
    color: 'green',
    gradient: 'from-green-500 to-teal-600',
    tools: [
      {
        id: 'editor-review',
        name: '编辑审稿',
        description: '模拟编辑审稿，提供专业修改建议',
        href: '/editor-review',
        icon: '📋',
        isHot: true,
        isPro: true,
      },
      {
        id: 'explosive-analyze',
        name: '爆款拆解',
        description: '深度拆解爆款作品的成功要素',
        href: '/explosive-analyze',
        icon: '🔍',
      },
      {
        id: 'satisfaction-engine',
        name: '爽感引擎',
        description: '优化情节爽点，提升读者爽感',
        href: '/satisfaction-engine',
        icon: '💥',
        isNew: true,
        isPro: true,
      },
    ],
  },
  {
    id: 'creative',
    name: '创意工具',
    description: '激发灵感和创意',
    icon: '💡',
    color: 'yellow',
    gradient: 'from-yellow-500 to-amber-600',
    tools: [
      {
        id: 'title-generator',
        name: '标题生成',
        description: '生成吸引人的小说标题',
        href: '/title-generator',
        icon: '📚',
      },
      {
        id: 'cover-generator',
        name: '封面生成',
        description: 'AI生成小说封面图片',
        href: '/cover-generator',
        icon: '🖼️',
        isNew: true,
      },
      {
        id: 'writer-block',
        name: '卡文助手',
        description: '打破创作瓶颈，提供写作灵感',
        href: '/writer-block',
        icon: '💭',
      },
    ],
  },
  {
    id: 'materials',
    name: '素材资源',
    description: '管理创作素材和资料',
    icon: '📦',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    tools: [
      {
        id: 'materials',
        name: '素材库',
        description: '管理你的创作素材和参考资料',
        href: '/materials',
        icon: '🗂️',
      },
      {
        id: 'stats',
        name: '数据统计',
        description: '查看创作数据和统计分析',
        href: '/stats',
        icon: '📊',
      },
    ],
  },
];

// 导出所有工具的扁平列表
export const allTools: Tool[] = toolCategories.flatMap(category => category.tools);

// 根据ID查找工具
export function findToolById(id: string): Tool | undefined {
  return allTools.find(tool => tool.id === id);
}

// 根据href查找工具
export function findToolByHref(href: string): Tool | undefined {
  return allTools.find(tool => tool.href === href);
}
