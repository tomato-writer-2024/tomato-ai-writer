# 番茄AI写作助手 - 设计规范文档

> 版本：v1.0
> 更新时间：2025-01-XX
> 目标：提升用户审美标准、增强用户体验和粘性

---

## 一、品牌视觉识别系统

### 1.1 品牌理念
**"智能创作，爆款出圈"**
- 专业：AI技术驱动
- 高效：快速生成高质量内容
- 成功：助力创作者成为爆款

### 1.2 品牌个性
- **专业可靠**：技术领先，值得信赖
- **创新前沿**：AI赋能，引领潮流
- **结果导向**：帮助用户成功
- **友好易用**：简单直观，易于上手

---

## 二、色彩系统

### 2.1 主色调

#### 品牌主色
```css
/* 主品牌色 - 智慧蓝 */
--brand-primary: #6366F1;
--brand-primary-hover: #4F46E5;
--brand-primary-light: #818CF8;
--brand-primary-dark: #4338CA;

/* 品牌渐变 */
--brand-gradient-start: #6366F1;
--brand-gradient-end: #EC4899;
```

#### 辅助色
```css
/* 成功绿 */
--success: #10B981;
--success-light: #34D399;
--success-dark: #059669;

/* 警告橙 */
--warning: #F59E0B;
--warning-light: #FBBF24;
--warning-dark: #D97706;

/* 错误红 */
--error: #EF4444;
--error-light: #F87171;
--error-dark: #DC2626;

/* 信息蓝 */
--info: #3B82F6;
--info-light: #60A5FA;
--info-dark: #2563EB;
```

### 2.2 中性色系

```css
/* 文字色 */
--text-primary: #111827;      /* 主要文字 */
--text-secondary: #6B7280;    /* 次要文字 */
--text-tertiary: #9CA3AF;     /* 提示文字 */
--text-disabled: #D1D5DB;     /* 禁用文字 */

/* 背景色 */
--bg-primary: #FFFFFF;         /* 主背景 */
--bg-secondary: #F9FAFB;       /* 次背景 */
--bg-tertiary: #F3F4F6;        /* 三级背景 */

/* 边框色 */
--border-light: #E5E7EB;       /* 浅边框 */
--border-medium: #D1D5DB;      /* 中边框 */
--border-dark: #9CA3AF;        /* 深边框 */
```

### 2.3 功能色

```css
/* 爽点金 - 突出优质内容 */
--shuangdian-gold: #F59E0B;

/* 爆款红 - 突出热门 */
--baokuan-red: #EF4444;

/* 专业紫 - 突出AI能力 */
--ai-purple: #8B5CF6;
```

### 2.4 配色方案应用

#### 页面配色
- **首页背景**：渐变 `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **工作区背景**：浅灰 `#F9FAFB`
- **卡片背景**：纯白 `#FFFFFF` + 阴影

#### 按钮配色
- **主要按钮**：品牌主色渐变
- **次要按钮**：白色 + 品牌主色边框
- **成功按钮**：成功绿
- **危险按钮**：错误红

---

## 三、图标系统

### 3.1 图标库选择
使用 **Lucide React** - 现代简洁的图标库

安装：
```bash
pnpm add lucide-react
```

### 3.2 核心图标映射表

