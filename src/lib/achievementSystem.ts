/**
 * 成就系统
 * 提供用户成就追踪和奖励机制
 */

export enum AchievementType {
  CREATION = 'creation', // 创作相关
  SOCIAL = 'social', // 社交相关
  QUALITY = 'quality', // 质量相关
  GROWTH = 'growth', // 成长相关
  ACTIVITY = 'activity', // 活跃度相关
}

export enum AchievementRarity {
  COMMON = 'common', // 普通
  RARE = 'rare', // 稀有
  EPIC = 'epic', // 史诗
  LEGENDARY = 'legendary', // 传说
}

// 成就定义
export interface Achievement {
  id: string;
  type: AchievementType;
  rarity: AchievementRarity;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (stats: UserStats) => boolean;
}

// 用户统计
export interface UserStats {
  totalWords: number;
  chaptersCreated: number;
  novelsCreated: number;
  daysActive: number;
  consecutiveDays: number;
  avgCompletionRate: number;
  avgQualityScore: number;
  topRank: number;
  reviewsReceived: number;
  likesReceived: number;
  sharesReceived: number;
}

// 成就列表
export const achievements: Achievement[] = [
  // 创作相关
  {
    id: 'first_novel',
    type: AchievementType.CREATION,
    rarity: AchievementRarity.COMMON,
    name: '初出茅庐',
    description: '创建你的第一本小说',
    icon: '📝',
    xpReward: 100,
    condition: (stats) => stats.novelsCreated >= 1,
  },
  {
    id: 'ten_novels',
    type: AchievementType.CREATION,
    rarity: AchievementRarity.RARE,
    name: '多产作家',
    description: '创建10本小说',
    icon: '📚',
    xpReward: 500,
    condition: (stats) => stats.novelsCreated >= 10,
  },
  {
    id: 'first_chapter',
    type: AchievementType.CREATION,
    rarity: AchievementRarity.COMMON,
    name: '第一章',
    description: '发布你的第一章',
    icon: '📖',
    xpReward: 50,
    condition: (stats) => stats.chaptersCreated >= 1,
  },
  {
    id: 'hundred_chapters',
    type: AchievementType.CREATION,
    rarity: AchievementRarity.RARE,
    name: '百章达成',
    description: '累计发布100章',
    icon: '📑',
    xpReward: 300,
    condition: (stats) => stats.chaptersCreated >= 100,
  },
  {
    id: 'thousand_chapters',
    type: AchievementType.CREATION,
    rarity: AchievementRarity.EPIC,
    name: '千章巨著',
    description: '累计发布1000章',
    icon: '📜',
    xpReward: 1000,
    condition: (stats) => stats.chaptersCreated >= 1000,
  },
  {
    id: 'ten_thousand_words',
    type: AchievementType.CREATION,
    rarity: AchievementRarity.COMMON,
    name: '万字起步',
    description: '累计创作10,000字',
    icon: '✍️',
    xpReward: 100,
    condition: (stats) => stats.totalWords >= 10000,
  },
  {
    id: 'hundred_thousand_words',
    type: AchievementType.CREATION,
    rarity: AchievementRarity.RARE,
    name: '十万字作家',
    description: '累计创作100,000字',
    icon: '📝',
    xpReward: 500,
    condition: (stats) => stats.totalWords >= 100000,
  },
  {
    id: 'million_words',
    type: AchievementType.CREATION,
    rarity: AchievementRarity.EPIC,
    name: '百万字大神',
    description: '累计创作1,000,000字',
    icon: '👑',
    xpReward: 2000,
    condition: (stats) => stats.totalWords >= 1000000,
  },

  // 质量相关
  {
    id: 'quality_90',
    type: AchievementType.QUALITY,
    rarity: AchievementRarity.RARE,
    name: '质量保证',
    description: '平均完读率达到90%',
    icon: '⭐',
    xpReward: 300,
    condition: (stats) => stats.avgCompletionRate >= 90,
  },
  {
    id: 'quality_95',
    type: AchievementType.QUALITY,
    rarity: AchievementRarity.EPIC,
    name: '爆款作者',
    description: '平均完读率达到95%',
    icon: '🌟',
    xpReward: 500,
    condition: (stats) => stats.avgCompletionRate >= 95,
  },
  {
    id: 'quality_score_9',
    type: AchievementType.QUALITY,
    rarity: AchievementRarity.RARE,
    name: '9分作品',
    description: '平均质量评分达到9分',
    icon: '🎯',
    xpReward: 300,
    condition: (stats) => stats.avgQualityScore >= 9.0,
  },
  {
    id: 'quality_score_9_8',
    type: AchievementType.QUALITY,
    rarity: AchievementRarity.EPIC,
    name: '9.8分大神',
    description: '平均质量评分达到9.8分',
    icon: '🏆',
    xpReward: 500,
    condition: (stats) => stats.avgQualityScore >= 9.8,
  },

  // 社交相关
  {
    id: 'first_review',
    type: AchievementType.SOCIAL,
    rarity: AchievementRarity.COMMON,
    name: '初评',
    description: '收到第一条书评',
    icon: '💬',
    xpReward: 50,
    condition: (stats) => stats.reviewsReceived >= 1,
  },
  {
    id: 'hundred_reviews',
    type: AchievementType.SOCIAL,
    rarity: AchievementRarity.RARE,
    name: '百评达人',
    description: '累计收到100条书评',
    icon: '📊',
    xpReward: 300,
    condition: (stats) => stats.reviewsReceived >= 100,
  },
  {
    id: 'thousand_reviews',
    type: AchievementType.SOCIAL,
    rarity: AchievementRarity.EPIC,
    name: '千评大神',
    description: '累计收到1000条书评',
    icon: '🎖️',
    xpReward: 800,
    condition: (stats) => stats.reviewsReceived >= 1000,
  },
  {
    id: 'hundred_likes',
    type: AchievementType.SOCIAL,
    rarity: AchievementRarity.RARE,
    name: '百赞达成',
    description: '累计收到100个点赞',
    icon: '👍',
    xpReward: 200,
    condition: (stats) => stats.likesReceived >= 100,
  },
  {
    id: 'thousand_likes',
    type: AchievementType.SOCIAL,
    rarity: AchievementRarity.EPIC,
    name: '千赞大佬',
    description: '累计收到1000个点赞',
    icon: '❤️',
    xpReward: 600,
    condition: (stats) => stats.likesReceived >= 1000,
  },

  // 成长相关
  {
    id: 'rank_100',
    type: AchievementType.GROWTH,
    rarity: AchievementRarity.RARE,
    name: '百强',
    description: '作品进入排行榜前100',
    icon: '🏅',
    xpReward: 400,
    condition: (stats) => stats.topRank > 0 && stats.topRank <= 100,
  },
  {
    id: 'rank_10',
    type: AchievementType.GROWTH,
    rarity: AchievementRarity.EPIC,
    name: '前十',
    description: '作品进入排行榜前10',
    icon: '🥈',
    xpReward: 800,
    condition: (stats) => stats.topRank > 0 && stats.topRank <= 10,
  },
  {
    id: 'rank_1',
    type: AchievementType.GROWTH,
    rarity: AchievementRarity.LEGENDARY,
    name: '榜首',
    description: '作品登上排行榜第一',
    icon: '🥇',
    xpReward: 2000,
    condition: (stats) => stats.topRank === 1,
  },

  // 活跃度相关
  {
    id: 'login_7_days',
    type: AchievementType.ACTIVITY,
    rarity: AchievementRarity.COMMON,
    name: '周活跃',
    description: '连续登录7天',
    icon: '📅',
    xpReward: 100,
    condition: (stats) => stats.consecutiveDays >= 7,
  },
  {
    id: 'login_30_days',
    type: AchievementType.ACTIVITY,
    rarity: AchievementRarity.RARE,
    name: '月活跃',
    description: '连续登录30天',
    icon: '🗓️',
    xpReward: 300,
    condition: (stats) => stats.consecutiveDays >= 30,
  },
  {
    id: 'login_100_days',
    type: AchievementType.ACTIVITY,
    rarity: AchievementRarity.EPIC,
    name: '百日坚持',
    description: '连续登录100天',
    icon: '💪',
    xpReward: 800,
    condition: (stats) => stats.consecutiveDays >= 100,
  },
];

