# 字体问题修复指南

## 问题描述

在本地开发环境中运行 `npm run dev` 时，出现以下错误：

```
Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'
```

这是因为 Next.js 缓存了旧的 Geist 字体模块，即使代码已经更新为使用 Inter 字体，缓存仍然存在。

## 解决方案

### 方法一：自动清理（推荐）

1. 停止开发服务器（按 `Ctrl + C`）

2. 运行清理命令：
```bash
npm run clean
```

3. 重新启动开发服务器：
```bash
npm run dev
```

### 方法二：手动清理

如果方法一无效，可以手动删除 `.next` 目录：

```bash
# Windows
rmdir /s /q .next

# macOS/Linux
rm -rf .next
```

然后重新运行：
```bash
npm run dev
```

### 方法三：彻底清理（如果以上方法都无效）

```bash
# 删除所有缓存
rm -rf .next
rm -rf node_modules/.cache

# 重新安装依赖（可选，如果问题仍然存在）
# npm install

# 重新启动
npm run dev
```

## 技术细节

### 已完成的修复

1. ✅ 将 `layout.tsx` 中的 Geist 字体替换为 Inter + JetBrains Mono
2. ✅ 更新 `tailwind.config.js` 添加字体家族配置
3. ✅ 删除冲突的 `next.config.ts`（保留 `next.config.mjs`）
4. ✅ 添加 `clean` 脚本到 `package.json`
5. ✅ 修复 TypeScript 类型检查错误

### 为什么会出现这个问题？

1. **Next.js 缓存机制**：Next.js 在 `.next` 目录中缓存编译产物，包括字体模块
2. **Turbopack 的限制**：Turbopack 对 Google Fonts 的处理存在已知问题
3. **模块解析缓存**：即使更新了 `layout.tsx`，旧的 Geist 字体模块仍被缓存

### 字体配置

当前使用的字体：
- **主字体**：Inter（Google Fonts）
- **等宽字体**：JetBrains Mono（Google Fonts）

这些字体是经过验证的，与 Turbopack 完全兼容。

## 验证修复成功

修复成功后，你应该看到：

1. 开发服务器正常启动，无字体相关错误
2. 网站使用 Inter 字体渲染
3. TypeScript 编译通过
4. 构建成功（`npm run build`）

## 如果问题仍然存在

请提供以下信息：

1. Node.js 版本：`node -v`
2. Next.js 版本：`npm list next`
3. 错误日志的完整输出
4. 操作系统版本

## 相关链接

- Next.js 字体优化文档：https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Turbopack 已知问题：https://nextjs.org/docs/architecture/turbopack
