import React from 'react';

// 品牌色系配置
export const BRAND_COLORS = {
  primary: '#4F46E5',      // Indigo-600
  secondary: '#7C3AED',    // Purple-600
  accent: '#DB2777',       // Pink-600
  success: '#10B981',      // Emerald-500
  warning: '#F59E0B',      // Amber-500
  gradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #DB2777 100%)',
  gradientLight: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
  gradientDark: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 50%, #BE185D 100%)',
} as const;

// 品牌Logo图标 - 主Logo
export const LogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#DB2777" />
      </linearGradient>
    </defs>
    {/* 书本形状 */}
    <path
      d="M8 12 L32 8 L56 12 L56 52 L32 48 L8 52 Z"
      fill="url(#logoGradient)"
      opacity="0.9"
    />
    {/* 书脊线条 */}
    <path
      d="M32 8 L32 48"
      stroke="white"
      strokeWidth="2"
      opacity="0.3"
    />
    {/* 页面线条 */}
    <path
      d="M16 20 L28 19 M16 26 L28 25 M16 32 L28 31"
      stroke="white"
      strokeWidth="2"
      opacity="0.4"
      strokeLinecap="round"
    />
    <path
      d="M36 19 L48 20 M36 25 L48 26 M36 31 L48 32"
      stroke="white"
      strokeWidth="2"
      opacity="0.4"
      strokeLinecap="round"
    />
    {/* 火花装饰 */}
    <path
      d="M44 36 C44 36 46 32 48 32 C50 32 52 36 52 36 C52 36 50 38 48 38 C46 38 44 36 44 36"
      fill="white"
      opacity="0.8"
    />
  </svg>
);

// AI智能图标
export const AIIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    {/* 脑部轮廓 */}
    <path
      d="M32 8 C48 8 56 20 56 32 C56 44 48 56 32 56 C16 56 8 44 8 32 C8 20 16 8 32 8 Z"
      fill="url(#aiGradient)"
      opacity="0.9"
    />
    {/* 神经网络连接 */}
    <circle cx="32" cy="32" r="4" fill="white" opacity="0.9" />
    <circle cx="20" cy="24" r="3" fill="white" opacity="0.7" />
    <circle cx="44" cy="24" r="3" fill="white" opacity="0.7" />
    <circle cx="20" cy="40" r="3" fill="white" opacity="0.7" />
    <circle cx="44" cy="40" r="3" fill="white" opacity="0.7" />
    <line x1="32" y1="32" x2="20" y2="24" stroke="white" strokeWidth="1.5" opacity="0.5" />
    <line x1="32" y1="32" x2="44" y2="24" stroke="white" strokeWidth="1.5" opacity="0.5" />
    <line x1="32" y1="32" x2="20" y2="40" stroke="white" strokeWidth="1.5" opacity="0.5" />
    <line x1="32" y1="32" x2="44" y2="40" stroke="white" strokeWidth="1.5" opacity="0.5" />
    {/* 闪光点 */}
    <circle cx="52" cy="16" r="2" fill="#DB2777" opacity="0.8" />
  </svg>
);

// 写作图标
export const WritingIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="writingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#DB2777" />
      </linearGradient>
    </defs>
    {/* 钢笔主体 */}
    <path
      d="M48 16 L52 20 L24 48 L12 56 L20 44 Z"
      fill="url(#writingGradient)"
      opacity="0.9"
    />
    {/* 钢笔笔尖 */}
    <path
      d="M12 56 L20 44 L24 48 Z"
      fill="#4F46E5"
      opacity="0.7"
    />
    {/* 笔尖高光 */}
    <path
      d="M14 52 L18 48"
      stroke="white"
      strokeWidth="1"
      opacity="0.5"
      strokeLinecap="round"
    />
    {/* 文档线条 */}
    <path
      d="M12 20 L36 20 M12 28 L40 28 M12 36 L32 36 M12 44 L20 44"
      stroke="#4F46E5"
      strokeWidth="2"
      opacity="0.3"
      strokeLinecap="round"
    />
  </svg>
);

