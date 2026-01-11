'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getPageIconConfig, type PageIconConfig } from '@/lib/pageIcons';

export type PageIconVariant = 'default' | 'gradient' | 'outline' | 'solid' | 'minimal';
export type PageIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface PageIconProps {
  /** 页面路径，用于自动获取icon配置 */
  pagePath?: string;
  /** 直接指定icon配置（优先级高于pagePath） */
  config?: PageIconConfig;
  /** icon样式变体 */
  variant?: PageIconVariant;
  /** icon尺寸 */
  size?: PageIconSize;
  /** 自定义类名 */
  className?: string;
  /** 图片加载失败时的回调 */
  onImageError?: () => void;
  /** 是否显示背景 */
  showBackground?: boolean;
  /** 是否显示圆角 */
  rounded?: boolean;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 是否支持hover效果 */
  hoverable?: boolean;
}

/**
 * 尺寸映射表
 */
const sizeMap: Record<PageIconSize, { width: number; height: number; fontSize: string }> = {
  xs: { width: 24, height: 24, fontSize: '12px' },
  sm: { width: 32, height: 32, fontSize: '14px' },
  md: { width: 40, height: 40, fontSize: '16px' },
  lg: { width: 48, height: 48, fontSize: '18px' },
  xl: { width: 64, height: 64, fontSize: '24px' },
  '2xl': { width: 80, height: 80, fontSize: '32px' },
};

/**
 * 渐变样式映射表（基于VI系统）
 */
const gradientStyles = {
  'from-blue-500 to-indigo-600': 'bg-gradient-to-br from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600': 'bg-gradient-to-br from-purple-500 to-pink-600',
  'from-red-500 to-orange-600': 'bg-gradient-to-br from-red-500 to-orange-600',
  'from-green-500 to-teal-600': 'bg-gradient-to-br from-green-500 to-teal-600',
  'from-yellow-500 to-amber-600': 'bg-gradient-to-br from-yellow-500 to-amber-600',
  'from-cyan-500 to-blue-600': 'bg-gradient-to-br from-cyan-500 to-blue-600',
  'from-pink-500 to-rose-600': 'bg-gradient-to-br from-pink-500 to-rose-600',
  'from-indigo-500 to-purple-600': 'bg-gradient-to-br from-indigo-500 to-purple-600',
  'from-gray-500 to-slate-600': 'bg-gradient-to-br from-gray-500 to-slate-600',
  'from-red-500 to-pink-600': 'bg-gradient-to-br from-red-500 to-pink-600',
  'from-gray-400 to-gray-600': 'bg-gradient-to-br from-gray-400 to-gray-600',
};

/**
 * PageIcon组件
 * 统一的页面图标组件，支持多种显示模式，与logo保持VI风格一致
 */
