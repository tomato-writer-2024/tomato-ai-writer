# 数据库配置快速参考

## 🚀 5分钟快速配置（Neon）

```bash
# 1. 创建Neon数据库并获取连接字符串
# 访问: https://neon.tech/

# 2. 更新 .env.local
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
DATABASE_MOCK_MODE=false

# 3. 验证连接
npx tsx scripts/verify-neon-connection.ts

# 4. 创建表结构
npm run migrate

# 5. 重启服务
npm run dev

# 6. 测试健康检查
curl http://localhost:5000/api/health
```

## 📚 文档索引

| 文档 | 说明 | 适用场景 |
|------|------|----------|
| [NEON_MIGRATION_GUIDE.md](./NEON_MIGRATION_GUIDE.md) | 完整的10步迁移流程 | 首次迁移或详细配置 |
| [NEON_MIGRATION_CHECKLIST.md](./NEON_MIGRATION_CHECKLIST.md) | 分步骤检查清单 | 确保迁移完成 |
| [DATABASE_FIX_SUMMARY.md](./DATABASE_FIX_SUMMARY.md) | 数据库问题修复总结 | 了解当前问题和解决方案 |
| [DATABASE_DIAGNOSIS.md](./DATABASE_DIAGNOSIS.md) | 详细诊断指南 | 排查数据库连接问题 |
| [docs/DATABASE.md](./docs/DATABASE.md) | 数据库配置文档 | 了解数据库配置选项 |

## 🔍 诊断工具

### 1. 连接验证脚本
```bash
npx tsx scripts/verify-neon-connection.ts
```

### 2. 健康检查API
```bash
# 本地
curl http://localhost:5000/api/health

# 生产
curl https://tomatowriter.netlify.app/api/health
```

### 3. 数据库迁移
```bash
npm run migrate
```

## 🛠️ 常见配置

### Supabase（当前使用，有IPv6问题）
```bash
DATABASE_URL=postgresql://postgres:PASSWORD@db.wxbhkjxfcwcjaguoapxy.supabase.co:5432/postgres?sslmode=require
DATABASE_MOCK_MODE=false
```

### Neon（推荐，IPv4支持）
```bash
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
DATABASE_MOCK_MODE=false
```

### Mock模式（开发环境）
```bash
DATABASE_URL=any_value
DATABASE_MOCK_MODE=true
```

## ⚠️ 常见错误

### 错误1: connect ENETUNREACH
**原因**: IPv6网络不可达
**解决**: 迁移到Neon PostgreSQL

### 错误2: relation "xxx" does not exist
**原因**: 表未创建
**解决**: 运行 `npm run migrate`

### 错误3: SSL connection error
**原因**: SSL未启用
**解决**: 确保连接字符串包含 `sslmode=require`

## ✅ 健康状态检查

### 本地环境
```bash
curl http://localhost:5000/api/health | jq '.status, .checks.database.mode'
```

期望输出:
```json
"healthy"
"real"
```

### 生产环境
```bash
curl https://tomatowriter.netlify.app/api/health | jq '.status, .checks.database.mode'
```

期望输出:
```json
"healthy"
"real"
```

## 📊 数据库表结构

项目包含以下主要表：

1. **users** - 用户表
2. **novels** - 小说表
3. **chapters** - 章节表
4. **content_stats** - 内容统计表
5. **api_keys** - API密钥表
6. **membership_orders** - 会员订单表
7. **security_logs** - 安全日志表
8. **sub_accounts** - 子账号表
9. **usage_logs** - 使用日志表
10. **works** - 作品表

## 🔗 相关链接

- **Neon官网**: https://neon.tech/
- **Neon文档**: https://neon.tech/docs
- **Supabase官网**: https://supabase.com/
- **Netlify文档**: https://docs.netlify.com/
- **Next.js文档**: https://nextjs.org/docs

## 💡 快速决策树

```
需要数据库连接？
├─ 是
│  ├─ 首次配置？
│  │  ├─ 是 → 阅读 NEON_MIGRATION_GUIDE.md
│  │  └─ 否 → 使用 verify-neon-connection.ts 验证
│  └─ 遇到问题？
│     └─ 是 → 阅读 DATABASE_DIAGNOSIS.md
└─ 否（Mock模式）
   └─ 设置 DATABASE_MOCK_MODE=true
```

---

**需要更多帮助？** 📖 查看 [NEON_MIGRATION_README.md](./NEON_MIGRATION_README.md) 获取完整文档索引
