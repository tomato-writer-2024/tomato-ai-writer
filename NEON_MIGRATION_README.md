# Neon PostgreSQL 迁移文档中心

## 📋 文档索引

本文档中心包含从Supabase迁移到Neon PostgreSQL的所有相关文档。

### 核心文档

1. **[NEON_MIGRATION_GUIDE.md](./NEON_MIGRATION_GUIDE.md)** - 详细迁移步骤
   - 完整的10步迁移流程
   - 包含每个步骤的详细说明和命令
   - 故障排查指南
   - 最佳实践建议

2. **[NEON_MIGRATION_CHECKLIST.md](./NEON_MIGRATION_CHECKLIST.md)** - 快速检查清单
   - 分步骤检查项
   - 迁移前准备清单
   - 生产环境验证清单
   - 完整功能测试清单

3. **[DATABASE_FIX_SUMMARY.md](./DATABASE_FIX_SUMMARY.md)** - 数据库问题修复总结
   - 当前数据库连接问题分析
   - 诊断结果和根本原因
   - 修复方案和实施结果
   - 系统状态报告

4. **[DATABASE_DIAGNOSIS.md](./DATABASE_DIAGNOSIS.md)** - 数据库诊断指南
   - 详细的问题诊断步骤
   - 常见问题和解决方案
   - 联系支持指南

### 脚本工具

1. **[scripts/verify-neon-connection.ts](./scripts/verify-neon-connection.ts)** - 连接验证脚本
   - 验证环境变量配置
   - 测试数据库连接
   - 检查表结构
   - 性能测试

## 🚀 快速开始

### 5分钟快速迁移（适用于新项目）

如果当前生产环境使用Mock模式且没有需要保留的数据，可以快速迁移：

```bash
# 1. 创建Neon账号并获取连接字符串（参考 NEON_MIGRATION_GUIDE.md 步骤1-2）

# 2. 更新 .env.local 文件
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
DATABASE_MOCK_MODE=false

# 3. 验证本地连接
npx tsx scripts/verify-neon-connection.ts

# 4. 运行数据库迁移
npm run migrate

# 5. 更新Netlify环境变量（参考 NEON_MIGRATION_GUIDE.md 步骤6）

# 6. 等待部署完成并验证
curl https://tomatowriter.netlify.app/api/health
```

### 完整迁移流程（详细步骤）

参考 [NEON_MIGRATION_GUIDE.md](./NEON_MIGRATION_GUIDE.md)，按照以下步骤执行：

1. **准备阶段**
   - 创建Neon账号
   - 创建数据库项目
   - 获取连接字符串

2. **本地环境配置**
   - 更新 .env.local
   - 测试本地连接
   - 运行数据库迁移
   - 创建超级管理员

3. **生产环境配置**
   - 更新Netlify环境变量
   - 等待自动部署
   - 验证生产环境

4. **功能测试**
   - 测试所有核心功能
   - 验证数据持久化
   - 性能测试

## 📖 使用指南

### 选择适合你的迁移方式

#### 方式1：快速迁移（推荐用于新项目）
- **适用场景**：当前使用Mock模式，无需要保留的数据
- **时间**：5-10分钟
- **复杂度**：简单
- **文档**：快速开始部分

#### 方式2：标准迁移（推荐用于生产环境）
- **适用场景**：有少量数据需要保留
- **时间**：30-60分钟
- **复杂度**：中等
- **文档**：NEON_MIGRATION_GUIDE.md

#### 方式3：完整迁移（企业级）
- **适用场景**：有大量数据，需要零停机迁移
- **时间**：2-4小时
- **复杂度**：复杂
- **文档**：NEON_MIGRATION_GUIDE.md + 专业咨询

### 验证工具

在迁移过程中，使用以下工具验证配置：

#### 1. 验证本地连接
```bash
npx tsx scripts/verify-neon-connection.ts
```

#### 2. 健康检查API
```bash
# 本地
curl http://localhost:5000/api/health

# 生产
curl https://tomatowriter.netlify.app/api/health
```

#### 3. 数据库迁移
```bash
npm run migrate
```

## 🔍 故障排查

### 常见问题

#### 问题1：连接超时
**症状**：
```
connect ETIMEDOUT
```

**解决方案**：
1. 检查网络连接
2. 验证连接字符串格式
3. 参考 [DATABASE_DIAGNOSIS.md](./DATABASE_DIAGNOSIS.md) 详细诊断

