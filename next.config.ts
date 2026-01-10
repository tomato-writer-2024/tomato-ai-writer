import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 安全配置 - 解决浏览器安全警告
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // 强制HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          // 防止点击劫持
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          // 防止MIME类型嗅探
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // XSS保护
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Referrer策略
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // 权限策略（替代Feature-Policy）
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          // 内容安全策略（逐步放宽以避免破坏现有功能）
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
              "img-src 'self' data: https: http:",
              "font-src 'self' data: https://cdn.jsdelivr.net https://unpkg.com",
              "connect-src 'self' https://p75463bk4t.coze.site http://localhost:5000",
              "frame-src 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; ')
          },
        ],
      },
    ];
  },
};

export default nextConfig;
