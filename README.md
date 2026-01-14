# 番茄小说AI辅助写作工具

专为番茄小说平台打造的AI辅助写作工具，帮助小说创作者快速生成符合番茄平台风格的爆款爽文内容。

## 功能特性

### 核心功能

1. **智能章节撰写**
   - 完读率潜力计算
   - 爽点密度控制（每500字至少一个爽点）
   - 自动分章系统
   - 标题自动生成

2. **精修润色工坊**
   - 网感增强（口语化转化）
   - 爽点放大（细节增强、情绪渲染）
   - 冗余内容修剪
   - 节奏优化

3. **智能续写大脑**
   - 剧情逻辑锚点
   - 多分支剧情生成
   - 风格一致性保障
   - 伏笔回收系统

4. **文件导入导出** ✨新增
   - 支持 Word (.docx) 格式
   - 支持 PDF 格式
   - 支持 TXT 格式
   - 一键导入已创作内容
   - 多格式导出，方便分享和备份

### 平台适配

- 番茄算法适配层
- 黄金800字留存模型
- 排版规范自动执行
- 敏感词检测

### 质量评估

- 完读率预测
- 推荐潜力评分
- 合规性检测
- 爽点密度分析

## 技术栈

- **前端框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **AI模型**: 豆包大语言模型（通过 coze-coding-dev-sdk 集成）
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL (Neon/Supabase)
  - 📄 [数据库配置文档](./docs/DATABASE.md)
  - 📄 [Neon迁移指南](./NEON_MIGRATION_GUIDE.md)
  - 📄 [Neon快速检查清单](./NEON_MIGRATION_CHECKLIST.md)
- **部署**: Netlify (免费版)
  - 📄 [数据库问题诊断](./DATABASE_DIAGNOSIS.md)
  - 📄 [数据库修复总结](./DATABASE_FIX_SUMMARY.md)
- **文件处理**:
  - mammoth - Word 文档读取
  - pdf-parse - PDF 文档读取
  - docx - Word 文档生成
  - jsPDF - PDF 文档生成

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── generate/         # 章节生成API
│   │   ├── polish/            # 润色API
│   │   ├── continue/          # 续写API
│   │   └── auth/              # 认证API
│   ├── workspace/             # 写作工作台
│   ├── login/                 # 登录页
│   ├── register/              # 注册页
│   ├── pricing/               # 定价页
│   └── page.tsx               # 首页
```

## 数据库配置

### 当前状态

项目已配置自动降级机制，确保系统始终可用：

- **真实数据库模式**（推荐）：连接到PostgreSQL数据库（Neon或Supabase）
- **自动降级模式**：数据库连接失败时自动切换到Mock模式
- **Mock模式**（开发环境）：强制使用内存数据库，不连接真实数据库

### 环境变量配置

在 `.env.local` 文件中配置：

```bash
# 数据库连接字符串（推荐使用Neon）
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# 数据库模式配置
DATABASE_MOCK_MODE=false  # true=Mock模式, false=真实数据库模式

# JWT密钥
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

### 数据库迁移

```bash
# 创建表结构
npm run migrate

# 验证数据库连接
npx tsx scripts/verify-neon-connection.ts
```

### 迁移到 Neon PostgreSQL

如果当前遇到数据库连接问题（如IPv6不可达），建议迁移到Neon：

📄 **详细步骤**: [NEON_MIGRATION_GUIDE.md](./NEON_MIGRATION_GUIDE.md)

📋 **快速检查清单**: [NEON_MIGRATION_CHECKLIST.md](./NEON_MIGRATION_CHECKLIST.md)

**快速迁移**（5分钟）：
1. 访问 https://neon.tech/ 创建账号和项目
2. 复制连接字符串
3. 更新 `.env.local` 中的 `DATABASE_URL`
4. 运行 `npm run migrate`
5. 更新Netlify环境变量

### 健康检查

```bash
# 本地环境
curl http://localhost:5000/api/health

# 生产环境
curl https://tomatowriter.netlify.app/api/health
```

期望返回：
```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "ok",
      "mode": "real"
    }
  }
}
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
bash .cozeproj/scripts/dev_run.sh
```

访问 http://localhost:5000 查看应用

### 构建生产版本

```bash
npx tsc --noEmit  # 类型检查
pnpm run build
```

## 部署指南 🚀

> **不会代码的个人开发者也能轻松部署！0成本，完全免费！**

### Vercel部署（推荐，5分钟搞定）

🔥 **最简单、最快速的部署方式，适合所有用户！**

