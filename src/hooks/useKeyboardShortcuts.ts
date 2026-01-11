/**
 * 全局快捷键系统 Hook
 * 支持 Cmd/Ctrl 快捷键、多作用域管理、快捷键帮助面板
 */

import { useEffect, useCallback, useState, useRef } from 'react';

export type ShortcutScope = 'global' | 'editor' | 'navigation' | 'workspace';

export interface Shortcut {
  key: string;
  description: string;
  handler: () => void;
  scope?: ShortcutScope;
  macKey?: string; // Mac 专用按键
  disabled?: boolean;
}

export interface ShortcutGroup {
  scope: ShortcutScope;
  name: string;
  shortcuts: Shortcut[];
}

/**
 * 使用快捷键 Hook
 */
export function useKeyboardShortcuts(
  shortcuts: Shortcut[],
  scope?: ShortcutScope
) {
  const [activeScope, setActiveScope] = useState<ShortcutScope>('global');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const scopeRef = useRef(scope || 'global');

  // 更新作用域
  const setScope = useCallback((newScope: ShortcutScope) => {
    scopeRef.current = newScope;
    setActiveScope(newScope);
  }, []);

  // 处理按键事件
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const currentScope = scope || scopeRef.current;

    // 检查是否在输入框中
    const target = event.target as HTMLElement;
    const isInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    // 如果是输入框且不是编辑器作用域，则忽略快捷键
    if (isInput && currentScope !== 'editor') {
      return;
    }

    // 检查 Cmd/Ctrl 键
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

    // 构建快捷键字符串
    const modifiers: string[] = [];
    if (cmdOrCtrl) modifiers.push(isMac ? 'Cmd' : 'Ctrl');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.altKey) modifiers.push('Alt');
    const key = event.key === ' ' ? 'Space' : event.key;
    const shortcutKey = [...modifiers, key].join('+');

    // 查找匹配的快捷键
    const matchedShortcut = shortcuts.find(
      (shortcut) =>
        !shortcut.disabled &&
        (!shortcut.scope || shortcut.scope === currentScope) &&
        (shortcut.key === shortcutKey ||
          (isMac && shortcut.macKey === shortcutKey))
    );

    if (matchedShortcut) {
      event.preventDefault();
      matchedShortcut.handler();
    }

    // 打开帮助面板（Ctrl/Cmd + /）
    if (cmdOrCtrl && event.key === '/') {
      event.preventDefault();
      setIsHelpOpen(!isHelpOpen);
    }
  }, [shortcuts, scope, isHelpOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    activeScope,
    setScope,
    isHelpOpen,
    setIsHelpOpen,
  };
}

/**
 * 全局快捷键配置
 */
export const globalShortcuts: Shortcut[] = [
  // 导航
  {
    key: 'Ctrl+K',
    macKey: 'Cmd+K',
    description: '快速搜索',
    scope: 'global',
    handler: () => {
      // 打开搜索框
      console.log('打开搜索框');
    },
  },
  {
    key: 'Ctrl+B',
    macKey: 'Cmd+B',
    description: '打开侧边栏',
    scope: 'global',
    handler: () => {
      console.log('打开侧边栏');
    },
  },
  {
    key: 'Ctrl+N',
    macKey: 'Cmd+N',
    description: '新建项目',
    scope: 'global',
    handler: () => {
      console.log('新建项目');
    },
  },
  {
    key: 'Ctrl+S',
    macKey: 'Cmd+S',
    description: '保存',
    scope: 'editor',
    handler: () => {
      console.log('保存');
    },
  },
  {
    key: 'Ctrl+Shift+S',
    macKey: 'Cmd+Shift+S',
    description: '另存为',
    scope: 'editor',
    handler: () => {
      console.log('另存为');
    },
  },
  // 编辑器
  {
    key: 'Ctrl+B',
    macKey: 'Cmd+B',
    description: '加粗',
    scope: 'editor',
    handler: () => {
      console.log('加粗');
    },
  },
  {
    key: 'Ctrl+I',
    macKey: 'Cmd+I',
    description: '斜体',
    scope: 'editor',
    handler: () => {
      console.log('斜体');
    },
  },
  {
    key: 'Ctrl+U',
    macKey: 'Cmd+U',
    description: '下划线',
    scope: 'editor',
    handler: () => {
      console.log('下划线');
    },
  },
  {
    key: 'Ctrl+Z',
    macKey: 'Cmd+Z',
    description: '撤销',
    scope: 'editor',
    handler: () => {
      console.log('撤销');
    },
  },
  {
    key: 'Ctrl+Shift+Z',
    macKey: 'Cmd+Shift+Z',
    description: '重做',
    scope: 'editor',
    handler: () => {
      console.log('重做');
    },
  },
  {
    key: 'Ctrl+F',
    macKey: 'Cmd+F',
    description: '查找',
    scope: 'editor',
    handler: () => {
      console.log('查找');
    },
  },
  {
    key: 'Ctrl+H',
    macKey: 'Cmd+H',
    description: '替换',
    scope: 'editor',
    handler: () => {
      console.log('替换');
    },
  },
  // 工作区
  {
    key: 'Ctrl+1',
    macKey: 'Cmd+1',
    description: '切换到工作台',
    scope: 'workspace',
    handler: () => {
      console.log('切换到工作台');
    },
  },
  {
    key: 'Ctrl+2',
    macKey: 'Cmd+2',
    description: '切换到编辑器',
    scope: 'workspace',
    handler: () => {
      console.log('切换到编辑器');
    },
  },
  {
    key: 'Ctrl+3',
    macKey: 'Cmd+3',
    description: '切换到数据分析',
    scope: 'workspace',
    handler: () => {
      console.log('切换到数据分析');
    },
  },
  // 其他
  {
    key: 'Escape',
    description: '关闭弹窗/退出',
    scope: 'global',
    handler: () => {
      console.log('关闭弹窗');
    },
  },
  {
    key: 'Enter',
    description: '确认',
    scope: 'global',
    handler: () => {
      console.log('确认');
    },
  },
  {
    key: 'Ctrl+/',
    macKey: 'Cmd+/',
    description: '打开快捷键帮助',
    scope: 'global',
    handler: () => {
      console.log('打开快捷键帮助');
    },
  },
];

