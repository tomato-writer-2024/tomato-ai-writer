/**
 * 全局快捷键系统 Hook
 * 支持 Cmd/Ctrl 快捷键
 */

export interface ShortcutKey {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Cmd on Mac, Win key on Windows
}

export type ShortcutHandler = (event: KeyboardEvent) => void;

export interface Shortcut {
  keys: ShortcutKey | ShortcutKey[];
  handler: ShortcutHandler;
  description: string;
  scope?: 'global' | 'editor' | 'navigation';
}

export class KeyboardShortcutManager {
  private shortcuts: Map<string, Shortcut> = new Map();
  private scope: 'global' | 'editor' | 'navigation' = 'global';

  /**
   * 注册快捷键
   */
  register(id: string, shortcut: Shortcut): () => void {
    this.shortcuts.set(id, shortcut);

    // 返回取消注册的函数
    return () => {
      this.shortcuts.delete(id);
    };
  }

  /**
   * 设置当前作用域
   */
  setScope(scope: 'global' | 'editor' | 'navigation') {
    this.scope = scope;
  }

  /**
   * 检查键盘事件是否匹配快捷键
   */
  private matchesShortcut(
    event: KeyboardEvent,
    shortcutKey: ShortcutKey
  ): boolean {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey; // Mac 上 Cmd 等同于 Ctrl
    const shift = event.shiftKey;
    const alt = event.altKey;

    return (
      key === shortcutKey.key.toLowerCase() &&
      (shortcutKey.ctrl ? ctrl : !ctrl) &&
      (shortcutKey.shift ? shift : !shift) &&
      (shortcutKey.alt ? alt : !alt)
    );
  }

  /**
   * 处理键盘事件
   */
  handleEvent(event: KeyboardEvent): boolean {
    // 如果在输入框中，只处理特定的快捷键
    const isInputFocused =
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement).isContentEditable;

    for (const [id, shortcut] of this.shortcuts) {
      // 检查作用域
      if (shortcut.scope && shortcut.scope !== this.scope) {
        continue;
      }

      // 如果在输入框中，跳过非编辑器快捷键
      if (isInputFocused && shortcut.scope !== 'editor') {
        continue;
      }

      const keys = Array.isArray(shortcut.keys)
        ? shortcut.keys
        : [shortcut.keys];

      const matched = keys.some(key => this.matchesShortcut(event, key));

      if (matched) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.handler(event);
        return true;
      }
    }

    return false;
  }

  /**
   * 获取所有快捷键
   */
  getShortcuts(): Map<string, Shortcut> {
    return this.shortcuts;
  }
}

// 全局快捷键管理器实例
const globalShortcutManager = new KeyboardShortcutManager();

// 在客户端挂载全局键盘事件监听器
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (event) => {
    globalShortcutManager.handleEvent(event);
  });
}

/**
 * 全局快捷键 Hook
 */
export function useKeyboardShortcuts() {
  const register = (id: string, shortcut: Shortcut): () => void => {
    return globalShortcutManager.register(id, shortcut);
  };

  const setScope = (scope: 'global' | 'editor' | 'navigation') => {
    globalShortcutManager.setScope(scope);
  };

  const getShortcuts = () => globalShortcutManager.getShortcuts();

  return { register, setScope, getShortcuts };
}

/**
 * 预定义的快捷键配置
 */