| 文档 | 说明 | 路径 |
|------|------|------|
| 🚀 Vercel快速开始 | 5分钟快速部署到Vercel，完全免费 | [docs/VERCEL_QUICK_START.md](docs/VERCEL_QUICK_START.md) |
| 📖 Vercel完整部署指南 | 详细的Vercel部署教程，包含故障排查 | [docs/vercel-deployment-guide.md](docs/vercel-deployment-guide.md) |
| ✅ 环境变量清单 | Vercel环境变量配置检查清单 | [docs/vercel-env-checklist.md](docs/vercel-env-checklist.md) |

**为什么选择Vercel？**
- ✅ 完全免费（Hobby计划）
- ✅ 自动HTTPS
- ✅ 全球CDN加速
- ✅ 一键部署，无需配置服务器
- ✅ 自动扩展，无需手动运维

### 本地部署

| 文档 | 说明 | 路径 |
|------|------|------|
| 🚀 快速开始指引 | 5分钟了解部署流程，选择适合你的部署方案 | [docs/QUICK_START_DEPLOYMENT.md](docs/QUICK_START_DEPLOYMENT.md) |
| 📖 完整部署指南 | 详细的0成本部署步骤，包含所有配置说明 | [docs/ZERO_COST_DEPLOYMENT_GUIDE.md](docs/ZERO_COST_DEPLOYMENT_GUIDE.md) |
| ✅ 配置检查清单 | 逐项检查配置是否完成，确保部署成功 | [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md) |

### 0成本部署方案

**总成本**：0元（全部使用免费服务）
**预计耗时**：2-3小时（大部分时间等待微信审核）

**使用的服务**：
- GitHub（免费）- 代码托管
- Vercel（免费）- 网站部署
- 163/QQ/Gmail邮箱（免费）- 邮件服务
- 微信开放平台（免费）- 微信登录
- 豆包AI（免费）- AI写作功能

### 快速开始

1. **注册账号**（30分钟）
   - GitHub账号：https://github.com
   - Vercel账号：https://vercel.com（使用GitHub登录）
   - 邮箱账号：163/QQ/Gmail三选一
   - 豆包账号：https://www.doubao.com
   - 微信开放平台：https://open.weixin.qq.com

2. **配置邮件服务**（20分钟）
   - 获取邮箱授权码（详细步骤见部署指南）
   - 在Vercel中配置邮件环境变量

3. **部署到Vercel**（30分钟）
   - 连接GitHub仓库
   - 导入项目到Vercel
   - 等待部署完成

4. **配置环境变量**（15分钟）
   - 添加所有必需的环境变量
   - 重新部署项目

5. **测试验证**（30分钟）
   - 测试网站访问
   - 测试用户注册和登录
   - 测试邮件发送
   - 测试AI功能

**详细步骤**：请查看 [完整部署指南](docs/ZERO_COST_DEPLOYMENT_GUIDE.md)

### 常见问题

**Q：部署到Vercel后无法登录？**
A：请按照以下步骤排查：
1. 访问 `https://tomato-ai-writer.vercel.app/api/diagnose` 检查配置
2. 访问 `https://tomato-ai-writer.vercel.app/test-vercel` 查看详细报告
3. 确认超级管理员账户是否存在
4. 检查 `DATABASE_URL` 和 `JWT_SECRET` 环境变量是否正确配置

**Q：完全不懂代码，能完成部署吗？**
A：完全可以！Vercel快速部署指南专为不会代码的个人开发者编写，所有步骤都有详细说明。

**Q：整个流程需要花钱吗？**
A：不需要！Vercel的Hobby计划完全免费，Supabase也有免费计划，总成本为0元。

**Q：可以使用手机完成部署吗？**
A：建议使用电脑，因为需要操作GitHub、配置环境变量。

