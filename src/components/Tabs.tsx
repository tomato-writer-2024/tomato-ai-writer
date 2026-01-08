'use client';

import React, { useState, createContext, useContext } from 'react';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className = '' }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'pills';
}

export function TabsList({ children, className = '', variant = 'default' }: TabsListProps) {
  const baseStyles = 'flex gap-2';

  const variantStyles = {
    default: 'rounded-lg bg-gray-100 p-1',
    pills: 'gap-4 border-b border-gray-200',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'pills';
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function TabsTrigger({
  value,
  children,
  className = '',
  variant = 'default',
  disabled = false,
  icon,
}: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }

  const { value: selectedValue, onValueChange } = context;
  const isSelected = value === selectedValue;

  const baseStyles = 'flex items-center gap-2 font-medium transition-all duration-200';

  const variantStyles = {
    default: isSelected
      ? 'bg-white text-indigo-600 shadow-md rounded-lg px-4 py-2'
      : 'text-gray-600 hover:text-gray-900 rounded-lg px-4 py-2',
    pills: isSelected
      ? 'text-indigo-600 border-b-2 border-indigo-600 pb-2'
      : 'text-gray-600 hover:text-gray-900 pb-2 border-b-2 border-transparent',
  };

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      onClick={() => !disabled && onValueChange(value)}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }

  const { value: selectedValue } = context;
  const isVisible = value === selectedValue;

  if (!isVisible) return null;

  return (
    <div className={`animate-fadeIn ${className}`}>
      {children}
    </div>
  );
}

// Vertical Tabs
interface VerticalTabsProps extends Omit<TabsProps, 'className'> {
  className?: string;
}

export function VerticalTabs({ value, onValueChange, children, className = '' }: VerticalTabsProps) {
  return (
    <div className={`flex gap-6 ${className}`}>
      <TabsContext.Provider value={{ value, onValueChange }}>
        {children}
      </TabsContext.Provider>
    </div>
  );
}

export function VerticalTabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {children}
    </div>
  );
}

export function VerticalTabsTrigger({ value, children, className = '', disabled = false, icon }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('VerticalTabsTrigger must be used within a VerticalTabs component');
  }

  const { value: selectedValue, onValueChange } = context;
  const isSelected = value === selectedValue;

  return (
    <button
      onClick={() => !disabled && onValueChange(value)}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2 text-left font-medium transition-all duration-200
        ${isSelected
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 rounded-lg'
          : 'text-gray-600 hover:bg-gray-50 rounded-lg'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon}
      {children}
    </button>
  );
}

export default Tabs;
