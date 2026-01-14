# Neon 迁移快速检查清单

## 迁移前准备

### Neon 账号和项目
- [ ] 访问 https://neon.tech/ 并注册账号
- [ ] 登录 https://console.neon.tech/
- [ ] 创建新项目（项目名：tomato-ai-writer）
- [ ] 选择合适的区域（推荐 us-east-1 或 ap-southeast-1）
- [ ] 生成并保存数据库密码（**重要！**）
- [ ] 复制连接字符串
- [ ] 格式：`postgresql://neondb_owner:PASSWORD@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

### 本地环境配置
- [ ] 打开项目根目录的 `.env.local` 文件
- [ ] 注释掉旧的 Supabase 连接字符串
- [ ] 添加新的 Neon 连接字符串
- [ ] 设置 `DATABASE_MOCK_MODE=false`
- [ ] 保存文件

---

## 本地环境测试

### 连接测试
- [ ] 重启本地开发服务器：`npm run dev`
- [ ] 等待服务启动完成
- [ ] 执行健康检查：`curl http://localhost:5000/api/health`
- [ ] 确认返回：`"status": "healthy"`
- [ ] 确认返回：`"database.mode": "real"`
- [ ] 确认返回：`"database.status": "ok"`

### 数据库迁移
- [ ] 执行迁移脚本：`npm run migrate`
- [ ] 确认看到：`✅ 数据库迁移完成!`
- [ ] 确认创建的表数量：10+ 个表
- [ ] 在Neon控制台Table Editor中查看表

### 超级管理员创建
- [ ] 使用API创建超级管理员账号
- [ ] 邮箱：admin@tomatowriter.com（或你喜欢的邮箱）
- [ ] 密码：强密码（包含大小写字母、数字、特殊字符）
- [ ] 用户名：超级管理员
- [ ] 确认注册成功：`"success": true`
- [ ] 在Neon控制台验证用户已创建

---

## 生产环境配置

### Netlify环境变量
- [ ] 登录 https://app.netlify.com/
- [ ] 选择站点：tomatowriter
- [ ] 进入 Site settings → Environment variables
- [ ] 找到 `DATABASE_URL` 并编辑
- [ ] 替换为Neon连接字符串
- [ ] 找到或添加 `DATABASE_MOCK_MODE` 变量
- [ ] 设置为 `false`
- [ ] 确认变量作用域：All contexts 或 Production
- [ ] 保存所有更改

---

## 生产环境验证

### 部署检查
- [ ] 等待Netlify自动部署完成（2-3分钟）
- [ ] 访问 Deploys 页面查看部署状态
- [ ] 确认最新部署状态：Published

### 健康检查
- [ ] 执行生产健康检查：`curl https://tomatowriter.netlify.app/api/health`
- [ ] 确认返回：`"status": "healthy"`
- [ ] 确认返回：`"database.mode": "real"`
- [ ] 确认返回：`"database.status": "ok"`
- [ ] 确认连接时间 < 1000ms

### 功能测试
- [ ] 访问生产环境：https://tomatowriter.netlify.app
- [ ] 使用超级管理员账号登录
- [ ] 创建新小说
- [ ] 创建新章节
- [ ] 测试AI写作功能
- [ ] 在Neon控制台验证数据写入

---

## 数据库管理验证

### Neon控制台
- [ ] 访问 https://console.neon.tech/
- [ ] 选择 tomato-ai-writer 项目
- [ ] 查看项目概览（存储使用量、请求次数等）
- [ ] 打开 Table Editor 查看所有表
- [ ] 打开 SQL Editor 执行查询
- [ ] 执行查询：`SELECT COUNT(*) FROM users;`
- [ ] 执行查询：`SELECT COUNT(*) FROM novels;`
- [ ] 查看数据是否正确

### 自动备份
- [ ] 点击 Backups 菜单
- [ ] 查看自动备份状态
- [ ] 确认时间点恢复（PITR）已启用
- [ ] 创建一个手动备份快照

---

## 完整功能测试

### 用户功能
- [ ] 测试用户注册（新用户）
- [ ] 测试用户登录
- [ ] 测试密码重置
- [ ] 测试个人信息修改

### 小说管理
- [ ] 创建新小说
- [ ] 修改小说信息
- [ ] 删除小说
- [ ] 查看小说列表

### 章节管理
- [ ] 创建新章节
- [ ] 编辑章节内容
- [ ] 删除章节
- [ ] 查看章节列表

### AI写作
- [ ] 测试章节生成
- [ ] 测试内容润色
- [ ] 测试智能续写
- [ ] 验证AI响应时间 < 1秒

### 数据持久化
- [ ] 在Neon控制台查看新创建的数据
- [ ] 确认数据正确写入
- [ ] 确认数据可以正确读取

---

## 性能测试

### 响应时间测试
```bash
# 测试健康检查响应时间
time curl https://tomatowriter.netlify.app/api/health

# 多次测试稳定性
for i in {1..10}; do
  curl -s https://tomatowriter.netlify.app/api/health
  echo ""
done
```

- [ ] 健康检查响应时间 < 100ms
- [ ] API响应时间 < 500ms
- [ ] AI功能响应时间 < 2000ms

### 并发测试（可选）
- [ ] 使用Apache Bench进行并发测试
- [ ] 测试100并发请求
- [ ] 确认成功率 > 95%
- [ ] 确认平均响应时间 < 500ms

---

## 监控和维护

### 性能监控
- [ ] 访问Neon Metrics页面
- [ ] 查看存储使用量
- [ ] 查看请求次数
- [ ] 查看平均响应时间
- [ ] 查看活跃连接数

### 日志检查
- [ ] 访问Netlify Functions日志
- [ ] 查看api/health日志
- [ ] 查看api/auth/register日志
- [ ] 确认无错误日志

### 安全检查
- [ ] 确认数据库密码强度足够
- [ ] 确认SSL连接已启用
- [ ] 确认敏感信息不暴露
- [ ] 检查是否有异常访问

---

## 迁移成功标志

✅ 所有检查项都已标记完成

✅ 本地环境：
- 健康检查：healthy
- 数据库模式：real
- 所有功能正常

✅ 生产环境：
- 健康检查：healthy
- 数据库模式：real
- 所有功能正常
- 数据持久化正常

✅ 数据库管理：
- Neon控制台可用
- 自动备份已启用
- 监控指标正常

---

## 后续优化建议

- [ ] 定期检查Neon存储使用量
- [ ] 定期检查Netlify部署日志
- [ ] 定期查看性能指标
- [ ] 根据使用情况优化数据库索引
- [ ] 考虑添加数据库连接池
- [ ] 设置告警通知

---

## 文档归档

迁移完成后，建议归档以下文档：

- [ ] NEON_MIGRATION_GUIDE.md - 迁移指南
- [ ] DATABASE_FIX_SUMMARY.md - 修复总结
- [ ] DATABASE_DIAGNOSIS.md - 诊断指南
- [ ] 本次迁移检查清单（本文档）

---

**迁移完成日期**: ___________

**执行人**: ___________

**备注**: ___________

---

## 遇到问题？

参考文档：
- DATABASE_DIAGNOSIS.md - 详细诊断指南
- NEON_MIGRATION_GUIDE.md - 完整迁移步骤
- Neon官方文档：https://neon.tech/docs

获取支持：
- Neon支持：https://neon.tech/support
- Netlify支持：https://answers.netlify.com/
