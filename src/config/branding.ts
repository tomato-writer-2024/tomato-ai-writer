/**
 * 番茄AI写作助手 - VI设计系统
 * 基于logo色彩构建的品牌视觉识别系统
 * 专为创作者打造，提供专业、现代、高效的视觉体验
 */

// ============ 色彩系统 ============

export interface ColorPalette {
  name: string;
  value: string;
  description: string;
}

/** 主色调 - 品牌核心色（基于logo番茄红） */
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
  {
    name: '绯红',
    value: '#FF375F',
    description: '鲜艳绯红，用于高亮和重要提示',
  },
  {
    name: '玫瑰红',
    value: '#FF7E8E',
    description: '温柔玫瑰红，用于柔和的视觉元素',
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
  {
    name: '紫罗兰',
    value: '#A55EEA',
    description: '代表艺术、想象、浪漫',
  },
  {
    name: '翡翠绿',
    value: '#00D2D3',
    description: '代表成长、新生、希望',
  },
  {
    name: '皇家蓝',
    value: '#4B7BEC',
    description: '代表专业、信任、权威',
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

  /** 热情渐变 - 多色渐变 */
  passion: 'linear-gradient(135deg, #FF4757 0%, #FF6B81 25%, #FF9F43 50%, #FFD700 75%, #FF4757 100%)',

  /** 梦幻渐变 - 紫色系 */
  dream: 'linear-gradient(135deg, #A55EEA 0%, #5F27CD 50%, #4B7BEC 100%)',

  /** 清新渐变 - 青绿色系 */
  fresh: 'linear-gradient(135deg, #00D2D3 0%, #0ABDE3 50%, #4B7BEC 100%)',

  /** 深邃渐变 - 深色系 */
  deep: 'linear-gradient(135deg, #2F3542 0%, #1E272E 50%, #000000 100%)',

  /** 日落渐变 */
  sunset: 'linear-gradient(135deg, #FF7E8E 0%, #FF6B81 25%, #FF4757 50%, #E84118 75%, #FF9F43 100%)',

  /** 极光渐变 */
  aurora: 'linear-gradient(135deg, #00D2D3 0%, #0ABDE3 25%, #4B7BEC 50%, #A55EEA 75%, #FF4757 100%)',

  /** 编写工具专用 - 创作灵感 */
  inspiration: 'linear-gradient(135deg, #FF4757 0%, #FF9F43 25%, #FFD700 50%, #00D2D3 75%, #5F27CD 100%)',
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

// ============ 创作工具特定配置 ============

/** 创作状态颜色 */
export const writingStates = {
  drafting: {
    color: '#FF9F43',
    bg: '#FEF9E7',
    border: '#F1C40F',
    icon: '✏️',
  },
  editing: {
    color: '#0ABDE3',
    bg: '#EBF5FB',
    border: '#3498DB',
    icon: '📝',
  },
  reviewing: {
    color: '#5F27CD',
    bg: '#F4EAFD',
    border: '#A55EEA',
    icon: '👁️',
  },
  published: {
    color: '#27AE60',
    bg: '#E8F8F5',
    border: '#2ECC71',
    icon: '📚',
  },
};

/** 工具分类配色 */
export const categoryColors = {
  character: {
    name: '角色设定',
    color: '#FF4757',
    gradient: 'linear-gradient(135deg, #FF4757 0%, #FF6B81 100%)',
    icon: '👤',
  },
  plot: {
    name: '情节设计',
    color: '#FF9F43',
    gradient: 'linear-gradient(135deg, #FF9F43 0%, #FFD700 100%)',
    icon: '📖',
  },
  writing: {
    name: '智能写作',
    color: '#0ABDE3',
    gradient: 'linear-gradient(135deg, #0ABDE3 0%, #00D2D3 100%)',
    icon: '✨',
  },
  polish: {
    name: '润色优化',
    color: '#5F27CD',
    gradient: 'linear-gradient(135deg, #5F27CD 0%, #A55EEA 100%)',
    icon: '💎',
  },
  creative: {
    name: '创意工具',
    color: '#A55EEA',
    gradient: 'linear-gradient(135deg, #A55EEA 0%, #FF4757 100%)',
    icon: '🎨',
  },
  resources: {
    name: '素材资源',
    color: '#00D2D3',
    gradient: 'linear-gradient(135deg, #00D2D3 0%, #0ABDE3 100%)',
    icon: '📦',
  },
  data: {
    name: '数据分析',
    color: '#4B7BEC',
    gradient: 'linear-gradient(135deg, #4B7BEC 0%, #5F27CD 100%)',
    icon: '📊',
  },
  collaboration: {
    name: '协作功能',
    color: '#27AE60',
    gradient: 'linear-gradient(135deg, #27AE60 0%, #00D2D3 100%)',
    icon: '🤝',
  },
  protection: {
    name: '版权保护',
    color: '#E74C3C',
    gradient: 'linear-gradient(135deg, #E74C3C 0%, #FF4757 100%)',
    icon: '🔒',
  },
  platform: {
    name: '平台对接',
    color: '#2E86DE',
    gradient: 'linear-gradient(135deg, #2E86DE 0%, #4B7BEC 100%)',
    icon: '🚀',
  },
  aiTuning: {
    name: 'AI微调',
    color: '#FF6B81',
    gradient: 'linear-gradient(135deg, #FF6B81 0%, #A55EEA 100%)',
    icon: '🧠',
  },
  community: {
    name: '社区功能',
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FF9F43 100%)',
    icon: '🌟',
  },
};

/** 创作模式主题 */
export const writingModes = {
  focus: {
    name: '专注模式',
    description: '极简界面，专注于写作',
    colors: {
      bg: '#FFFFFF',
      text: '#2F3542',
      accent: '#FF4757',
    },
    features: ['无干扰', '沉浸式', '自动保存'],
  },
  zen: {
    name: '禅意模式',
    description: '柔和配色，舒缓创作压力',
    colors: {
      bg: '#F8F9FA',
      text: '#57606F',
      accent: '#5F27CD',
    },
    features: ['柔和视觉', '白噪音', '计时提醒'],
  },
  dark: {
    name: '暗色模式',
    description: '护眼配色，适合夜间写作',
    colors: {
      bg: '#1E272E',
      text: '#F1F2F6',
      accent: '#FF6B81',
    },
    features: ['护眼', '夜间模式', '高对比度'],
  },
  colorful: {
    name: '多彩模式',
    description: '活力配色，激发创作灵感',
    colors: {
      bg: 'linear-gradient(135deg, #FF4757 0%, #5F27CD 100%)',
      text: '#FFFFFF',
      accent: '#FFD700',
    },
    features: ['活力配色', '动态背景', '创意激发'],
  },
};

/** 质量评分色彩 */
export const qualityGrades = {
  excellent: {
    range: [90, 100],
    color: '#27AE60',
    bg: '#E8F8F5',
    border: '#2ECC71',
    icon: '⭐⭐⭐⭐⭐',
    label: '优秀',
  },
  good: {
    range: [80, 89],
    color: '#00D2D3',
    bg: '#EBF5FB',
    border: '#0ABDE3',
    icon: '⭐⭐⭐⭐',
    label: '良好',
  },
  average: {
    range: [70, 79],
    color: '#FF9F43',
    bg: '#FEF9E7',
    border: '#F1C40F',
    icon: '⭐⭐⭐',
    label: '一般',
  },
  poor: {
    range: [0, 69],
    color: '#E74C3C',
    bg: '#FDEDEC',
    border: '#C0392B',
    icon: '⭐⭐',
    label: '需改进',
  },
};

/** 平台对接颜色 */
export const platformColors = {
  fanqie: {
    name: '番茄小说',
    color: '#FF4757',
    bg: '#FDEDEC',
    border: '#E74C3C',
  },
  jinjiang: {
    name: '晋江文学城',
    color: '#E84118',
    bg: '#FADBD8',
    border: '#C0392B',
  },
  qidian: {
    name: '起点中文网',
    color: '#F1C40F',
    bg: '#FEF9E7',
    border: '#F39C12',
  },
  zongheng: {
    name: '纵横中文网',
    color: '#3498DB',
    bg: '#EBF5FB',
    border: '#2980B9',
  },
};

/** 导出格式颜色 */
export const exportFormats = {
  word: {
    name: 'Word文档',
    color: '#2B579A',
    icon: '📄',
  },
  pdf: {
    name: 'PDF文档',
    color: '#E74C3C',
    icon: '📕',
  },
  txt: {
    name: 'TXT纯文本',
    color: '#747D8C',
    icon: '📃',
  },
  epub: {
    name: 'EPUB电子书',
    color: '#27AE60',
    icon: '📚',
  },
};

/** 创作者专属色卡 */
export const creatorPalette = {
  /** 激发灵感的色彩 */
  inspiration: ['#FF4757', '#FF9F43', '#FFD700', '#00D2D3', '#5F27CD'],
  
  /** 专注写作的色彩 */
  focus: ['#FFFFFF', '#F8F9FA', '#F1F2F6', '#DFE4EA', '#A4B0BE'],
  
  /** 深度思考的色彩 */
  thinking: ['#2F3542', '#57606F', '#747D8C', '#A4B0BE', '#CED6E0'],
  
  /** 创意迸发的色彩 */
  creative: ['#FF4757', '#FF6B81', '#FF9F43', '#FFD700', '#A55EEA'],
  
  /** 数据分析的色彩 */
  analytics: ['#00D2D3', '#0ABDE3', '#4B7BEC', '#5F27CD', '#A55EEA'],
  
  /** 协作互动的色彩 */
  collaboration: ['#27AE60', '#00D2D3', '#0ABDE3', '#3498DB', '#4B7BEC'],
};

/** 玻璃态样式 */
export const glassEffects = {
  /** 品牌色玻璃态 */
  brand: {
    background: 'rgba(255, 71, 87, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 71, 87, 0.2)',
    boxShadow: '0 8px 32px rgba(255, 71, 87, 0.1)',
  },
  /** 深色玻璃态 */
  dark: {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  /** 浅色玻璃态 */
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
};

/** 创作者主题 */
export const creatorTheme = {
  /** 欢迎页主题 */
  welcome: {
    background: gradients.primary,
    textColor: '#FFFFFF',
    accentColor: '#FFD700',
  },
  
  /** 工作台主题 */
  workspace: {
    background: '#F8F9FA',
    textColor: '#2F3542',
    accentColor: '#FF4757',
    cardBackground: '#FFFFFF',
    borderColor: '#E9ECEF',
  },
  
  /** 编辑器主题 */
  editor: {
    background: '#FFFFFF',
    textColor: '#2F3542',
    accentColor: '#0ABDE3',
    selectionColor: 'rgba(255, 71, 87, 0.1)',
  },
};