// 稀有度配置
export const rarityConfig = {
  [AchievementRarity.COMMON]: {
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: '⚪',
    label: '普通',
  },
  [AchievementRarity.RARE]: {
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: '🔵',
    label: '稀有',
  },
  [AchievementRarity.EPIC]: {
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: '🟣',
    label: '史诗',
  },
  [AchievementRarity.LEGENDARY]: {
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: '🟡',
    label: '传说',
  },
};

// 类型配置
export const typeConfig = {
  [AchievementType.CREATION]: {
    icon: '📝',
    label: '创作',
    color: 'text-blue-600',
  },
  [AchievementType.SOCIAL]: {
    icon: '💬',
    label: '社交',
    color: 'text-green-600',
  },
  [AchievementType.QUALITY]: {
    icon: '⭐',
    label: '质量',
    color: 'text-purple-600',
  },
  [AchievementType.GROWTH]: {
    icon: '📈',
    label: '成长',
    color: 'text-amber-600',
  },
  [AchievementType.ACTIVITY]: {
    icon: '🔥',
    label: '活跃',
    color: 'text-red-600',
  },
};

// 获取用户成就
export function getUserAchievements(stats: UserStats): Achievement[] {
  return achievements.filter(achievement => achievement.condition(stats));
}

// 获取即将解锁的成就（差距最小）
export function getNearbyAchievements(stats: UserStats, count: number = 3): Achievement[] {
  // 计算每个未解锁成就的差距
  const unlocked = new Set(getUserAchievements(stats).map(a => a.id));
  const nearby = achievements
    .filter(a => !unlocked.has(a.id))
    .map(achievement => {
      let gap = Infinity;
      
      // 简单的差距计算
      if (achievement.id.includes('words')) {
        gap = 1000000 - stats.totalWords;
      } else if (achievement.id.includes('chapter')) {
        gap = 1000 - stats.chaptersCreated;
      } else if (achievement.id.includes('days')) {
        gap = 100 - stats.consecutiveDays;
      } else if (achievement.id.includes('review')) {
        gap = 1000 - stats.reviewsReceived;
      } else if (achievement.id.includes('like')) {
        gap = 1000 - stats.likesReceived;
      }
      
      return { achievement, gap };
    })
    .filter(item => item.gap > 0)
    .sort((a, b) => a.gap - b.gap)
    .slice(0, count)
    .map(item => item.achievement);
  
  return nearby;
}

