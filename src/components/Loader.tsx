'use client';

import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  text?: string;
  className?: string;
}

const sizes = {
  sm: { icon: 16, text: 'text-xs' },
  md: { icon: 24, text: 'text-sm' },
  lg: { icon: 32, text: 'text-base' },
  xl: { icon: 48, text: 'text-lg' },
};

export function Loader({
  size = 'md',
  color = 'text-indigo-600',
  text,
  className = '',
}: LoaderProps) {
  const sizeConfig = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2
        className={`animate-spin ${color}`}
        size={sizeConfig.icon}
      />
      {text && (
        <p className={`text-gray-600 font-medium ${sizeConfig.text}`}>{text}</p>
      )}
    </div>
  );
}

// Full Page Loader
interface PageLoaderProps {
  text?: string;
}

export function PageLoader({ text = '加载中...' }: PageLoaderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <RefreshCw className="mx-auto animate-spin text-indigo-600" size={48} />
        <p className="mt-4 text-lg font-medium text-gray-700">{text}</p>
      </div>
    </div>
  );
}

// Inline Loader (for buttons, cards, etc.)
interface InlineLoaderProps extends Omit<LoaderProps, 'text'> {}

export function InlineLoader(props: InlineLoaderProps) {
  return <Loader size="sm" {...props} />;
}

// Skeleton Loader
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    rounded: 'rounded-xl',
  };

  const baseClasses = [
    'animate-pulse',
    'bg-gray-200',
    variants[variant],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={baseClasses}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
        height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
      }}
    />
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex gap-3">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="space-y-2">
            <Skeleton variant="text" width={180} height={20} />
            <Skeleton variant="text" width={120} height={16} />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="90%" height={16} />
        <Skeleton variant="text" width="85%" height={16} />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-4">
          <Skeleton variant="text" width={60} height={20} />
          <Skeleton variant="text" width={80} height={20} />
        </div>
        <Skeleton variant="rounded" width={80} height={32} />
      </div>
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton variant="text" width={120} height={16} className="mb-2" />
          <Skeleton variant="text" width={80} height={32} />
        </div>
        <Skeleton variant="rounded" width={48} height={48} />
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="text" width={100} height={20} />
          ))}
        </div>
      </div>
      <div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border-b border-gray-100 px-6 py-4">
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((j) => (
                <Skeleton key={j} variant="text" width={120} height={20} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export default Loader;
