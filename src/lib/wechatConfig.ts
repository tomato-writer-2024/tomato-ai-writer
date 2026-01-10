/**
 * 微信OAuth2.0登录配置说明
 *
 * 本项目支持微信开放平台OAuth2.0登录
 * 完全免费注册使用，个人开发者可免费申请
 */

/**
 * 微信开放平台OAuth2.0配置
 */
export interface WeChatConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  mockMode: boolean;
}

/**
 * 从环境变量获取微信配置
 */
export function getWeChatConfig(): WeChatConfig {
  return {
    appId: process.env.WECHAT_APPID || '',
    appSecret: process.env.WECHAT_SECRET || '',
    redirectUri: process.env.WECHAT_REDIRECT_URI || '',
    mockMode: process.env.WECHAT_MOCK_MODE !== 'false', // 默认启用mock模式
  };
}

/**
 * 验证微信配置是否完整
 */
export function validateWeChatConfig(): { valid: boolean; errors: string[] } {
  const config = getWeChatConfig();
  const errors: string[] = [];

  if (config.mockMode) {
    // Mock模式下，配置不完整也可以
    return { valid: true, errors: [] };
  }

  if (!config.appId) {
    errors.push('缺少微信开放平台AppID（WECHAT_APPID）');
  }

  if (!config.appSecret) {
    errors.push('缺少微信开放平台AppSecret（WECHAT_SECRET）');
  }

  if (!config.redirectUri) {
    errors.push('缺少微信授权回调地址（WECHAT_REDIRECT_URI）');
  }

  if (config.redirectUri) {
    // 验证回调地址格式
    try {
      const url = new URL(config.redirectUri);
      if (!url.protocol.startsWith('https') && !url.hostname.includes('localhost')) {
        errors.push('微信回调地址必须使用HTTPS协议（本地开发除外）');
      }
    } catch (e) {
      errors.push('微信回调地址格式无效');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 检查微信登录是否处于Mock模式
 */
export function isWeChatMockMode(): boolean {
  return process.env.WECHAT_MOCK_MODE !== 'false';
}

/**
 * 获取微信授权URL
 */
export function getWeChatAuthUrl(state?: string): string {
  const config = getWeChatConfig();

  if (config.mockMode) {
    // Mock模式：返回本地跳转
    return '/auth/wechat/callback';
  }

  const params = new URLSearchParams({
    appid: config.appId,
    redirect_uri: encodeURIComponent(config.redirectUri),
    response_type: 'code',
    scope: 'snsapi_login',
    state: state || crypto.randomUUID(),
  });

  return `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}#wechat_redirect`;
}

/**
 * 生成微信登录状态码
 */
export function generateWeChatState(): string {
  return crypto.randomUUID();
}

/**
 * 验证微信回调地址是否正确配置
 */
export function validateRedirectUri(expectedUri: string, actualUri: string): boolean {
  try {
    const expected = new URL(expectedUri);
    const actual = new URL(actualUri);

    // 比较协议、主机和路径
    return (
      expected.protocol === actual.protocol &&
      expected.hostname === actual.hostname &&
      expected.pathname === actual.pathname
    );
  } catch {
    return false;
  }
}

/**
 * 微信开放平台申请指南
 */
export const WECHAT_REGISTRATION_GUIDE = {
  title: '微信开放平台OAuth2.0登录申请指南',
  steps: [
    {
      title: '注册微信开放平台账号',
      description: '访问 https://open.weixin.qq.com，使用微信扫码注册账号',
      notes: '个人开发者可以免费注册，无需企业资质',
    },
    {
      title: '创建网站应用',
      description: '登录后进入管理中心，点击"创建网站应用"',
      notes: '需要准备以下信息：网站名称、网站简介、网站图标、网站域名',
    },
    {
      title: '填写应用信息',
      description: '按照要求填写应用基本信息',
      notes: [
        '网站名称：建议使用"番茄小说AI写作助手"',
        '网站简介：简要描述应用功能',
        '网站域名：填写您的实际域名（如：yourdomain.com）',
        '网站图标：上传应用图标（尺寸建议：108x108）',
      ],
    },
    {
      title: '提交审核',
      description: '提交申请后，等待微信官方审核',
      notes: '审核时间通常为1-3个工作日',
    },
    {
      title: '获取AppID和AppSecret',
      description: '审核通过后，在应用详情页面可以看到AppID和AppSecret',
      notes: [
        'AppID：应用唯一标识',
        'AppSecret：应用密钥（保密，不要泄露）',
        '注意：AppSecret只能在首次获取时看到，请妥善保存',
      ],
    },
    {
      title: '配置授权回调域名',
      description: '在应用详情页面配置授权回调域名',
      notes: [
        '填写您的域名（如：yourdomain.com）',
        '不需要填写协议（http://）或路径',
        '不要添加端口号',
      ],
    },
    {
      title: '配置环境变量',
      description: '将获取的AppID和AppSecret填入环境变量',
      notes: [
        'WECHAT_APPID：您的AppID',
        'WECHAT_SECRET：您的AppSecret',
        'WECHAT_REDIRECT_URI：完整的回调地址（如：https://yourdomain.com/api/auth/wechat/callback）',
        'WECHAT_MOCK_MODE：设置为false启用真实登录',
      ],
    },
  ],
  commonQuestions: [
    {
      question: '个人开发者可以申请微信登录吗？',
      answer: '可以。个人开发者可以免费申请微信开放平台账号，并创建网站应用。不过审核可能比企业开发者严格一些。',
    },
    {
      question: '审核需要多长时间？',
      answer: '通常为1-3个工作日。如果审核未通过，可以根据反馈修改信息后重新提交。',
    },
    {
      question: 'AppSecret忘记了怎么办？',
      answer: 'AppSecret只能在首次获取时看到。如果忘记了，需要重置AppSecret。重置后旧的AppSecret将失效，记得及时更新环境变量。',
    },
    {
      question: '回调地址填写格式是什么？',
      answer: '环境变量WECHAT_REDIRECT_URI需要填写完整的回调地址，例如：https://yourdomain.com/api/auth/wechat/callback。在微信开放平台配置时，只需要填写域名（yourdomain.com）即可。',
    },
    {
      question: '本地开发可以使用真实微信登录吗？',
      answer: '可以。在微信开放平台配置回调域名时，可以使用内网穿透工具（如ngrok）提供的域名，或者在本地使用Mock模式（WECHAT_MOCK_MODE=true）进行测试。',
    },
    {
      question: '微信登录是否收费？',
      answer: '微信开放平台的基础功能（包括OAuth2.0登录）完全免费。没有调用次数限制。',
    },
  ],
};

/**
 * 环境变量配置示例
 *
 * 复制以下内容到 .env.local 文件中：
 *
 * # ============ 微信登录配置 ============
 *
 * # 微信开放平台AppID（从微信开放平台获取）
 # WECHAT_APPID=wx1234567890abcdef
 #
 # 微信开放平台AppSecret（从微信开放平台获取，保密！）
 # WECHAT_SECRET=your-wechat-app-secret-here
 #
 # 微信授权回调地址（必须与微信开放平台配置一致）
 # 格式: https://yourdomain.com/api/auth/wechat/callback
 # WECHAT_REDIRECT_URI=https://yourdomain.com/api/auth/wechat/callback
 #
 # Mock模式开关
 # true=模拟登录（用于开发测试）
 # false=真实登录（生产环境必须设为false）
 # WECHAT_MOCK_MODE=false
 */