// 获取成就进度
export function getAchievementProgress(achievementId: string, stats: UserStats): number {
  const achievement = achievements.find(a => a.id === achievementId);
  if (!achievement) return 0;
  
  if (achievement.condition(stats)) return 100;
  
  // 计算进度百分比
  if (achievementId.includes('words')) {
    return Math.min(100, (stats.totalWords / 1000000) * 100);
  } else if (achievementId.includes('chapter')) {
    return Math.min(100, (stats.chaptersCreated / 1000) * 100);
  } else if (achievementId.includes('days')) {
    return Math.min(100, (stats.consecutiveDays / 100) * 100);
  } else if (achievementId.includes('review')) {
    return Math.min(100, (stats.reviewsReceived / 1000) * 100);
  } else if (achievementId.includes('like')) {
    return Math.min(100, (stats.likesReceived / 1000) * 100);
  } else if (achievementId.includes('completion')) {
    return Math.min(100, stats.avgCompletionRate);
  } else if (achievementId.includes('score')) {
    return Math.min(100, (stats.avgQualityScore / 10) * 100);
  }
  
  return 0;
}

// 按类型获取成就
export function getAchievementsByType(type: AchievementType): Achievement[] {
  return achievements.filter(a => a.type === type);
}

// 按稀有度获取成就
export function getAchievementsByRarity(rarity: AchievementRarity): Achievement[] {
  return achievements.filter(a => a.rarity === rarity);
}
