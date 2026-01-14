# 数据库连接信息更新

## 重要更新

### 数据库连接信息已更新

**新连接字符串：**
```
postgresql://postgres:izyXumPX6k3wQmfN@db.wxbhkjxfcwcjaguoapxy.supabase.co:5432/postgres?sslmode=require
```

**数据库密码：**
```
izyXumPX6k3wQmfN
```

## 操作步骤

### 本地开发环境
- ✅ 已更新 `.env.local` 文件
- ✅ 自动降级机制已启用
- ⚠️  当前仍使用 Mock 模式（沙箱环境 IPv6 限制）
- ℹ️  生产环境将使用真实数据库

### Netlify 生产环境
需要在 Netlify Dashboard 中手动更新环境变量：

1. **登录 Netlify Dashboard**
   - 访问：https://app.netlify.com
   - 选择项目：tomato-ai-writer

2. **更新环境变量**
   - 进入：Site settings → Environment variables
   - 找到并更新 `DATABASE_URL`
   - 新值：
     ```
     postgresql://postgres:izyXumPX6k3wQmfN@db.wxbhkjxfcwcjaguoapxy.supabase.co:5432/postgres?sslmode=require
     ```

3. **重新部署**
   - 保存环境变量后，Netlify 会自动触发重新部署
   - 或者手动触发：Deploys → Trigger deploy → Deploy site

4. **验证部署**
   - 等待部署完成（2-3 分钟）
   - 访问健康检查 API：`https://your-site.netlify.app/api/health`
   - 确认 `database.mode` 为 `real`

## 验证步骤

### 本地环境测试
```bash
# 健康检查
curl http://localhost:5000/api/health

# 用户注册
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!","username":"TestUser"}'
```

### 生产环境测试
```bash
# 替换为你的 Netlify 站点 URL
SITE_URL="https://your-site.netlify.app"

# 健康检查
curl $SITE_URL/api/health

# 预期响应（真实数据库模式）
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "ok",
      "mode": "real",
      "message": "数据库连接正常"
    }
  }
}

# 用户注册
curl -X POST $SITE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!","username":"TestUser"}'
```

## 预期结果

### 本地环境（沙箱）
```
database: {
  "status": "ok",
  "mode": "auto-mock",
  "message": "自动降级模式：真实数据库不可用，使用Mock模式",
  "details": {
    "autoFallback": true,
    "lastError": "connect ENETUNREACH..."
  }
}
```

### 生产环境（Netlify）
```
database: {
  "status": "ok",
  "mode": "real",
  "message": "数据库连接正常",
  "details": {
    "autoFallback": false,
    "lastError": null
  }
}
```

## 注意事项

### 安全建议
1. ⚠️  不要在代码中硬编码密码
2. ⚠️  不要将 `.env.local` 提交到 Git
3. ⚠️  定期更换数据库密码
4. ⚠️  限制 Supabase 数据库访问 IP

### 自动降级机制
- 本地环境：IPv6 限制，自动降级到 Mock 模式
- 生产环境：真实数据库连接正常，使用 real 模式
- 故障处理：如果真实数据库连接失败，自动降级到 Mock 模式

### 故障排查

**问题 1：Netlify 仍然显示 auto-mock 模式**
```
解决方案：
1. 检查 Netlify Dashboard 环境变量是否已更新
2. 确认重新部署已完成
3. 查看 Netlify Functions 日志
4. 检查 Supabase 数据库是否在线
```

**问题 2：用户注册失败**
```
解决方案：
1. 检查数据库连接状态
2. 验证 Supabase 数据库表是否已创建
3. 查看详细的错误日志
```

**问题 3：API 响应超时**
```
解决方案：
1. 检查 Netlify Functions 日志
2. 确认数据库连接字符串正确
3. 验证 Supabase 数据库状态
```

## 相关文档

- 数据库配置指南：`docs/DATABASE.md`
- 修复总结：`BUGFIX_SUMMARY.md`
- Supabase Dashboard：https://supabase.com/dashboard
- Netlify Dashboard：https://app.netlify.com

## 更新日志

### v2.1.0 (2026-01-14)
- 🔄 更新数据库连接字符串
- 🔑 更新数据库密码
- 📝 创建部署更新指南
- ✅ 验证本地环境（自动降级模式）
- ⏳ 等待 Netlify 生产环境更新

---

**状态**：✅ 本地配置已更新，⏳ 等待 Netlify 环境变量更新
**下一步**：在 Netlify Dashboard 中更新 DATABASE_URL 环境变量
**预计时间**：更新后 2-3 分钟部署完成
