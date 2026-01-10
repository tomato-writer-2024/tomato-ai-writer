# 番茄小说AI写作工具 - 使用指南

## 📚 快速导航

- [环境配置](#环境配置)
- [功能介绍](#功能介绍)
- [常见场景](#常见场景)
- [最佳实践](#最佳实践)

---

## 🚀 环境配置

### 开发环境快速启动

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量（复制示例文件）
cp .env.local.example .env.local

# 3. 启动开发服务器
pnpm dev
```

### 生产环境部署

```bash
# 1. 构建项目
pnpm build

# 2. 启动生产服务器
pnpm start
```

---

## 🎯 功能介绍

### 1. AI写作核心

#### 章节撰写
一键生成完整的小说章节，支持多种题材。

**适用场景：**
- 开新坑，快速生成第一章
- 卡文时，让AI生成情节大纲
- 批量生成章节

**使用技巧：**
- 提供详细的剧情描述
- 指定题材和风格
- 提供前文上下文

**示例请求：**
```json
{
  "prompt": "主角林辰穿越到玄幻世界，获得无敌系统...",
  "genre": "玄幻",
  "chapterNumber": 1,
  "wordCount": 3000,
  "style": "爽文风格"
}
```

#### 精修润色
优化现有章节内容，提升文笔和节奏。

**适用场景：**
- 初稿完成后润色
- 优化特定部分（对话/描写）
- 提升爽点密度

**使用技巧：**
- 选择合适的润色重点
- 提供题材和风格信息
- 可以多次润色不同方面

**润色类型：**
- `all`: 全面润色（推荐）
- `plot`: 剧情节奏优化
- `dialogue`: 对话优化
- `emotion`: 情感强化
- `description`: 环境描写优化

#### 智能续写
根据上文内容自动续写，保持连贯性。

**适用场景：**
- 临时中断后继续写作
- 让AI推进剧情发展
- 制造新的情节转折

**使用技巧：**
- 提供足够长的上下文
- 指定续写类型
- 控制续写字数

**续写类型：**
- `plot`: 剧情推进
- `scene`: 场景切换
- `dialogue`: 对话互动
- `action`: 动作场面
- `emotion`: 情感爆发
- `foreshadowing`: 伏笔铺垫
- `climax`: 爽点爆发

### 2. 生成器系统

65+细分生成器，覆盖小说创作的各个方面。

#### 角色类生成器（8个）
- 基础角色设定
- 批量角色生成
- 反派角色设计
- 伙伴角色设计
- 恋爱对象设计
- 导师角色设计
- 竞争对手设计
- 配角群像设计

#### 情节类生成器（10个）
- 开篇情节设计
- 高潮情节设计
- 悬念情节设计
- 情感情节设计
- 动作情节设计
- 悬疑情节设计
- 浪漫情节设计
- 冲突情节设计
- 揭秘情节设计
- 伏笔情节设计

**使用场景：**
- 构思章节大纲
- 设计关键情节
- 制造剧情转折

### 3. 第三方服务

#### 邮件服务
支持163、QQ、Gmail等多种邮件服务提供商。

**配置步骤：**
1. 获取邮箱授权码（不是登录密码）
2. 配置SMTP服务器信息
3. 设置EMAIL_MOCK_MODE=false

**适用场景：**
- 发送验证码
- 密码重置链接
- 会员升级通知

#### 微信登录
支持微信开放平台OAuth2.0登录。

**配置步骤：**
1. 注册微信开放平台账号
2. 创建网站应用
3. 配置授权回调域名
4. 设置WECHAT_MOCK_MODE=false

**适用场景：**
- 快速登录
- 绑定微信账号
- 第三方授权

---

## 💡 常见场景

### 场景1：开新坑

```bash
# 1. 使用章节撰写API生成第一章
curl -X POST http://localhost:5000/api/ai/chapter \
  -H "Authorization: Bearer your_token" \
  -d '{
    "prompt": "主角穿越到都市世界，成为首富...",
    "genre": "都市",
    "chapterNumber": 1
  }'

# 2. 使用角色生成器设计主要角色
# ...

# 3. 使用情节生成器设计前10章大纲
# ...
```

### 场景2：卡文突破

```bash
# 1. 使用智能续写API
curl -X POST http://localhost:5000/api/ai/continue \
  -H "Authorization: Bearer your_token" \
  -d '{
    "context": "上文的最后一段内容...",
    "continuationType": "plot",
    "wordCount": 1000
  }'

# 2. 使用情节生成器获取灵感
# ...

# 3. 使用对话生成器优化对话
# ...
```

### 场景3：初稿润色

```bash
# 1. 使用精修润色API（全面润色）
curl -X POST http://localhost:5000/api/ai/polish \
  -H "Authorization: Bearer your_token" \
  -d '{
    "content": "整章内容...",
    "focus": "all"
  }'

# 2. 针对特定方面优化
# 例如：优化对话
curl -X POST http://localhost:5000/api/ai/polish \
  -d '{
    "content": "对话部分...",
    "focus": "dialogue"
  }'

