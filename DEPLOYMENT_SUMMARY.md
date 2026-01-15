# 番茄小说AI写作工具 - Netlify 部署总结

## 📋 已完成的工作

### 1. 修正 Netlify 配置

**文件**：`netlify.toml`

**修改内容**：
- 将构建命令从 `npm run build` 改为 `pnpm run build`
- 将 Node 版本从 `20` 更新为 `24`
- 添加 `NPM_FLAGS="--legacy-peer-deps"` 以避免依赖冲突
- 配置 Functions 使用 `esbuild` 打包器

### 2. 创建部署文档

已创建以下文档：

| 文档名 | 说明 |
|--------|------|
| `NETLIFY_DEPLOYMENT_GUIDE.md` | 完整的 Netlify 部署指南（包含所有步骤和故障排查） |
| `ENV_VARIABLES_GUIDE.md` | 详细的 Netlify 环境变量配置指南 |
| `NETLIFY_DEPLOY_COMMANDS.md` | Netlify 部署的完整命令执行步骤 |

### 3. 提交代码到 Git

**提交信息**：
```
feat: 添加 Netlify 部署配置和详细文档

- 修正 netlify.toml，使用 pnpm 作为包管理器
- 更新 Node 版本为 24
- 添加 Netlify 部署完整指南 (NETLIFY_DEPLOYMENT_GUIDE.md)
- 添加环境变量配置指南 (ENV_VARIABLES_GUIDE.md)
- 支持生产环境、预览环境、开发环境三种配置策略
```

**远程仓库**：`https://github.com/tomato-writer-2024/tomato-ai-writer.git`

---

## 🚀 快速部署步骤

### 方法 1：通过 Netlify 网页界面部署

#### 第一步：连接 GitHub 仓库

1. 访问 [https://app.netlify.com](https://app.netlify.com)
2. 点击 **"Add new site"** → **"Import an existing project"**
3. 选择 **"GitHub"**
4. 找到并导入 `tomato-writer-2024/tomato-ai-writer` 仓库

#### 第二步：配置构建设置

| 配置项 | 值 |
|--------|-----|
| Build command | `pnpm run build` |
| Publish directory | `.next` |
| Branch to deploy | `main` |

#### 第三步：配置环境变量

在 **"Site configuration"** → **"Environment variables"** 中添加：

**必需变量**：

```bash
NEXT_PUBLIC_BASE_URL=https://your-site-name.netlify.app
JWT_SECRET=<生成32位以上随机字符串>
JWT_REFRESH_SECRET=<生成32位以上随机字符串>
DOUBAO_API_KEY=ak-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URL=postgresql://neondb_owner:npg_9ucFS2HzCGdV@ep-small-salad-a142jglw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**推荐变量**：

```bash
NEXT_PUBLIC_APP_NAME=番茄小说AI写作助手
DOUBAO_MODEL=doubao-pro-4k
EMAIL_MOCK_MODE=true
```

#### 第四步：部署

点击 **"Deploy site"** 按钮，等待部署完成。

### 方法 2：使用 Netlify CLI 部署

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录
netlify login

# 3. 初始化站点
cd /workspace/projects
netlify init

# 4. 配置环境变量
netlify env:set JWT_SECRET "your-super-secret-jwt-key"
netlify env:set JWT_REFRESH_SECRET "your-refresh-token-key"
netlify env:set DOUBAO_API_KEY "your-doubao-api-key"
netlify env:set DATABASE_URL "your-database-url"
netlify env:set NEXT_PUBLIC_BASE_URL "https://your-app.netlify.app"

# 5. 部署
netlify deploy --prod
```

---

## ✅ 部署验证清单

部署完成后，请验证以下功能：

- [ ] 访问站点首页（应该显示欢迎页面）
- [ ] 用户注册功能正常（访问 `/login` → 注册）
- [ ] 用户登录功能正常
- [ ] AI 写作功能正常（创建小说 → 撰写章节）
- [ ] 社区功能正常（浏览帖子、发布帖子）
- [ ] 管理后台功能正常（访问 `/admin/login`）
- [ ] 控制台无错误信息
- [ ] API 响应正常（检查 Network 面板）

---

## 🔑 关键配置说明

### 1. 必需的环境变量

| 变量名 | 说明 | 获取方式 |
|--------|------|---------|
| `JWT_SECRET` | JWT 访问令牌密钥 | 生成 32 位以上随机字符串 |
| `JWT_REFRESH_SECRET` | JWT 刷新令牌密钥 | 生成 32 位以上随机字符串 |
| `DOUBAO_API_KEY` | 豆包大模型 API Key | 访问火山引擎控制台获取 |
| `DATABASE_URL` | Neon 数据库连接字符串 | 使用已提供的 Neon 数据库 |
| `NEXT_PUBLIC_BASE_URL` | 应用域名 | 部署后填入实际域名 |

### 2. 数据库配置

已提供 Neon PostgreSQL 数据库：

```bash
DATABASE_URL=postgresql://neondb_owner:npg_9ucFS2HzCGdV@ep-small-salad-a142jglw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**特点**：
- 使用 Pooler 模式（适应 Netlify 10 秒超时）
- 支持 IPv4 连接
- 完全免费

### 3. 邮件服务配置

**方案一：使用 Mock 模式（推荐用于测试）**

```bash
EMAIL_MOCK_MODE=true
```

**方案二：使用真实邮件服务**

以 163 邮箱为例：

```bash
EMAIL_HOST=smtp.163.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@163.com
EMAIL_PASS=your_email_authorization_code
EMAIL_FROM=番茄小说AI <your_email@163.com>
EMAIL_MOCK_MODE=false
```

---

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| `NETLIFY_DEPLOYMENT_GUIDE.md` | 完整的部署指南，包含详细步骤和故障排查 |
| `ENV_VARIABLES_GUIDE.md` | 详细的环境变量配置说明 |
| `NETLIFY_DEPLOY_COMMANDS.md` | 完整的命令执行步骤 |

---

## 🎯 部署成功标志

当以下条件全部满足时，说明部署成功：

✅ 站点可以正常访问
✅ 用户可以注册和登录
✅ AI 写作功能正常（响应时间 < 1 秒）
✅ 社区功能完整可用
✅ 管理后台可以正常访问和管理
✅ 所有 API 返回正确的 JSON 格式
✅ 数据库读写正常
✅ 无控制台错误
✅ 性能评分 > 90

---

## 📞 技术支持

如遇到部署问题，可以：

1. 查看 `NETLIFY_DEPLOYMENT_GUIDE.md` 中的"常见问题排查"部分
2. 检查 Netlify Functions 日志
3. 查看项目的 GitHub Issues
4. 参考 [Netlify 官方文档](https://docs.netlify.com/)

---

**现在你可以按照上述步骤将项目部署到 Netlify 了！** 🚀
