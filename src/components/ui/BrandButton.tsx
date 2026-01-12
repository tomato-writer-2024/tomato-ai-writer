'use client';

import { ReactNode } from 'react';

interface BrandButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function BrandButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  disabled = false,
  className = '',
}: BrandButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200';

  const variants = {
    primary: `
      bg-gradient-to-r from-[#FF4757] to-[#5F27CD]
      text-white
      hover:shadow-lg hover:shadow-[#FF4757]/25
      hover:scale-105
      disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100
    `,
    secondary: `
      bg-slate-100 text-slate-900
      hover:bg-slate-200
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    outline: `
      border-2 border-[#FF4757] text-[#FF4757]
      hover:bg-[#FF4757] hover:text-white
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
