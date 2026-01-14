# 迁移到 Neon PostgreSQL 详细步骤指南

## 概述

本文档提供从当前Supabase PostgreSQL迁移到Neon PostgreSQL的详细步骤。Neon是一个完全免费、无服务器、自动扩展的PostgreSQL数据库，支持IPv4连接，完美解决当前Supabase的IPv6连接问题。

## 为什么要迁移到 Neon

### Neon 的优势

1. **完全免费**
   - 无额度限制
   - 永久免费计划
   - 0.5GB存储空间（足够中小型应用）

2. **Serverless架构**
   - 自动扩展，无需手动管理
   - 按需启动，节省资源
   - 无冷启动延迟

3. **支持IPv4**
   - 完美支持IPv4连接
   - 解决当前Supabase的IPv6网络不可达问题
   - Netlify Functions连接稳定

4. **高可用性**
   - 自动备份
   - 多区域部署
   - 故障自动恢复

5. **易于使用**
   - 一键创建数据库
   - 简洁的Web控制台
   - 完善的CLI工具

### 数据库表结构

当前项目包含以下数据库表：

1. **users** - 用户表
   - 基本信息（email、username、password等）
   - 会员信息（membership_level、membership_expire_at）
   - 使用统计（daily_usage_count、monthly_usage_count）
   - 微信登录（wechat_open_id、wechat_union_id）

2. **novels** - 小说表
   - 基本信息（title、description、genre、status）
   - 统计信息（word_count、chapter_count、average_rating）
   - 分类标签（genre、type、tags）

3. **chapters** - 章节表
   - 章节内容（title、content、word_count）
   - 质量评分（quality_score、completion_rate、shuangdian_count）

4. **content_stats** - 内容统计表
   - AI评分（quality_score、density_score、emotion_score）
   - 完读率（completion_rate）

5. **api_keys** - API密钥表
   - 密钥管理（key_hash、permissions、expires_at）

6. **membership_orders** - 会员订单表
   - 订单信息（level、months、amount、payment_status）

7. **security_logs** - 安全日志表
   - 登录日志、操作记录

8. **sub_accounts** - 子账号表
   - 团队协作功能

9. **usage_logs** - 使用日志表
   - 用户行为统计

10. **works** - 作品表
    - 通用作品存储

11. **content_versions** - 内容版本历史表
    - 版本管理

## 迁移步骤

---

## 步骤 1: 创建 Neon 账号

### 1.1 注册 Neon 账号

1. 访问 Neon 官网：https://neon.tech/
2. 点击右上角 **"Sign up"** 按钮
3. 使用以下方式之一注册：
   - GitHub账号（推荐）
   - Google账号
   - Email账号

### 1.2 验证邮箱（如果使用Email注册）

1. 检查邮箱收到的验证邮件
2. 点击验证链接完成邮箱验证

### 1.3 登录 Neon 控制台

1. 访问 https://console.neon.tech/
2. 使用注册的账号登录

---

## 步骤 2: 创建 Neon 数据库项目

### 2.1 创建新项目

1. 登录后点击 **"Create a project"** 按钮
2. 填写项目信息：
   - **Project name**: `tomato-ai-writer` （或你喜欢的名字）
   - **Region**: 选择离你最近的区域
     - 推荐：`us-east-1` (美国东部)
     - 或选择 `ap-southeast-1` (亚洲-新加坡)
   - **PostgreSQL version**: `16` （最新稳定版）
   - **Database name**: `neondb` （默认即可）
   - **Password**: 生成一个强密码（**记住这个密码！**）

3. 点击 **"Create project"** 按钮
4. 等待项目创建完成（约30秒）

### 2.2 查看项目信息

创建完成后，你会看到：
- **Project ID**: 类似 `warm-sun-123456` 的ID
- **Host**: 类似 `ep-cool-darkness-123456.us-east-2.aws.neon.tech` 的主机地址
- **Database**: `neondb`
- **User**: `neondb_owner`
- **Password**: 你刚才设置的密码

---

## 步骤 3: 获取 Neon 数据库连接字符串

### 3.1 在 Neon 控制台获取连接信息

1. 在项目页面，点击左侧菜单 **"SQL Editor"** 或 **"Connection Details"**
2. 找到 **Connection string** 部分
3. 复制 **Connection string**，格式类似：

```
postgresql://neondb_owner:PASSWORD@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 3.2 修改连接字符串（可选但推荐）

为了更好的兼容性，建议修改用户名：

原连接字符串：
```
postgresql://neondb_owner:PASSWORD@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

