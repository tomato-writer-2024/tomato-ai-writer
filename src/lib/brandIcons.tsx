/**
 * 品牌图标系统
 *
 * 基于番茄AI写作助手logo设计
 * 品牌色系：Indigo (#6366F1) + Purple (#A855F7) + Pink (#EC4899)
 *
 * 设计理念：
 * - 现代、简洁、专业
 * - 突出AI智能和创意写作
 * - 符合用户审美标准
 */

import { LucideIcon } from 'lucide-react';

// ============================================================================
// 品牌颜色系统
// ============================================================================

export const brandColors = {
  // 主品牌色
  primary: '#6366F1',      // Indigo-500
  primaryHover: '#4F46E5',  // Indigo-600
  primaryLight: '#818CF8', // Indigo-400
  primaryDark: '#4338CA',  // Indigo-700

  // 品牌渐变色
  gradientStart: '#6366F1', // Indigo-500
  gradientEnd: '#EC4899',   // Pink-500
  gradientMid: '#A855F7',   // Purple-500

  // 功能色
  success: '#10B981',       // Emerald-500
  warning: '#F59E0B',       // Amber-500
  error: '#EF4444',         // Red-500
  info: '#3B82F6',          // Blue-500

  // 特殊色
  shuangdian: '#F59E0B',    // 爽点金
  baokuan: '#EF4444',       // 爆款红
  ai: '#8B5CF6',            // AI紫
} as const;

// ============================================================================
// 渐变配置
// ============================================================================

export const gradients = {
  primary: 'from-indigo-500 to-purple-600',
  primaryLight: 'from-indigo-400 to-purple-500',
  full: 'from-indigo-500 via-purple-500 to-pink-500',
  warm: 'from-purple-500 to-pink-500',
  cool: 'from-indigo-500 to-blue-500',
} as const;

// ============================================================================
// 图标组件（带品牌颜色和效果）
// ============================================================================

interface BrandIconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  variant?: 'primary' | 'gradient' | 'solid' | 'outline';
  effect?: 'none' | 'pulse' | 'bounce' | 'spin';
}

/**
 * 品牌图标组件 - 统一的图标样式
 */
export function BrandIcon({
  icon: Icon,
  size = 24,
  className = '',
  variant = 'primary',
  effect = 'none',
}: BrandIconProps) {
  const effectClass = {
    none: '',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    spin: 'animate-spin',
  }[effect];

  const variantClasses = {
    primary: 'text-indigo-600',
    gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent',
    solid: 'bg-indigo-500 text-white rounded-lg p-2',
    outline: 'text-indigo-600',
  }[variant];

  return (
    <Icon
      size={size}
      className={`${variantClasses} ${effectClass} ${className}`}
    />
  );
}

// ============================================================================
// 专用图标组件（结合品牌色）
// ============================================================================

/**
 * Logo图标 - 品牌标识
 */
export function LogoIcon({ size = 40 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"
      style={{ width: size, height: size }}
    >
      <div className="text-white">
        {/* 使用书图标代表番茄小说 */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={size ? `w-[${size * 0.6}px] h-[${size * 0.6}px]` : ''}
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
    </div>
  );
}

/**
 * AI图标 - 突出智能能力
 */
export function AIIcon({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1={12} x2={12} y1={19} y2={22} />
        <line x1={8} x2={16} y1={22} y2={22} />
      </svg>
    </div>
  );
}

/**
 * 写作图标 - 章节撰写
 */
export function WritingIcon({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r={2} />
      </svg>
    </div>
  );
}

/**
 * 爽点图标 - 爆款潜力
 */
export function ShuangdianIcon({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </div>
  );
}

/**
 * 会员等级图标
 */
export function MembershipIcon({
  level,
  size = 32,
}: {
  level: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  size?: number;
}) {
  const gradients = {
    FREE: 'from-gray-400 to-gray-500',
    BASIC: 'from-blue-500 to-cyan-500',
    PREMIUM: 'from-indigo-500 to-purple-500',
    ENTERPRISE: 'from-purple-600 to-pink-600',
  };

  const icons = {
    FREE: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    BASIC: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    PREMIUM: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        <path d="M6 3h12l4 6-10 13L2 9Z" />
      </svg>
    ),
    ENTERPRISE: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
  };

  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br ${gradients[level]} shadow-lg`}
      style={{ width: size, height: size }}
    >
      {icons[level]}
    </div>
  );
}

// ============================================================================
// 功能图标映射
// ============================================================================

export const functionalIcons = {
  // 导航
  home: 'Home',
  workspace: 'PenTool',
  pricing: 'Crown',
  profile: 'User',
  settings: 'Settings',
  logout: 'LogOut',

  // 认证
  login: 'LogIn',
  register: 'UserPlus',

  // 文档操作
  save: 'Save',
  download: 'Download',
  upload: 'Upload',
  copy: 'Copy',
  edit: 'Edit',
  delete: 'Trash',

  // 搜索和过滤
  search: 'Search',
  filter: 'Filter',
  sort: 'ArrowUpDown',

  // 状态
  loading: 'Loader',
  success: 'CheckCircle',
  error: 'XCircle',
  warning: 'AlertTriangle',
  info: 'Info',

  // 评分和统计
  star: 'Star',
  flame: 'Flame',
  trendingUp: 'TrendingUp',
  barChart: 'BarChart',
  pieChart: 'PieChart',

  // 权限
  lock: 'Lock',
  unlock: 'Unlock',

  // 支付
  wallet: 'Wallet',
  creditCard: 'CreditCard',

  // 其他
  refresh: 'Refresh',
  history: 'History',
  bell: 'Bell',
  helpCircle: 'HelpCircle',
  externalLink: 'ExternalLink',
  menu: 'Menu',
  close: 'X',
} as const;

// ============================================================================
// 图标使用指南
// ============================================================================

/**
 * 使用示例：
 *
 * import { LogoIcon, AIIcon, WritingIcon, MembershipIcon, brandColors } from '@/lib/brandIcons';
 *
 * // 1. Logo图标
 * <LogoIcon size={40} />
 *
 * // 2. AI图标
 * <AIIcon size={32} />
 *
 * // 3. 会员图标
 * <MembershipIcon level="PREMIUM" size={32} />
 *
 * // 4. 品牌颜色
 * <div style={{ backgroundColor: brandColors.primary }}>...</div>
 *
 * // 5. 渐变背景
 * <div className="bg-gradient-to-br from-indigo-500 to-purple-600">...</div>
 */
