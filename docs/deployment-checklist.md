# 部署验证清单

本文档提供了番茄小说AI写作工具部署后的完整验证清单，确保所有功能正常运行。

## 部署状态检查

### 1. Vercel 部署状态

- [ ] 构建成功（Build Success）
- [ ] 部署成功（Deploy Success）
- [ ] 生产环境URL可访问
- [ ] 环境变量已全部配置
- [ ] 域名配置正确（如使用自定义域名）

### 2. 健康检查

运行以下命令检查应用健康状态：

```bash
# 检查首页
curl -I https://your-app.vercel.app

# 预期响应：HTTP/1.1 200 OK

# 检查API健康状态
curl https://your-app.vercel.app/api/health

# 预期响应：{"status":"ok","timestamp":"..."}
```

---

## 用户认证功能测试

### 3. 用户注册

- [ ] 访问注册页面 `/auth/register`
- [ ] 输入邮箱和密码
- [ ] 提交注册表单
- [ ] 验证是否成功注册
- [ ] 检查是否发送验证邮件

**测试命令**：
```bash
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test@123",
    "confirmPassword":"Test@123"
  }'
```

**预期响应**：
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

### 4. 用户登录

- [ ] 访问登录页面 `/auth/login`
- [ ] 输入注册的邮箱和密码
- [ ] 提交登录表单
- [ ] 验证是否成功登录
- [ ] 验证Token是否正确生成

**测试命令**：
```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test@123"
  }'
```

**预期响应**：
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "...",
    "refreshToken": "..."
  }
}
```

### 5. 用户资料

- [ ] 访问用户资料页面 `/profile`
- [ ] 验证用户信息显示正确
- [ ] 测试编辑用户信息
- [ ] 测试修改密码

**测试命令**：
```bash
curl https://your-app.vercel.app/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. 登出功能

- [ ] 点击登出按钮
- [ ] 验证是否成功登出
- [ ] 验证Token是否失效

---

## 核心创作功能测试

### 7. 章节撰写 (`/writing/chapter`)

- [ ] 访问章节撰写页面
- [ ] 输入章节标题
- [ ] 输入章节大纲或提示词
- [ ] 点击生成按钮
- [ ] 验证AI生成内容
- [ ] 测试保存功能
- [ ] 测试导出功能（Word/TXT）

**测试API**：
```bash
curl -X POST https://your-app.vercel.app/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt":"写一段关于英雄觉醒的章节",
    "context":"玄幻世界，修炼体系",
    "wordCount":2000
  }'
```

### 8. 精修润色 (`/writing/polish`)

- [ ] 访问精修润色页面
- [ ] 输入待润色文本
- [ ] 选择润色类型（语法、情感、逻辑等）
- [ ] 点击润色按钮
- [ ] 验证润色结果
- [ ] 查看修改建议

### 9. 智能续写 (`/continue`)

- [ ] 访问智能续写页面
- [ ] 导入前文内容
- [ ] 选择续写类型（自动/章节/批量）
- [ ] 点击续写按钮
- [ ] 验证续写内容的连贯性
- [ ] 检查字数控制
- [ ] 测试导出功能

**测试API**：
```bash
curl -X POST https://your-app.vercel.app/api/continue \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content":"前文内容...",
    "type":"auto",
    "wordCount":2000
  }'
```

---

## 作品管理功能测试

### 10. 创建作品

- [ ] 访问工作台 `/workspace`
- [ ] 点击"新建作品"
- [ ] 输入作品标题
- [ ] 输入作品描述
- [ ] 选择作品类型
- [ ] 提交创建
- [ ] 验证作品创建成功

**测试API**：
```bash
curl -X POST https://your-app.vercel.app/api/novels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title":"测试作品",
    "description":"这是一个测试作品",
    "genre":"玄幻"
  }'
```

### 11. 查看作品列表

- [ ] 访问作品列表页面
- [ ] 验证作品显示正确
- [ ] 测试分页功能
- [ ] 测试搜索功能
- [ ] 测试筛选功能