export default function PageIcon({
  pagePath,
  config,
  variant = 'default',
  size = 'md',
  className = '',
  onImageError,
  showBackground = false,
  rounded = true,
  bordered = false,
  hoverable = false,
}: PageIconProps) {
  const [imageError, setImageError] = useState(false);

  // 获取icon配置
  const iconConfig = config || (pagePath ? getPageIconConfig(pagePath) : getPageIconConfig('/workspace'));
  const { width, height, fontSize } = sizeMap[size];

  // 处理图片加载失败
  const handleImageError = () => {
    setImageError(true);
    onImageError?.();
  };

  // 基础样式
  const baseClasses = `
    inline-flex items-center justify-center
    transition-all duration-200
    ${rounded ? 'rounded-lg' : 'rounded-none'}
    ${hoverable ? 'hover:scale-105 hover:shadow-lg cursor-pointer' : ''}
  `;

  // 边框样式
  const borderClasses = bordered
    ? 'border-2 border-gray-200'
    : '';

  // 背景样式
  const backgroundGradient = iconConfig.gradient ? gradientStyles[iconConfig.gradient as keyof typeof gradientStyles] : 'bg-gray-100';

  // 根据variant决定渲染样式
  const renderContent = () => {
    // 如果图片加载失败，显示fallback
    if (imageError) {
      return (
        <span
          className={baseClasses}
          style={{
            width: width,
            height: height,
            fontSize: fontSize,
            background: showBackground ? 'rgba(255, 71, 87, 0.1)' : undefined,
            border: bordered ? '2px solid #FF4757' : undefined,
          }}
        >
          {iconConfig.fallbackIcon}
        </span>
      );
    }

    // 使用Next.js Image组件
    return (
      <Image
        src={`/${iconConfig.iconFileName}`}
        alt={iconConfig.pageName}
        width={width}
        height={height}
        className={`
          ${rounded ? 'rounded-lg' : 'rounded-none'}
          ${bordered ? 'border-2 border-gray-200' : ''}
          ${hoverable ? 'hover:scale-105 transition-transform' : ''}
          ${variant === 'gradient' || showBackground ? 'object-cover' : ''}
        `}
        onError={handleImageError}
        unoptimized
      />
    );
  };

  // 不同variant的样式处理
  switch (variant) {
    case 'gradient':
      // 渐变背景 + 白色icon（如果icon是SVG）或带阴影的图片
      return (
        <div
          className={`
            ${baseClasses}
            ${backgroundGradient}
            shadow-md
            overflow-hidden
            ${className}
          `}
          style={{
            width: width + 16,
            height: height + 16,
          }}
        >
          <div className="flex items-center justify-center w-full h-full">
            {renderContent()}
          </div>
        </div>
      );

    case 'outline':
      // 边框样式
      return (
        <div
          className={`
            ${baseClasses}
            ${bordered ? 'border-2 border-gray-300' : 'border-2'}
            hover:border-[#FF4757]
            ${className}
          `}
          style={{
            width: width,
            height: height,
            borderColor: bordered ? undefined : '#FF4757',
          }}
        >
          {renderContent()}
        </div>
      );

    case 'solid':
      // 纯色背景（使用品牌色）
      return (
        <div
          className={`
            ${baseClasses}
            shadow-lg
            overflow-hidden
            ${className}
          `}
          style={{
            width: width,
            height: height,
            background: 'rgba(255, 71, 87, 0.1)',
          }}
        >
          {renderContent()}
        </div>
      );

    case 'minimal':
      // 最小化样式（无边框无背景）
      return (
        <div className={className}>
          {renderContent()}
        </div>
      );

    case 'default':
    default:
      // 默认样式（带背景渐变）
      return (
        <div
          className={`
            ${baseClasses}
            ${backgroundGradient}
            shadow-sm
            overflow-hidden
            ${className}
          `}
          style={{
            width: width + 8,
            height: height + 8,
          }}
        >
          <div className="flex items-center justify-center w-full h-full p-1">
            {renderContent()}
          </div>
        </div>
      );
  }
}

/**
 * 带标题的PageIcon组件
 */
export function PageIconWithTitle({
  pagePath,
  config,
  title,
  description,
  size = 'lg',
  variant = 'default',
  className = '',
}: {
  pagePath?: string;
  config?: PageIconConfig;
  title?: string;
  description?: string;
  size?: PageIconSize;
  variant?: PageIconVariant;
  className?: string;
}) {
  const iconConfig = config || (pagePath ? getPageIconConfig(pagePath) : getPageIconConfig('/workspace'));

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <PageIcon
        config={iconConfig}
        variant={variant}
        size={size}
        showBackground={true}
        rounded={true}
        hoverable={true}
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {title || iconConfig.pageName}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * 卡片式PageIcon组件（用于工作台等功能列表）
 */
export function PageIconCard({
  pagePath,
  config,
  onClick,
  size = 'lg',
  variant = 'gradient',
  className = '',
}: {
  pagePath?: string;
  config?: PageIconConfig;
  onClick?: () => void;
  size?: PageIconSize;
  variant?: PageIconVariant;
  className?: string;
}) {
  const iconConfig = config || (pagePath ? getPageIconConfig(pagePath) : getPageIconConfig('/workspace'));

  return (
    <button
      onClick={onClick}
      className={`
        group w-full p-4 rounded-xl border border-gray-200
        hover:shadow-lg hover:border-[#FF4757]
        transition-all duration-200
        flex flex-col items-center gap-3
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${className}
      `}
    >
      <PageIcon
        config={iconConfig}
        variant={variant}
        size={size}
        showBackground={false}
        rounded={true}
        hoverable={false}
      />
      <div className="text-center">
        <h4 className="font-medium text-gray-900 group-hover:text-[#FF4757] transition-colors">
          {iconConfig.pageName}
        </h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {iconConfig.description}
        </p>
      </div>
    </button>
  );
}
