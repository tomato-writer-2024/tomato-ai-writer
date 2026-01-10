/**
 * 邮件服务配置说明
 *
 * 本项目支持多种邮件服务提供商（163、QQ、Gmail等）
 * 通过环境变量配置SMTP服务器
 */

/**
 * 预定义的邮件服务配置
 */
export const EMAIL_PROVIDERS = {
  /**
   * 163网易邮箱
   * 需要开启SMTP服务并获取授权码
   *
   * 获取授权码步骤：
   * 1. 登录163邮箱网页版
   * 2. 进入"设置" -> "POP3/SMTP/IMAP"
   * 3. 开启"IMAP/SMTP服务"
   * 4. 获取授权码（不是登录密码）
   */
  NETEASE_163: {
    host: 'smtp.163.com',
    port: 465,
    secure: true,
  },

  /**
   * 126网易邮箱
   */
  NETEASE_126: {
    host: 'smtp.126.com',
    port: 465,
    secure: true,
  },

  /**
   * QQ邮箱
   * 需要开启SMTP服务并获取授权码
   *
   * 获取授权码步骤：
   * 1. 登录QQ邮箱网页版
   * 2. 进入"设置" -> "账户"
   * 3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
   * 4. 开启"IMAP/SMTP服务"
   * 5. 获取授权码（使用手机短信验证）
   */
  QQ_MAIL: {
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
  },

  /**
   * 腾讯企业邮箱
   */
  TENCENT_ENTERPRISE: {
    host: 'smtp.exmail.qq.com',
    port: 465,
    secure: true,
  },

  /**
   * Gmail
   * 需要开启"两步验证"并使用"应用专用密码"
   *
   * 获取应用专用密码步骤：
   * 1. 登录Google账户
   * 2. 进入"安全性"设置
   * 3. 开启"两步验证"
   * 4. 在"两步验证"页面找到"应用专用密码"
   * 5. 生成新的应用专用密码
   *
   * 注意：中国地区访问Gmail可能需要使用代理
   */
  GMAIL: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
  },

  /**
   * Outlook/Hotmail
   */
  OUTLOOK: {
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
  },

  /**
   * 阿里云邮件推送
   * 需要购买阿里云邮件推送服务
   */
  ALIYUN_DM: {
    host: 'smtpdm.aliyun.com',
    port: 465,
    secure: true,
  },

  /**
   * SendGrid
   * 需要注册SendGrid账户
   */
  SENDGRID: {
    host: 'smtp.sendgrid.net',
    port: 465,
    secure: true,
  },
} as const;

/**
 * 获取邮件服务配置
 */
export function getEmailProviderConfig(provider: keyof typeof EMAIL_PROVIDERS) {
  return EMAIL_PROVIDERS[provider];
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 根据邮箱地址推断邮件服务提供商
 */
export function inferEmailProvider(email: string): keyof typeof EMAIL_PROVIDERS | null {
  if (!isValidEmail(email)) {
    return null;
  }

  const domain = email.split('@')[1].toLowerCase();

  const providerMap: Record<string, keyof typeof EMAIL_PROVIDERS> = {
    '163.com': 'NETEASE_163',
    '126.com': 'NETEASE_126',
    'qq.com': 'QQ_MAIL',
    'foxmail.com': 'QQ_MAIL',
    'gmail.com': 'GMAIL',
    'outlook.com': 'OUTLOOK',
    'hotmail.com': 'OUTLOOK',
  };

  return providerMap[domain] || null;
}

/**
 * 环境变量配置示例
 *
 * 复制以下内容到 .env.local 文件中：
 *
 * # ============ 邮件服务配置 ============
 *
 * # 邮件服务提供商（163/QQ/Gmail等）
 * EMAIL_HOST=smtp.163.com
 *
 * # SMTP端口（465/587）
 * EMAIL_PORT=465
 *
   * 是否使用SSL（true/false）
 * EMAIL_SECURE=true
 *
   # 发件人邮箱地址
 * EMAIL_USER=your_email@163.com
 *
 * # 发件人密码或授权码（不是登录密码！）
 * EMAIL_PASS=your_authorization_code
 *
 * # 发件人名称
 * EMAIL_FROM=番茄小说AI <your_email@163.com>
 *
 * # Mock模式开关（true=模拟发送，false=真实发送）
 * # 开发环境可以设为false测试真实发送
 * EMAIL_MOCK_MODE=true
 *
 * # ============ 163邮箱配置示例 ============
 # EMAIL_HOST=smtp.163.com
 # EMAIL_PORT=465
 # EMAIL_SECURE=true
 # EMAIL_USER=your_email@163.com
 # EMAIL_PASS=your_authorization_code
 # EMAIL_FROM=番茄小说AI <your_email@163.com>
 #
 # ============ QQ邮箱配置示例 ============
 # EMAIL_HOST=smtp.qq.com
 # EMAIL_PORT=465
 # EMAIL_SECURE=true
 # EMAIL_USER=your_email@qq.com
 # EMAIL_PASS=your_authorization_code
 # EMAIL_FROM=番茄小说AI <your_email@qq.com>
 #
 # ============ Gmail配置示例 ============
 # EMAIL_HOST=smtp.gmail.com
 # EMAIL_PORT=587
 # EMAIL_SECURE=false
 # EMAIL_USER=your_email@gmail.com
 # EMAIL_PASS=your_app_password
 # EMAIL_FROM=番茄小说AI <your_email@gmail.com>
 */
