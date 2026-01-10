/**
 * 邮件服务配置说明
 *
 * 本项目支持多种邮件服务提供商（163、QQ、Gmail等）
 * 通过环境变量配置SMTP服务器
 *
 * 0成本实现：
 * - 所有邮箱服务均为免费邮箱
 * - 无需购买任何服务
 * - 只需开通SMTP服务即可
 */

/**
 * 预定义的邮件服务配置
 */
export const EMAIL_PROVIDERS = {
  /**
   * 163网易邮箱（推荐，国内访问快，完全免费）
   *
   * 获取授权码步骤：
   * 1. 登录163邮箱网页版（https://mail.163.com）
   * 2. 点击右上角"设置"
   * 3. 进入"POP3/SMTP/IMAP"选项卡
   * 4. 开启"IMAP/SMTP服务"
   * 5. 点击"获取授权码"
   * 6. 通过手机验证后，复制授权码（不是登录密码！）
   *
   * 注意事项：
   * - 授权码只能查看一次，请妥善保存
   * - 同一个邮箱只能生成一个授权码
   */
  NETEASE_163: {
    host: 'smtp.163.com',
    port: 465,
    secure: true,
    name: '163网易邮箱',
    instructions: [
      '登录163邮箱网页版',
      '进入"设置" -> "POP3/SMTP/IMAP"',
      '开启"IMAP/SMTP服务"',
      '获取授权码（不是登录密码）',
    ],
  },

  /**
   * 126网易邮箱（免费）
   */
  NETEASE_126: {
    host: 'smtp.126.com',
    port: 465,
    secure: true,
    name: '126网易邮箱',
    instructions: [
      '登录126邮箱网页版',
      '进入"设置" -> "POP3/SMTP/IMAP"',
      '开启"IMAP/SMTP服务"',
      '获取授权码（不是登录密码）',
    ],
  },

  /**
   * QQ邮箱（免费，国内访问快）
   *
   * 获取授权码步骤：
   * 1. 登录QQ邮箱网页版（https://mail.qq.com）
   * 2. 点击右上角"设置"
   * 3. 进入"账户"选项卡
   * 4. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
   * 5. 开启"IMAP/SMTP服务"
   * 6. 点击"生成授权码"
   * 7. 通过手机短信验证后，复制授权码（不是登录密码！）
   *
   * 注意事项：
   * - 授权码只能查看一次，请妥善保存
   * - 需要手机短信验证
   */
  QQ_MAIL: {
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    name: 'QQ邮箱',
    instructions: [
      '登录QQ邮箱网页版',
      '进入"设置" -> "账户"',
      '开启"IMAP/SMTP服务"',
      '生成授权码（需要手机验证）',
    ],
  },

  /**
   * 腾讯企业邮箱（免费版）
   */
  TENCENT_ENTERPRISE: {
    host: 'smtp.exmail.qq.com',
    port: 465,
    secure: true,
    name: '腾讯企业邮箱',
    instructions: [
      '登录腾讯企业邮箱',
      '进入"设置" -> "客户端设置"',
      '启用IMAP/SMTP服务',
      '使用企业邮箱密码',
    ],
  },

  /**
   * Gmail（海外访问友好，免费）
   *
   * 获取应用专用密码步骤：
   * 1. 登录Google账户（https://myaccount.google.com）
   * 2. 进入"安全性"设置
   * 3. 开启"两步验证"（必须！）
   * 4. 在"两步验证"页面找到"应用专用密码"
   * 5. 选择"邮件"和"其他（自定义名称）"
   * 6. 生成应用专用密码（16位密码）
   * 7. 复制应用专用密码到 EMAIL_PASS
   *
   * 注意事项：
   * - 必须先开启两步验证才能生成应用专用密码
   * - 应用专用密码不是登录密码
   * - 中国地区访问Gmail可能需要使用代理
   */
  GMAIL: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    name: 'Gmail',
    instructions: [
      '登录Google账户',
      '进入"安全性"设置',
      '开启"两步验证"',
      '生成"应用专用密码"',
      '复制应用专用密码（不是登录密码）',
    ],
  },

  /**
   * Outlook/Hotmail（免费）
   */
  OUTLOOK: {
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    name: 'Outlook/Hotmail',
    instructions: [
      '登录Outlook邮箱',
      '进入"设置" -> "邮件"',
      '同步邮件',
      '允许设备和应用使用POP/SMTP',
    ],
  },

  /**
   * 阿里云邮件推送（付费服务，不推荐）
   */
  ALIYUN_DM: {
    host: 'smtpdm.aliyun.com',
    port: 465,
    secure: true,
    name: '阿里云邮件推送（付费）',
    instructions: [
      '购买阿里云邮件推送服务',
      '配置SMTP服务器',
      '获取发送密钥',
    ],
  },

  /**
   * SendGrid（付费服务，不推荐）
   */
  SENDGRID: {
    host: 'smtp.sendgrid.net',
    port: 465,
    secure: true,
    name: 'SendGrid（付费）',
    instructions: [
      '注册SendGrid账户',
      '创建API Key',
      '配置SMTP服务器',
    ],
  },
} as const;

/**
 * 免费邮箱服务列表（推荐使用）
 */
export const FREE_EMAIL_PROVIDERS = [
  'NETEASE_163',
  'NETEASE_126',
  'QQ_MAIL',
  'GMAIL',
  'OUTLOOK',
] as const;

/**
 * 获取邮件服务配置
 */
export function getEmailProviderConfig(provider: keyof typeof EMAIL_PROVIDERS) {
  return EMAIL_PROVIDERS[provider];
}

/**
 * 从环境变量获取邮件配置
 */
export function getEmailConfigFromEnv() {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || '465', 10);
  const secure = process.env.EMAIL_SECURE === 'true';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM;
  const mockMode = process.env.EMAIL_MOCK_MODE === 'true';

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
    mockMode,
  };
}

/**
 * 验证邮件配置是否完整
 */
export function validateEmailConfig(): { valid: boolean; errors: string[] } {
  const config = getEmailConfigFromEnv();
  const errors: string[] = [];

  if (config.mockMode) {
    // Mock模式下，配置不完整也可以
    return { valid: true, errors: [] };
  }

  if (!config.host) {
    errors.push('缺少SMTP服务器地址（EMAIL_HOST）');
  }

  if (!config.port || config.port <= 0) {
    errors.push('SMTP端口无效（EMAIL_PORT）');
  }

  if (!config.user) {
    errors.push('缺少邮箱账号（EMAIL_USER）');
  }

  if (!config.pass) {
    errors.push('缺少邮箱密码或授权码（EMAIL_PASS）');
  }

  if (!config.from) {
    errors.push('缺少发件人地址（EMAIL_FROM）');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 检查邮件配置是否处于Mock模式
 */
export function isEmailMockMode(): boolean {
  return process.env.EMAIL_MOCK_MODE === 'true';
}

/**
 * 获取推荐邮箱配置（基于用户邮箱地址）
 */
export function getRecommendedProvider(email: string): keyof typeof EMAIL_PROVIDERS | null {
  const provider = inferEmailProvider(email);
  return provider;
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