修改为（将 `neondb_owner` 改为 `postgres`）：
```
postgresql://postgres:PASSWORD@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**注意**：如果使用 `postgres` 用户名，需要在Neon中创建该用户，或者保持使用 `neondb_owner`。

### 3.3 测试连接字符串（本地）

在项目根目录执行：

```bash
# 使用psql测试连接（需要先安装PostgreSQL客户端）
psql "postgresql://neondb_owner:PASSWORD@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

如果连接成功，会看到类似输出：
```
psql (16.2, server 16.2)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

neondb=>
```

输入 `\q` 退出。

---

## 步骤 4: 配置本地环境连接到 Neon

### 4.1 更新 .env.local 文件

编辑项目根目录的 `.env.local` 文件：

```bash
# 原Supabase配置（注释掉）
# DATABASE_URL=postgresql://postgres:izyXumPX6k3wQmfN@db.wxbhkjxfcwcjaguoapxy.supabase.co:5432/postgres?sslmode=require

# 新的Neon配置
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

# 确保关闭Mock模式
DATABASE_MOCK_MODE=false
```

**重要**：
- 将 `YOUR_PASSWORD` 替换为你在步骤2中设置的密码
- 将主机地址替换为你的实际地址
- 确保 `sslmode=require` 参数存在（Neon需要SSL连接）

### 4.2 重启本地开发服务器

```bash
# 停止当前运行的服务
pkill -f "next dev"

# 重新启动
npm run dev
```

### 4.3 测试本地数据库连接

```bash
# 测试健康检查API
curl http://localhost:5000/api/health
```

期望输出：
```json
{
  "status": "healthy",
  "checks": {
    "environment": {
      "status": "ok",
      "message": "所有必需的环境变量已配置"
    },
    "database": {
      "status": "ok",
      "message": "数据库连接正常",
      "mode": "real"
    }
  }
}
```

如果看到 `"mode": "real"` 和 `"status": "ok"`，说明连接成功！

---

## 步骤 5: 运行数据库迁移到 Neon

### 5.1 理解迁移方式

Neon 提供了三种迁移方式：

1. **使用项目内置的迁移脚本**（推荐）
   - 直接在Neon上创建表结构
   - 无数据迁移（适合新项目或数据可丢弃的情况）

2. **使用Neon的数据库导入功能**
   - 从Supabase导出数据
   - 导入到Neon
   - 适合需要保留数据的场景

3. **使用第三方工具（如pg_dump）**
   - 手动导出/导入
   - 更灵活但复杂

由于当前生产环境使用的是Mock模式，没有真实数据需要迁移，**推荐使用方式1**。

### 5.2 使用项目迁移脚本

#### 5.2.1 准备迁移脚本

项目的迁移脚本位于 `src/scripts/migrate.ts`，它会在Neon数据库中创建所有必要的表。

#### 5.2.2 执行迁移

在项目根目录执行：

```bash
# 执行数据库迁移
npm run migrate
```

**预期输出**：
```
================================================================================
数据库迁移工具
================================================================================

步骤 1: 测试数据库连接...
✅ 数据库连接成功

步骤 2: 检查现有数据库表...
现有表: 无

步骤 3: 执行数据库迁移...
执行迁移文件: add_missing_fields.sql
✅ 迁移文件 add_missing_fields.sql 执行成功

步骤 4: 验证迁移结果...
迁移后表列表: api_keys, chapters, content_stats, membership_orders, novels, security_logs, sub_accounts, usage_logs, users, works

✅ 所有预期表都已创建

================================================================================
✅ 数据库迁移完成!
================================================================================
```

#### 5.2.3 验证表创建

在Neon控制台：
1. 点击 **"Table Editor"**
2. 查看创建的表：
   - users
   - novels
   - chapters
   - content_stats
   - api_keys
   - membership_orders
   - security_logs
   - sub_accounts
   - usage_logs
   - works

### 5.3 创建超级管理员账号

#### 5.3.1 使用API创建超级管理员

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tomatowriter.com",
    "password": "YourStrongPassword123!",
    "username": "超级管理员"
  }'
```

期望输出：
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@tomatowriter.com",
      "username": "超级管理员",
      "role": "SUPER_ADMIN"
    }
  }
}
```

#### 5.3.2 验证超级管理员创建

在Neon控制台SQL Editor中执行：

```sql
SELECT id, email, username, role, is_super_admin
FROM users
WHERE is_super_admin = true;
```

应该看到刚创建的超级管理员账号。

---

## 步骤 6: 更新 Netlify 环境变量