| 功能 | 图标名称 | 应用场景 |
|------|----------|----------|
| 首页 | Home | 导航栏首页入口 |
| 写作 | PenTool | 导航栏工作区入口 |
| 会员 | Crown | 导航栏会员入口 |
| 个人 | User | 导航栏个人中心入口 |
| 设置 | Settings | 设置页面 |
| 退出 | LogOut | 退出登录 |
| 登录 | LogIn | 登录页面 |
| 注册 | UserPlus | 注册页面 |
| 文档 | FileText | 文档管理 |
| 下载 | Download | 导出功能 |
| 上传 | Upload | 导入功能 |
| 复制 | Copy | 复制内容 |
| 刷新 | Refresh | 刷新内容 |
| 保存 | Save | 保存草稿 |
| 编辑 | Edit | 编辑功能 |
| 删除 | Trash | 删除功能 |
| 搜索 | Search | 搜索功能 |
| 筛选 | Filter | 筛选功能 |
| 排序 | ArrowUpDown | 排序功能 |
| 加载 | Loader | 加载状态 |
| 成功 | CheckCircle | 成功提示 |
| 错误 | XCircle | 错误提示 |
| 警告 | AlertTriangle | 警告提示 |
| 信息 | Info | 信息提示 |
| 星星 | Star | 评分、收藏 |
| 火焰 | Flame | 热门、爆款 |
| 爆炸 | Sparkles | 爽点 |
| 大脑 | Brain | AI能力 |
| 闪电 | Zap | 快速生成 |
| 时钟 | Clock | 时间统计 |
| 饼图 | PieChart | 数据统计 |
| 柱状图 | BarChart | 数据统计 |
| 线图 | TrendingUp | 趋势分析 |
| 锁 | Lock | 权限管理 |
| 解锁 | Unlock | 解锁功能 |
| 钱包 | Wallet | 会员付费 |
| 信用卡 | CreditCard | 支付方式 |
| 历史记录 | History | 使用记录 |
| 通知 | Bell | 通知中心 |
| 帮助 | HelpCircle | 帮助文档 |
| 外链 | ExternalLink | 外部链接 |
| 菜单 | Menu | 移动端菜单 |
| 关闭 | X | 关闭弹窗 |
| 展开 | ChevronDown | 展开内容 |
| 折叠 | ChevronUp | 折叠内容 |
| 左箭头 | ChevronLeft | 返回 |
| 右箭头 | ChevronRight | 前进 |
| 上箭头 | ChevronUp | 上一页 |
| 下箭头 | ChevronDown | 下一页 |
| 播放 | Play | 开始生成 |
| 暂停 | Pause | 暂停生成 |
| 停止 | Square | 停止生成 |
| 眼睛 | Eye | 查看详情 |
| 眼睛关闭 | EyeOff | 隐藏内容 |
| 书签 | Bookmark | 收藏功能 |
| 分享 | Share | 分享功能 |
| 评论 | MessageSquare | 评论功能 |
| 点赞 | ThumbsUp | 点赞功能 |
| 心形 | Heart | 喜欢、收藏 |
| 盾牌 | Shield | 安全保障 |
| 锁定 | LockCircle | 权限锁定 |
| 解锁 | UnlockCircle | 权限解锁 |

### 3.3 图标使用规范

#### 尺寸规范
```tsx
{/* 大图标 - 32px */}
<Icon size={32} />

{/* 中图标 - 24px（默认）*/}
<Icon size={24} />

{/* 小图标 - 16px */}
<Icon size={16} />

{/* 超小图标 - 12px */}
<Icon size={12} />
```

#### 颜色规范
```tsx
{/* 品牌色 */}
<Icon className="text-indigo-500" />

{/* 灰色 */}
<Icon className="text-gray-500" />

/* 成功色 */
<Icon className="text-green-500" />

/* 错误色 */
<Icon className="text-red-500" />
```

---

## 四、排版系统

### 4.1 字体家族
```css
/* 主字体 */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;

/* 代码字体 */
--font-mono: 'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
```

### 4.2 字体大小

```css
/* 标题层级 */
--text-4xl: 2.25rem;    /* 36px - 页面标题 */
--text-3xl: 1.875rem;   /* 30px - 区块标题 */
--text-2xl: 1.5rem;     /* 24px - 卡片标题 */
--text-xl: 1.25rem;     /* 20px - 小标题 */
--text-lg: 1.125rem;    /* 18px - 重要文本 */
--text-base: 1rem;      /* 16px - 正文 */
--text-sm: 0.875rem;    /* 14px - 次要文本 */
--text-xs: 0.75rem;     /* 12px - 辅助文本 */
```

### 4.3 字重

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 4.4 行高

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

---

## 五、间距系统

### 5.1 间距单位

```css
--spacing-0: 0;
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
```

### 5.2 常用间距

```tsx
{/* 元素内间距 */}
className="p-4"    /* 16px */
className="p-6"    /* 24px */
className="p-8"    /* 32px */

{/* 元素外间距 */}
className="m-4"    /* 16px */
className="m-6"    /* 24px */
className="m-8"    /* 32px */

{/* 元素上下间距 */}
className="py-4"   /* 16px */
className="py-6"   /* 24px */
className="py-8"   /* 32px */

{/* 元素左右间距 */}
className="px-4"   /* 16px */
className="px-6"   /* 24px */
className="px-8"   /* 32px */

{/* 元素间距 */}
className="gap-4"  /* 16px */
className="gap-6"  /* 24px */
className="gap-8"  /* 32px */
```

---

## 六、阴影系统

### 6.1 阴影层级

```css
/* 微阴影 - 卡片悬浮 */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* 小阴影 - 默认卡片 */
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);

/* 中阴影 - 弹出层 */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* 大阴影 - 模态框 */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

/* 超大阴影 - 特殊效果 */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### 6.2 应用场景

```tsx
{/* 卡片默认阴影 */}
className="shadow-md"

{/* 卡片悬浮阴影 */}
className="shadow-lg hover:shadow-xl transition-shadow"

{/* 模态框阴影 */}
className="shadow-2xl"
```

---

## 七、圆角系统

### 7.1 圆角层级

```css
/* 无圆角 */
--rounded-none: 0;

