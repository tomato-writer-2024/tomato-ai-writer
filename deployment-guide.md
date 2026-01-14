# Netlify 部署监控与测试指南

## 📦 代码推送完成

```
✅ 推送成功：main 分支
✅ 2个新提交：
   - fix: 修复 TypeScript 类型错误（migrate.ts 中 pool null 检查）
   - fix: 诊断并记录沙箱环境数据库连接限制问题（IPv6 only, ENETUNREACH）
```

## 🔄 Netlify 自动构建

### 构建流程（预计 2-3 分钟）

1. **检测到新提交** (30秒)
   - GitHub webhook 触发 Netlify 构建

2. **环境准备** (30秒)
   - 拉取最新代码
   - 安装依赖（pnpm install）
   - 设置环境变量（DATABASE_URL, DATABASE_MOCK_MODE=false）

3. **构建阶段** (1-2分钟)
   - 运行 `npm run build`
   - TypeScript 类型检查
   - Next.js 编译
   - 生成优化后的生产构建

4. **部署阶段** (30秒)
   - 上传 .next 目录
   - 配置 Netlify Functions
   - 分发到 CDN

5. **部署完成**
   - 新版本在线上生效
   - 可访问的 URL

## 🧪 部署后测试

### 1. 检查 Netlify Dashboard
登录 Netlify 查看：
- Deploys → 查看构建状态
- Site overview → 查看部署 URL

### 2. 测试真实数据库连接

**健康检查 API：**
```bash
curl https://your-site.netlify.app/api/health
```

**预期响应（真实数据库模式）：**
```json
{
  "status": "healthy",
  "checks": {
    "environment": {
      "status": "ok",
      "details": {
        "DATABASE_URL": true,
        "DATABASE_MOCK_MODE": false
      }
    },
    "database": {
      "status": "ok",
      "message": "数据库连接成功",
      "mode": "real"
    }
  }
}
```

### 3. 测试完整功能流程

**创建超级管理员：**
```bash
curl -X POST https://your-site.netlify.app/api/init-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tomato-writer.com",
    "password": "Admin123456!",
    "username": "超级管理员"
  }'
```

**用户注册测试：**
```bash
curl -X POST https://your-site.netlify.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "username": "测试用户"
  }'
```

**用户登录测试：**
```bash
curl -X POST https://your-site.netlify.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!"
  }'
```

## 🔍 故障排查

### 如果构建失败

**检查构建日志：**
1. 登录 Netlify Dashboard
2. 选择项目
3. Deploys → 失败的构建 → View deploy log

**常见问题：**
- TypeScript 类型错误 → 检查本地 `pnpm run build` 是否通过
- 环境变量缺失 → 在 Netlify Dashboard 中检查环境变量配置
- 依赖安装失败 → 检查 pnpm-lock.yaml 是否已提交

### 如果数据库连接失败

**检查 Supabase 状态：**
1. 登录 Supabase Dashboard
2. Database → 查看数据库是否在线
3. Settings → Database → Connection pooling

**检查网络连接：**
```bash
# 在 Netlify Functions 日志中查看错误
curl https://your-site.netlify.app/api/health
```

**临时解决方案：**
在 Netlify Dashboard 中设置环境变量：
```
DATABASE_MOCK_MODE=true
```
这会启用 Mock 模式，确保系统可用。

## 📊 监控指标

### 成功指标
- ✅ 构建时间 < 3 分钟
- ✅ 首次加载时间 < 2 秒
- ✅ API 响应时间 < 1 秒
- ✅ 数据库连接成功
- ✅ 所有 API 端点正常

### 性能目标
- Lighthouse Score: 90+
- 首次内容绘制 (FCP): < 1.5s
- 最大内容绘制 (LCP): < 2.5s
- API 响应时间: P95 < 500ms

## 🎯 下一步操作

1. **等待构建完成**（2-3 分钟）
2. **访问 Netlify Dashboard** 检查构建状态
3. **测试健康检查 API** 验证数据库连接
4. **创建超级管理员** 进行功能测试
5. **验证核心功能**（注册、登录、章节管理）
6. **监控生产环境** 检查日志和性能

## 📝 相关链接

- Netlify Dashboard: https://app.netlify.com
- 项目仓库: https://github.com/tomato-writer-2024/tomato-ai-writer
- Supabase Dashboard: https://supabase.com/dashboard
- 文档: /workspace/projects/README.md

---

**注意**：这是生产环境，请谨慎测试。建议先在测试账号上验证功能，再开放给真实用户。
