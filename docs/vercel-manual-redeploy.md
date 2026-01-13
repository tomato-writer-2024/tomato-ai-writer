# Vercel 手动重新部署指南

## 问题说明

Vercel自动部署使用的是旧commit（df40e30），而代码已经更新到最新commit（8bee3f5）。需要手动触发重新部署。

## 解决方案

### 方案1：通过Vercel控制台手动部署（推荐）

1. 访问Vercel项目页面：https://vercel.com/tomato-writer-2024/tomato-ai-writer/deployments
2. 找到最新的部署记录
3. 点击右上角的"..."菜单
4. 选择"Redeploy"按钮
5. 在弹出窗口中确认分支为main，点击"Redeploy"

### 方案2：等待Vercel自动检测

Vercel会自动检测GitHub仓库的新commit并触发部署。通常需要1-5分钟。

### 方案3：使用Vercel CLI（开发者）

如果你安装了Vercel CLI，可以运行：

```bash
vercel --prod
```

## 监控部署状态

### 1. 查看部署进度

访问部署页面：https://vercel.com/tomato-writer-2024/tomato-ai-writer/deployments

查看最新部署的状态：
- Building：正在构建
- Queued：队列中
- Ready：部署成功
- Error：部署失败

### 2. 查看构建日志

点击部署记录可以查看详细的构建日志。

### 3. 预期构建时间

- npm install：约18-20秒
- next build：约30-35秒
- 总计：约1-2分钟

## 本次修复内容

### 修复的问题

Vercel构建时报错："It looks like you're trying to use TypeScript but do not have the required package(s) installed."

### 修复方案

将TypeScript相关依赖从devDependencies移到dependencies：

**修改前：**
```json
"devDependencies": {
  "typescript": "^5",
  "@types/react": "^19",
  "@types/react-dom": "^19"
}
```

**修改后：**
```json
"dependencies": {
  "typescript": "^5",
  "@types/react": "^19",
  "@types/react-dom": "^19"
}
```

### Commit信息

- 最新commit：8bee3f5
- 提交信息：chore: 触发Vercel重新部署，修复TypeScript依赖问题
- 修复commit：afc4ffe
- 提交信息：fix: 将TypeScript依赖移到dependencies以修复Vercel构建失败问题

## 验证部署成功

部署成功后，访问以下页面验证：

### 1. 首页
```
https://your-domain.vercel.app
```
预期：首页正常显示，没有报错。

### 2. 登录功能
```
https://your-domain.vercel.app/login
```
测试账号：
- 邮箱：208343256@qq.com
- 密码：TomatoAdmin@2024

预期：登录成功，跳转到工作台。

### 3. 诊断页面
```
https://your-domain.vercel.app/test-vercel
```
预期：显示环境变量、数据库状态、JWT配置等信息。

### 4. 诊断API
```bash
curl https://your-domain.vercel.app/api/diagnose
```
预期：返回系统诊断信息（JSON格式）。

## 如果部署仍然失败

### 1. 查看完整的错误信息

点击部署记录，查看完整的构建日志。

### 2. 检查环境变量

确保Vercel项目配置了所有必需的环境变量：

必需变量：
- DATABASE_URL
- JWT_SECRET
- NODE_ENV=production

可选变量：
- WECHAT_APP_ID
- WECHAT_APP_SECRET
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- S3_ENDPOINT
- S3_ACCESS_KEY_ID
- S3_SECRET_ACCESS_KEY
- S3_BUCKET
- S3_REGION

### 3. 联系开发者

如果问题持续存在，请提供以下信息：
- 完整的Vercel构建日志
- 错误信息截图
- 环境变量配置截图（隐藏敏感信息）

## 常见问题

### Q1: 为什么Vercel使用的是旧commit？

A: Vercel自动部署可能有延迟，或者GitHub集成配置有问题。手动触发部署可以立即解决。

### Q2: 重新部署会删除现有数据吗？

A: 不会。Vercel只更新应用代码，不会影响Supabase数据库中的数据。

### Q3: 需要重新配置环境变量吗？

A: 不需要。环境变量保存在Vercel项目中，不会因为重新部署而丢失。

### Q4: 构建时间太长怎么办？

A: Vercel免费版构建时间限制为6000分钟/月。如果超出限制，可以：
- 清理不必要的依赖
- 使用构建缓存
- 升级到付费计划

## 相关文档

- Vercel快速开始：docs/VERCEL_QUICK_START.md
- 完整部署指南：docs/vercel-deployment-guide.md
- 环境变量清单：docs/vercel-env-checklist.md
- 登录修复报告：docs/vercel-login-fix-complete.md

## 下一步

部署成功后，按照以下顺序操作：

1. 验证首页加载正常
2. 测试登录功能
3. 检查诊断页面
4. 验证所有核心功能（写作、润色、续写）
5. 开始正常使用

---

最后更新：2025-01-13
文档版本：v1.0
