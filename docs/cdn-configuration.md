# CDN加速配置说明

## 概述

本应用使用 **Vercel Edge Network** 提供全球CDN加速，确保用户在全球任何地区都能快速访问。

## CDN特性

### 1. 自动全球分发
- Vercel在全球200+个边缘节点部署
- 自动将静态资源和API请求路由到最近的节点
- 减少延迟，提升用户体验

### 2. 图片优化
- 自动转换为WebP/AVIF格式（节省50%+带宽）
- 响应式图片（根据设备大小自动调整）
- 懒加载（提升首屏加载速度）

### 3. 静态资源缓存
- CSS、JavaScript、字体等静态资源自动缓存
- 使用Cache-Control头优化缓存策略
- 支持长期缓存（1年）

### 4. API缓存
- GET请求自动缓存（根据Cache-Control头）
- 支持SWR（Stale-While-Revalidate）策略
- 减少服务器负载

## 配置详情

### next.config.mjs

```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
    { protocol: 'https', hostname: 'unpkg.com' },
    { protocol: 'https', hostname: 'cdnjs.cloudflare.com' },
  ],
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### 性能优化清单

- ✅ 启用Gzip/Brotli压缩
- ✅ 图片自动优化和格式转换
- ✅ 静态资源长期缓存
- ✅ API响应缓存（适当）
- ✅ 预连接关键域名
- ✅ HTTP/2/3支持
- ✅ CDN边缘计算

## 测速建议

使用以下工具测试CDN性能：

1. **Google PageSpeed Insights**
   - URL: https://pagespeed.web.dev/
   - 目标: 90+ (Mobile), 95+ (Desktop)

2. **WebPageTest**
   - URL: https://www.webpagetest.org/
   - 测试全球多个地点

3. **Lighthouse**
   - Chrome DevTools → Lighthouse
   - 目标: 90+

## 监控CDN性能

在Vercel Dashboard中可以查看：
- 边缘函数执行时间
- 带宽使用情况
- 缓存命中率
- 全球访问延迟

## 最佳实践

1. **图片优化**
   - 使用Next.js Image组件
   - 选择合适的图片尺寸
   - 优先使用WebP格式

2. **API优化**
   - 使用SWR缓存
   - 合理设置Cache-Control头
   - 减少不必要的数据传输

3. **静态资源**
   - 长期缓存（1年）
   - 使用内容哈希（filename.[hash].js）
   - 启用CDN压缩

## 故障排除

### CDN缓存问题

如果遇到CDN缓存未更新：

1. Vercel Dashboard → Deployments → Redeploy
2. 在next.config.mjs中配置revalidate
3. 清除浏览器缓存

### 图片加载慢

1. 检查图片大小
2. 启用格式转换
3. 使用懒加载

### 全球访问慢

1. 检查Vercel Edge Network状态
2. 查看访问者地理位置
3. 考虑使用更近的CDN节点

## 联系支持

如有CDN相关问题，请联系：
- Vercel Support: https://vercel.com/support
- 技术团队: support@tomato-ai-writer.com
