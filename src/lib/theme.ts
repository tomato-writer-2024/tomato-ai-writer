/**
 * 全局主题配置
 * 番茄AI写作助手 - VI视觉识别系统实现
 */

export const THEME = {
  // 品牌颜色
  colors: {
    // 主色 - 青蓝色渐变
    primary: {
      from: 'from-cyan-500',
      to: 'to-blue-600',
      solid: '#2563EB',
      light: '#06B6D4',
    },

    // 辅助色
    secondary: {
      purple: {
        from: 'from-purple-500',
        to: 'to-pink-600',
        solid: '#9333EA',
      },
      amber: {
        from: 'from-amber-500',
        to: 'to-orange-600',
        solid: '#D97706',
      },
      emerald: {
        from: 'from-emerald-500',
        to: 'to-teal-600',
        solid: '#059669',
      },
      rose: {
        from: 'from-rose-500',
        to: 'to-red-600',
        solid: '#E11D48',
      },
    },

    // 语义色
    success: {
      from: 'from-emerald-500',
      to: 'to-emerald-600',
      solid: '#059669',
      bg: 'bg-emerald-100',
      bgDark: 'dark:bg-emerald-900/30',
      text: 'text-emerald-600',
      textDark: 'dark:text-emerald-400',
    },

    warning: {
      from: 'from-amber-500',
      to: 'to-amber-600',
      solid: '#D97706',
      bg: 'bg-amber-100',
      bgDark: 'dark:bg-amber-900/30',
      text: 'text-amber-600',
      textDark: 'dark:text-amber-400',
    },

    error: {
      from: 'from-red-500',
      to: 'to-red-600',
      solid: '#DC2626',
      bg: 'bg-red-100',
      bgDark: 'dark:bg-red-900/30',
      text: 'text-red-600',
      textDark: 'dark:text-red-400',
    },

    info: {
      from: 'from-cyan-500',
      to: 'to-blue-600',
      solid: '#2563EB',
      bg: 'bg-cyan-100',
      bgDark: 'dark:bg-cyan-900/30',
      text: 'text-cyan-600',
      textDark: 'dark:text-cyan-400',
    },
  },

  // 功能分类渐变
  categoryGradients: {
    character: 'from-blue-500 to-indigo-600',
    plot: 'from-purple-500 to-pink-600',
    writing: 'from-cyan-500 to-teal-600',
    optimization: 'from-amber-500 to-orange-600',
    creative: 'from-rose-500 to-red-600',
    materials: 'from-emerald-500 to-green-600',
  },

  // 字体配置
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
    },
    fontSize: {
      h1: ['text-4xl lg:text-5xl', 'font-bold', 'leading-tight'],
      h2: ['text-3xl lg:text-4xl', 'font-bold', 'leading-tight'],
      h3: ['text-xl lg:text-2xl', 'font-bold', 'leading-tight'],
      h4: ['text-lg lg:text-xl', 'font-semibold', 'leading-tight'],
      body: ['text-base', 'font-normal', 'leading-normal'],
      small: ['text-sm', 'font-normal', 'leading-normal'],
      xs: ['text-xs', 'font-normal', 'leading-normal'],
    },
    fontWeight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },

  // 间距配置
  spacing: {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-10',
    '3xl': 'p-12',
    '4xl': 'p-16',
  },

  // 圆角配置
  borderRadius: {
    sm: 'rounded-sm',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    '2xl': 'rounded-3xl',
    full: 'rounded-full',
  },

  // 阴影配置
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    colored: 'shadow-cyan-500/25',
  },

  // 过渡配置
  transition: {
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-300',
    slower: 'duration-500',
  },

  // 断点配置
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // 组件样式
  components: {
    // 按钮样式
    button: {
      base: 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      gradient: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:scale-105',
      outline: 'border-2 border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },

    // 卡片样式
    card: {
      base: 'rounded-2xl border transition-all duration-300',
      glass: 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl hover:scale-105',
      solid: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg',
      hover: 'hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-xl hover:scale-105',
    },

    // 输入框样式
    input: {
      base: 'w-full px-4 py-2 rounded-xl border font-medium transition-all duration-200 focus:outline-none',
      default: 'border-slate-200 bg-slate-50 text-slate-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100',
      error: 'border-red-500 bg-red-50 text-red-900 focus:ring-red-200 dark:border-red-700 dark:bg-red-900/20 dark:text-red-100',
    },

    // 标签样式
    badge: {
      base: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      default: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      primary: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
      success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      error: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    },
  },

  // 动画配置
  animation: {
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    bounce: 'animate-bounce',
    fadeIn: 'animate-in fade-in duration-300',
    slideIn: 'animate-in slide-in-from-bottom duration-300',
    scaleIn: 'animate-in zoom-in duration-300',
  },
} as const;

// 导出类型
export type Theme = typeof THEME;

// 导出常用组合
export const brandColors = THEME.colors.primary;
export const categoryColors = THEME.categoryGradients;
export const componentStyles = THEME.components;
