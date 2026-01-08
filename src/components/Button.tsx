import React from 'react';
import { Loader2 } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/brandIcons';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'href' | 'as'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'gradient-bg text-white shadow-md hover:shadow-lg focus:ring-indigo-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-600 focus:ring-indigo-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-500 text-white shadow-md hover:bg-red-600 hover:shadow-lg focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  const classes = [
    baseStyles,
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="animate-spin" size={16} />
      )}
      {!isLoading && iconPosition === 'left' && icon}
      {children}
      {!isLoading && iconPosition === 'right' && icon}
    </button>
  );
}

// Gradient Button with hover effect
export function GradientButton({
  children,
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  const classes = [
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl text-white transition-all duration-300',
    'hover:scale-105 hover:shadow-lg',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
    sizes[size],
    fullWidth ? 'w-full' : '',
    'btn-primary',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="animate-spin" size={16} />
      )}
      {!isLoading && iconPosition === 'left' && icon}
      {children}
      {!isLoading && iconPosition === 'right' && icon}
    </button>
  );
}

export default Button;