**测试API**：
```bash
curl https://your-app.vercel.app/api/novels \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 12. 编辑作品信息

- [ ] 进入作品详情页
- [ ] 点击编辑按钮
- [ ] 修改作品标题
- [ ] 修改作品描述
- [ ] 上传封面图片
- [ ] 保存修改
- [ ] 验证修改成功

### 13. 删除作品

- [ ] 进入作品详情页
- [ ] 点击删除按钮
- [ ] 确认删除
- [ ] 验证作品已删除

---

## 文件导入导出测试

### 14. 导入 Word 文件

- [ ] 选择 Word 文件（.docx）
- [ ] 点击导入按钮
- [ ] 验证文件内容正确解析
- [ ] 检查字数统计
- [ ] 验证格式保留

**支持的格式**：
- Word 文档（.docx）
- 文本文件（.txt）
- PDF 文件（需额外配置，已暂时禁用）

### 15. 导出为 Word

- [ ] 选择导出格式为 Word
- [ ] 点击导出按钮
- [ ] 验证文件下载成功
- [ ] 打开文件验证格式正确

### 16. 导出为 TXT

- [ ] 选择导出格式为 TXT
- [ ] 点击导出按钮
- [ ] 验证文件下载成功
- [ ] 打开文件验证内容完整

---

## 邮件服务测试

### 17. 验证邮件发送

- [ ] 注册新用户
- [ ] 检查邮箱是否收到验证邮件
- [ ] 点击验证链接
- [ ] 验证邮箱验证成功

**测试API**：
```bash
curl -X POST https://your-app.vercel.app/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 18. 密码重置邮件

- [ ] 访问忘记密码页面
- [ ] 输入注册邮箱
- [ ] 点击发送重置邮件
- [ ] 检查邮箱是否收到重置邮件
- [ ] 点击重置链接
- [ ] 输入新密码
- [ ] 验证密码重置成功

---

## 统计分析测试

### 19. 用户统计

- [ ] 访问用户统计页面
- [ ] 验证累计字数显示正确
- [ ] 验证作品数量显示正确
- [ ] 验证今日创作显示正确
- [ ] 验证会员等级显示正确

