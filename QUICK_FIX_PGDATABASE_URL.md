# 快速修复：PGDATABASE_URL 环境变量缺失

## 问题原因

错误信息：`Database URL not configured. Set PGDATABASE_URL environment variable.`

**根本原因**：
- 项目使用的 `coze-coding-dev-sdk` 期望的环境变量名称是 **`PGDATABASE_URL`**
- 而不是 `DATABASE_URL`
- 之前配置的 `.env.local` 只有 `DATABASE_URL`，缺少 `PGDATABASE_URL`

---

## 解决方案

### 步骤 1：.env.local 已自动更新 ✅

我已经自动更新了 `.env.local` 文件，添加了以下配置：

```env
# 两个环境变量都指向相同的 Supabase 连接字符串
DATABASE_URL=postgresql://postgres:Tomato2024!%40%23%24@db.jtibmdmfvusjlhiuqyrn.supabase.co:5432/postgres
PGDATABASE_URL=postgresql://postgres:Tomato2024!%40%23%24@db.jtibmdmfvusjlhiuqyrn.supabase.co:5432/postgres
```

**说明**：
- `DATABASE_URL`：项目内部使用的环境变量
- `PGDATABASE_URL`：`coze-coding-dev-sdk` 期望的环境变量
- 两者指向相同的 Supabase 连接字符串

---

### 步骤 2：重启开发服务器（重要！）

**必须重启服务器才能读取新的环境变量！**

在命令行中执行：

```bash
# 1. 停止当前服务器
Ctrl + C

# 2. 等待几秒钟，直到提示符重新出现

# 3. 重新启动服务器
npm run dev
```

**预期输出**：
```
✓ Ready in 2.8s
○ Local:        http://localhost:5000
```

---

### 步骤 3：验证数据库连接

在浏览器中访问：

```
http://localhost:5000/api/health
```

**预期返回**：
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
      "message": "数据库连接正常"
    }
  }
}
```

如果 `"database": "ok"`，说明数据库连接成功！

---

### 步骤 4：创建超级管理员

在浏览器中访问：

```
http://localhost:5000/api/init-admin?email=admin@example.com&password=Admin@123456&username=超级管理员
```

**预期返回**：
```json
{
  "success": true,
  "message": "超级管理员创建成功",
  "data": {
    "id": "uuid-xxxx-xxxx",
    "email": "admin@example.com",
    "username": "超级管理员",
    "role": "DEVELOPER"
  }
}
```

---

### 步骤 5：登录管理员后台

1. 访问：http://localhost:5000/admin/login
2. 输入：
   - 邮箱：`admin@example.com`
   - 密码：`Admin@123456`
3. 点击登录

成功后自动跳转到仪表盘。

---

## 常见问题

### 问题 1: 重启后仍然提示 "Database URL not configured"

**原因**：.env.local 文件未更新或服务器未重启

**解决方案**：

1. 检查 `.env.local` 文件是否包含：
   ```env
   DATABASE_URL=postgresql://...
   PGDATABASE_URL=postgresql://...
   ```

2. 确保服务器已重启：
   ```bash
   Ctrl + C
   npm run dev
   ```

3. 清除 Next.js 缓存（可选）：
   ```bash
   # 删除 .next 目录
   rmdir /s /q .next

   # 重新启动
   npm run dev
   ```

---

### 问题 2: 健康检查显示 "database": "error"

**原因**：数据库连接失败

**解决方案**：

1. 检查连接字符串是否正确：
   - 确认密码是否正确
   - 确认数据库地址是否正确
   - 确认端口是否正确（5432）

2. 测试连接字符串：
   ```bash
   # 安装 PostgreSQL 客户端
   npm install -g pg

   # 测试连接
   psql "postgresql://postgres:Tomato2024!%40%23%24@db.jtibmdmfvusjlhiuqyrn.supabase.co:5432/postgres"
   ```

3. 重新从 Supabase 复制连接字符串

---

### 问题 3: "password authentication failed"

**原因**：密码错误

**解决方案**：

1. 检查 `.env.local` 中的密码是否正确
2. 确认密码是否进行了 URL 编码（`!@#$` → `!%40%23%24`）
3. 如果忘记密码，在 Supabase Dashboard 中重置：
   - Settings → Database → Reset database password
4. 重置后更新 `.env.local` 中的密码

---

## 环境变量说明

### 必需的环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | 项目内部使用的数据库连接字符串 | `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres` |
| `PGDATABASE_URL` | coze-coding-dev-sdk 期望的环境变量 | 与 `DATABASE_URL` 相同 |
| `JWT_SECRET` | JWT 密钥 | `dev-jwt-secret-key-change-in-production-123456` |

### 可选的环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `JWT_REFRESH_SECRET` | JWT 刷新密钥 | 与 JWT_SECRET 相同 |
| `DOUBAO_API_KEY` | 豆包 AI API Key | 空字符串 |
| `EMAIL_MOCK_MODE` | 邮件 Mock 模式 | `true` |
| `WECHAT_MOCK_MODE` | 微信登录 Mock 模式 | `true` |

---

## 完整操作流程

```bash
# 1. .env.local 已自动更新（无需手动操作）

# 2. 重启服务器
Ctrl + C
npm run dev

# 3. 验证数据库连接（浏览器访问）
http://localhost:5000/api/health

# 4. 创建超级管理员（浏览器访问）
http://localhost:5000/api/init-admin?email=admin@example.com&password=Admin@123456&username=超级管理员

# 5. 登录管理员后台（浏览器访问）
http://localhost:5000/admin/login
```

---

## 验证清单

完成所有步骤后，使用此清单验证：

- [ ] `.env.local` 文件已更新（包含 `DATABASE_URL` 和 `PGDATABASE_URL`）
- [ ] 服务器已重启
- [ ] 健康检查返回 `"database": "ok"`
- [ ] 超级管理员创建成功（`"success": true`）
- [ ] 管理员登录成功
- [ ] 仪表盘页面正常显示

---

## 快速提示

**Q: 为什么需要两个环境变量？**

**A**:
- `DATABASE_URL`：项目内部代码使用
- `PGDATABASE_URL`：`coze-coding-dev-sdk` 期望的环境变量名称
- 两者必须指向相同的数据库连接字符串

**Q: 如何确认环境变量已加载？**

**A**:
1. 访问健康检查：`http://localhost:5000/api/health`
2. 查看 `"checks.environment.details"` 部分
3. 确认 `DATABASE_URL` 和 `PGDATABASE_URL` 都是 `true`

**Q: 重启服务器后仍然失败怎么办？**

**A**:
1. 清除 Next.js 缓存：删除 `.next` 目录
2. 重新启动服务器
3. 检查 `.env.local` 文件内容
4. 确认连接字符串正确

---

## 下一步

完成配置后：

1. ✅ 验证数据库连接
2. ✅ 创建超级管理员
3. ✅ 登录管理员后台
4. ✅ 测试核心功能
5. ✅ 部署到生产环境（Vercel）

---

**更新时间**: 2025-01-13
**问题**: PGDATABASE_URL 环境变量缺失
**状态**: 已修复 ✅
