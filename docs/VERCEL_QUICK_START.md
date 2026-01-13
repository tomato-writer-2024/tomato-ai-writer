# Vercel部署快速开始指南

## 🚀 5分钟快速部署到Vercel

### 前置要求

1. ✅ 代码已推送到GitHub
2. ✅ 已注册Vercel账号（[vercel.com](https://vercel.com)）
3. ✅ 已有Supabase账号（免费）[supabase.com](https://supabase.com)

---

## 第1步：创建Supabase数据库（2分钟）

1. 登录 [Supabase](https://supabase.com)
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `tomato-ai-writer`
   - Database Password: **记住这个密码！**
   - Region: 选择离你最近的区域（如Singapore）
4. 点击 "Create new project"，等待1-2分钟

5. 获取数据库连接字符串：
   - 进入项目 → Settings → Database
   - 找到 "Connection string"
   - 复制URI格式的连接字符串（格式：`postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-ID].supabase.co:5432/postgres`）

---

## 第2步：导入项目到Vercel（1分钟）

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New" → "Project"
3. 选择GitHub仓库：`tomato-writer-2024/tomato-ai-writer`
4. 点击 "Import"

---

## 第3步：配置环境变量（2分钟，关键步骤！）

在Vercel项目配置页面，找到 "Environment Variables" 部分，添加以下变量：

### 必需的环境变量（必须全部配置）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | 复制第1步获取的Supabase连接字符串 | 数据库连接 |
| `JWT_SECRET` | 生成一个32位以上的随机字符串 | JWT密钥 |
| `NODE_ENV` | `production` | 环境模式 |
| `NEXT_PUBLIC_APP_NAME` | `番茄小说AI写作助手` | 应用名称 |
| `NEXT_PUBLIC_BASE_URL` | `https://tomato-ai-writer.vercel.app` | 应用域名 |

### 如何生成JWT_SECRET？

使用以下任一方法生成：

**方法1：在线生成**
访问 https://www.grc.com/passwords.htm，复制"63 random alpha-numeric characters"中的任意32位

**方法2：命令行生成（Mac/Linux）**
```bash
openssl rand -base64 32
```

**方法3：命令行生成（Windows）**
```powershell
powershell -Command "[System.Web.Security.Membership]::GeneratePassword(32,0)"
```

---

## 第4步：部署项目（等待2-5分钟）

1. 滚动到页面底部，点击 "Deploy" 按钮
2. 等待Vercel完成部署（通常2-5分钟）
3. 部署成功后，点击生成的URL（通常是 `https://tomato-ai-writer.vercel.app`）

---

## 第5步：初始化数据库（1分钟）

部署成功后，需要创建数据库表和管理员账户。

### 方法1：使用Vercel终端（推荐）

1. 进入Vercel项目 → Deployments → 选择最新部署
2. 点击 "..." → "Open Terminal"
3. 在终端中运行以下命令：

```bash
# 创建数据库表
npx tsx src/scripts/migrate.ts

# 创建超级管理员
npx tsx src/scripts/init-super-admin.ts

# 运行健康检查
npx tsx src/scripts/vercel-health-check.ts
```

### 方法2：使用Supabase SQL编辑器

1. 进入Supabase项目 → SQL Editor
2. 打开项目中的 `src/scripts/init-database.sql`
3. 复制所有SQL语句到Supabase SQL编辑器
4. 点击 "Run" 执行

---

## 第6步：验证部署

### 1. 检查诊断页面

访问：https://tomato-ai-writer.vercel.app/api/diagnose

应该看到类似以下JSON响应：

```json
{
  "success": true,
  "data": {
    "checks": {
      "database": {
        "status": "连接成功"
      },
      "jwt": {
        "status": "已配置",
        "valid": "有效"
      }
    }
  }
}
```

### 2. 检查诊断页面（可视化）

访问：https://tomato-ai-writer.vercel.app/test-vercel

应该看到完整的诊断报告，包括：
- ✅ 环境信息
- ✅ 数据库连接状态
- ✅ 超级管理员账户信息
- ✅ JWT配置状态

### 3. 测试登录

访问：https://tomato-ai-writer.vercel.app/simple-login

使用以下账号登录：
- **邮箱**：208343256@qq.com
- **密码**：TomatoAdmin@2024

### 4. 进入工作台

登录成功后，访问：
https://tomato-ai-writer.vercel.app/workspace

---

## 🔧 故障排查

### 问题1：部署失败

**检查清单：**
- [ ] 确认代码已推送到GitHub
- [ ] 确认所有必需的环境变量都已添加
- [ ] 查看Vercel构建日志

**解决方案：**
1. 进入Vercel项目 → Deployments → 点击最新部署
2. 查看 "Build Logs"，找到错误信息
3. 根据错误信息修复问题，重新部署

### 问题2：登录失败

**可能原因：**
- 数据库表未创建
- 超级管理员账户未创建
- 密码错误

**解决方案：**
1. 访问 `/api/diagnose` 检查数据库状态
2. 访问 `/test-vercel` 查看超级管理员是否存在
3. 确认密码是 `TomatoAdmin@2024`

### 问题3：数据库连接失败

**可能原因：**
- `DATABASE_URL` 格式错误
- Supabase密码错误
- Supabase项目未创建

**解决方案：**
1. 检查 `DATABASE_URL` 格式是否正确：
   ```
   postgresql://postgres:[PASSWORD]@[PROJECT-ID].supabase.co:5432/postgres
   ```
2. 确认Supabase项目状态是 "Active"
3. 重新获取连接字符串并更新环境变量

### 问题4：页面显示"访问遇到小插曲"

**可能原因：**
- 部署过程中出现错误
- 环境变量未正确配置

**解决方案：**
1. 查看Vercel部署日志
2. 确认所有环境变量都已添加并重新部署
3. 访问 `/api/diagnose` 进行诊断

---

## 📋 可选配置（生产环境）

### 邮件服务（用于密码重置）

如果需要密码重置功能，配置以下环境变量：

```bash
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@163.com
EMAIL_PASS=your-authorization-code
EMAIL_FROM=your-email@163.com
```

**获取163邮箱授权码：**
1. 登录163邮箱
2. 设置 → POP3/SMTP/IMAP → 开启服务
3. 获取授权码

### 豆包大模型（用于AI写作）

如果需要AI写作功能，配置以下环境变量：

```bash
DOUBAO_API_KEY=your-doubao-api-key
DOUBAO_MODEL=doubao-pro-4k
```

**获取豆包API Key：**
1. 注册火山引擎账号
2. 进入控制台 → 人工智能服务 → 大模型
3. 创建API Key

### 自定义域名

1. 在Vercel项目设置中，进入 "Domains"
2. 添加你的域名
3. 按照提示配置DNS记录
4. 更新环境变量 `NEXT_PUBLIC_BASE_URL` 为你的自定义域名

---

## 📚 相关文档

- [完整部署指南](./vercel-deployment-guide.md) - 详细的Vercel部署教程
- [环境变量清单](./vercel-env-checklist.md) - 环境变量配置检查清单
- [登录问题修复](./login-fix-summary.md) - 登录问题诊断和修复

---

## 🆘 获取帮助

如果遇到问题：

1. 查看 [Vercel文档](https://vercel.com/docs)
2. 访问诊断页面：`https://tomato-ai-writer.vercel.app/api/diagnose`
3. 查看项目 [GitHub Issues](https://github.com/tomato-writer-2024/tomato-ai-writer/issues)

---

## ✅ 部署成功检查清单

部署完成后，请确认以下所有项目：

- [ ] 首页正常加载
- [ ] 诊断API返回成功
- [ ] 超级管理员账户存在
- [ ] 可以成功登录
- [ ] 工作台页面正常加载

如果所有项目都通过 ✅，恭喜你，部署成功！

---

**部署完成后，你将拥有：**
- ✅ 免费的HTTPS访问
- ✅ 全球CDN加速
- ✅ 自动扩展的服务器
- ✅ 完整的AI写作工具

开始你的创作之旅吧！🚀