/**
 * 快捷键分组
 */
export const shortcutGroups: ShortcutGroup[] = [
  {
    scope: 'global',
    name: '全局快捷键',
    shortcuts: [
      {
        key: 'Ctrl+K',
        macKey: 'Cmd+K',
        description: '快速搜索',
        scope: 'global',
        handler: () => {},
      },
      {
        key: 'Ctrl+N',
        macKey: 'Cmd+N',
        description: '新建项目',
        scope: 'global',
        handler: () => {},
      },
      {
        key: 'Ctrl+S',
        macKey: 'Cmd+S',
        description: '保存',
        scope: 'global',
        handler: () => {},
      },
      {
        key: 'Ctrl+/',
        macKey: 'Cmd+/',
        description: '快捷键帮助',
        scope: 'global',
        handler: () => {},
      },
      {
        key: 'Escape',
        description: '关闭弹窗',
        scope: 'global',
        handler: () => {},
      },
    ],
  },
  {
    scope: 'editor',
    name: '编辑器快捷键',
    shortcuts: [
      {
        key: 'Ctrl+B',
        macKey: 'Cmd+B',
        description: '加粗',
        scope: 'editor',
        handler: () => {},
      },
      {
        key: 'Ctrl+I',
        macKey: 'Cmd+I',
        description: '斜体',
        scope: 'editor',
        handler: () => {},
      },
      {
        key: 'Ctrl+U',
        macKey: 'Cmd+U',
        description: '下划线',
        scope: 'editor',
        handler: () => {},
      },
      {
        key: 'Ctrl+Z',
        macKey: 'Cmd+Z',
        description: '撤销',
        scope: 'editor',
        handler: () => {},
      },
      {
        key: 'Ctrl+Shift+Z',
        macKey: 'Cmd+Shift+Z',
        description: '重做',
        scope: 'editor',
        handler: () => {},
      },
      {
        key: 'Ctrl+F',
        macKey: 'Cmd+F',
        description: '查找',
        scope: 'editor',
        handler: () => {},
      },
      {
        key: 'Ctrl+H',
        macKey: 'Cmd+H',
        description: '替换',
        scope: 'editor',
        handler: () => {},
      },
    ],
  },
  {
    scope: 'workspace',
    name: '工作区快捷键',
    shortcuts: [
      {
        key: 'Ctrl+1',
        macKey: 'Cmd+1',
        description: '切换到工作台',
        scope: 'workspace',
        handler: () => {},
      },
      {
        key: 'Ctrl+2',
        macKey: 'Cmd+2',
        description: '切换到编辑器',
        scope: 'workspace',
        handler: () => {},
      },
      {
        key: 'Ctrl+3',
        macKey: 'Cmd+3',
        description: '切换到数据分析',
        scope: 'workspace',
        handler: () => {},
      },
      {
        key: 'Ctrl+B',
        macKey: 'Cmd+B',
        description: '打开侧边栏',
        scope: 'workspace',
        handler: () => {},
      },
    ],
  },
];

/**
 * 检测快捷键冲突
 */
export function detectShortcutConflicts(
  newShortcuts: Shortcut[],
  existingShortcuts: Shortcut[]
): Shortcut[] {
  const conflicts: Shortcut[] = [];

  newShortcuts.forEach((newShortcut) => {
    const conflict = existingShortcuts.find(
      (existing) =>
        existing.key === newShortcut.key &&
        existing.scope === newShortcut.scope &&
        (!newShortcut.scope || newShortcut.scope === existing.scope)
    );

    if (conflict) {
      conflicts.push(newShortcut);
    }
  });

  return conflicts;
}

/**
 * 格式化快捷键显示
 */
export function formatShortcutDisplay(key: string): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return key.replace('Ctrl', isMac ? '⌘' : 'Ctrl').replace('Cmd', '⌘');
}

/**
 * 快捷键工具函数
 */
export const shortcutUtils = {
  /**
   * 解析快捷键字符串
   */
  parseShortcut(shortcut: string): {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
    key: string;
  } {
    const parts = shortcut.split('+');
    return {
      ctrl: parts.includes('Ctrl'),
      shift: parts.includes('Shift'),
      alt: parts.includes('Alt'),
      meta: parts.includes('Cmd'),
      key: parts[parts.length - 1],
    };
  },

  /**
   * 判断两个快捷键是否相同
   */
  isShortcutMatch(
    event: KeyboardEvent,
    shortcut: string
  ): boolean {
    const parsed = this.parseShortcut(shortcut);
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    return (
      (parsed.ctrl === event.ctrlKey || (isMac && parsed.meta === event.metaKey)) &&
      parsed.shift === event.shiftKey &&
      parsed.alt === event.altKey &&
      event.key.toLowerCase() === parsed.key.toLowerCase()
    );
  },

  /**
   * 获取快捷键提示文本
   */
  getShortcutTooltip(shortcuts: Shortcut[]): string {
    return shortcuts
      .map((s) => formatShortcutDisplay(s.key))
      .join(' / ');
  },
};
