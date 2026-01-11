# 番茄AI写作助手 - VI视觉识别系统

## 品牌概述

番茄AI写作助手是一款专为番茄小说平台创作者打造的AI辅助写作工具，旨在通过智能化、专业化的工具链，帮助创作者提升写作效率、优化内容质量，打造出符合平台Top3标准的优秀作品。

## 1. 品牌理念

### 1.1 核心价值观
- **专业专注**：深耕番茄小说平台，理解平台调性和读者喜好
- **质量至上**：以9.8分+为质量标准，追求内容卓越
- **高效创作**：AI赋能，解放创作者，让创作更轻松
- **原创合规**：确保内容原创性，符合平台审核要求

### 1.2 品牌定位
- 专业级AI写作辅助工具
- 番茄小说创作者的必备利器
- 从灵感到成稿的全流程解决方案

### 1.3 品牌个性
- 专业可靠
- 现代科技
- 高效便捷
- 创意无限

## 2. 色彩系统

### 2.1 主色调

#### 品牌主色 - 青蓝色渐变
- **渐变起始色**：Cyan-500 (#06B6D4)
- **渐变结束色**：Blue-600 (#2563EB)
- **应用场景**：品牌Logo、主按钮、关键交互元素、品牌标识

```css
/* Tailwind CSS */
bg-gradient-to-br from-cyan-500 to-blue-600
bg-gradient-to-r from-cyan-500 to-blue-600
text-cyan-600
text-blue-600
```

### 2.2 辅助色

#### 辅助色1 - 紫色系（创意与灵感）
- **浅紫色**：Purple-400 (#C084FC)
- **深紫色**：Purple-600 (#9333EA)
- **应用场景**：创意工具、灵感模块、智能推荐

```css
bg-gradient-to-br from-purple-500 to-pink-600
from-purple-400 to-purple-600
```

#### 辅助色2 - 琥珀色（成就与热门）
- **浅琥珀色**：Amber-400 (#FBBF24)
- **深琥珀色**：Amber-600 (#D97706)
- **应用场景**：热门标签、成就标识、会员等级

```css
bg-gradient-to-br from-amber-500 to-orange-600
text-amber-500
```

#### 辅助色3 - 绿色系（成功与质量）
- **浅绿色**：Emerald-400 (#34D399)
- **深绿色**：Emerald-600 (#059669)
- **应用场景**：成功提示、质量评分、数据统计

```css
bg-gradient-to-br from-emerald-500 to-teal-600
text-emerald-600
```

### 2.3 中性色

#### 文本颜色
- **主要文本**：Slate-900 (#0F172A)
- **次要文本**：Slate-600 (#475569)
- **辅助文本**：Slate-500 (#64748B)

#### 背景颜色
- **主背景**：Slate-50 (#F8FAFC)
- **次背景**：White (#FFFFFF)
- **深色背景**：Slate-900 (#0F172A)
- **卡片背景**：White/80 (rgba(255, 255, 255, 0.8))

#### 边框颜色
- **主边框**：Slate-200 (#E2E8F0)
- **深色边框**：Slate-700 (#334155)

### 2.4 语义颜色

#### 成功
- 绿色系：Emerald-500 to Emerald-600
- 应用：成功提示、完成状态、质量达标

#### 警告
- 琥珀色系：Amber-500 to Amber-600
- 应用：注意提示、会员提醒、操作确认

#### 错误
- 红色系：Red-500 to Red-600
- 应用：错误提示、失败状态、警告信息

#### 信息
- 青色系：Cyan-500 to Blue-600
- 应用：信息提示、功能说明、引导说明

### 2.5 渐变方案

#### 主渐变
```css
/* 从左上到右下 */
bg-gradient-to-br from-cyan-500 to-blue-600

/* 从左到右 */
bg-gradient-to-r from-cyan-500 to-blue-600
```

#### 功能分类渐变
```css
/* 角色设定 - 蓝色系 */
bg-gradient-to-br from-blue-500 to-indigo-600

/* 情节设计 - 紫色系 */
bg-gradient-to-br from-purple-500 to-pink-600

/* 智能写作 - 青色系 */
bg-gradient-to-br from-cyan-500 to-teal-600

/* 润色优化 - 琥珀色系 */
bg-gradient-to-br from-amber-500 to-orange-600

/* 创意工具 - 玫瑰色系 */
bg-gradient-to-br from-rose-500 to-red-600

/* 素材资源 - 绿色系 */
bg-gradient-to-br from-emerald-500 to-green-600
```

## 3. 字体系统

### 3.1 字体家族

#### 主字体 - Geist Sans
- **用途**：正文、标题、UI元素
- **特点**：现代、清晰、易读
- **来源**：Vercel Geist字体

#### 等宽字体 - Geist Mono
- **用途**：代码、数据、技术性内容
- **特点**：等宽、技术感、精确

#### 中文字体
- **优先级**：系统默认中文字体
- **备选**：PingFang SC, Microsoft YaHei, SimHei

### 3.2 字体大小

#### 标题层级
```css
/* H1 - 页面主标题 */
text-4xl (36px) - lg:text-5xl (48px)

/* H2 - 区块标题 */
text-3xl (30px) - lg:text-4xl (36px)

/* H3 - 卡片标题 */
text-xl (20px) - lg:text-2xl (24px)

/* H4 - 次级标题 */
text-lg (18px) - lg:text-xl (20px)
```

#### 正文层级
```css
/* 正文 - 主要内容 */
text-base (16px)

/* 正文 - 次要内容 */
text-sm (14px)

/* 辅助文字 */
text-xs (12px)
```

### 3.3 字重
```css
font-light (300)  - 轻盈，用于次要信息
font-normal (400) - 正常，用于正文
font-medium (500) - 中等，用于标题
font-semibold (600) - 半粗，用于重要标题
font-bold (700)   - 粗体，用于强调
```

### 3.4 行高
```css
leading-tight (1.25) - 紧凑，用于标题
leading-normal (1.5) - 正常，用于正文
leading-relaxed (1.625) - 宽松，用于阅读内容
```

## 4. 图标系统

### 4.1 图标库

#### Lucide React - 主图标库
- **特点**：现代、一致、轻量
- **版本**：最新版
- **来源**：lucide-react

#### 自定义图标
- **Logo**：品牌标识
- **品牌图标**：Writing, AI, Star, Award, Crown, Sparkle, Zap, Rocket, User, Stats

### 4.2 图标尺寸规范

```css
/* 超小图标 */
size={12} - 标签内图标

/* 小图标 */
size={14} - 文本内图标
size={16} - 列表项图标

/* 中等图标 */
size={18} - 按钮图标
size={20} - 导航图标

/* 大图标 */
size={24} - 卡片图标
size={28} - 页面Logo
size={32} - 加载图标

/* 超大图标 */
size={48} - 页面主图标
size={64} - 空状态图标
```

### 4.3 图标颜色规范

```css
/* 主色图标 */
text-cyan-600
text-blue-600

/* 功能色图标 */
text-purple-600 - 创意类
text-amber-600 - 热门/成就
text-emerald-600 - 成功/质量
text-rose-600 - 警告/错误

/* 中性色图标 */
text-slate-600 - 正常状态
text-slate-400 - 辅助状态
text-slate-300 - 禁用状态
```

### 4.4 图标背景规范

```css
/* 主色背景 */
bg-gradient-to-br from-cyan-500 to-blue-600 text-white

/* 浅色背景 */
bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300

/* 功能色背景 */
bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400
bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400
bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400
```

## 5. 间距系统

### 5.1 间距比例 - 4px基准

```css
/* 极小间距 */
p-0.5 (2px)
p-1 (4px)

/* 小间距 */
p-1.5 (6px)
p-2 (8px)

/* 正常间距 */
p-3 (12px)
p-4 (16px)

/* 中等间距 */
p-5 (20px)
p-6 (24px)
p-8 (32px)

/* 大间距 */
p-10 (40px)
p-12 (48px)
p-16 (64px)
```

### 5.2 内边距应用

```css
/* 按钮 */
px-4 py-2 - 小按钮
px-6 py-3 - 正常按钮
px-8 py-4 - 大按钮

/* 卡片 */
p-4 - 小卡片
p-6 - 正常卡片
p-8 - 大卡片

/* 输入框 */
px-4 py-2 - 正常输入框
```

### 5.3 外边距应用

```css
/* 元素间距 */
gap-2 (8px) - 紧密排列
gap-3 (12px) - 正常排列
gap-4 (16px) - 宽松排列
gap-6 (24px) - 区块间距

/* 页面边距 */
p-4 (16px) - 移动端
p-6 (24px) - 平板
p-8 (32px) - 桌面
```

## 6. 圆角系统

```css
/* 极小圆角 */
rounded-sm - 按钮小元素

/* 小圆角 */
rounded-lg - 卡片小元素
rounded-xl - 按钮、输入框

/* 中等圆角 */
rounded-2xl - 卡片、模态框

/* 大圆角 */
rounded-3xl - 弹窗、浮层

/* 完全圆角 */
rounded-full - 标签、头像
```

## 7. 阴影系统

```css
/* 浅阴影 */
shadow-sm - 轻微悬浮

/* 正常阴影 */
shadow - 标准卡片

/* 大阴影 */
shadow-lg - 重要卡片

/* 超大阴影 */
shadow-xl - 弹窗、浮层
shadow-2xl - 重要交互元素

/* 彩色阴影 */
shadow-cyan-500/25 - 主色阴影
```

## 8. 组件样式规范

### 8.1 按钮

#### 主按钮（渐变）
```tsx
<GradientButton>
  className="bg-gradient-to-r from-cyan-500 to-blue-600"
  按钮文本
</GradientButton>
```

#### 次要按钮（轮廓）
```tsx
<Button variant="outline">
  边框按钮
</Button>
```

#### 幽灵按钮
```tsx
<Button variant="ghost">
  幽灵按钮
</Button>
```

### 8.2 卡片

#### 标准卡片
```tsx
<Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg
  border border-slate-200/50 dark:border-slate-700/50
  rounded-2xl shadow-lg
  hover:shadow-xl hover:scale-105 transition-all">
</Card>
```

#### 玻璃态卡片
```tsx
<div className="bg-white/80 dark:bg-slate-800/80
  backdrop-blur-lg
  border border-slate-200/50 dark:border-slate-700/50">
</div>
```

### 8.3 输入框

```tsx
<input className="w-full px-4 py-2
  rounded-xl border border-slate-200
  bg-slate-50
  focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200
  dark:border-slate-700 dark:bg-slate-800
  transition-all" />
```

### 8.4 标签

```tsx
<span className="inline-flex items-center gap-1
  px-2 py-0.5 rounded-full
  bg-cyan-100 dark:bg-cyan-900/30
  text-cyan-600 dark:text-cyan-400
  text-xs font-medium">
  标签文本
</span>
```

## 9. 响应式断点

```css
/* 移动端 */
sm (640px) - 小手机

/* 平板 */
md (768px) - 平板竖屏
lg (1024px) - 平板横屏/小桌面

/* 桌面 */
xl (1280px) - 桌面
2xl (1536px) - 大桌面
```

## 10. 动画与过渡

### 10.1 过渡时长
```css
duration-150 (150ms) - 快速交互
duration-200 (200ms) - 正常交互
duration-300 (300ms) - 标准过渡
duration-500 (500ms) - 慢速过渡
```

### 10.2 常用动画
```css
/* 悬停效果 */
hover:scale-105 - 轻微放大
hover:scale-110 - 明显放大
hover:shadow-xl - 阴影增强

/* 淡入淡出 */
opacity-0 to opacity-100

/* 滑动 */
transform -translate-x-full to translate-x-0

/* 旋转 */
hover:rotate-90
```

### 10.3 加载动画
```css
/* 旋转加载 */
animate-spin

/* 脉冲加载 */
animate-pulse

/* 弹跳加载 */
animate-bounce
```

## 11. 暗色模式

### 11.1 颜色映射

| 元素 | 亮色模式 | 暗色模式 |
|------|---------|---------|
| 背景 | Slate-50 | Slate-950 |
| 卡片 | White/80 | Slate-800/80 |
| 文本主色 | Slate-900 | Slate-100 |
| 文本次色 | Slate-600 | Slate-400 |
| 边框 | Slate-200 | Slate-700 |
| 输入框背景 | Slate-50 | Slate-800 |

### 11.2 实现方式
```tsx
<div className="bg-slate-50 dark:bg-slate-950
  text-slate-900 dark:text-slate-100">
</div>
```

## 12. 品牌应用规范

### 12.1 Logo使用

#### Logo尺寸规范
- **最小尺寸**：24px (小图标)
- **标准尺寸**：28px (导航Logo)
- **大尺寸**：48px (页面Logo)

#### Logo间距
- 左右间距：12px
- 上下间距：8px
- 禁止修改Logo比例

### 12.2 品牌色彩应用

#### 主色使用比例
- **主色（青蓝渐变）**：60% - 品牌标识、主按钮、关键交互
- **辅助色（紫/琥珀/绿）**：30% - 功能分类、标签、提示
- **中性色（Slate）**：10% - 背景、文本、边框

#### 颜色搭配禁忌
- ❌ 避免使用纯黑、纯白
- ❌ 避免过度使用鲜艳色
- ❌ 避免不符合品牌调性的颜色组合
- ✅ 使用品牌色渐变系统
- ✅ 保持色彩层次和对比度

### 12.3 字体使用规范

#### 排版原则
- 标题使用较粗字重（Semibold/Bold）
- 正文使用正常字重（Normal/Medium）
- 辅助文字使用较轻字重（Light/Normal）
- 保持字体层次清晰

## 13. 用户体验原则

### 13.1 可访问性
- 确保颜色对比度符合WCAG 2.1 AA标准
- 提供足够的点击区域（最小44x44px）
- 支持键盘导航
- 为图标提供文本描述

### 13.2 反馈与提示
- 操作及时反馈（200ms内）
- 错误提示清晰明确
- 成功提示简洁明了
- 警告提示引起注意但不打扰

### 13.3 性能要求
- 首屏加载 < 2秒
- 交互响应 < 100ms
- 动画帧率 60fps
- 图片懒加载和优化

## 14. 更新与维护

### 14.1 版本控制
- VI系统版本号：v1.0.0
- 更新日期：2025-01-11
- 维护团队：番茄AI写作助手设计团队

### 14.2 更新原则
- 重大更新需要团队评审
- 向后兼容性考虑
- 文档同步更新
- 示例代码更新

---

**备注**：本VI系统是番茄AI写作助手的核心设计规范，所有设计和开发工作必须严格遵循。如有疑问或建议，请联系设计团队。