/* 小圆角 - 按钮、标签 */
--rounded-sm: 0.125rem;    /* 2px */

/* 中圆角 - 输入框 */
--rounded: 0.25rem;         /* 4px */

/* 中大圆角 - 卡片 */
--rounded-md: 0.375rem;     /* 6px */

/* 大圆角 - 大卡片 */
--rounded-lg: 0.5rem;       /* 8px */

/* 超大圆角 - 弹窗 */
--rounded-xl: 0.75rem;      /* 12px */

/* 全圆角 - 标签、徽章 */
--rounded-full: 9999px;
```

### 7.2 应用场景

```tsx
{/* 按钮圆角 */}
className="rounded-md"

{/* 输入框圆角 */}
className="rounded-lg"

{/* 卡片圆角 */}
className="rounded-xl"

{/* 标签圆角 */}
className="rounded-full"
```

---

## 八、动画系统

### 8.1 动画时长

```css
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

### 8.2 常用动画

```tsx
{/* 淡入 */}
className="animate-in fade-in"

{/* 淡出 */}
className="animate-out fade-out"

{/* 滑入 */}
className="animate-in slide-in-from-bottom"

{/* 缩放 */}
className="animate-in zoom-in"

{/* 旋转 */}
className="animate-spin"

{/* 弹跳 */}
className="animate-bounce"

{/* 悬浮效果 */}
className="hover:scale-105 transition-transform duration-200"

{/* 阴影效果 */}
className="hover:shadow-lg transition-shadow duration-200"
```

---

## 九、组件规范

### 9.1 按钮组件

```tsx
{/* 主要按钮 */}
<button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
  立即开始
</button>

{/* 次要按钮 */}
<button className="bg-white text-indigo-600 border-2 border-indigo-500 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-all">
  了解更多
</button>

{/* 危险按钮 */}
<button className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-all">
  删除
</button>

{/* 禁用按钮 */}
<button className="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-medium cursor-not-allowed" disabled>
  禁用
</button>
```

### 9.2 卡片组件

```tsx
{/* 基础卡片 */}
<div className="bg-white rounded-xl shadow-md p-6">
  <h3 className="text-xl font-bold text-gray-900 mb-4">卡片标题</h3>
  <p className="text-gray-600">卡片内容</p>
</div>

{/* 悬浮卡片 */}
<div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6">
  {/* 内容 */}
</div>

{/* 功能卡片 */}
<div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
  <div className="flex items-center gap-4 mb-4">
    <Icon size={32} className="text-white" />
    <h3 className="text-2xl font-bold">功能标题</h3>
  </div>
  <p className="text-white/90">功能描述</p>
</div>
```

### 9.3 输入框组件

```tsx
{/* 文本输入框 */}
<input
  type="text"
  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
  placeholder="请输入内容"
/>

{/* 多行文本框 */}
<textarea
  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors resize-none"
  rows={6}
  placeholder="请输入内容"
/>

{/* 带图标的输入框 */}
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
  <input
    type="text"
    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
    placeholder="请输入内容"
  />
</div>
```

### 9.4 标签组件

```tsx
{/* 默认标签 */}
<span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
  标签
</span>

{/* 成功标签 */}
<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
  已完成
</span>

{/* 警告标签 */}
<span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
  进行中
</span>

{/* 错误标签 */}
<span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
  已失败
</span>
```

### 9.5 加载组件

```tsx
{/* 加载中 */}
<div className="flex items-center justify-center">
  <Loader className="animate-spin text-indigo-500" size={32} />
  <span className="ml-3 text-gray-600">加载中...</span>
</div>

{/* 按钮加载中 */}
<button className="bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium cursor-not-allowed opacity-75" disabled>
  <Loader className="animate-spin inline mr-2" size={16} />
  加载中...
</button>
```

---

## 十、响应式设计

### 10.1 断点

```css
/* 移动端 */
--breakpoint-sm: 640px;

/* 平板 */
--breakpoint-md: 768px;

/* 桌面 */
--breakpoint-lg: 1024px;

/* 大屏幕 */
--breakpoint-xl: 1280px;

/* 超大屏幕 */
--breakpoint-2xl: 1536px;
```

### 10.2 响应式类

```tsx
{/* 响应式网格 */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 内容 */}
</div>

{/* 响应式字体 */}
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  响应式标题
</h1>

{/* 响应式间距 */}
<div className="p-4 md:p-6 lg:p-8">
  {/* 内容 */}
</div>

{/* 响应式显示 */}
<div className="hidden md:block">
  {/* 桌面端显示 */}
</div>
```

---

## 十一、深色模式

### 11.1 深色配色

