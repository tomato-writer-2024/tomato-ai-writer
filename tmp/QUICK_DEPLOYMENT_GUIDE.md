# 番茄AI写作助手 - 快速部署指南

## 🚀 3步完成部署（5分钟）

---

### 步骤1：推送代码到GitHub（1分钟）

```bash
cd C:\tomato-ai-writer\tomato-ai-writer
git push origin main
```

如果需要输入用户名和密码，使用GitHub个人访问令牌：
- 获取Token：https://github.com/settings/tokens
- 命令：`git push https://<YOUR_TOKEN>@github.com/tomato-writer-2024/tomato-ai-writer.git main`

---

### 步骤2：配置Vercel环境变量（3分钟）

访问：https://vercel.com/tomato-writer-2024/tomato-ai-writer/settings/environment-variables

#### 必需配置（5个）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres` | Supabase数据库连接 |
| `JWT_SECRET` | `your-32-char-random-key` | JWT访问密钥（至少32位） |
| `JWT_REFRESH_SECRET` | `xK9mN2pQ4vR8sT6wY1aB3cD5eF7gH9jL0nM2pQ4rS6tU8vW0yZ2aB4cD6eF8gH0` | JWT刷新密钥 |
| `DOUBAO_API_KEY` | `ak-xxxxxxxxxxxxxxxxxxxxxxxx` | 豆包大模型API密钥 |
| `NEXT_PUBLIC_BASE_URL` | `https://tomato-ai-writer.vercel.app` | 生产环境域名 |

#### 如何获取这些值？

**DATABASE_URL**：
1. 访问：https://supabase.com/dashboard
2. 选择你的项目
3. Settings → Database → Connection string → URI
4. 复制连接字符串

**JWT_SECRET**：
- 访问：https://www.uuidgenerator.net/api/guid
- 复制生成的UUID（32位以上）

**DOUBAO_API_KEY**：
1. 访问：https://console.volcengine.com/
2. 开通豆包大模型服务（免费）
3. API密钥管理 → 创建密钥
4. 复制API Key（格式：`ak-...`）

---

### 步骤3：触发Vercel重新部署（1分钟）

1. 访问：https://vercel.com/tomato-writer-2024/tomato-ai-writer/deployments
2. 找到最新部署
3. 点击右上角 "..." 菜单
4. 选择 "Redeploy"
5. 等待部署完成（约2-3分钟）

---

## ✅ 部署验证

### 1. 访问网站

打开浏览器访问：https://tomato-ai-writer.vercel.app/

### 2. 检查页面内容

应该看到：
- ✅ "番茄AI写作助手"标题
- ✅ 导航栏（定价、登录、免费注册）
- ✅ "AI辅助创作 爆款爽文" 主标题
- ✅ "开始创作"和"查看套餐"按钮

### 3. 测试注册功能

1. 点击"免费注册"
2. 填写注册信息：
   - 用户名：testuser
   - 邮箱：testuser@example.com
   - 密码：password123
3. 点击"注册"
4. 应该跳转到工作区

### 4. 测试登录功能

1. 点击"登录"
2. 输入刚才注册的邮箱和密码
3. 点击"登录"
4. 应该跳转到工作区

---

## ⚠️ 常见问题

### Q1：部署后页面显示404或500错误？

**A**：检查环境变量是否配置正确，特别是：
- DATABASE_URL 格式是否正确
- DOUBAO_API_KEY 是否有效

### Q2：用户注册失败？

**A**：
1. 检查Supabase数据库连接是否正常
2. 查看Vercel部署日志中的错误信息
3. 确保JWT_SECRET和JWT_REFRESH_SECRET已配置

### Q3：AI功能不工作？

**A**：
1. 检查DOUBAO_API_KEY是否正确
2. 确认豆包大模型服务已开通
3. 查看Vercel部署日志中的错误信息

### Q4：如何查看部署日志？

**A**：
1. 访问：https://vercel.com/tomato-writer-2024/tomato-ai-writer/deployments
2. 点击最新部署
3. 点击 "Build Logs" 或 "Function Logs"

### Q5：需要配置邮件服务吗？

**A**：不需要。邮件功能是可选的，不配置也不会影响其他功能。

---

## 📞 技术支持

如果遇到问题：

1. 查看详细修复报告：`tmp/WEBSITE_ACCESS_FIX_REPORT.md`
2. 查看部署检查清单：`docs/DEPLOYMENT_CHECKLIST.md`
3. 查看完整部署指南：`docs/ZERO_COST_DEPLOYMENT_GUIDE.md`

---

## 🎉 部署成功标志

如果看到以下内容，说明部署成功：

- ✅ 网站可以正常访问
- ✅ 所有页面显示正常
- ✅ 用户可以注册
- ✅ 用户可以登录
- ✅ AI功能可用（需配置DOUBAO_API_KEY）

---

**祝部署顺利！** 🚀
