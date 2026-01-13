import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, glass = false, gradient = false, onClick }: CardProps) {
  const baseStyles = 'rounded-2xl transition-all duration-300';

  const backgroundStyles = gradient
    ? 'bg-gradient-to-br from-white to-slate-50 border border-slate-200'
    : glass
    ? 'bg-white/95 backdrop-blur-sm border border-slate-200'
    : 'bg-white border border-slate-200';

  const shadowStyles = 'shadow-sm';
  const hoverStyles = hover
    ? 'hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 cursor-pointer'
    : '';

  const paddingStyles = 'p-6 sm:p-8';

  const clickableStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${backgroundStyles} ${shadowStyles} ${hoverStyles} ${paddingStyles} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mt-6 pt-6 border-t border-slate-200 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-xl font-bold text-slate-900 ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-slate-600 mt-1 ${className}`}>{children}</p>;
}

export default Card;
