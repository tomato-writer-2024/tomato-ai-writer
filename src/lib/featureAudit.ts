/**
 * 番茄AI写作助手 - 功能开发完成情况盘点
 *
 * 最后更新时间：2025-01-09
 */

// ============================================================================
// 一级功能模块
// ============================================================================

export interface FeatureModule {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'planned';
  progress?: number; // 0-100
  features: Feature[];
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'planned';
  progress?: number;
  pages: string[];
  apiRoutes: string[];
  dependencies: string[];
  notes?: string;
}

// ============================================================================
// 功能模块清单
// ============================================================================

export const FEATURE_MODULES: FeatureModule[] = [
  // ============================================================================
  // 1. 用户认证与权限管理
  // ============================================================================
  {
    id: 'auth',
    name: '用户认证与权限管理',
    description: '完整的用户注册、登录、权限管理、会员体系',
    status: 'completed',
    progress: 100,
    features: [
      {
        id: 'auth.register',
        name: '用户注册',
        description: '支持邮箱注册，密码加密存储',
        status: 'completed',
        pages: ['/register'],
        apiRoutes: ['/api/auth/register'],
        dependencies: ['bcrypt', 'JWT'],
      },
      {
        id: 'auth.login',
        name: '用户登录',
        description: 'JWT认证，token管理',
        status: 'completed',
        pages: ['/login'],
        apiRoutes: ['/api/auth/login'],
        dependencies: ['bcrypt', 'JWT'],
      },
      {
        id: 'auth.profile',
        name: '个人资料管理',
        description: '修改用户名、手机号、位置信息',
        status: 'completed',
        pages: ['/profile'],
        apiRoutes: ['/api/user/profile'],
        dependencies: [],
      },
      {
        id: 'auth.avatar',
        name: '头像上传',
        description: '支持头像上传和预览',
        status: 'completed',
        pages: ['/profile'],
        apiRoutes: ['/api/user/avatar', '/api/files/upload'],
        dependencies: ['S3 Storage'],
      },
      {
        id: 'auth.membership',
        name: '会员体系',
        description: '4级会员体系（FREE, BASIC, PREMIUM, ENTERPRISE）',
        status: 'completed',
        pages: ['/pricing', '/payment'],
        apiRoutes: ['/api/orders', '/api/payment/[id]'],
        dependencies: [],
      },
    ],
  },

  // ============================================================================
  // 2. 作品管理
  // ============================================================================
  {
    id: 'novels',
    name: '作品管理',
    description: '作品的创建、编辑、删除、发布管理',
    status: 'completed',
    progress: 100,
    features: [
      {
        id: 'novels.create',
        name: '创建作品',
        description: '创建新作品，设置标题、类型、标签等',
        status: 'completed',
        pages: ['/works'],
        apiRoutes: ['/api/novels'],
        dependencies: [],
      },
      {
        id: 'novels.list',
        name: '作品列表',
        description: '展示用户所有作品',
        status: 'completed',
        pages: ['/works'],
        apiRoutes: ['/api/novels'],
        dependencies: [],
      },
      {
        id: 'novels.detail',
        name: '作品详情',
        description: '查看作品详细信息、章节列表',
        status: 'completed',
        pages: ['/novel/[id]'],
        apiRoutes: ['/api/novels/[id]', '/api/chapters'],
        dependencies: [],
      },
      {
        id: 'novels.edit',
        name: '编辑作品',
        description: '修改作品信息',
        status: 'completed',
        pages: ['/novel/[id]'],
        apiRoutes: ['/api/novels/[id]'],
        dependencies: [],
      },
      {
        id: 'novels.delete',
        name: '删除作品',
        description: '删除作品及其章节',
        status: 'completed',
        pages: ['/novel/[id]'],
        apiRoutes: ['/api/novels/[id]'],
        dependencies: [],
      },
    ],
  },

  // ============================================================================
  // 3. 章节管理
  // ============================================================================
  {
    id: 'chapters',
    name: '章节管理',
    description: '章节的创建、编辑、删除、发布管理',
    status: 'completed',
    progress: 100,
    features: [
      {
        id: 'chapters.create',
        name: '创建章节',
        description: '创建新章节，AI生成或手动输入',
        status: 'completed',
        pages: ['/novel/[id]/chapter/new'],
        apiRoutes: ['/api/chapters', '/api/generate'],
        dependencies: ['LLM'],
      },
      {
        id: 'chapters.edit',
        name: '章节编辑器',
        description: '完整的章节编辑功能，支持AI续写、润色',
        status: 'completed',
        pages: ['/novel/[id]/chapter/[chapterId]'],
        apiRoutes: ['/api/chapters/[id]', '/api/continue', '/api/polish'],
        dependencies: ['LLM'],
      },
      {
        id: 'chapters.list',
        name: '章节列表',
        description: '展示作品所有章节',
        status: 'completed',
        pages: ['/novel/[id]'],
        apiRoutes: ['/api/chapters'],
        dependencies: [],
      },
      {
        id: 'chapters.delete',
        name: '删除章节',
        description: '删除章节',
        status: 'completed',
        pages: ['/novel/[id]/chapter/[chapterId]'],
        apiRoutes: ['/api/chapters/[id]'],
        dependencies: [],
      },
      {
        id: 'chapters.publish',
        name: '章节发布',
        description: '发布/取消发布章节',
        status: 'completed',
        pages: ['/novel/[id]/chapter/[chapterId]'],
        apiRoutes: ['/api/chapters/[id]'],
        dependencies: [],
      },
    ],
  },

  // ============================================================================
  // 4. AI写作助手
  // ============================================================================
  {
    id: 'ai-writing',
    name: 'AI写作助手',
    description: 'AI智能生成、续写、润色功能',
    status: 'completed',
    progress: 100,
    features: [
      {
        id: 'ai.generate',
        name: '智能章节撰写',
        description: 'AI生成符合番茄平台风格的章节内容',
        status: 'completed',
        pages: ['/workspace', '/novel/[id]/chapter/new'],
        apiRoutes: ['/api/generate'],
        dependencies: ['LLM', 'contentGenerator'],
      },
      {
        id: 'ai.continue',
        name: '智能续写',
        description: '基于已有内容智能续写',
        status: 'completed',
        pages: ['/workspace', '/novel/[id]/chapter/[chapterId]'],
        apiRoutes: ['/api/continue'],
        dependencies: ['LLM'],
      },
      {
        id: 'ai.polish',
        name: '精修润色',
        description: '优化文字表达，增强网感',
        status: 'completed',
        pages: ['/workspace', '/novel/[id]/chapter/[chapterId]'],
        apiRoutes: ['/api/polish'],
        dependencies: ['LLM', 'contentOptimizer'],
      },
      {
        id: 'ai.quality',
        name: '质量评估',
        description: '5维度质量评分（密度、长度、情绪、钩子、整体）',
        status: 'completed',
        pages: ['/workspace', '/novel/[id]/chapter/[chapterId]'],
        apiRoutes: [],
        dependencies: ['contentGenerator'],
      },
      {
        id: 'ai.completion',
        name: '完读率预测',
        description: '预估章节完读率',
        status: 'completed',
        pages: ['/workspace', '/novel/[id]/chapter/[chapterId]'],
        apiRoutes: [],
        dependencies: ['contentGenerator'],
      },
    ],
  },

  // ============================================================================
  // 5. 文件管理
  // ============================================================================
  {
    id: 'files',
    name: '文件管理',
    description: '文件导入、导出、上传、下载',
    status: 'completed',
    progress: 100,
    features: [
      {
        id: 'files.import',
        name: '文档导入',
        description: '支持Word、PDF、TXT导入',
        status: 'completed',
        pages: ['/workspace'],
        apiRoutes: ['/api/files/import'],
        dependencies: ['mammoth', 'pdf-parse'],
      },
      {
        id: 'files.export.word',
        name: 'Word导出',
        description: '导出为Word文档',
        status: 'completed',
        pages: ['/workspace', '/novel/[id]/chapter/[chapterId]'],
        apiRoutes: ['/api/files/export'],
        dependencies: ['docx'],
      },
      {
        id: 'files.export.txt',
        name: 'TXT导出',
        description: '导出为TXT文档',
        status: 'completed',
        pages: ['/workspace', '/novel/[id]/chapter/[chapterId]'],
        apiRoutes: ['/api/files/export'],
        dependencies: [],
      },
      {
        id: 'files.upload',
        name: '文件上传',
        description: '通用文件上传（图片、文档）',
        status: 'completed',
        pages: ['/profile'],
        apiRoutes: ['/api/files/upload'],
        dependencies: ['S3 Storage'],
      },
      {
        id: 'files.download',
        name: '文件下载',
        description: '通用文件下载',
        status: 'completed',
        pages: [],
        apiRoutes: ['/api/files/download/[key]'],
        dependencies: ['S3 Storage'],
      },
    ],
  },

  // ============================================================================
  // 6. 数据统计
  // ============================================================================
  {
    id: 'stats',
    name: '数据统计',
    description: '写作数据、质量趋势、小说统计',
    status: 'completed',
    progress: 100,
    features: [
      {
        id: 'stats.dashboard',
        name: '数据看板',
        description: '展示写作趋势、质量趋势、小说统计',
        status: 'completed',
        pages: ['/stats'],
        apiRoutes: ['/api/stats', '/api/stats/novels/[id]'],
        dependencies: [],
      },
      {
        id: 'stats.writing',
        name: '写作统计',
        description: '字数、章节数、日更量等',
        status: 'completed',
        pages: ['/stats'],
        apiRoutes: ['/api/stats'],
        dependencies: [],
      },
      {
        id: 'stats.quality',
        name: '质量统计',
        description: '质量评分、完读率趋势',
        status: 'completed',
        pages: ['/stats'],
        apiRoutes: ['/api/stats'],
        dependencies: [],
      },
      {
        id: 'stats.novel',
        name: '小说统计',
        description: '小说级别的数据统计',
        status: 'completed',
        pages: ['/stats', '/novel/[id]'],
        apiRoutes: ['/api/stats/novels/[id]'],
        dependencies: [],
      },
    ],
  },

  // ============================================================================
  // 7. 测试框架
  // ============================================================================
  {
    id: 'testing',
    name: '测试框架',
    description: '批量测试、A/B测试、性能测试',
    status: 'completed',
    progress: 100,
    features: [
      {
        id: 'testing.batch',
        name: '批量测试',
        description: '生成千例以上测试数据并执行测试',
        status: 'completed',
        pages: ['/test-report'],
        apiRoutes: ['/api/test/generate', '/api/test/novel'],
        dependencies: ['testDataGenerator', 'testExecutor'],
      },
      {
        id: 'testing.ab',
        name: 'A/B测试',
        description: '提示词和算法参数对比测试',
        status: 'completed',
        pages: ['/test-report'],
        apiRoutes: ['/api/test/ab'],
        dependencies: ['abTestingFramework'],
      },
      {
        id: 'testing.performance',
        name: '性能测试',
        description: 'AI响应时间、流式输出性能测试',
        status: 'completed',
        pages: ['/test-report'],
        apiRoutes: ['/api/test/performance'],
        dependencies: ['performanceOptimizer'],
      },
      {
        id: 'testing.report',
        name: '测试报告',
        description: '可视化测试结果展示',
        status: 'completed',
        pages: ['/test-report'],
        apiRoutes: [],
        dependencies: [],
      },
    ],
  },

  // ============================================================================
  // 8. 页面与UI组件
  // ============================================================================
  {
    id: 'ui',
    name: '页面与UI组件',
    description: '完整的页面和UI组件系统',
    status: 'completed',
    progress: 100,
    features: [
      {
        id: 'ui.pages',
        name: '页面系统',
        description: '首页、工作台、作品管理、作品详情、章节编辑、个人中心、数据统计、定价、支付、测试报告等',
        status: 'completed',
        pages: [
          '/',
          '/workspace',
          '/works',
          '/novel/[id]',
          '/novel/[id]/chapter/[chapterId]',
          '/novel/[id]/chapter/new',
          '/profile',
          '/stats',
          '/pricing',
          '/payment',
          '/test-report',
          '/login',
          '/register',
        ],
        apiRoutes: [],
        dependencies: [],
      },
      {
        id: 'ui.components',
        name: 'UI组件',
        description: 'Navigation, Button, Card, Input, Badge, Modal, Loader, Toast, Tabs等统一组件',
        status: 'completed',
        pages: [],
        apiRoutes: [],
        dependencies: [],
      },
      {
        id: 'ui.brand-icons',
        name: '品牌图标',
        description: '基于Logo设计的原创图标系统',
        status: 'completed',
        pages: [],
        apiRoutes: [],
        dependencies: [],
      },
      {
        id: 'ui.theme',
        name: '主题系统',
        description: 'Cyan/Blue/Indigo配色，全局样式优化',
        status: 'completed',
        pages: [],
        apiRoutes: [],
        dependencies: [],
      },
    ],
  },

  // ============================================================================
  // 9. 数据库与存储
  // ============================================================================
  {
    id: 'database',
    name: '数据库与存储',
    description: 'PostgreSQL数据库和S3对象存储',
    status: 'completed',
    progress: 100,
    features: [
      {
        id: 'database.schema',
        name: '数据库Schema',
        description: 'users, novels, chapters, contentStats, membershipOrders, securityLogs, usageLogs, apiKeys, subAccounts',
        status: 'completed',
        pages: [],
        apiRoutes: [],
        dependencies: ['Drizzle ORM'],
      },
      {
        id: 'database.managers',
        name: 'Manager层',
        description: 'UserManager, NovelManager, ChapterManager, ContentStatsManager, MembershipOrderManager, UsageLogManager, SecurityLogManager',
        status: 'completed',
        pages: [],
        apiRoutes: [],
        dependencies: ['Drizzle ORM'],
      },
      {
        id: 'database.storage',
        name: '对象存储',
        description: 'S3兼容对象存储服务，用于头像、封面、导出文件',
        status: 'completed',
        pages: [],
        apiRoutes: ['/api/files/upload', '/api/files/download/[key]'],
        dependencies: ['S3 Storage'],
      },
    ],
  },

  // ============================================================================
  // 10. 安全与日志
  // ============================================================================
  {
    id: 'security',
    name: '安全与日志',
    description: '安全日志、使用日志、数据隔离',
    status: 'completed',
    progress: 100,
    features: [
      {
        id: 'security.logs',
        name: '安全日志',
        description: '记录用户安全相关操作',
        status: 'completed',
        pages: [],
        apiRoutes: [],
        dependencies: ['SecurityLogManager'],
      },
      {
        id: 'security.usage',
        name: '使用日志',
        description: '记录用户使用行为',
        status: 'completed',
        pages: [],
        apiRoutes: [],
        dependencies: ['UsageLogManager'],
      },
      {
        id: 'security.isolation',
        name: '数据隔离',
        description: '用户数据100%安全隔离',
        status: 'completed',
        pages: [],
        apiRoutes: [],
        dependencies: [],
      },
    ],
  },

  // ============================================================================
  // 11. 核心引擎
  // ============================================================================
  {
    id: 'core',
    name: '核心引擎',
    description: '内容生成、优化、性能优化引擎',
    status: 'completed',
    progress: 100,
    features: [
      {
        id: 'core.generator',
        name: '内容生成引擎',
        description: '高性能内容生成，目标完读率90%+，质量评分9.8+',
        status: 'completed',
        pages: [],
        apiRoutes: ['/api/generate', '/api/continue', '/api/polish'],
        dependencies: ['LLM', 'contentGenerator'],
      },
      {
        id: 'core.optimizer',
        name: '内容优化引擎',
        description: '网感增强、爽点放大、冗余修剪',
        status: 'completed',
        pages: [],
        apiRoutes: ['/api/polish'],
        dependencies: ['contentOptimizer'],
      },
      {
        id: 'core.performance',
        name: '性能优化引擎',
        description: '流式输出、提示词压缩、系统提示词缓存',
        status: 'completed',
        pages: [],
        apiRoutes: ['/api/test/performance'],
        dependencies: ['performanceOptimizer'],
      },
      {
        id: 'core.originality',
        name: '原创性检测',
        description: '内容原创性检测',
        status: 'completed',
        pages: [],
        apiRoutes: [],
        dependencies: ['originality'],
      },
    ],
  },

  // ============================================================================
  // 12. 支付系统
  // ============================================================================
  {
    id: 'payment',
    name: '支付系统',
    description: '订单创建、支付流程、支付状态查询',
    status: 'completed',
    progress: 100,
    features: [
      {
        id: 'payment.orders',
        name: '订单创建',
        description: '创建会员订单',
        status: 'completed',
        pages: ['/pricing'],
        apiRoutes: ['/api/orders'],
        dependencies: [],
      },
      {
        id: 'payment.flow',
        name: '支付流程',
        description: '模拟支付宝/微信支付流程',
        status: 'completed',
        pages: ['/payment'],
        apiRoutes: ['/api/payment/[id]'],
        dependencies: [],
      },
      {
        id: 'payment.status',
        name: '支付状态查询',
        description: '轮询查询支付状态',
        status: 'completed',
        pages: ['/payment'],
        apiRoutes: ['/api/payment/[id]'],
        dependencies: [],
      },
    ],
  },
];