更多常见问题：请查看 [Vercel部署常见问题](docs/vercel-deployment-guide.md#常见问题排查)

## 使用指南

### 1. 智能章节撰写

1. 进入工作台
2. 填写章节信息（章节号、目标字数）
3. 输入故事背景、角色信息
4. 编写本章大纲
5. 输入创作提示
6. 点击"AI生成章节"

**示例提示词**:
```
主角发现金手指，系统激活，获得超强能力，在同学面前展示实力，打脸富二代
```

### 2. 精修润色

1. 生成章节后，点击"精修润色"按钮
2. AI会自动优化：
   - 语言风格（更口语化、网感强）
   - 爽点强度（增加细节、渲染情绪）
   - 节奏控制（去除冗余、推进剧情）

### 3. 智能续写

1. 在续写标签页，点击"智能续写"
2. AI会根据前文内容：
   - 保持逻辑连贯
   - 确保角色一致
   - 提供多个续写方向
   - 设计结尾钩子

### 4. 文件导入 ✨新增

支持导入以下格式的文件：
- Word 文档 (.docx)
- PDF 文档 (.pdf)
- 纯文本 (.txt)

**操作步骤**：
1. 点击输出区右上角的"导入"按钮
2. 选择本地文件
3. 等待文件读取完成
4. 内容会自动填充到编辑器中

**适用场景**：
- 导入已创作的章节内容
- 导入参考资料或设定文档
- 批量处理多个章节
- 从其他写作工具迁移内容

### 5. 文件导出 ✨新增

支持导出为以下格式：
- Word 文档 (.docx)
- PDF 文档 (.pdf)
- 纯文本 (.txt)

**操作步骤**：
1. 点击输出区右上角的"导出"按钮
2. 选择导出格式
3. 文件会自动下载到本地

**文件命名规则**：
- 自动使用当前章节号命名
- 格式：`第X章.扩展名`
- 示例：`第1章.docx`

**各格式特点**：
- **Word**：保留基本格式，适合编辑和分享
- **PDF**：便于打印和正式发布
- **TXT**：纯文本，兼容性最强

## 会员系统

### 免费版
- 每天5次AI生成
- 基础章节撰写
- 标准润色功能

### VIP版（¥99/月）
- 每天50次AI生成
- 全功能章节撰写
- 高级润色功能
- 智能续写
- 质量评估报告

### SVIP版（¥299/月）
- 无限AI生成
- 所有VIP功能
- 专属客服支持
- 剧情逻辑优化
- 平台算法优化

## 商业模式

### 收入来源

1. **会员订阅**
   - 月费/年费订阅
   - 7天无理由退款
   - 多套餐选择

2. **个人收款二维码**
   - 支持微信支付
   - 支持支付宝
   - 简化支付流程

### 预期效果

- 用户转化率：10%以上
- 月营收：100万元以上
- 用户留存率：60%以上

## AI模型配置

### 使用的模型

- **主模型**: `doubao-seed-1-6-251015`
  - 平衡性能模型，适合通用对话和文本生成

- **温度参数**:
  - 章节生成: 1.2（高创造性）
  - 润色: 0.8（中等创造性）
  - 续写: 1.0（平衡）

### 流式输出

所有AI接口均采用流式输出，实现实时打字机效果，提升用户体验。

## 系统提示词

### 章节生成提示词

专为番茄小说设计，包含：
- 爽点密度控制（每500字至少一个）
- 节奏控制要求
- 语言风格指南（口语化、网感强）
- 情绪调动技巧
- 结尾钩子设计
- 平台适配规则

### 润色提示词

专注于优化：
- 网感增强
- 爽点放大
- 情绪渲染
- 对比强化
- 冗余修剪

### 续写提示词

确保：
- 逻辑连贯
- 设定一致
- 伏笔跟踪
- 爽点导向
- 角色一致

## 开发规范

### 前端开发

- 使用TypeScript严格模式
- 组件化开发
- 响应式设计
- 用户体验优先

### 后端开发

- API Route规范
- 错误处理
- 流式响应
- 类型安全

## 未来扩展

### 数据库集成

使用 `integration-postgre-database` 集成数据库，实现：
- 用户数据持久化
- 作品管理
- 版本控制
- 历史记录

### 对象存储

使用 `integration-s3-storage` 集成对象存储，实现：
- 章节文件存储
- 备份和恢复
- 多端同步

### 支付功能

对接支付平台，实现：
- 在线支付
- 订单管理
- 会员续费
- 发票管理

### 高级功能

- 作品数据分析
- 读者行为分析
- A/B测试
- 推荐算法优化

## 核心优势

1. **平台适配**
   - 专为番茄小说设计
   - 深度理解平台算法
   - 符合审核规则

2. **剧情逻辑**
   - 解决AI写作逻辑混乱问题
   - 全局剧情数据库
   - 实时一致性检查

3. **角色塑造**
   - 人物弧光引擎
   - 对话个性化
   - 反派智商在线

4. **质量保障**
   - 平台算法视角评估
   - 十年老书虫视角评估
   - 合规性检测

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请联系客服或访问项目文档。

---

**让AI成为你的创作伙伴，写出爆款爽文！**