**测试API**：
```bash
curl https://your-app.vercel.app/api/user/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 20. 内容质量分析

- [ ] 导入一段内容
- [ ] 点击分析按钮
- [ ] 验证质量评分显示
- [ ] 验证完读率计算
- [ ] 验证爽点统计
- [ ] 验证阅读时间估算

---

## 微信登录测试（可选）

### 21. 微信扫码登录

- [ ] 访问登录页面
- [ ] 点击"微信登录"
- [ ] 扫描二维码
- [ ] 确认授权
- [ ] 验证登录成功
- [ ] 检查用户信息绑定

### 22. 微信账号绑定

- [ ] 已登录状态下
- [ ] 访问账号设置
- [ ] 点击"绑定微信"
- [ ] 扫码绑定
- [ ] 验证绑定成功

---

## 性能测试

### 23. 页面加载速度

- [ ] 首页加载时间 < 2秒
- [ ] 工作台加载时间 < 3秒
- [ ] 章节撰写页面加载时间 < 2秒
- [ ] 智能续写页面加载时间 < 2秒

**测试工具**：
- Google Lighthouse
- WebPageTest

### 24. API 响应时间

- [ ] 注册接口响应时间 < 1秒
- [ ] 登录接口响应时间 < 1秒
- [ ] AI生成接口首字响应时间 < 1秒
- [ ] 文件上传接口响应时间 < 3秒

**测试命令**：
```bash
# 测试登录接口响应时间
time curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'
```

### 25. 并发测试

- [ ] 10个并发用户登录
- [ ] 10个并发用户生成内容
- [ ] 验证系统稳定性
- [ ] 检查错误率

**测试工具**：
- Apache Bench (ab)
- Apache JMeter

---

## 安全性测试

### 26. SQL 注入防护

- [ ] 测试登录接口的 SQL 注入防护
- [ ] 测试注册接口的 SQL 注入防护
- [ ] 测试搜索功能的 SQL 注入防护

**测试示例**：
```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com\' OR 1=1 --","password":"test"}'
```

### 27. XSS 防护

- [ ] 测试作品标题的 XSS 防护
- [ ] 测试作品描述的 XSS 防护
- [ ] 测试评论功能的 XSS 防护

### 28. CSRF 防护

- [ ] 验证表单提交包含 CSRF Token
- [ ] 测试重复提交保护
- [ ] 验证 Token 过期机制

### 29. 认证授权

- [ ] 验证未登录无法访问受保护页面
- [ ] 验证过期 Token 无法使用
- [ ] 验证刷新 Token 机制正常
- [ ] 验证权限控制正确

---

## 兼容性测试

### 30. 浏览器兼容性

- [ ] Chrome 最新版
- [ ] Firefox 最新版
- [ ] Safari 最新版
- [ ] Edge 最新版
- [ ] 移动端 Chrome（Android）
- [ ] 移动端 Safari（iOS）

### 31. 响应式设计

- [ ] 桌面端（1920x1080）
- [ ] 笔记本（1366x768）
- [ ] 平板（768x1024）
- [ ] 手机（375x667）

---

## 错误处理测试

### 32. 网络错误处理

- [ ] 断网状态下测试功能
- [ ] 验证错误提示友好
- [ ] 验证重试机制

### 33. API 错误处理

- [ ] 测试 400 Bad Request
- [ ] 测试 401 Unauthorized
- [ ] 测试 403 Forbidden
- [ ] 测试 404 Not Found
- [ ] 测试 500 Internal Server Error
- [ ] 验证错误提示清晰

### 34. 表单验证

- [ ] 测试必填字段验证
- [ ] 测试邮箱格式验证
- [ ] 测试密码强度验证
- [ ] 测试文件大小限制
- [ ] 测试文件类型限制

---

## 监控和日志

### 35. Vercel 日志检查

- [ ] 检查 Functions 日志
- [ ] 检查 Build 日志
- [ ] 检查错误日志
- [ ] 检查访问日志

### 36. 性能监控

- [ ] 配置 Vercel Analytics
- [ ] 配置错误告警（可选）
- [ ] 检查页面访问统计
- [ ] 检查API调用统计

---

## 文档和帮助

### 37. 用户文档

- [ ] 帮助中心页面可访问
- [ ] 使用指南完整
- [ ] 常见问题解答
- [ ] 视频教程（可选）

### 38. 开发文档

- [ ] API 文档完整
- [ ] 部署文档完整
- [ ] 故障排查文档
- [ ] 开发者指南

---

## 最终验收

### 39. 核心功能验收

- [ ] 用户可以注册并登录
- [ ] 用户可以创建和管理作品
- [ ] 用户可以生成章节内容
- [ ] 用户可以润色和续写内容
- [ ] 用户可以导入导出文件
- [ ] 邮件验证功能正常
- [ ] AI生成功能正常

### 40. 性能指标验收

- [ ] 首页加载时间 < 2秒
- [ ] AI首字响应时间 < 1秒
- [ ] API 成功率 > 99%
- [ ] 错误率 < 1%

### 41. 安全性验收

- [ ] 通过 SQL 注入测试
- [ ] 通过 XSS 防护测试
- [ ] 通过 CSRF 防护测试
- [ ] 通过认证授权测试

---

## 问题记录

在测试过程中发现的问题记录：

| 序号 | 问题描述 | 严重程度 | 状态 | 备注 |
|------|----------|----------|------|------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## 测试签名

**测试人员**：_______________

**测试日期**：_______________

**部署版本**：_______________

**测试结论**：

- [ ] 通过，可以上线
- [ ] 不通过，需要修复以下问题：

---

最后更新时间：2025-01-15
