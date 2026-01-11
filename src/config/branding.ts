/**
 * 番茄AI写作助手 - VI设计系统
 * 基于logo色彩构建的品牌视觉识别系统
 */

// ============ 色彩系统 ============

export interface ColorPalette {
  name: string;
  value: string;
  description: string;
}

/** 主色调 - 品牌核心色 */
export const primaryColors: ColorPalette[] = [
  {
    name: '番茄红',
    value: '#FF4757',
    description: '品牌主色，代表热情、活力、创作激情',
  },
  {
    name: '深红',
    value: '#E84118',
    description: '品牌深色，用于强调和悬停状态',
  },
  {
    name: '浅红',
    value: '#FF6B81',
    description: '品牌浅色，用于背景和辅助元素',
  },
];

/** 辅色调 - 辅助品牌色 */
export const secondaryColors: ColorPalette[] = [
  {
    name: '靛蓝',
    value: '#5F27CD',
    description: '辅助色，代表智慧、深度',
  },
  {
    name: '青色',
    value: '#0ABDE3',
    description: '辅助色，代表创新、科技',
  },
  {
    name: '橙色',
    value: '#FF9F43',
    description: '辅助色，代表创意、灵感',
  },
];

/** 渐变色系统 */
export const gradients = {
  /** 品牌主渐变 - 番茄红到靛蓝 */
  primary: 'linear-gradient(135deg, #FF4757 0%, #5F27CD 100%)',

  /** 次级渐变 - 浅红到深蓝 */
  secondary: 'linear-gradient(135deg, #FF6B81 0%, #2E86DE 100%)',

  /** 科技渐变 - 青色到紫色 */
  tech: 'linear-gradient(135deg, #0ABDE3 0%, #5F27CD 100%)',

  /** 创意渐变 - 橙色到红色 */
  creative: 'linear-gradient(135deg, #FF9F43 0%, #FF4757 100%)',

  /** 文案渐变 - 留白到深色 */
  text: 'linear-gradient(135deg, #576574 0%, #222F3E 100%)',

  /** 光泽渐变 */
  shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',

  /** 卡片渐变 - 白色到浅灰 */
  card: 'linear-gradient(145deg, #FFFFFF 0%, #F8F9FA 100%)',
};

/** 中性色系统 */
export const neutralColors = {
  // 白色系
  white: '#FFFFFF',
  offWhite: '#F8F9FA',
  lightGray: '#E9ECEF',

  // 灰色系
  gray50: '#F1F2F6',
  gray100: '#DFE4EA',
  gray200: '#CED6E0',
  gray300: '#A4B0BE',
  gray400: '#747D8C',

  // 深色系
  gray500: '#57606F',
  gray600: '#2F3542',
  gray700: '#2F3542',
  gray800: '#1E272E',
  gray900: '#000000',

  // 暗色模式
  darkBg: '#0F0F0F',
  darkCard: '#1A1A1A',
  darkBorder: '#2A2A2A',
};

/** 语义色系统 */
export const semanticColors = {
  success: {
    light: '#2ECC71',
    normal: '#27AE60',
    dark: '#1E8449',
    bg: '#E8F8F5',
  },
  warning: {
    light: '#F1C40F',
    normal: '#F39C12',
    dark: '#B7791F',
    bg: '#FEF9E7',
  },
  error: {
    light: '#E74C3C',
    normal: '#C0392B',
    dark: '#922B21',
    bg: '#FDEDEC',
  },
  info: {
    light: '#3498DB',
    normal: '#2980B9',
    dark: '#1F618D',
    bg: '#EBF5FB',
  },
};

// ============ 阴影系统 ============

export const shadows = {
  /** 卡片基础阴影 */
  card: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  /** 品牌色阴影 */
  brand: {
    sm: '0 2px 8px rgba(255, 71, 87, 0.15)',
    md: '0 4px 12px rgba(255, 71, 87, 0.25)',
    lg: '0 8px 24px rgba(255, 71, 87, 0.35)',
    xl: '0 12px 32px rgba(255, 71, 87, 0.45)',
  },

  /** 内部阴影 */
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  /** 玻璃态阴影 */
  glass: '0 8px 32px rgba(0, 0, 0, 0.08)',
};

// ============ 字体系统 ============

export const typography = {
  /** 字体家族 */
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(', '),
    mono: [
      'ui-monospace',
      'SFMono-Regular',
      'Menlo',
      'Monaco',
      'Consolas',
      '"Liberation Mono"',
      '"Courier New"',
      'monospace',
    ].join(', '),
  },

  /** 字体大小 */
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  /** 字体粗细 */
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  /** 行高 */
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },

  /** 字母间距 */
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// ============ 间距系统 ============

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
};

