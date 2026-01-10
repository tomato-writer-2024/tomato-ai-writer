/**
 * 高级UI组件库
 * 提升视效审美，打造现代化界面
 */

import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// 渐变卡片组件
// ============================================================================

export interface GradientCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  gradient?: 'cyan-blue' | 'purple-pink' | 'orange-red' | 'green-teal';
  hover?: boolean;
}

export function GradientCard({
  children,
  gradient = 'cyan-blue',
  hover = true,
  className,
  ...props
}: GradientCardProps) {
  const gradients = {
    'cyan-blue': 'from-cyan-500 to-blue-600',
    'purple-pink': 'from-purple-500 to-pink-600',
    'orange-red': 'from-orange-500 to-red-600',
    'green-teal': 'from-green-500 to-teal-600',
  };

  return (
    <div
      className={cn(
        'rounded-2xl bg-gradient-to-br p-[2px] shadow-lg',
        gradients[gradient],
        hover && 'hover:shadow-2xl hover:scale-[1.02]',
        'transition-all duration-300',
        className
      )}
      {...props}
    >
      <div className="h-full w-full rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// 玻璃态卡片组件
// ============================================================================

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
}

export function GlassCard({
  children,
  blur = 'md',
  border = true,
  className,
  ...props
}: GlassCardProps) {
  const blurMap = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  return (
    <div
      className={cn(
        'rounded-2xl bg-white/60 dark:bg-slate-900/60',
        blurMap[blur],
        border && 'border border-slate-200/50 dark:border-slate-700/50',
        'shadow-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 动态网格卡片
// ============================================================================

export interface DynamicGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number;
}

export function DynamicGrid({
  children,
  columns = 1,
  gap = 4,
  className,
  ...props
}: DynamicGridProps) {
  const getGridClass = () => {
    if (typeof columns === 'number') {
      return `grid-cols-${columns}`;
    }

    const classes: string[] = [];
    if (columns.xs) classes.push(`grid-cols-${columns.xs}`);
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);

    return classes.join(' ');
  };

  return (
    <div
      className={cn(
        'grid',
        getGridClass(),
        `gap-${gap}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 统计卡片组件
// ============================================================================

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'cyan' | 'purple' | 'orange' | 'green' | 'red';
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'cyan',
}: StatCardProps) {
  const colorMap = {
    cyan: {
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      text: 'text-cyan-600 dark:text-cyan-400',
      icon: 'text-cyan-500',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      icon: 'text-purple-500',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-600 dark:text-orange-400',
      icon: 'text-orange-500',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      icon: 'text-green-500',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-400',
      icon: 'text-red-500',
    },
  };

  const colors = colorMap[color];

  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'mt-1 text-sm font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('rounded-xl p-3', colors.bg)}>
            <div className={colors.icon}>{icon}</div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ============================================================================
// 功能卡片组件
// ============================================================================

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  link?: string;
  isPro?: boolean;
  isNew?: boolean;
}

export function FeatureCard({
  icon,
  title,
  description,
  link,
  isPro = false,
  isNew = false,
}: FeatureCardProps) {
  return (
    <GradientCard hover className="p-6">
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between">
          <div
            className="rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 text-white"
          >
            {icon}
          </div>
          <div className="flex gap-2">
            {isNew && (
              <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                NEW
              </span>
            )}
            {isPro && (
              <span className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-1 text-xs font-medium text-white">
                PRO
              </span>
            )}
          </div>
        </div>
        <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-slate-600 dark:text-slate-400">
          {description}
        </p>
        {link && (
          <a
            href={link}
            className="mt-4 inline-flex items-center font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            开始使用 →
          </a>
        )}
      </div>
    </GradientCard>
  );
}

// ============================================================================
// 进度条组件
// ============================================================================

export interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'cyan' | 'purple' | 'orange' | 'green' | 'red';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  max,
  color = 'cyan',
  size = 'md',
  showLabel = true,
  label,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeMap = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  const colorMap = {
    cyan: 'bg-gradient-to-r from-cyan-500 to-blue-600',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-600',
    orange: 'bg-gradient-to-r from-orange-500 to-red-600',
    green: 'bg-gradient-to-r from-green-500 to-teal-600',
    red: 'bg-gradient-to-r from-red-500 to-pink-600',
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label || '进度'}
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="w-full rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={cn(
            'rounded-full transition-all duration-500 ease-out',
            sizeMap[size],
            colorMap[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// 标签云组件
// ============================================================================

export interface TagCloudProps {
  tags: Array<{
    name: string;
    count?: number;
    color?: 'cyan' | 'purple' | 'orange' | 'green' | 'red';
  }>;
  size?: 'sm' | 'md' | 'lg';
}

export function TagCloud({ tags, size = 'md' }: TagCloudProps) {
  const sizeMap = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const colorMap = {
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className={cn(
            'inline-flex items-center gap-1 rounded-full font-medium',
            sizeMap[size],
            tag.color ? colorMap[tag.color] : colorMap.cyan
          )}
        >
          {tag.name}
          {tag.count !== undefined && (
            <span className="opacity-70">({tag.count})</span>
          )}
        </span>
      ))}
    </div>
  );
}

// ============================================================================
// 时间线组件
// ============================================================================

export interface TimelineItem {
  title: string;
  description: string;
  date?: string;
  status?: 'pending' | 'in-progress' | 'completed';
}

export interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  const statusColors = {
    pending: 'bg-slate-300 dark:bg-slate-600',
    'in-progress': 'bg-cyan-500',
    completed: 'bg-green-500',
  };

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={index} className="relative flex gap-4">
          {/* 时间线 */}
          <div className="absolute left-[15px] top-10 h-full w-0.5 -translate-x-1/2 bg-slate-200 dark:bg-slate-700 last:hidden" />

          {/* 状态圆点 */}
          <div
            className={cn(
              'relative z-10 mt-2 h-8 w-8 rounded-full',
              statusColors[item.status || 'pending']
            )}
          />

          {/* 内容 */}
          <div className="flex-1 pb-6">
            <div className="flex items-start justify-between">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {item.title}
              </h4>
              {item.date && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {item.date}
                </span>
              )}
            </div>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 浮动操作按钮组件
// ============================================================================

export interface FABProps extends HTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color?: 'cyan' | 'purple' | 'orange' | 'green';
}

export function FAB({
  icon,
  label,
  position = 'bottom-right',
  color = 'cyan',
  className,
  ...props
}: FABProps) {
  const positionMap = {
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'top-right': 'top-8 right-8',
    'top-left': 'top-8 left-8',
  };

  const colorMap = {
    cyan: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700',
    orange: 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
    green: 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700',
  };

  return (
    <button
      className={cn(
        'fixed z-50 flex items-center gap-2 rounded-full px-6 py-3 font-medium text-white shadow-2xl transition-transform hover:scale-110 active:scale-95',
        positionMap[position],
        colorMap[color],
        className
      )}
      {...props}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
}

export default {
  GradientCard,
  GlassCard,
  DynamicGrid,
  StatCard,
  FeatureCard,
  ProgressBar,
  TagCloud,
  Timeline,
  FAB,
};