// 爽点图标（番茄小说特色）
export const ShuangdianIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="shuangdianGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DB2777" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    {/* 火焰形状 */}
    <path
      d="M32 8 C32 8 44 20 44 36 C44 48 40 56 32 56 C24 56 20 48 20 36 C20 20 32 8 32 8 Z"
      fill="url(#shuangdianGradient)"
      opacity="0.9"
    />
    {/* 火焰内部高光 */}
    <path
      d="M32 16 C32 16 40 28 40 36 C40 44 36 48 32 48 C28 48 24 44 24 36 C24 28 32 16 32 16 Z"
      fill="white"
      opacity="0.3"
    />
    {/* 星星装饰 */}
    <circle cx="44" cy="24" r="3" fill="#4F46E5" opacity="0.6" />
    <circle cx="20" cy="28" r="2" fill="#7C3AED" opacity="0.5" />
  </svg>
);

// 会员图标
export const MembershipIcon: React.FC<{ level?: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'; size?: number; className?: string }> = ({ level = 'BASIC', size = 32, className = '' }) => {
  const gradients = {
    FREE: ['#9CA3AF', '#6B7280'],        // 灰色
    BASIC: ['#4F46E5', '#7C3AED'],       // Indigo -> Purple
    PREMIUM: ['#DB2777', '#F59E0B'],     // Pink -> Amber
    ENTERPRISE: ['#0EA5E9', '#10B981'],   // Sky -> Emerald
  };

  const [start, end] = gradients[level];

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <defs>
        <linearGradient id={`membershipGradient-${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={start} />
          <stop offset="100%" stopColor={end} />
        </linearGradient>
      </defs>
      {/* 皇冠底部 */}
      <path
        d="M8 48 L8 56 L56 56 L56 48 Z"
        fill={`url(#membershipGradient-${level})`}
        opacity="0.8"
      />
      {/* 皇冠主体 */}
      <path
        d="M8 48 L8 32 L16 40 L24 20 L32 40 L40 20 L48 40 L56 32 L56 48 Z"
        fill={`url(#membershipGradient-${level})`}
        opacity="0.9"
      />
      {/* 皇冠宝石 */}
      {level !== 'FREE' && (
        <>
          <circle cx="32" cy="28" r="4" fill="white" opacity="0.8" />
          <circle cx="16" cy="36" r="2" fill="white" opacity="0.6" />
          <circle cx="48" cy="36" r="2" fill="white" opacity="0.6" />
        </>
      )}
      {/* 星星装饰（PREMIUM和ENTERPRISE） */}
      {(level === 'PREMIUM' || level === 'ENTERPRISE') && (
        <>
          <circle cx="32" cy="16" r="2" fill="#FBBF24" opacity="0.9" />
          <circle cx="20" cy="20" r="1.5" fill="#FBBF24" opacity="0.7" />
          <circle cx="44" cy="20" r="1.5" fill="#FBBF24" opacity="0.7" />
        </>
      )}
    </svg>
  );
};

// 效率图标
export const EfficiencyIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="efficiencyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#0EA5E9" />
      </linearGradient>
    </defs>
    {/* 闪电形状 */}
    <path
      d="M36 8 L24 32 L36 32 L32 56 L44 28 L32 28 Z"
      fill="url(#efficiencyGradient)"
      opacity="0.9"
    />
    {/* 闪光线条 */}
    <path
      d="M20 16 L16 20 M48 16 L52 20 M16 36 L12 40 M52 36 L56 40"
      stroke="#4F46E5"
      strokeWidth="2"
      opacity="0.5"
      strokeLinecap="round"
    />
  </svg>
);