# 3. 例如：强化情感
curl -X POST http://localhost:5000/api/ai/polish \
  -d '{
    "content": "情感爆发部分...",
    "focus": "emotion"
  }'
```

---

## ✅ 最佳实践

### 1. 番茄小说风格写作

**核心原则：**
- 快节奏，不拖沓
- 爽点密集（每500字至少一个）
- 情绪递进，强烈反差
- 章节悬念，吸引下章

**章节结构：**
- 开头（10%）：承接上章
- 发展（60%）：冲突升级
- 高潮（25%）：爆发爽点
- 悬念（5%）：留下钩子

### 2. AI写作提示词技巧

**✅ 好的提示词：**
```
主角林辰穿越到玄幻世界，觉醒无敌系统。
开篇：被未婚妻家族当众退婚，遭受羞辱。
系统激活：系统发布第一个任务，要求当场打脸。
爽点：主角展示隐藏实力，震惊众人。
结局：留下悬念，引出更大的阴谋。
```

**❌ 差的提示词：**
```
写个玄幻小说第一章
```

### 3. 多轮迭代优化

1. **第一轮**：生成初稿
2. **第二轮**：润色优化
3. **第三轮**：针对性调整
4. **第四轮**：人工校对

### 4. 质量控制

**检查清单：**
- [ ] 爽点是否密集
- [ ] 节奏是否紧凑
- [ ] 悬念是否吸引
- [ ] 人设是否统一
- [ ] 对话是否自然
- [ ] 描写是否适度

---

## 🔧 开发建议

### 1. 使用Mock模式

开发时使用Mock模式，避免真实调用：

```bash
EMAIL_MOCK_MODE=true
WECHAT_MOCK_MODE=true
```

### 2. 日志调试

启用详细日志：

```bash
ENABLE_VERBOSE_LOGGING=true
```

### 3. 数据库管理

使用原生SQL，避免Drizzle ORM问题：

```typescript
// ✅ 推荐
const result = await db.execute(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

---

## 📊 性能优化

### 1. 流式输出

AI写作功能使用流式输出，降低首字响应时间：

```typescript
// 流式响应，首字 <1秒
const stream = await fetch('/api/ai/chapter', ...);
const reader = stream.body.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // 实时渲染内容
}
```

### 2. 缓存策略

- 生成器结果缓存：30分钟
- 用户数据缓存：1小时
- 系统配置缓存：24小时

### 3. 请求限流

- 严格限流：5次/15分钟
- 标准限流：100次/15分钟
- 宽松限流：60次/1分钟

---

## 🎓 学习资源

### 番茄小说写作技巧

- [番茄小说官方创作指南](https://fanqienovel.com/page/writing-guide)
- [网文爽文写作技巧](https://www.jianshu.com/p/xxx)
- [章节结构设计方法](https://www.zhihu.com/question/xxx)

### AI写作最佳实践

- [如何写好AI提示词](https://www.promptingguide.ai/)
- [创意写作与AI结合](https://openai.com/research/language-models-are-few-shot-learners)
- [流式输出优化](https://web.dev/fetch-streaming)

---

## 🤝 社区支持

- GitHub Issues: [提交问题](https://github.com/xxx/issues)
- 社区论坛: [讨论交流](https://forum.xxx.com)
- 邮箱支持: support@example.com

---

**祝你创作愉快！🎉**
