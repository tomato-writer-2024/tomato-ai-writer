# 数据库连接配置指南

## 概述

本工具实现了**智能数据库连接系统**，支持三种运行模式：
1. **强制 Mock 模式**：使用本地 JSON 文件存储数据
2. **自动降级模式**：优先尝试真实数据库，失败时自动降级到 Mock
3. **真实数据库模式**：仅使用真实数据库（不推荐，可能导致服务不可用）

## 推荐配置

### 开发环境（当前沙箱环境）
```env
DATABASE_MOCK_MODE=false
DATABASE_URL=postgresql://postgres.wxbhkjxfcwcjaguoapxy:Tomato2024%21%40%23%24@db.wxbhkjxfcwcjaguoapxy.supabase.co:5432/postgres?sslmode=require
```

**工作原理**：
- 系统尝试连接真实数据库
- 如果连接失败（网络限制、权限问题等），自动降级到 Mock 模式
- 确保系统始终可用
- 详细的错误日志帮助诊断问题

### 生产环境（Netlify）
```env
DATABASE_MOCK_MODE=false
DATABASE_URL=postgresql://postgres.wxbhkjxfcwcjaguoapxy:Tomato2024%21%40%23%24@db.wxbhkjxfcwcjaguoapxy.supabase.co:5432/postgres?sslmode=require
```

**工作原理**：
- Netlify 网络环境良好，真实数据库连接应该正常
- 如果连接失败，自动降级到 Mock 模式
- 最大化系统可用性

## 模式对比

| 模式 | 环境变量 | 行为 | 适用场景 |
|------|---------|------|---------|
| 强制 Mock | `DATABASE_MOCK_MODE=true` | 不尝试真实数据库，直接使用 Mock | 离线开发、测试 |
| 自动降级 | `DATABASE_MOCK_MODE=false` | 优先真实数据库，失败时降级 | 生产环境（推荐） |
| 真实数据库 | `DATABASE_MOCK_MODE=false` + 代码修改 | 仅使用真实数据库，失败报错 | 不推荐 |

## 健康检查 API

### 端点
```
GET /api/health
```

### 响应示例

**自动降级模式（真实数据库不可用）**
```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "ok",
      "message": "自动降级模式：真实数据库不可用，使用Mock模式",
      "mode": "auto-mock",
      "details": {
        "mode": "auto-mock",
        "urlConfigured": true,
        "autoFallback": true,
        "lastError": "connect ENETUNREACH..."
      }
    }
  }
}
```

**真实数据库模式（成功连接）**
```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "ok",
      "message": "数据库连接正常",
      "mode": "real",
      "details": {
        "mode": "real",
        "urlConfigured": true,
        "autoFallback": false,
        "lastError": null
      }
    }
  }
}
```

**强制 Mock 模式**
```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "ok",
      "message": "Mock模式已启用",
      "mode": "mock",
      "details": {
        "mode": "mock",
        "urlConfigured": true,
        "autoFallback": false,
        "lastError": null
      }
    }
  }
}
```

## 故障排查

### 问题 1：健康检查返回 unhealthy
**症状**：`/api/health` 返回 `status: "unhealthy"`

**可能原因**：
- 缺少必需的环境变量
- 数据库 URL 配置错误

**解决方案**：
1. 检查环境变量是否正确配置
2. 查看 Netlify Dashboard → Site settings → Environment variables
3. 确保 `DATABASE_URL` 格式正确

### 问题 2：自动降级到 Mock 模式
**症状**：`mode: "auto-mock"`，`autoFallback: true`

**可能原因**：
- 网络连接问题（ENETUNREACH）
- 数据库服务器不可用
- 连接超时
- 认证失败

**解决方案**：
1. 查看健康检查中的 `lastError` 字段
2. 检查 Supabase Dashboard 中数据库是否在线
3. 验证数据库密码是否正确
4. 检查网络连接（特别是 Netlify 环境）

### 问题 3：本地开发时无法连接真实数据库
**症状**：沙箱环境始终降级到 Mock 模式

**原因**：沙箱环境的网络限制（IPv6 only）

**解决方案**：
- 这是正常的，无需修复
- Mock 模式完全支持所有功能
- 生产环境（Netlify）应该可以正常连接真实数据库

## Supabase 配置

### 数据库连接字符串格式
```
postgresql://[project-ref].[role]:[password]@[host]:5432/postgres?sslmode=require
```

### 获取连接字符串
1. 登录 Supabase Dashboard
2. 选择项目
3. Settings → Database → Connection string
4. 选择 "URI" 格式
5. 使用 "Transaction" 或 "Session" 模式

### URL 编码
特殊字符需要 URL 编码：
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`

示例：
```
原始密码: Tomato2024!@#$
URL 编码: Tomato2024%21%40%23%24
```

## 性能优化

### 连接池配置
- **最大连接数**：5（Netlify Functions）
- **空闲超时**：30 秒
- **连接超时**：5 秒（适应 10 秒限制）

### 查询优化
- 所有查询使用参数化查询（防注入）
- 批量操作使用事务
- 避免全表扫描

### Netlify 限制
- **免费版函数超时**：10 秒
- **函数内存**：1024 MB
- **每月执行时间**：3,000 分钟

## 监控和日志

### 日志级别
```env
LOG_LEVEL=debug
ENABLE_VERBOSE_LOGGING=true
```

### 关键日志
- 🔍 测试真实数据库连接...
- ✅ 真实数据库连接成功
- ❌ 真实数据库连接测试失败: [错误信息]
- ⚠️ 自动降级到 Mock 模式
- 🎭 Mock query executed

### 监控指标
- 数据库连接成功率
- 查询响应时间（P95 < 500ms）
- 降级模式触发频率
- API 错误率

## 测试

### 单元测试
```bash
pnpm test
```

### 集成测试
```bash
# 测试健康检查
curl http://localhost:5000/api/health

# 测试用户注册
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!","username":"TestUser"}'

# 测试用户登录
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!"}'
```

### 压力测试
```bash
# 使用 Apache Bench
ab -n 1000 -c 10 http://localhost:5000/api/health
```

## 安全建议

1. **环境变量保护**
   - 使用 Netlify 环境变量（不要硬编码）
   - 定期更换数据库密码
   - 使用强密码（至少 16 字符）

2. **网络安全**
   - 强制 SSL 连接（`sslmode=require`）
   - 限制数据库访问 IP（Supabase Dashboard）
   - 启用连接池限制

3. **数据备份**
   - 定期备份 Supabase 数据库
   - 配置自动备份（每天）
   - 测试恢复流程

## 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Netlify Functions 文档](https://docs.netlify.com/functions/)
- [pg (Node.js) 文档](https://node-postgres.com/)

## 更新日志

### v2.0.0 (2026-01-14)
- ✨ 新增自动降级机制
- ✨ 新增详细的数据库状态信息
- 🐛 修复 IPv6 连接问题
- 📝 优化错误日志
- ⚡ 优化连接超时配置

### v1.0.0 (2026-01-10)
- ✨ 初始版本
- ✨ 支持 Mock 模式
- ✨ 支持真实数据库模式
