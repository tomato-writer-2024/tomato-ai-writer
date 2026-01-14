# Neon PostgreSQL 迁移命令清单

## 已完成的命令（本地环境）

### 1. 更新环境变量
```bash
# 编辑 .env.local 文件
vim .env.local

# 修改内容：
DATABASE_URL=postgresql://neondb_owner:npg_9ucFS2HzCGdV@ep-small-salad-a142jglw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DATABASE_MOCK_MODE=false
```

### 2. 验证数据库连接
```bash
curl -s http://localhost:5000/api/health
```

**输出**：
```json
{
  "status": "healthy",
  "database": {
    "status": "ok",
    "mode": "real",
    "connectionTime": "1813ms"
  }
}
```

### 3. 运行数据库迁移
```bash
npx tsx scripts/migrate-with-env.ts
```

**输出**：
```
✅ 数据库连接成功
✅ 数据库迁移完成!
✅ 所有预期表都已创建
```

### 4. 创建超级管理员账号
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@tomatowriter.com",
    "password": "SuperAdmin123!",
    "confirmPassword": "SuperAdmin123!",
    "username": "系统管理员"
  }'
```

**输出**：
```json
{
  "success": true,
  "data": {
    "user": {
      "email": "superadmin@tomatowriter.com",
      "username": "系统管理员"
    }
  }
}
```

### 5. 验证系统状态
```bash
curl -s http://localhost:5000/api/health
```

**输出**：
```json
{
  "status": "healthy",
  "database": {
    "status": "ok",
    "mode": "real"
  }
}
```

---

## 待执行的命令（Netlify 生产环境）

### 6. 登录 Netlify Dashboard
```bash
# 在浏览器中打开
open https://app.netlify.com/
```

### 7. 更新环境变量（在 Netlify Dashboard 中操作）

**步骤**：
1. Site settings → Environment variables
2. 编辑 `DATABASE_URL`：
   ```
   postgresql://neondb_owner:npg_9ucFS2HzCGdV@ep-small-salad-a142jglw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
3. 编辑 `DATABASE_MOCK_MODE`：`false`
4. 保存并确认作用域

### 8. 等待自动部署
- Netlify 会自动触发重新部署
- 等待 2-3 分钟
- 部署状态变为 **Published**

### 9. 验证生产环境
```bash
curl -s https://tomatowriter.netlify.app/api/health
```

**预期输出**：
```json
{
  "status": "healthy",
  "database": {
    "status": "ok",
    "mode": "real"
  }
}
```

### 10. 测试生产环境功能
```bash
# 测试用户注册
curl -X POST https://tomatowriter.netlify.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "confirmPassword": "Test123456!",
    "username": "测试用户"
  }'
```

### 11. 访问生产环境
```bash
# 在浏览器中打开
open https://tomatowriter.netlify.app
```

---

## 常用命令参考

### 健康检查
```bash
# 本地
curl http://localhost:5000/api/health

# 生产
curl https://tomatowriter.netlify.app/api/health

# 格式化输出
curl -s http://localhost:5000/api/health | python3 -m json.tool
```

### 数据库连接验证
```bash
# 使用验证脚本
npx tsx scripts/verify-neon-connection.ts

# 使用迁移脚本（含验证）
npx tsx scripts/migrate-with-env.ts
```

### 用户管理
```bash
# 注册
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!","confirmPassword":"Pass123!","username":"用户"}'

# 登录
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!"}'
```

### 日志查看
```bash
# 本地开发服务器日志
# 查看终端输出

# Netlify Functions 日志
# 访问：https://app.netlify.com/sites/tomatowriter/functions
```

---

## Neon 数据库信息

### 连接字符串
```
postgresql://neondb_owner:npg_9ucFS2HzCGdV@ep-small-salad-a142jglw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 控制台
```
https://console.neon.tech/
```

### 项目信息
- **项目名称**: tomatowriter
- **用户名**: neondb_owner
- **数据库**: neondb
- **区域**: ap-southeast-1（新加坡）

---

## 迁移状态

### 本地环境（✅ 已完成）

- [x] 环境变量配置
- [x] 数据库连接验证
- [x] 数据库迁移
- [x] 超级管理员创建
- [x] 功能测试

### 生产环境（⏳ 待完成）

- [ ] Netlify 环境变量更新
- [ ] 自动部署
- [ ] 数据库连接验证
- [ ] 功能测试

---

## 快速参考

| 任务 | 命令 |
|------|------|
| 健康检查 | `curl http://localhost:5000/api/health` |
| 数据库迁移 | `npx tsx scripts/migrate-with-env.ts` |
| 连接验证 | `npx tsx scripts/verify-neon-connection.ts` |
| 用户注册 | `curl -X POST /api/auth/register -d '{"email":"...","password":"..."}'` |

---

**🎯 下一步：登录 Netlify Dashboard 更新环境变量**
