import React from 'react';
import Link from 'next/link';
import { BRAND_COLORS } from '@/lib/brandIcons';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  border?: boolean;
}

export function Card({
  children,
  className = '',
  hover = true,
  gradient = false,
  border = false,
}: CardProps) {
  const baseStyles = 'rounded-2xl bg-white';

  const hoverStyles = hover
    ? 'card-shadow transition-all duration-300 hover:-translate-y-1'
    : '';

  const gradientStyles = gradient
    ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
    : '';

  const borderStyles = border
    ? 'border-2 border-gray-200'
    : 'border border-gray-200/50';

  const classes = [
    baseStyles,
    hoverStyles,
    gradientStyles,
    borderStyles,
    'overflow-hidden',
    className,
  ].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
}

// Card Header
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export function CardHeader({ children, className = '', gradient = false }: CardHeaderProps) {
  const baseStyles = 'px-6 py-5 border-b border-gray-200/50';

  const gradientStyles = gradient
    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
    : '';

  const classes = [baseStyles, gradientStyles, className].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
}

// Card Body
interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}

// Card Footer
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 bg-gray-50/50 border-t border-gray-200/50 ${className}`}>
      {children}
    </div>
  );
}

// Stats Card
interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon, trend, className = '' }: StatsCardProps) {
  return (
    <Card hover className={className}>
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold gradient-text">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100">
              {icon}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// Feature Card
interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  link?: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, link, className = '' }: FeatureCardProps) {
  const cardContent = (
    <CardBody>
      {icon && (
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </CardBody>
  );

  if (link) {
    return (
      <Link href={link} className="block">
        <Card hover className={`text-center ${className}`}>
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card hover className={`text-center ${className}`}>
      {cardContent}
    </Card>
  );
}

export default Card;