// 质量图标
export const QualityIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="qualityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    {/* 盾牌形状 */}
    <path
      d="M32 8 L56 20 L56 32 C56 48 48 56 32 60 C16 56 8 48 8 32 L8 20 Z"
      fill="url(#qualityGradient)"
      opacity="0.9"
    />
    {/* 对勾 */}
    <path
      d="M20 32 L28 40 L44 24"
      stroke="white"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.9"
    />
  </svg>
);

// 导出/导入图标
export const ExportIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="exportGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#DB2777" />
      </linearGradient>
    </defs>
    {/* 文档形状 */}
    <rect x="12" y="8" width="32" height="48" rx="4" fill="url(#exportGradient)" opacity="0.2" />
    <rect x="16" y="12" width="24" height="40" rx="2" fill="url(#exportGradient)" opacity="0.9" />
    {/* 箭头 */}
    <path
      d="M40 32 L52 32 L46 26 M52 32 L46 38"
      stroke="url(#exportGradient)"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 文档线条 */}
    <line x1="24" y1="24" x2="32" y2="24" stroke="white" strokeWidth="2" opacity="0.7" />
    <line x1="24" y1="32" x2="32" y2="32" stroke="white" strokeWidth="2" opacity="0.7" />
    <line x1="24" y1="40" x2="28" y2="40" stroke="white" strokeWidth="2" opacity="0.7" />
  </svg>
);

// Zap/闪电图标（用于快速操作）
export const ZapIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="zapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#DB2777" />
      </linearGradient>
    </defs>
    {/* 闪电 */}
    <path
      d="M36 8 L20 32 L36 32 L28 56 L44 28 L28 28 Z"
      fill="url(#zapGradient)"
      opacity="0.9"
    />
    {/* 光芒 */}
    <circle cx="48" cy="20" r="2" fill="#F59E0B" opacity="0.8" />
    <circle cx="12" cy="36" r="1.5" fill="#F59E0B" opacity="0.6" />
  </svg>
);

// Book/作品图标
export const BookIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    {/* 书本左侧 */}
    <path
      d="M32 12 L8 16 L8 52 L32 48 Z"
      fill="url(#bookGradient)"
      opacity="0.8"
    />
    {/* 书本右侧 */}
    <path
      d="M32 12 L56 16 L56 52 L32 48 Z"
      fill="url(#bookGradient)"
      opacity="0.9"
    />
    {/* 书脊 */}
    <path
      d="M32 12 L32 48"
      stroke="white"
      strokeWidth="1"
      opacity="0.3"
    />
    {/* 页面线条 */}
    <path
      d="M16 24 L28 22 M16 32 L28 30 M16 40 L28 38"
      stroke="white"
      strokeWidth="1.5"
      opacity="0.5"
      strokeLinecap="round"
    />
    <path
      d="M36 22 L48 24 M36 30 L48 32 M36 38 L48 40"
      stroke="white"
      strokeWidth="1.5"
      opacity="0.5"
      strokeLinecap="round"
    />
    {/* 书签 */}
    <path
      d="M44 8 L44 28 L48 24 L52 28 L52 8 Z"
      fill="#DB2777"
      opacity="0.9"
    />
  </svg>
);

// Stats/统计图标
export const StatsIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="statsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#DB2777" />
      </linearGradient>
    </defs>
    {/* 柱状图 */}
    <rect x="8" y="40" width="12" height="16" rx="2" fill="url(#statsGradient)" opacity="0.5" />
    <rect x="24" y="28" width="12" height="28" rx="2" fill="url(#statsGradient)" opacity="0.7" />
    <rect x="40" y="16" width="12" height="40" rx="2" fill="url(#statsGradient)" opacity="0.9" />
    {/* 趋势线 */}
    <path
      d="M8 48 L26 32 L44 20 L56 12"
      stroke="#F59E0B"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      opacity="0.8"
    />
    {/* 数据点 */}
    <circle cx="26" cy="32" r="3" fill="#F59E0B" opacity="0.9" />
    <circle cx="44" cy="20" r="3" fill="#F59E0B" opacity="0.9" />
  </svg>
);