#### 问题2：SSL错误
**症状**：
```
SSL connection error
```

**解决方案**：
1. 确保连接字符串包含 `sslmode=require`
2. 参考 [DATABASE_DIAGNOSIS.md](./DATABASE_DIAGNOSIS.md) SSL配置部分

#### 问题3：表不存在
**症状**：
```
relation "xxx" does not exist
```

**解决方案**：
1. 运行 `npm run migrate`
2. 检查迁移日志
3. 在Neon控制台查看表列表

### 获取帮助

如果遇到问题，可以：

1. 查看详细诊断指南：[DATABASE_DIAGNOSIS.md](./DATABASE_DIAGNOSIS.md)
2. 运行验证脚本：`npx tsx scripts/verify-neon-connection.ts`
3. 查看Neon官方文档：https://neon.tech/docs
4. 联系Neon支持：https://neon.tech/support
5. 查看Netlify文档：https://docs.netlify.com/

## ✅ 迁移成功标志

完成迁移后，你应该看到：

### 本地环境
- ✅ 健康检查返回 `healthy` 状态
- ✅ 数据库模式为 `real`
- ✅ 所有表已创建（10+个表）
- ✅ 超级管理员账号已创建

### 生产环境
- ✅ 健康检查返回 `healthy` 状态
- ✅ 数据库模式为 `real`
- ✅ 连接时间 < 1000ms
- ✅ 所有功能正常运行
- ✅ 数据持久化正常

### Neon数据库
- ✅ 可以在控制台查看数据
- ✅ 可以执行SQL查询
- ✅ 自动备份已启用
- ✅ 监控指标正常

## 📊 迁移前后对比

### Supabase（迁移前）
- ❌ IPv6连接问题
- ❌ 网络不可达
- ⚠️ 需要自动降级到Mock模式
- ⚠️ 生产环境不可用

### Neon（迁移后）
- ✅ IPv4连接支持
- ✅ 连接稳定
- ✅ 完全免费
- ✅ 自动扩展
- ✅ 生产环境可用
- ✅ 数据持久化

## 📝 后续维护

### 日常维护

1. **定期检查**
   - Neon存储使用量
   - Netlify部署日志
   - 性能指标

2. **备份策略**
   - Neon自动备份（7天保留）
   - 手动备份（重大操作前）
   - 测试恢复流程

3. **性能优化**
   - 添加数据库索引
   - 优化查询语句
   - 使用连接池

### 监控告警

建议配置以下监控：
- 数据库连接数
- 查询响应时间
- 错误率
- 存储使用量

## 🎯 最佳实践

1. **安全**
   - 使用强密码
   - 启用SSL连接
   - 定期更新密码
   - 监控异常访问

2. **性能**
   - 使用连接池
   - 添加索引
   - 优化查询
   - 缓存常用数据

3. **备份**
   - 定期手动备份
   - 测试恢复流程
   - 制定灾难恢复计划

4. **监控**
   - 设置性能监控
   - 配置错误告警
   - 定期查看日志

## 📚 参考资源

### 官方文档
- **Neon文档**: https://neon.tech/docs
- **Neon快速开始**: https://neon.tech/docs/get-started-with-neon
- **Netlify文档**: https://docs.netlify.com/
- **Next.js文档**: https://nextjs.org/docs

### 社区资源
- **Neon GitHub**: https://github.com/neondatabase/neon
- **Netlify Answers**: https://answers.netlify.com/
- **Next.js GitHub**: https://github.com/vercel/next.js

## 📞 技术支持

### Neon支持
- 官方文档：https://neon.tech/docs
- 支持论坛：https://community.neon.tech/
- 邮件支持：https://neon.tech/support

### Netlify支持
- 官方文档：https://docs.netlify.com/
- 支持论坛：https://answers.netlify.com/
- Twitter: @Netlify

## 📈 版本历史

- **v1.0.0** (2024-01-14)
  - 初始版本
  - 完整的迁移指南
  - 验证脚本
  - 检查清单

## 🤝 贡献

如果你发现文档中的错误或有改进建议，欢迎提交问题或拉取请求。

## 📄 许可

本文档遵循项目的开源许可证。

---

**祝迁移顺利！** 🎉

如有任何问题，请参考本文档中心的相关文档或联系技术支持。
