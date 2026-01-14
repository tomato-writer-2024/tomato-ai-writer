# Netlify 生产环境配置指南

## 本地环境已完成的配置

✅ 已完成的配置：
1. 更新了 `.env.local` 文件，配置了Neon数据库连接字符串
2. 验证了本地数据库连接（健康检查返回 `mode: "real"`）
3. 运行了数据库迁移，创建了11个数据库表
4. 创建了超级管理员账号

**超级管理员账号信息**：
- 邮箱：admin@tomatowriter.com
- 密码：TomatoAdmin@2024
- 角色：SUPER_ADMIN
- 会员等级：ENTERPRISE

## Netlify 环境变量配置步骤

### 步骤 1: 登录 Netlify Dashboard

1. 访问 Netlify 官网：https://app.netlify.com/
2. 使用你的账号登录
3. 在仪表板中找到你的站点：`tomatowriter`
4. 点击站点名称进入站点设置

### 步骤 2: 进入环境变量设置

1. 在站点页面，点击顶部的 **"Site settings"** 按钮
2. 在左侧菜单中找到并点击 **"Environment variables"**
3. 你会看到环境变量列表

### 步骤 3: 更新 DATABASE_URL 环境变量

1. 在环境变量列表中找到 `DATABASE_URL` 变量
2. 点击该变量右侧的 **编辑（铅笔）** 图标
3. 将值替换为以下Neon连接字符串：