export const SHORTCUTS = {
  // 全局快捷键
  SAVE: { key: 's', ctrl: true, meta: true },
  SAVE_AS: { key: 's', ctrl: true, shift: true, meta: true },
  NEW_FILE: { key: 'n', ctrl: true, meta: true },
  OPEN_FILE: { key: 'o', ctrl: true, meta: true },
  SEARCH: { key: 'f', ctrl: true, meta: true },
  REPLACE: { key: 'h', ctrl: true, meta: true },
  HELP: { key: '/', ctrl: true, meta: true },
  SETTINGS: { key: ',', ctrl: true, meta: true },

  // 编辑器快捷键
  BOLD: { key: 'b', ctrl: true, meta: true },
  ITALIC: { key: 'i', ctrl: true, meta: true },
  UNDERLINE: { key: 'u', ctrl: true, meta: true },
  STRIKETHROUGH: { key: 'd', ctrl: true, shift: true, meta: true },
  HEADER: { key: '1', ctrl: true, alt: true, meta: true },

  // AI写作快捷键
  AI_CONTINUE: { key: 'k', ctrl: true, meta: true },
  AI_POLISH: { key: 'p', ctrl: true, alt: true, meta: true },
  AI_GENERATE: { key: 'g', ctrl: true, meta: true },

  // 导航快捷键
  GO_HOME: { key: 'h', alt: true },
  GO_WORKSPACE: { key: 'w', alt: true },
  GO_ANALYTICS: { key: 'a', alt: true },
  GO_SETTINGS: { key: 's', alt: true },

  // 视图快捷键
  TOGGLE_SIDEBAR: { key: 'b', ctrl: true, alt: true, meta: true },
  TOGGLE_DARK: { key: 'd', ctrl: true, shift: true, alt: true, meta: true },
  ZOOM_IN: { key: '=', ctrl: true, meta: true },
  ZOOM_OUT: { key: '-', ctrl: true, meta: true },
  ZOOM_RESET: { key: '0', ctrl: true, meta: true },
} as const;

/**
 * 快捷键显示名称生成器
 */
export function formatShortcut(keys: ShortcutKey | ShortcutKey[]): string {
  const keyArray = Array.isArray(keys) ? keys : [keys];

  return keyArray
    .map(k => {
      const parts: string[] = [];

      if (k.ctrl || k.meta) parts.push('⌘'); // Mac 使用 ⌘ 符号
      if (k.alt) parts.push('⌥');
      if (k.shift) parts.push('⇧');

      // 转换特殊按键
      const keyName = k.key
        .replace('escape', 'Esc')
        .replace('arrowup', '↑')
        .replace('arrowdown', '↓')
        .replace('arrowleft', '←')
        .replace('arrowright', '→')
        .replace('enter', '↵')
        .replace('backspace', '⌫')
        .replace('delete', '⌦')
        .replace(' ', 'Space')
        .toUpperCase();

      parts.push(keyName);

      return parts.join('');
    })
    .join(' 或 ');
}

/**
 * 快捷键帮助组件
 */
export function useShortcutHelp() {
  const { getShortcuts } = useKeyboardShortcuts();
  const shortcuts = getShortcuts();

  const shortcutsByScope = {
    global: [] as Array<{ id: string; description: string; keys: string }>,
    editor: [] as Array<{ id: string; description: string; keys: string }>,
    navigation: [] as Array<{ id: string; description: string; keys: string }>,
  };

  shortcuts.forEach((shortcut, id) => {
    const scope = shortcut.scope || 'global';
    const keys = Array.isArray(shortcut.keys) ? shortcut.keys : [shortcut.keys];
    shortcutsByScope[scope].push({
      id,
      description: shortcut.description,
      keys: formatShortcut(keys),
    });
  });

  return shortcutsByScope;
}

/**
 * 快捷键冲突检测
 */
export function useShortcutConflict(shortcut: ShortcutKey) {
  const conflicts: string[] = [];

  const { getShortcuts } = useKeyboardShortcuts();
  const shortcuts = getShortcuts();

  shortcuts.forEach((s, id) => {
    const keys = Array.isArray(s.keys) ? s.keys : [s.keys];

    keys.forEach(k => {
      if (
        k.key.toLowerCase() === shortcut.key.toLowerCase() &&
        (k.ctrl ? shortcut.ctrl : !shortcut.ctrl) &&
        (k.shift ? shortcut.shift : !shortcut.shift) &&
        (k.alt ? shortcut.alt : !shortcut.alt)
      ) {
        conflicts.push(id);
      }
    });
  });

  return conflicts;
}
