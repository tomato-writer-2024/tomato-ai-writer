# JWT 密钥生成

## 生成的密钥

### JWT_SECRET (已有)
- 生成时间：18小时前
- 状态：已在Vercel配置

### JWT_REFRESH_SECRET (新增)
```
xK9mN2pQ4vR8sT6wY1aB3cD5eF7gH9jL0nM2pQ4rS6tU8vW0yZ2aB4cD6eF8gH0
```
- 生成时间：2025-01-12
- 长度：64位（超过要求的32位）
- 用途：JWT刷新Token签名密钥

## 配置说明

在 Vercel 环境变量中添加：
```
Name: JWT_REFRESH_SECRET
Value: xK9mN2pQ4vR8sT6wY1aB3cD5eF7gH9jL0nM2pQ4rS6tU8vW0yZ2aB4cD6eF8gH0
Environment: All (Production, Preview, Development)
Comment: JWT刷新Token密钥
```
