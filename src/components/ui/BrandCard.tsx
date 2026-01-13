'use client';

import { LucideIcon } from 'lucide-react';

interface BrandCardProps {
  icon: LucideIcon | string;
  title: string;
  description: string;
  tags?: string[];
  gradient?: string;
  onClick?: () => void;
  delay?: number;
}

export default function BrandCard({
  icon,
  title,
  description,
  tags,
  gradient = 'from-[#FF4757] to-[#6366F1]',
  onClick,
  delay = 0,
}: BrandCardProps) {
  const isLucideIcon = typeof icon !== 'string';
  const IconComponent = isLucideIcon ? icon : null;

  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8
        border border-slate-200
        hover:border-[#FF4757]/30
        hover:shadow-2xl hover:shadow-[#FF4757]/20
        transition-all duration-300
        cursor-pointer
        hover:scale-[1.02]
        hover:-translate-y-1
      `}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      }}
    >
      {/* 渐变背景装饰 */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-br ${gradient} opacity-0
          group-hover:opacity-[0.05] transition-opacity duration-300
        `}
      />

      {/* 图标区域 */}
      <div
        className={`
          mb-4 flex h-14 w-14 items-center justify-center rounded-2xl
          bg-gradient-to-br ${gradient} shadow-lg shadow-[#FF4757]/30
          group-hover:scale-110 group-hover:rotate-3
          transition-all duration-300
        `}
      >
        {isLucideIcon && IconComponent ? (
          <IconComponent className="h-7 w-7 text-white" />
        ) : (
          <span className="text-3xl">{typeof icon === 'string' ? icon : '✨'}</span>
        )}
      </div>

      {/* 内容区域 */}
      <h3 className="mb-2 text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#FF4757] transition-colors">
        {title}
      </h3>
      <p className="mb-4 text-sm sm:text-base text-slate-600 leading-relaxed">{description}</p>

      {/* 标签 */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="
                px-2.5 py-1 text-xs font-medium text-slate-600
                bg-slate-100 rounded-lg
                group-hover:bg-gradient-to-r group-hover:from-[#FF4757]/10 group-hover:to-[#6366F1]/10
                transition-colors
              "
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 箭头指示器 */}
      <div className="absolute bottom-6 right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FF4757] to-[#6366F1] text-white shadow-lg shadow-[#FF4757]/30">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
