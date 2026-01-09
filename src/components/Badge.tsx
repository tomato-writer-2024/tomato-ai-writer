import React from 'react';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

const variants = {
  default: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
  success: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  danger: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  outline: {
    bg: 'bg-transparent',
    text: 'text-gray-700',
    border: 'border-gray-300',
  },
  secondary: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
};

const sizes = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}: BadgeProps) {
  const styles = variants[variant];
  const sizeStyles = sizes[size];

  const classes = [
    'inline-flex items-center gap-1.5 font-medium rounded-full border',
    styles.bg,
    styles.text,
    styles.border,
    sizeStyles,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {icon}
      {children}
    </span>
  );
}

// Status Badge with Icons
interface StatusBadgeProps {
  status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'PENDING' | 'PAID' | 'FAILED' | 'SUCCESS' | '连载中' | '已完结' | '暂停';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  DRAFT: {
    label: '草稿',
    variant: 'default' as const,
    icon: <AlertCircle size={14} />,
  },
  PUBLISHED: {
    label: '连载中',
    variant: 'success' as const,
    icon: <CheckCircle size={14} />,
  },
  COMPLETED: {
    label: '已完结',
    variant: 'info' as const,
    icon: <CheckCircle size={14} />,
  },
  PENDING: {
    label: '待支付',
    variant: 'warning' as const,
    icon: <Clock size={14} />,
  },
  PAID: {
    label: '已支付',
    variant: 'success' as const,
    icon: <CheckCircle size={14} />,
  },
  FAILED: {
    label: '支付失败',
    variant: 'danger' as const,
    icon: <XCircle size={14} />,
  },
  SUCCESS: {
    label: '成功',
    variant: 'success' as const,
    icon: <CheckCircle size={14} />,
  },
  '连载中': {
    label: '连载中',
    variant: 'success' as const,
    icon: <CheckCircle size={14} />,
  },
  '已完结': {
    label: '已完结',
    variant: 'info' as const,
    icon: <CheckCircle size={14} />,
  },
  '暂停': {
    label: '暂停',
    variant: 'warning' as const,
    icon: <Clock size={14} />,
  },
};

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size} icon={config.icon}>
      {label || config.label}
    </Badge>
  );
}

// Membership Badge
interface MembershipBadgeProps {
  level: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const membershipConfig = {
  FREE: {
    label: '免费版',
    variant: 'default' as const,
    gradient: 'bg-gradient-to-r from-gray-400 to-gray-500',
  },
  BASIC: {
    label: '基础版',
    variant: 'info' as const,
    gradient: 'bg-gradient-to-r from-indigo-500 to-purple-600',
  },
  PREMIUM: {
    label: '高级版',
    variant: 'warning' as const,
    gradient: 'bg-gradient-to-r from-pink-500 to-orange-500',
  },
  ENTERPRISE: {
    label: '企业版',
    variant: 'success' as const,
    gradient: 'bg-gradient-to-r from-cyan-500 to-emerald-500',
  },
};

export function MembershipBadge({ level, label, size = 'md' }: MembershipBadgeProps) {
  const config = membershipConfig[level];
  const sizeStyles = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-base' : 'px-3 py-1 text-sm';

  return (
    <span
      className={[
        'inline-flex items-center font-medium rounded-full text-white shadow-md',
        config.gradient,
        sizeStyles,
      ].join(' ')}
    >
      {label || config.label}
    </span>
  );
}

// Genre Badge
interface GenreBadgeProps {
  genre: string;
  size?: 'sm' | 'md' | 'lg';
}

const genreColors: Record<string, string> = {
  '都市': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '玄幻': 'bg-purple-100 text-purple-700 border-purple-200',
  '仙侠': 'bg-pink-100 text-pink-700 border-pink-200',
  '科幻': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  '历史': 'bg-orange-100 text-orange-700 border-orange-200',
  '军事': 'bg-red-100 text-red-700 border-red-200',
  '游戏': 'bg-green-100 text-green-700 border-green-200',
  '体育': 'bg-blue-100 text-blue-700 border-blue-200',
  '灵异': 'bg-gray-100 text-gray-700 border-gray-200',
  '同人': 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

export function GenreBadge({ genre, size = 'md' }: GenreBadgeProps) {
  const sizeStyles = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-base' : 'px-3 py-1 text-sm';
  const colorClass = genreColors[genre] || genreColors['都市'];

  return (
    <span
      className={[
        'inline-flex items-center font-medium rounded-full border',
        colorClass,
        sizeStyles,
      ].join(' ')}
    >
      {genre}
    </span>
  );
}

// Type Badge
interface TypeBadgeProps {
  type: 'generate' | 'polish' | 'continue' | '爽文' | '甜宠' | '悬疑' | '玄幻' | '都市';
  size?: 'sm' | 'md' | 'lg';
}

const typeConfig = {
  generate: {
    label: '生成',
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  polish: {
    label: '润色',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  continue: {
    label: '续写',
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    border: 'border-pink-200',
  },
  '爽文': {
    label: '爽文',
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  '甜宠': {
    label: '甜宠',
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    border: 'border-pink-200',
  },
  '悬疑': {
    label: '悬疑',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
  '玄幻': {
    label: '玄幻',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  '都市': {
    label: '都市',
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
};

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const config = typeConfig[type];
  const sizeStyles = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-base' : 'px-3 py-1 text-sm';

  return (
    <span
      className={[
        'inline-flex items-center font-medium rounded-full border',
        config.bg,
        config.text,
        config.border,
        sizeStyles,
      ].join(' ')}
    >
      {config.label}
    </span>
  );
}

export default Badge;
