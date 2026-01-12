'use client';

import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
}

export default function FeatureCard({
  icon: Icon,
  title,
  value,
  trend,
  trendUp,
  delay = 0,
}: FeatureCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl bg-white p-6
        border border-slate-200
        hover:border-[#FF4757]/30
        hover:shadow-xl hover:shadow-[#FF4757]/15
        transition-all duration-300
        animate-fadeInUp
      `}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      }}
    >
      {/* 渐变背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF4757]/5 to-[#5F27CD]/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />

      {/* 图标 */}
      <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4757] to-[#5F27CD] text-white">
        <Icon className="h-6 w-6" />
      </div>

      {/* 标题 */}
      <p className="relative text-sm font-medium text-slate-600">{title}</p>

      {/* 数值 */}
      <p className="relative mt-1 text-3xl font-bold text-slate-900">{value}</p>

      {/* 趋势 */}
      {trend && (
        <div
          className={`
            relative mt-2 inline-flex items-center gap-1 text-xs font-medium
            ${trendUp ? 'text-green-600' : 'text-red-600'}
          `}
        >
          <svg
            className={`h-3 w-3 ${trendUp ? 'rotate-0' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
