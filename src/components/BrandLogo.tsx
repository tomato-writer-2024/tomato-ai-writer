'use client';

import Image from 'next/image';
import { type HTMLAttributes } from 'react';

export interface BrandLogoProps extends HTMLAttributes<HTMLDivElement> {
  /** Logo尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 是否显示文字 */
  showText?: boolean;
  /** 文字颜色 */
  textColor?: 'white' | 'black' | 'brand';
  /** 文字方向 */
  textPosition?: 'horizontal' | 'vertical';
}

export function BrandLogo({
  size = 'md',
  showText = true,
  textColor = 'black',
  textPosition = 'horizontal',
  className = '',
  ...props
}: BrandLogoProps) {
  const sizeMap = {
    sm: { width: 32, height: 32, fontSize: 'text-sm' },
    md: { width: 40, height: 40, fontSize: 'text-base' },
    lg: { width: 48, height: 48, fontSize: 'text-lg' },
    xl: { width: 64, height: 64, fontSize: 'text-xl' },
  };

  const { width, height, fontSize } = sizeMap[size];

  const textColorClass = {
    white: 'text-white',
    black: 'text-slate-900',
    brand: 'text-brand',
  }[textColor];

  const containerClass = textPosition === 'vertical'
    ? 'flex-col'
    : 'flex-row';

  return (
    <div className={`flex items-center gap-3 ${containerClass} ${className}`} {...props}>
      {/* Logo图片 */}
      <div
        className="relative flex-shrink-0"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <Image
          src="/logo.png"
          alt="番茄AI写作助手"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* 品牌文字 */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${fontSize} ${textColorClass} bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent`}>
            番茄AI写作
          </span>
          <span className={`text-xs ${textColor === 'white' ? 'text-white/70' : 'text-slate-500'}`}>
            创作助手
          </span>
        </div>
      )}
    </div>
  );
}

export function BrandLogoInline({
  size = 'md',
  className = '',
  ...props
}: Omit<BrandLogoProps, 'showText'>) {
  return (
    <BrandLogo size={size} showText={true} className={className} {...props} />
  );
}

export function BrandLogoOnly({
  size = 'md',
  className = '',
  ...props
}: Omit<BrandLogoProps, 'showText'>) {
  return (
    <BrandLogo size={size} showText={false} className={className} {...props} />
  );
}

// 品牌色组件
export function BrandGradient({
  children,
  className = '',
  variant = 'primary',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'tech' | 'creative';
}) {
  const gradients = {
    primary: 'bg-gradient-to-r from-brand to-brand-dark',
    secondary: 'bg-gradient-to-r from-brand-light to-blue-600',
    tech: 'bg-gradient-to-r from-accent to-secondary',
    creative: 'bg-gradient-to-r from-orange-400 to-brand',
  };

  return (
    <div className={`${gradients[variant]} ${className}`}>
      {children}
    </div>
  );
}

// 品牌图标组件（SVG）
export function BrandIcons() {
  return {
    Logo: ({ size = 24, className = '' }: { size?: number; className?: string }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),

    Sparkle: ({ size = 24, className = '' }: { size?: number; className?: string }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),

    Pen: ({ size = 24, className = '' }: { size?: number; className?: string }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      </svg>
    ),

    Book: ({ size = 24, className = '' }: { size?: number; className?: string }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M12 7v14" />
        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3H4a1 1 0 0 1-1-1Z" />
        <path d="M9 18h6" />
      </svg>
    ),

    Wand: ({ size = 24, className = '' }: { size?: number; className?: string }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
        <path d="m14 7 3 3" />
        <path d="M5 6v4" />
        <path d="M19 14v4" />
        <path d="M10 2v2" />
        <path d="M7 8H3" />
        <path d="M21 16h-4" />
        <path d="M11 3H9" />
      </svg>
    ),
  };
}