### 6.1 登录 Netlify Dashboard

1. 访问 https://app.netlify.com/
2. 登录你的账号
3. 选择你的站点：`tomatowriter`

### 6.2 更新 DATABASE_URL 环境变量

1. 点击 **Site settings**
2. 点击左侧菜单 **Environment variables**
3. 找到 `DATABASE_URL` 变量
4. 点击编辑按钮（铅笔图标）
5. 替换为新的Neon连接字符串：
   ```
   postgresql://neondb_owner:YOUR_PASSWORD@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
6. 点击 **Save** 保存

### 6.3 设置 DATABASE_MOCK_MODE 为 false

1. 在同一页面找到 `DATABASE_MOCK_MODE` 变量
2. 如果存在，设置为 `false`
3. 如果不存在，点击 **Add variable** 添加：
   - Key: `DATABASE_MOCK_MODE`
   - Value: `false`
4. 点击 **Save** 保存

### 6.4 确认环境变量作用域

确保环境变量设置正确：
- 点击变量旁边的 **Edit scopes** 按钮
- 选择 **All contexts** 或至少包含 **Production**
- 保存设置

---

## 步骤 7: 验证生产环境数据库连接

### 7.1 等待 Netlify 自动部署

环境变量更新后，Netlify会自动触发重新部署：
- 部署时间：约2-3分钟
- 可以在 **Deploys** 页面查看部署进度

### 7.2 检查部署状态

1. 访问 Netlify Dashboard → Deploys
2. 找到最新的部署
3. 等待状态变为 **Published**

### 7.3 测试生产环境健康检查

在本地终端执行：

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
      "message": "所有必需的环境变量已配置"
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

**如果失败**，检查：
- `mode` 是否为 `real`
- `status` 是否为 `ok`
- 查看 Netlify Functions 日志

### 7.4 查看详细日志

1. Netlify Dashboard → Functions
2. 点击 `api/health`
3. 查看日志输出，确认没有连接错误

### 7.5 测试用户注册功能

```bash
curl -X POST https://tomatowriter.netlify.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "username": "测试用户"
  }'
```

期望输出：
```json
{
  "success": true,
  "message": "注册成功"
}
```

### 7.6 验证数据写入

在Neon控制台SQL Editor中执行：

```sql
SELECT id, email, username, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;
```

应该能看到新注册的用户。

---

## 步骤 8: 完整功能测试

### 8.1 测试列表

完成以下测试清单：

- [ ] 健康检查API正常
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] JWT Token生成和验证正常
- [ ] 小说创建功能正常
- [ ] 章节创建功能正常
- [ ] AI写作功能正常（集成豆包）
- [ ] 数据库读写操作正常
- [ ] 错误处理正常

### 8.2 测试AI写作功能

1. 访问生产环境首页：https://tomatowriter.netlify.app
2. 使用超级管理员账号登录
3. 创建新小说
4. 测试AI章节生成
5. 验证数据正确写入Neon数据库

### 8.3 性能测试

```bash
# 测试响应时间
time curl https://tomatowriter.netlify.app/api/health

# 多次测试稳定性
for i in {1..10}; do
  curl -s https://tomatowriter.netlify.app/api/health | jq '.status'
done
```

---

## 步骤 9: Neon 数据库管理

### 9.1 访问 Neon 控制台

1. 访问 https://console.neon.tech/
2. 选择 `tomato-ai-writer` 项目

### 9.2 使用 SQL Editor

1. 点击左侧菜单 **SQL Editor**
2. 在编辑器中输入SQL语句
3. 点击 **Run** 执行

常用查询：

```sql
-- 查看所有表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 查看用户数
SELECT COUNT(*) as user_count FROM users;

-- 查看小说数
SELECT COUNT(*) as novel_count FROM novels;

-- 查看章节数
SELECT COUNT(*) as chapter_count FROM chapters;

-- 查看最新注册用户
SELECT email, username, created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;
```

### 9.3 使用 Table Editor

1. 点击左侧菜单 **Table Editor**
2. 选择要查看的表
3. 可以直接在浏览器中查看、编辑、添加数据

### 9.4 查看数据库连接信息

1. 点击 **Connection Details**
2. 查看当前连接信息
3. 可以复制新的连接字符串

### 9.5 监控数据库性能

1. 点击左侧菜单 **Metrics**
2. 查看：
   - 存储使用量
   - 请求次数
   - 平均响应时间
   - 活跃连接数

---

## 步骤 10: 备份与维护

### 10.1 Neon 自动备份

Neon 自动提供：
- **时间点恢复（PITR）**
  - 可以恢复到任意时间点
  - 保留期：免费计划7天
  - Pro计划30天

- **数据库快照**
  - 手动创建快照
  - 用于重大操作前备份

### 10.2 手动备份

在Neon控制台：
1. 点击 **Backups**
2. 点击 **Create backup** 创建手动快照
3. 输入快照名称
4. 保存

### 10.3 导出数据

在Neon控制台SQL Editor中：

```sql
-- 导出所有用户
\copy (SELECT * FROM users) TO '/tmp/users.csv' CSV HEADER;

