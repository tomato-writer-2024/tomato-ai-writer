'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

interface TrendData {
  date: string;
  value: number;
  label?: string;
}

interface TrendChartProps {
  data: TrendData[];
  title?: string;
  color?: string;
  height?: number;
  showLabels?: boolean;
}

export function TrendChart({
  data,
  title = '趋势图',
  color = '#FF4757',
  height = 200,
  showLabels = true,
}: TrendChartProps) {
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    if (!data || data.length === 0) {
      setSvgContent('');
      return;
    }

    const width = 800;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // 计算数据范围
    const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
    const minValue = 0;

    // 生成路径
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((d.value - minValue) / (maxValue - minValue)) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    // 生成区域路径（渐变填充）
    const areaPoints = `
      ${padding},${padding + chartHeight}
      ${points}
      ${padding + chartWidth},${padding + chartHeight}
    `;

    // 生成X轴标签
    const xLabels = data.map((d, i) => {
      if (data.length > 20 && i % Math.floor(data.length / 10) !== 0) {
        return '';
      }
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const date = new Date(d.date);
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      return `
        <text
          x="${x}"
          y="${height - 10}"
          text-anchor="middle"
          font-size="10"
          fill="#999"
        >
          ${label}
        </text>
      `;
    }).join('');

    // 生成Y轴标签
    const yLabels = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const value = Math.round(minValue + (maxValue - minValue) * ratio);
      const y = padding + chartHeight - ratio * chartHeight;
      return `
        <text
          x="${padding - 5}"
          y="${y + 3}"
          text-anchor="end"
          font-size="10"
          fill="#999"
        >
          ${value}
        </text>
        <line
          x1="${padding}"
          y1="${y}"
          x2="${width - padding}"
          y2="${y}"
          stroke="#e5e7eb"
          stroke-width="1"
          stroke-dasharray="4"
        />
      `;
    }).join('');

    // 生成数据点
    const dataPoints = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((d.value - minValue) / (maxValue - minValue)) * chartHeight;

      return `
        <circle
          cx="${x}"
          cy="${y}"
          r="3"
          fill="${color}"
          opacity="0.6"
          data-value="${d.value}"
          data-date="${d.date}"
          class="hover:r-5 hover:opacity-100 cursor-pointer transition-all"
        >
          <title>${d.label || d.date}: ${d.value}</title>
        </circle>
      `;
    }).join('');

    const svg = `
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="gradient-${title}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
          </linearGradient>
        </defs>

        <!-- 背景网格 -->
        ${yLabels}

        <!-- 区域填充 -->
        <polygon
          points="${areaPoints}"
          fill="url(#gradient-${title})"
        />

        <!-- 折线 -->
        <polyline
          points="${points}"
          fill="none"
          stroke="${color}"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- 数据点 -->
        ${dataPoints}

        <!-- X轴标签 -->
        ${showLabels ? xLabels : ''}
      </svg>
    `;

    setSvgContent(svg);
  }, [data, height, color, title, showLabels]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        暂无数据
      </div>
    );
  }

  return (
    <div className="w-full" title={title}>
      <div dangerouslySetInnerHTML={{ __html: svgContent }} />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
}

export function MetricCard({ title, value, change, trend, unit = '' }: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
            {value.toLocaleString()}
            <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
          </p>
        </div>
        <div className={`flex items-center ${trendColor} text-sm`}>
          <TrendIcon className="w-4 h-4 mr-1" />
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
    </div>
  );
}

interface CategoryBarProps {
  category: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  color?: string;
}

export function CategoryBar({ category, count, percentage, trend, change, color = '#FF4757' }: CategoryBarProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{category}</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400">{count}次</span>
          <div className={`flex items-center ${trendColor}`}>
            <TrendIcon className="w-3 h-3 mr-1" />
            <span className="text-xs">{Math.abs(change)}%</span>
          </div>
        </div>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface TimeDistributionChartProps {
  data: TrendData[];
}

export function TimeDistributionChart({ data }: TimeDistributionChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="flex items-end justify-between h-32 gap-1">
      {data.map((d, i) => {
        const height = maxValue > 0 ? (d.value / maxValue) * 100 : 0;
        const isActive = d.value > maxValue * 0.5;

        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 group"
            title={`${d.label || d.date}: ${d.value}次`}
          >
            <div
              className="w-full rounded-t-sm transition-all group-hover:opacity-100"
              style={{
                height: `${height}%`,
                backgroundColor: isActive ? '#FF4757' : '#FFB6C1',
                opacity: isActive ? 1 : 0.5,
              }}
            />
            {data.length <= 12 && (
              <span className="text-xs text-gray-500">
                {d.date.split(':')[0]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
