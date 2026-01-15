# 🚀 快速修复指南

## 问题
您在本地运行 `npm run dev` 时遇到字体错误：
```
Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'
```

## ⚡ 快速修复（3 步解决）

### 1. 停止开发服务器
按 `Ctrl + C` 停止正在运行的服务器

### 2. 清理缓存
```bash
npm run clean
```

或者手动删除：
```bash
# Windows
rmdir /s /q .next

# macOS/Linux
rm -rf .next
```

### 3. 重新启动
```bash
npm run dev
```

## ✅ 验证修复

访问以下地址确认修复成功：
- 首页：http://localhost:5000
- 管理员登录：http://localhost:5000/admin/login
- 字体测试：http://localhost:5000/font-test

修复成功后，您应该看到：
- ✅ 无字体相关错误
- ✅ 页面正常显示
- ✅ 使用 Inter 字体渲染

---

## 📖 详细说明

如果快速修复无效，请查看：
- **详细修复指南**：[FONT_FIX_GUIDE.md](./FONT_FIX_GUIDE.md)
- **修复总结**：[FONT_FIX_SUMMARY.md](./FONT_FIX_SUMMARY.md)

---

**注意**：代码已经全部修复，只需要清理本地缓存即可。
