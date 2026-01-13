# AI优化功能快速部署指南

## 一、部署前准备

### 1.1 数据库迁移

在部署前，需要先运行数据库迁移脚本，创建版本控制表：

```bash
# 方法1：直接执行SQL
psql YOUR_DATABASE_URL -f src/migrations/create_content_versions_table.sql

# 方法2：如果使用Supabase，在Supabase控制台执行SQL
# 打开 Supabase Dashboard -> SQL Editor -> 粘贴SQL并执行
```

### 1.2 环境变量检查

确保以下环境变量已配置：

```env
# 数据库
DATABASE_URL=postgresql://...

# AI服务（豆包大模型）
DOUBAO_API_KEY=...

# 认证
JWT_SECRET=...

# 其他（可选）
NODE_ENV=production
DISABLE_RATE_LIMIT=false
```

---

## 二、部署步骤

### 2.1 推送到GitHub

```bash
# 添加所有新文件
git add .

# 提交代码
git commit -m "feat: 优化AI生成质量并实现新功能

- 创建统一提示词库（src/lib/prompts.ts）
- 新增质量评估API（/api/ai/quality）
- 实现对话式写作功能（/api/ai/dialogue, /dialogue）
- 添加语音输入组件（VoiceInput.tsx）
- 扩展写作模板库（6→15个模板）
- 实现版本控制功能（/api/versions）
- 优化移动端适配
- 修复TypeScript类型错误"

# 推送到GitHub
git push origin main
```

### 2.2 Vercel部署

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. Vercel会自动检测到新的推送并开始部署
4. 等待部署完成（约2-3分钟）

### 2.3 配置环境变量

在Vercel中配置环境变量：

1. 打开项目 -> Settings -> Environment Variables
2. 添加以下变量（参考1.2节）
3. 点击Save保存
4. 重新部署项目（Redeploy）

---

## 三、部署后验证

### 3.1 检查部署状态

访问Vercel Dashboard，确保：
- ✅ Build Status: Success
- ✅ 所有构建步骤通过
- ✅ 无错误日志

### 3.2 功能测试

#### 测试1: 访问首页
```
URL: https://your-project.vercel.app/
预期: 正常显示首页
```

#### 测试2: 访问对话式写作页面
```
URL: https://your-project.vercel.app/dialogue
预期: 显示对话界面，快捷操作按钮可点击
```

#### 测试3: 语音输入
```
步骤:
1. 打开 /dialogue 页面
2. 点击麦克风按钮
3. 允许浏览器麦克风权限
4. 说话，检查是否实时转文字

预期: 语音成功转换为文字
注意: 需要Chrome或Safari浏览器
```

#### 测试4: 模板页面
```
URL: https://your-project.vercel.app/templates
预期: 显示15个模板，分类筛选正常
```

#### 测试5: 质量评估API
```bash
curl -X POST https://your-project.vercel.app/api/ai/quality \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "林逸一拳轰出，拳风呼啸，气势惊人...",
    "genre": "都市爽文"
  }'

预期: 返回JSON格式的质量评估结果
{
  "success": true,
  "data": {
    "totalScore": 85,
    "dimensions": {...},
    "overallFeedback": "...",
    "improvementSuggestions": [...]
  }
}
```

#### 测试6: 对话式写作API
```bash
curl -X POST https://your-project.vercel.app/api/ai/dialogue \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "messages": [
      {"role": "user", "content": "帮我设计一个都市爽文的开头"}
    ],
    "genre": "都市爽文"
  }'

预期: 返回流式文本
```

### 3.3 移动端测试

1. 在手机上打开网站
2. 检查导航栏是否正常显示
3. 检查对话页面是否适配
4. 检查按钮是否可点击
5. 测试响应式布局

---

## 四、常见问题

### 4.1 数据库表不存在

**错误信息**: `relation "content_versions" does not exist`

**解决方案**:
1. 确保已运行数据库迁移脚本（见2.1节）
2. 检查表是否创建成功：
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'content_versions';
   ```

### 4.2 语音输入不工作

**问题**: 点击麦克风没有反应

**可能原因**:
1. 浏览器不支持（推荐Chrome）
2. 麦克风权限被拒绝
3. 网络问题（Web Speech API需要网络）

**解决方案**:
- 使用Chrome或Safari浏览器
- 在浏览器设置中允许麦克风权限
- 检查网络连接

### 4.3 版本控制功能无法使用

**可能原因**:
- 数据库表未创建
- 用户未登录
- 权限不足

**解决方案**:
1. 检查数据库表是否存在
2. 确保已登录
3. 检查Token是否有效

### 4.4 API返回401未授权

**解决方案**:
1. 确保已登录
2. 检查Token是否存在：`localStorage.getItem('token')`
3. 检查Token是否过期

---

## 五、性能优化建议

### 5.1 Vercel Edge Functions

将高流量API迁移到Edge Functions：

```javascript
// api/ai/dialogue/route.ts
export const runtime = 'edge';
```

### 5.2 缓存配置

在Next.js配置中启用缓存：

```javascript
// next.config.mjs
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};
```

### 5.3 CDN加速

Vercel自动提供CDN加速，无需额外配置。

---

## 六、监控和日志

### 6.1 Vercel Analytics

启用Vercel Analytics：

1. 打开项目 -> Analytics
2. 点击Enable Analytics
3. 复制代码到`app/layout.tsx`

### 6.2 错误监控

使用Sentry进行错误监控：

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## 七、回滚方案

如果部署后出现问题，可以快速回滚：

1. 打开Vercel Dashboard
2. 进入项目 -> Deployments
3. 找到上一个稳定版本
4. 点击... -> Promote to Production

---

## 八、支持

如有问题，请联系开发团队或查看文档：

- [完整更新报告](./AI优化与新功能更新报告.md)
- [API文档](./API文档.md)
- [部署指南](./vercel-deployment-guide.md)

---

## 九、更新日志

### v2.0.0 (2024-01-XX)

**新增功能**:
- ✅ AI对话式写作
- ✅ 语音输入
- ✅ 质量评估
- ✅ 版本控制
- ✅ 扩展模板库（15个模板）

**优化**:
- ✅ 统一提示词库
- ✅ 移动端适配优化
- ✅ TypeScript类型检查
- ✅ 响应式设计优化

**修复**:
- ✅ 修复TypeScript类型错误
- ✅ 优化导航链接
- ✅ 修复模板页面布局

---

**祝部署顺利！** 🚀