// ============ 圆角系统 ============

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
};

// ============ 动画系统 ============

export const animations = {
  /** 缓动函数 */
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  /** 持续时间 */
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '1000ms',
  },

  /** 关键帧动画 */
  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    slideUp: {
      from: { transform: 'translateY(10px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    scale: {
      from: { transform: 'scale(0.95)' },
      to: { transform: 'scale(1)' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    shimmer: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' },
    },
  },
};

// ============ 组件系统 ============

export const components = {
  /** 按钮样式 */
  button: {
    primary: `
      background: ${gradients.primary};
      color: white;
      box-shadow: ${shadows.brand.md};
      transition: all 300ms;
      &:hover {
        transform: translateY(-2px);
        box-shadow: ${shadows.brand.lg};
      }
    `,
    secondary: `
      background: white;
      color: ${primaryColors[0].value};
      border: 2px solid ${primaryColors[0].value};
      transition: all 300ms;
      &:hover {
        background: ${primaryColors[0].value};
        color: white;
      }
    `,
    ghost: `
      background: transparent;
      color: ${neutralColors.gray600};
      transition: all 300ms;
      &:hover {
        background: ${neutralColors.gray50};
        color: ${primaryColors[0].value};
      }
    `,
  },

  /** 卡片样式 */
  card: {
    default: `
      background: white;
      border-radius: ${borderRadius['2xl']};
      box-shadow: ${shadows.card.md};
      transition: all 300ms;
      &:hover {
        box-shadow: ${shadows.card.xl};
        transform: translateY(-2px);
      }
    `,
    glass: `
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: ${borderRadius['2xl']};
      box-shadow: ${shadows.glass};
    `,
    gradient: `
      background: ${gradients.primary};
      color: white;
      border-radius: ${borderRadius['2xl']};
      box-shadow: ${shadows.brand.md};
    `,
  },

  /** 输入框样式 */
  input: {
    default: `
      background: ${neutralColors.white};
      border: 2px solid ${neutralColors.gray100};
      border-radius: ${borderRadius.xl};
      color: ${neutralColors.gray600};
      transition: all 300ms;
      &:focus {
        border-color: ${primaryColors[0].value};
        box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
      }
      &::placeholder {
        color: ${neutralColors.gray300};
      }
    `,
  },

  /** 标签样式 */
  badge: {
    hot: `
      background: ${semanticColors.warning.bg};
      color: ${semanticColors.warning.normal};
      border: 1px solid ${semanticColors.warning.light};
    `,
    new: `
      background: ${semanticColors.info.bg};
      color: ${semanticColors.info.normal};
      border: 1px solid ${semanticColors.info.light};
    `,
    pro: `
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: white;
    `,
  },
};

// ============ 布局系统 ============

export const layout = {
  /** 容器最大宽度 */
  maxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%',
  },

  /** 断点 */
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// ============ 主题映射 ============

export const themeMapping = {
  primary: primaryColors[0].value,
  primaryDark: primaryColors[1].value,
  primaryLight: primaryColors[2].value,
  secondary: secondaryColors[0].value,
  accent: secondaryColors[1].value,
  gradientPrimary: gradients.primary,
  gradientSecondary: gradients.secondary,
  gradientTech: gradients.tech,
  gradientCreative: gradients.creative,
};

// ============ Tailwind CSS 自定义配置 ============

export const tailwindConfig = {
  colors: {
    brand: {
      DEFAULT: primaryColors[0].value,
      light: primaryColors[2].value,
      dark: primaryColors[1].value,
    },
    secondary: {
      DEFAULT: secondaryColors[0].value,
    },
    accent: {
      DEFAULT: secondaryColors[1].value,
    },
    success: semanticColors.success,
    warning: semanticColors.warning,
    error: semanticColors.error,
    info: semanticColors.info,
  },
  fontFamily: typography.fontFamily,
  extend: {
    spacing,
    borderRadius,
    boxShadow: shadows,
    animation: {
      'fade-in': 'fadeIn 300ms ease-out',
      'slide-up': 'slideUp 300ms ease-out',
      'scale': 'scale 300ms ease-out',
      'pulse': 'pulse 2s ease-in-out infinite',
      'shimmer': 'shimmer 2s ease-in-out infinite',
    },
    keyframes: animations.keyframes,
  },
};