// ============================================================================
// 统计信息
// ============================================================================

export function getStatistics() {
  const totalModules = FEATURE_MODULES.length;
  const totalFeatures = FEATURE_MODULES.reduce((sum, module) => sum + module.features.length, 0);

  const completedModules = FEATURE_MODULES.filter(m => m.status === 'completed').length;
  const inProgressModules = FEATURE_MODULES.filter(m => m.status === 'in-progress').length;
  const pendingModules = FEATURE_MODULES.filter(m => m.status === 'pending').length;
  const plannedModules = FEATURE_MODULES.filter(m => m.status === 'planned').length;

  const completedFeatures = FEATURE_MODULES.reduce(
    (sum, module) => sum + module.features.filter(f => f.status === 'completed').length,
    0
  );
  const inProgressFeatures = FEATURE_MODULES.reduce(
    (sum, module) => sum + module.features.filter(f => f.status === 'in-progress').length,
    0
  );
  const pendingFeatures = FEATURE_MODULES.reduce(
    (sum, module) => sum + module.features.filter(f => f.status === 'pending').length,
    0
  );
  const plannedFeatures = FEATURE_MODULES.reduce(
    (sum, module) => sum + module.features.filter(f => f.status === 'planned').length,
    0
  );

  return {
    totalModules,
    totalFeatures,
    completedModules,
    inProgressModules,
    pendingModules,
    plannedModules,
    completedFeatures,
    inProgressFeatures,
    pendingFeatures,
    plannedFeatures,
    completionRate: ((completedFeatures / totalFeatures) * 100).toFixed(2),
  };
}

// ============================================================================
// 导出功能清单
// ============================================================================

export function getCompletedFeatures(): Feature[] {
  const features: Feature[] = [];
  FEATURE_MODULES.forEach(module => {
    module.features.forEach(feature => {
      if (feature.status === 'completed') {
        features.push(feature);
      }
    });
  });
  return features;
}

export function getInProgressFeatures(): Feature[] {
  const features: Feature[] = [];
  FEATURE_MODULES.forEach(module => {
    module.features.forEach(feature => {
      if (feature.status === 'in-progress') {
        features.push(feature);
      }
    });
  });
  return features;
}

export function getPendingFeatures(): Feature[] {
  const features: Feature[] = [];
  FEATURE_MODULES.forEach(module => {
    module.features.forEach(feature => {
      if (feature.status === 'pending' || feature.status === 'planned') {
        features.push(feature);
      }
    });
  });
  return features;
}

export default FEATURE_MODULES;