-- 导出所有小说
\copy (SELECT * FROM novels) TO '/tmp/novels.csv' CSV HEADER;
```

或者使用 pg_dump：

```bash
pg_dump "postgresql://neondb_owner:PASSWORD@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb" \
  -f backup.sql
```

### 10.4 恢复数据

从备份恢复：

```bash
psql "postgresql://neondb_owner:PASSWORD@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb" \
  -f backup.sql
```

---

## 故障排查

### 问题 1: 连接超时

**症状**：
```
connect ETIMEDOUT
```

**解决方案**：
1. 检查网络连接
2. 确认Neon数据库正在运行
3. 验证连接字符串格式正确
4. 检查防火墙设置

### 问题 2: SSL错误

**症状**：
```
SSL connection error
```

**解决方案**：
1. 确保连接字符串包含 `sslmode=require`
2. 更新pg包到最新版本
3. 检查网络是否支持SSL

### 问题 3: 权限错误

**症状**：
```
permission denied for table xxx
```

**解决方案**：
1. 在Neon控制台检查用户权限
2. 确保使用正确的用户名
3. 重新授权：
   ```sql
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO neondb_owner;
   ```

### 问题 4: 表不存在

**症状**：
```
relation "xxx" does not exist
```

**解决方案**：
1. 重新运行迁移脚本：`npm run migrate`
2. 检查迁移脚本是否正确执行
3. 在Neon控制台SQL Editor中查看表列表

### 问题 5: Netlify部署后无法连接

**症状**：
```
健康检查返回 mode: auto-mock
```

**解决方案**：
1. 检查Netlify环境变量是否正确更新
2. 确认环境变量作用域包含Production
3. 查看Netlify Functions日志
4. 重新部署

---

## 成功标志

完成迁移后，你应该看到：

✅ 本地环境健康检查：
- `"status": "healthy"`
- `"database.mode": "real"`
- 无连接错误

✅ 生产环境健康检查：
- `"status": "healthy"`
- `"database.mode": "real"`
- 连接时间 < 1000ms

✅ 所有功能正常：
- 用户注册/登录
- 小说/章节创建
- AI写作功能
- 数据持久化

✅ Neon数据库管理：
- 可以在控制台查看数据
- 可以执行SQL查询
- 自动备份正常工作

---

## 总结

### 迁移完成后的状态

1. **本地环境**
   - ✅ 连接到Neon数据库
   - ✅ 所有表已创建
   - ✅ 功能正常运行

2. **生产环境**
   - ✅ 连接到Neon数据库
   - ✅ 所有表已创建
   - ✅ 功能正常运行
   - ✅ 数据持久化

3. **数据库管理**
   - ✅ Neon控制台可用
   - ✅ 自动备份已启用
   - ✅ 监控指标正常

### 下一步优化建议

1. **性能优化**
   - 添加数据库索引
   - 优化查询语句
   - 使用连接池

2. **安全加固**
   - 设置强密码
   - 定期更新密码
   - 监控异常访问

3. **监控告警**
   - 配置性能监控
   - 设置错误告警
   - 定期查看日志

4. **数据备份**
   - 定期手动备份
   - 测试恢复流程
   - 制定灾难恢复计划

---

## 参考资料

- **Neon官网**: https://neon.tech/
- **Neon文档**: https://neon.tech/docs
- **Neon快速开始**: https://neon.tech/docs/get-started-with-neon
- **Neon连接字符串**: https://neon.tech/docs/connect/connection-parameters
- **Next.js数据库集成**: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

---

## 技术支持

如遇到问题：

1. 查看 [DATABASE_DIAGNOSIS.md](./DATABASE_DIAGNOSIS.md) 进行诊断
2. 查看 Neon 官方文档：https://neon.tech/docs
3. 联系 Neon 支持：https://neon.tech/support
4. 查看 Netlify 文档：https://docs.netlify.com/

---

**祝迁移顺利！🎉**