// Sparkles/创意图标
export const SparklesIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="sparklesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DB2777" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    {/* 主星星 */}
    <path
      d="M32 8 L36 24 L52 28 L36 32 L32 48 L28 32 L12 28 L28 24 Z"
      fill="url(#sparklesGradient)"
      opacity="0.9"
    />
    {/* 小星星 */}
    <circle cx="16" cy="16" r="3" fill="#7C3AED" opacity="0.7" />
    <circle cx="52" cy="16" r="2" fill="#4F46E5" opacity="0.6" />
    <circle cx="20" cy="52" r="2" fill="#DB2777" opacity="0.6" />
  </svg>
);

// 皇冠/会员图标
export const CrownIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#DB2777" />
      </linearGradient>
    </defs>
    {/* 皇冠底部 */}
    <path
      d="M8 48 L8 56 L56 56 L56 48 Z"
      fill="url(#crownGradient)"
      opacity="0.8"
    />
    {/* 皇冠主体 */}
    <path
      d="M8 48 L8 32 L16 40 L24 20 L32 40 L40 20 L48 40 L56 32 L56 48 Z"
      fill="url(#crownGradient)"
      opacity="0.9"
    />
    {/* 宝石 */}
    <circle cx="32" cy="28" r="4" fill="white" opacity="0.8" />
    <circle cx="16" cy="36" r="2" fill="white" opacity="0.6" />
    <circle cx="48" cy="36" r="2" fill="white" opacity="0.6" />
  </svg>
);

// Home/首页图标
export const HomeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    {/* 房子 */}
    <path
      d="M32 8 L56 28 L56 56 L40 56 L40 40 L24 40 L24 56 L8 56 L8 28 Z"
      fill="url(#homeGradient)"
      opacity="0.9"
    />
    {/* 门 */}
    <rect x="26" y="44" width="12" height="12" fill="white" opacity="0.3" />
    {/* 窗户 */}
    <circle cx="20" cy="20" r="4" fill="#DB2777" opacity="0.6" />
    <circle cx="44" cy="20" r="4" fill="#DB2777" opacity="0.6" />
  </svg>
);

// Settings/设置图标
export const SettingsIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <defs>
      <linearGradient id="settingsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6B7280" />
        <stop offset="100%" stopColor="#4B5563" />
      </linearGradient>
    </defs>
    {/* 外圈齿轮 */}
    <circle cx="32" cy="32" r="20" stroke="url(#settingsGradient)" strokeWidth="6" fill="none" opacity="0.8" />
    {/* 齿轮齿 */}
    <rect x="30" y="4" width="4" height="12" rx="2" fill="url(#settingsGradient)" opacity="0.9" />
    <rect x="30" y="48" width="4" height="12" rx="2" fill="url(#settingsGradient)" opacity="0.9" />
    <rect x="4" y="30" width="12" height="4" rx="2" fill="url(#settingsGradient)" opacity="0.9" />
    <rect x="48" y="30" width="12" height="4" rx="2" fill="url(#settingsGradient)" opacity="0.9" />
    {/* 中心圆 */}
    <circle cx="32" cy="32" r="8" fill="white" opacity="0.3" />
  </svg>
);

// 品牌图标集合导出
export const BrandIcons = {
  Logo: LogoIcon,
  AI: AIIcon,
  Writing: WritingIcon,
  Shuangdian: ShuangdianIcon,
  Membership: MembershipIcon,
  Efficiency: EfficiencyIcon,
  Quality: QualityIcon,
  Export: ExportIcon,
  Zap: ZapIcon,
  Book: BookIcon,
  Stats: StatsIcon,
  Sparkles: SparklesIcon,
  Crown: CrownIcon,
  Home: HomeIcon,
  Settings: SettingsIcon,
} as const;

export default BrandIcons;