```css
/* 深色背景 */
--dark-bg-primary: #111827;
--dark-bg-secondary: #1F2937;
--dark-bg-tertiary: #374151;

/* 深色文字 */
--dark-text-primary: #F9FAFB;
--dark-text-secondary: #D1D5DB;
--dark-text-tertiary: #9CA3AF;

/* 深色边框 */
--dark-border-light: #374151;
--dark-border-medium: #4B5563;
--dark-border-dark: #6B7280;
```

### 11.2 深色模式切换

```tsx
{/* 深色模式按钮 */}
<button className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 rounded-lg">
  <Sun className="hidden dark:block" size={20} />
  <Moon className="block dark:hidden" size={20} />
</button>
```

---

## 十二、微交互动画

### 12.1 按钮交互动画

```tsx
{/* 悬浮缩放 */}
<button className="transform hover:scale-105 transition-transform duration-200">
  点击
</button>

{/* 点击缩放 */}
<button className="transform active:scale-95 transition-transform duration-150">
  点击
</button>

{/* 阴影变化 */}
<button className="shadow-md hover:shadow-xl transition-shadow duration-200">
  点击
</button>
```

### 12.2 卡片交互动画

```tsx
{/* 悬浮上浮 */}
<div className="transform hover:-translate-y-1 transition-transform duration-300">
  {/* 卡片内容 */}
</div>

{/* 悬浮放大 */}
<div className="transform hover:scale-105 transition-transform duration-300">
  {/* 卡片内容 */}
</div>

{/* 悬浮阴影 */}
<div className="shadow-md hover:shadow-2xl transition-shadow duration-300">
  {/* 卡片内容 */}
</div>
```

### 12.3 输入框交互动画

```tsx
{/* 聚焦边框 */}
<input className="border-gray-200 focus:border-indigo-500 transition-colors" />

{/* 聚焦阴影 */}
<input className="focus:shadow-lg focus:shadow-indigo-500/20 transition-shadow" />
```

---

## 十三、品牌Logo设计指南

### 13.1 Logo设计原则
- 简洁易识别
- 体现AI智能特征
- 符合番茄小说品牌调性
- 适合多场景应用

### 13.2 Logo配色方案
- 主色：Indigo（智慧蓝）#6366F1
- 辅色：Purple（AI紫）#8B5CF6
- 点缀色：Orange（爽点金）#F59E0B

### 13.3 Logo变体
- 彩色版本：品牌色渐变
- 单色版本：纯色适配
- 反色版本：深色背景适配
- 图标版本：仅使用图标

---

## 十四、页面设计规范

### 14.1 首页
- **英雄区域**：渐变背景 + 大标题 + CTA按钮
- **功能展示**：3列网格布局 + 图标 + 标题 + 描述
- **数据展示**：渐变背景 + 数字 + 标签
- **定价展示**：3列卡片布局 + 功能对比

### 14.2 登录/注册页
- **布局**：居中卡片 + 上下留白
- **表单**：垂直排列 + 图标 + 输入框 + 按钮
- **提示**：友好的错误提示 + 成功提示

### 14.3 工作区
- **布局**：左侧导航 + 右侧内容区（桌面端）
- **标签页**：横向标签 + 图标 + 文字
- **表单**：多行输入框 + 参数配置 + 生成按钮
- **输出区**：大文本框 + 操作按钮栏

### 14.4 定价页
- **布局**：标题 + 周期切换 + 卡片 + 对比表
- **卡片**：价格 + 功能列表 + CTA按钮
- **标签**：推荐标签 + 省钱标签

---

## 十五、无障碍设计

### 15.1 颜色对比度
- 文字与背景对比度 > 4.5:1
- 大文字与背景对比度 > 3:1
- 交互元素对比度 > 3:1

### 15.2 语义化标签
- 使用正确的HTML语义化标签
- 添加ARIA属性
- 确保键盘可访问性

### 15.3 屏幕阅读器
- 添加alt属性
- 使用aria-label
- 提供文本替代

---

## 十六、性能优化

### 16.1 图片优化
- 使用WebP格式
- 响应式图片
- 懒加载

### 16.2 代码优化
- 代码分割
- 懒加载组件
- 优化bundle大小

### 16.3 缓存策略
- 静态资源缓存
- API响应缓存
- Service Worker

---

## 十七、维护与更新

### 17.1 版本管理
- 设计文档版本化
- 更新日志记录
- 变更通知

### 17.2 设计规范检查清单
- [ ] 颜色使用正确
- [ ] 图标使用规范
- [ ] 间距符合系统
- [ ] 字体大小正确
- [ ] 圆角统一
- [ ] 阴影合理
- [ ] 动画流畅
- [ ] 响应式适配

---

**文档版本**：v1.0
**最后更新**：2025-01-XX
**维护人**：番茄AI写作助手设计团队
