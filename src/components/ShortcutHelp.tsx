'use client';

/**
 * 快捷键帮助面板组件
 * 显示所有可用的快捷键，支持按作用域筛选
 */

import React, { useState } from 'react';
import {
  shortcutGroups,
  formatShortcutDisplay,
  type ShortcutScope,
} from '@/hooks/useKeyboardShortcuts';
import { X } from 'lucide-react';

interface ShortcutHelpProps {
  isOpen: boolean;
  onClose: () => void;
  activeScope?: ShortcutScope;
}

export default function ShortcutHelp({
  isOpen,
  onClose,
  activeScope = 'global',
}: ShortcutHelpProps) {
  const [selectedScope, setSelectedScope] = useState<ShortcutScope | 'all'>('all');

  if (!isOpen) return null;

  const filteredGroups =
    selectedScope === 'all'
      ? shortcutGroups
      : shortcutGroups.filter((group) => group.scope === selectedScope);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 面板主体 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">键盘快捷键</h2>
            <p className="text-sm text-gray-500 mt-1">
              快速访问常用功能，提升创作效率
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="关闭"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* 作用域筛选 */}
        <div className="flex gap-2 p-4 border-b border-gray-200 overflow-x-auto">
          {(['all', 'global', 'editor', 'workspace'] as const).map((scope) => (
            <button
              key={scope}
              onClick={() => setSelectedScope(scope)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedScope === scope
                  ? 'bg-gradient-to-r from-red-500 to-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {scope === 'all'
                ? '全部'
                : scope === 'global'
                ? '全局'
                : scope === 'editor'
                ? '编辑器'
                : '工作区'}
            </button>
          ))}
        </div>

        {/* 快捷键列表 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {filteredGroups.map((group) => (
              <div key={group.scope}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      background:
                        group.scope === 'global'
                          ? '#FF4757'
                          : group.scope === 'editor'
                          ? '#0ABDE3'
                          : '#5F27CD',
                    }}
                  />
                  {group.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm text-gray-700">
                        {shortcut.description}
                      </span>
                      <kbd className="flex gap-1 px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-900 shadow-sm">
                        {shortcut.key
                          .split('+')
                          .map((key, i) => (
                            <span key={i}>{formatShortcutDisplay(key)}</span>
                          ))}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            按 <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded">Esc</kbd>
            或点击遮罩层关闭此面板
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 快捷键提示组件
 * 用于在页面上显示单个快捷键的提示
 */
interface ShortcutBadgeProps {
  shortcut: string;
  className?: string;
}

export function ShortcutBadge({ shortcut, className = '' }: ShortcutBadgeProps) {
  return (
    <kbd
      className={`inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-900 shadow-sm ${className}`}
    >
      {shortcut.split('+').map((key, i) => (
        <span key={i}>{formatShortcutDisplay(key)}</span>
      ))}
    </kbd>
  );
}

/**
 * 快捷键工具提示组件
 */
interface ShortcutTooltipProps {
  shortcut: string;
  description: string;
  children: React.ReactNode;
}

export function ShortcutTooltip({
  shortcut,
  description,
  children,
}: ShortcutTooltipProps) {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
        <div className="flex items-center gap-2">
          <span>{description}</span>
          <ShortcutBadge shortcut={shortcut} />
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}