```
postgresql://neondb_owner:npg_9ucFS2HzCGdV@ep-small-salad-a142jglw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

4. 点击 **"Save"** 按钮保存

**重要提示**：
- ⚠️ 请确保完整复制整个连接字符串，不要遗漏任何字符
- ⚠️ 连接字符串包含数据库密码，请妥善保管
- ⚠️ 不要在公开的地方分享连接字符串

### 步骤 4: 设置 DATABASE_MOCK_MODE 为 false

1. 在环境变量列表中找到 `DATABASE_MOCK_MODE` 变量
   - 如果存在，点击编辑，将其值设置为 `false`
   - 如果不存在，点击 **"Add variable"** 按钮添加新变量

2. 添加或编辑以下内容：
   - **Key (变量名)**: `DATABASE_MOCK_MODE`
   - **Value (值)**: `false`

3. 点击 **"Save"** 按钮保存

**说明**：
- `false` = 使用真实数据库（Neon）
- `true` = 使用Mock模式（内存数据库）

### 步骤 5: 确认环境变量作用域

1. 确保环境变量作用域正确设置
2. 点击变量右侧的 **"Edit scopes"** 图标
3. 确保选择了以下作用域之一：
   - **All contexts**（推荐）：在所有环境中都使用此变量
   - **Production context**：仅在生产环境中使用此变量
   - 或者同时选择 **Development** 和 **Production**

4. 保存作用域设置

### 步骤 6: 等待 Netlify 自动部署

1. 更新环境变量后，Netlify 会自动触发重新部署
2. 导航到 **"Deploys"** 页面查看部署状态
3. 等待部署完成，通常需要 2-3 分钟

**部署状态说明**：
- **Queued**: 部署已排队，等待开始
- **Building**: 正在构建应用
- **Published**: 部署成功，已发布
- **Failed**: 部署失败，需要查看错误日志

如果部署失败，点击 **"Deploy log"** 查看详细错误信息。

## 验证生产环境配置

### 步骤 7: 测试生产环境健康检查

部署完成后，在本地终端执行以下命令：

```bash
curl https://tomatowriter.netlify.app/api/health
```

**期望输出**（成功）：

```json
{
  "status": "healthy",
  "checks": {
    "environment": {
      "status": "ok",
      "message": "所有必需的环境变量已配置",
      "details": {
        "DATABASE_URL": true,
        "DATABASE_MOCK_MODE": false
      }
    },
    "database": {
      "status": "ok",
      "message": "数据库连接正常",
      "mode": "real",
      "connectionTime": "500ms"
    }
  }
}
```

**关键检查点**：
- ✅ `status` = `"healthy"`
- ✅ `database.status` = `"ok"`
- ✅ `database.mode` = `"real"`（不是 "auto-mock" 或 "mock"）
- ✅ `connectionTime` < 1000ms

### 步骤 8: 访问生产环境

1. 打开浏览器，访问：https://tomatowriter.netlify.app
2. 应该能看到番茄小说AI写作工具的首页
3. 点击右上角的 **"登录"** 按钮

### 步骤 9: 登录超级管理员账号

1. 在登录页面输入：
   - **邮箱**: `admin@tomatowriter.com`
   - **密码**: `TomatoAdmin@2024`

2. 点击 **"登录"** 按钮

3. 登录成功后，你应该看到工作台页面
4. 在右上角可以看到管理员标识

### 步骤 10: 测试数据持久化

1. 创建一个新小说
   - 点击 **"新建小说"** 按钮
   - 输入小说标题：`测试小说`
   - 选择类型：`玄幻`
   - 点击 **"创建"**

2. 创建一个章节
   - 在小说详情页点击 **"添加章节"**
   - 输入章节标题：`第1章 测试`
   - 输入内容：`这是测试内容...`
   - 点击 **"保存"**

3. 在Neon控制台验证数据
   - 访问：https://console.neon.tech/
   - 选择 `tomato-ai-writer` 项目
   - 点击 **"Table Editor"**
   - 查看 `novels` 和 `chapters` 表
   - 确认新创建的小说和章节已保存

## 完整配置检查清单

### 环境变量配置

- [ ] DATABASE_URL 已更新为 Neon 连接字符串
- [ ] DATABASE_MOCK_MODE 已设置为 `false`
- [ ] 所有必需的环境变量都已配置
- [ ] 环境变量作用域设置为 All contexts 或 Production

### 部署验证

- [ ] Netlify 自动部署完成
- [ ] 部署状态显示为 Published
- [ ] 没有构建错误或警告

### 功能测试

- [ ] 健康检查返回 `status: "healthy"`
- [ ] 健康检查返回 `database.mode: "real"`
- [ ] 数据库连接时间 < 1000ms
- [ ] 可以访问生产环境主页
- [ ] 可以登录超级管理员账号
- [ ] 可以创建新小说
- [ ] 可以创建新章节
- [ ] 数据正确保存到 Neon 数据库

## 常见问题排查

### 问题 1: 健康检查返回 `mode: "auto-mock"`

**症状**：
```json
{
  "database": {
    "mode": "auto-mock",
    "message": "自动降级模式：真实数据库不可用"
  }
}
```

**原因**：Neon 数据库连接失败

**解决方案**：
1. 检查 Netlify 环境变量中的 DATABASE_URL 是否正确
2. 确认连接字符串格式完整
3. 查看部署日志，查找连接错误信息
4. 验证 Neon 数据库是否正常运行

### 问题 2: 部署失败

**症状**：部署状态显示为 Failed

**解决方案**：
1. 点击部署日志查看详细错误
2. 检查是否有 TypeScript 类型错误
3. 检查是否有依赖安装失败
4. 查看是否有构建脚本错误

### 问题 3: 无法登录超级管理员

**症状**：登录时提示账号或密码错误

**解决方案**：
1. 确认在生产环境中创建了超级管理员
2. 或者在生产环境中注册新账号
3. 检查 Neon 数据库中的 users 表

### 问题 4: 数据未保存

**症状**：创建的小说或章节未保存到数据库

**解决方案**：
1. 确认 DATABASE_MOCK_MODE = false
2. 检查 Neon 控制台是否有数据
3. 查看浏览器控制台是否有错误
4. 查看 Netlify Functions 日志

## 后续优化建议

### 安全加固

1. **修改默认密码**
   - 登录后立即修改超级管理员密码
   - 使用强密码（大小写字母、数字、特殊字符）

2. **启用安全功能**
   - 考虑启用双因素认证
   - 设置登录尝试限制
   - 启用安全日志记录

3. **定期更新**
   - 定期更新依赖包
   - 监控安全漏洞
   - 及时修复安全问题

### 性能优化

1. **数据库优化**
   - 添加适当的索引
   - 优化查询语句
   - 考虑使用连接池

2. **缓存策略**
   - 实现API响应缓存
   - 缓存常用数据
   - 使用CDN加速

3. **监控告警**
   - 设置性能监控
   - 配置错误告警
   - 监控数据库性能

### 备份策略

1. **自动备份**
   - Neon 提供自动备份（7天保留）
   - 定期手动备份
   - 测试恢复流程

2. **数据导出**
   - 定期导出重要数据
   - 保存备份文件
   - 验证备份完整性

## 技术支持

如果遇到问题：

1. **查看日志**
   - Netlify Deploy log
   - Netlify Functions log
   - Neon Dashboard metrics

2. **参考文档**
   - [NEON_MIGRATION_GUIDE.md](./NEON_MIGRATION_GUIDE.md)
   - [DATABASE_DIAGNOSIS.md](./DATABASE_DIAGNOSIS.md)
   - [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

3. **联系支持**
   - Neon 支持：https://neon.tech/support
   - Netlify 支持：https://answers.netlify.com/

## 总结

### 已完成的配置

✅ 本地环境：
- Neon 数据库连接配置完成
- 数据库迁移完成（11个表）
- 超级管理员账号创建成功
- 健康检查正常

✅ 生产环境（待完成）：
- Netlify 环境变量更新
- 自动部署验证
- 功能测试验证

### 下一步行动

1. **立即执行**：
   - 更新 Netlify 环境变量
   - 等待自动部署
   - 验证生产环境

2. **短期优化**：
   - 修改默认密码
   - 测试所有功能
   - 设置监控告警

3. **长期规划**：
   - 性能优化
   - 安全加固
   - 备份策略

---

## 快速命令参考

### 本地命令

```bash
# 测试本地健康检查
curl http://localhost:5000/api/health

# 查看开发日志
tail -f /tmp/dev.log

# 重启开发服务器
pkill -f "next dev"
npm run dev

# 运行数据库迁移
pnpm run migrate

# 创建超级管理员
npx tsx src/scripts/init-super-admin.ts
```

### 生产命令

```bash
# 测试生产健康检查
curl https://tomatowriter.netlify.app/api/health

# 查看部署状态（需要Netlify CLI）
netlify status

# 重新触发部署（需要Netlify CLI）
netlify deploy --prod
```

---

**配置完成后，生产环境将完全可用，数据将持久化到 Neon PostgreSQL 数据库！** 🎉
