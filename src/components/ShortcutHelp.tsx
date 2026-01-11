'use client';

import { useEffect, useState } from 'react';
import { X, Keyboard, Search } from 'lucide-react';
import { useShortcutHelp, formatShortcut } from '@/hooks/useKeyboardShortcuts';

interface ShortcutHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutHelp({ isOpen, onClose }: ShortcutHelpProps) {
  const shortcuts = useShortcutHelp();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredShortcuts = {
    global: shortcuts.global.filter(s =>
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    editor: shortcuts.editor.filter(s =>
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    navigation: shortcuts.navigation.filter(s =>
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  };

  const ShortcutSection = ({
    title,
    items,
  }: {
    title: string;
    items: Array<{ id: string; description: string; keys: string }>;
  }) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">{title}</h3>
        <div className="space-y-2">
          {items.map((shortcut) => (
            <div
              key={shortcut.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {shortcut.description}
              </span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Keyboard className="w-5 h-5 text-brand-primary" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              快捷键帮助
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索快捷键..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ShortcutSection title="全局快捷键" items={filteredShortcuts.global} />
          <ShortcutSection title="编辑器快捷键" items={filteredShortcuts.editor} />
          <ShortcutSection
            title="导航快捷键"
            items={filteredShortcuts.navigation}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            按 <kbd className="px-1 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
              Esc
            </kbd>{' '}
            或点击外部区域关闭
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 快捷键提示徽章组件
 */
export function ShortcutBadge({
  shortcut,
}: {
  shortcut: string | { key: string; ctrl?: boolean; shift?: boolean; alt?: boolean };
}) {
  const keys = typeof shortcut === 'string'
    ? [{ key: shortcut }]
    : [shortcut];

  return (
    <kbd className="px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 whitespace-nowrap">
      {formatShortcut(keys)}
    </kbd>
  );
}
