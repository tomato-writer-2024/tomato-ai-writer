import nodemailer from 'nodemailer';

/**
 * 邮件服务配置
 */
export interface EmailConfig {
	host: string;
	port: number;
	secure: boolean; // true for 465, false for other ports
	auth: {
		user: string;
		pass: string;
	};
	from?: string;
}

/**
 * 邮件模板类型
 */
export enum EmailTemplate {
	REGISTRATION_CODE = 'registration_code',
	FORGOT_PASSWORD = 'forgot_password',
	MEMBERSHIP_UPGRADE = 'membership_upgrade',
	SYSTEM_NOTIFICATION = 'system_notification',
}

/**
 * 邮件模板参数
 */
export interface EmailTemplateParams {
	[EmailTemplate.REGISTRATION_CODE]: {
		code: string;
		username?: string;
		expiresIn: number; // 分钟
	};
	[EmailTemplate.FORGOT_PASSWORD]: {
		resetLink: string;
		username?: string;
		expiresIn: number; // 分钟
	};
	[EmailTemplate.MEMBERSHIP_UPGRADE]: {
		username?: string;
		membershipLevel: string;
		expiresAt?: string;
	};
	[EmailTemplate.SYSTEM_NOTIFICATION]: {
		title: string;
		content: string;
		username?: string;
	};
}

/**
 * 邮件发送选项
 */
export interface SendEmailOptions {
	to: string;
	subject: string;
	html?: string;
	text?: string;
}

/**
 * 邮件服务类
 *
 * 支持多种邮件服务提供商：
 * - SMTP（支持163、QQ、Gmail等）
 * - SendGrid（需配置）
 * - 阿里云邮件推送
 *
 * 默认使用SMTP协议，可配置任意SMTP服务器
 */
class EmailService {
	private transporter: nodemailer.Transporter | null = null;
	private config: EmailConfig;

	constructor() {
		// 从环境变量读取配置
		this.config = {
			host: process.env.EMAIL_HOST || 'smtp.163.com',
			port: parseInt(process.env.EMAIL_PORT || '465'),
			secure: process.env.EMAIL_SECURE === 'true',
			auth: {
				user: process.env.EMAIL_USER || '',
				pass: process.env.EMAIL_PASS || '',
			},
			from: process.env.EMAIL_FROM || 'noreply@example.com',
		};

		this.initializeTransporter();
	}

	/**
	 * 初始化邮件传输器
	 */
	private initializeTransporter() {
		if (!this.config.auth.user || !this.config.auth.pass) {
			console.warn('[邮件服务] 未配置邮箱账号或密码，邮件功能将不可用');
			return;
		}

		try {
			this.transporter = nodemailer.createTransport({
				host: this.config.host,
				port: this.config.port,
				secure: this.config.secure,
				auth: {
					user: this.config.auth.user,
					pass: this.config.auth.pass,
				},
			});

			// 验证配置
			this.transporter.verify((error, success) => {
				if (error) {
					console.error('[邮件服务] 邮件配置验证失败:', error);
				} else {
					console.log('[邮件服务] 邮件服务初始化成功');
				}
			});
		} catch (error) {
			console.error('[邮件服务] 邮件传输器初始化失败:', error);
		}
	}

	/**
	 * 发送邮件
	 */
	async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
		if (!this.transporter) {
			const error = '邮件服务未初始化，请检查配置';
			console.error('[邮件服务]', error);
			return { success: false, error };
		}

		try {
			const info = await this.transporter.sendMail({
				from: this.config.from,
				to: options.to,
				subject: options.subject,
				text: options.text,
				html: options.html,
			});

			console.log('[邮件服务] 邮件发送成功:', info.messageId);
			return { success: true };
		} catch (error) {
			console.error('[邮件服务] 邮件发送失败:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : '邮件发送失败',
			};
		}
	}

	/**
	 * 发送模板邮件
	 */
	async sendTemplateEmail<T extends EmailTemplate>(
		template: T,
		params: EmailTemplateParams[T],
		to: string
	): Promise<{ success: boolean; error?: string }> {
		let subject = '';
		let html = '';
		let text = '';

		switch (template) {
			case EmailTemplate.REGISTRATION_CODE:
				subject = '【番茄小说AI】注册验证码';
				html = this.getRegistrationCodeHtml(params as EmailTemplateParams[EmailTemplate.REGISTRATION_CODE]);
				text = `您的注册验证码是：${(params as EmailTemplateParams[EmailTemplate.REGISTRATION_CODE]).code}，有效期为${(params as EmailTemplateParams[EmailTemplate.REGISTRATION_CODE]).expiresIn}分钟。`;
				break;

			case EmailTemplate.FORGOT_PASSWORD:
				subject = '【番茄小说AI】密码重置';
				html = this.getForgotPasswordHtml(params as EmailTemplateParams[EmailTemplate.FORGOT_PASSWORD]);
				text = `请点击以下链接重置您的密码：${(params as EmailTemplateParams[EmailTemplate.FORGOT_PASSWORD]).resetLink}`;
				break;

			case EmailTemplate.MEMBERSHIP_UPGRADE:
				subject = '【番茄小说AI】会员升级成功';
				html = this.getMembershipUpgradeHtml(params as EmailTemplateParams[EmailTemplate.MEMBERSHIP_UPGRADE]);
				text = `恭喜您成功升级为${(params as EmailTemplateParams[EmailTemplate.MEMBERSHIP_UPGRADE]).membershipLevel}会员！`;
				break;

			case EmailTemplate.SYSTEM_NOTIFICATION:
				subject = '【番茄小说AI】系统通知';
				html = this.getSystemNotificationHtml(params as EmailTemplateParams[EmailTemplate.SYSTEM_NOTIFICATION]);
				text = `${(params as EmailTemplateParams[EmailTemplate.SYSTEM_NOTIFICATION]).title}\n${(params as EmailTemplateParams[EmailTemplate.SYSTEM_NOTIFICATION]).content}`;
				break;

			default:
				return { success: false, error: '不支持的邮件模板' };
		}

		return this.sendEmail({ to, subject, html, text });
	}

	/**
	 * 生成注册验证码邮件HTML
	 */
	private getRegistrationCodeHtml(params: EmailTemplateParams[EmailTemplate.REGISTRATION_CODE]): string {
		const { code, username, expiresIn } = params;
		const greeting = username ? `亲爱的 ${username}，` : '您好，';

		return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
		.code-box { background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 20px 0; border-radius: 5px; }
		.content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
		.footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 10px 10px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>🍅 番茄小说AI</h1>
		</div>
		<div class="content">
			<p>${greeting}</p>
			<p>感谢您注册番茄小说AI写作工具！</p>
			<p>您的注册验证码是：</p>
			<div class="code-box">${code}</div>
			<p>验证码有效期为 <strong>${expiresIn} 分钟</strong>，请尽快完成验证。</p>
			<p>如果这不是您本人的操作，请忽略此邮件。</p>
		</div>
		<div class="footer">
			<p>此邮件由系统自动发送，请勿直接回复</p>
			<p>© 2024 番茄小说AI · 让创作更简单</p>
		</div>
	</div>
</body>
</html>
`;
	}

	/**
	 * 生成忘记密码邮件HTML
	 */
	private getForgotPasswordHtml(params: EmailTemplateParams[EmailTemplate.FORGOT_PASSWORD]): string {
		const { resetLink, username, expiresIn } = params;
		const greeting = username ? `亲爱的 ${username}，` : '您好，';

		return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
		.button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; }
		.content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
		.footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 10px 10px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>🍅 番茄小说AI</h1>
		</div>
		<div class="content">
			<p>${greeting}</p>
			<p>我们收到了您的密码重置请求。</p>
			<p>请点击下方按钮重置您的密码：</p>
			<div style="text-align: center;">
				<a href="${resetLink}" class="button">重置密码</a>
			</div>
			<p>或者复制以下链接到浏览器中打开：</p>
			<p style="word-break: break-all; color: #666;">${resetLink}</p>
			<p>重置链接有效期为 <strong>${expiresIn} 分钟</strong>。</p>
			<p>如果这不是您本人的操作，请忽略此邮件。</p>
		</div>
		<div class="footer">
			<p>此邮件由系统自动发送，请勿直接回复</p>
			<p>© 2024 番茄小说AI · 让创作更简单</p>
		</div>
	</div>
</body>
</html>
`;
	}

	/**
	 * 生成会员升级邮件HTML
	 */
	private getMembershipUpgradeHtml(params: EmailTemplateParams[EmailTemplate.MEMBERSHIP_UPGRADE]): string {
		const { username, membershipLevel, expiresAt } = params;
		const greeting = username ? `亲爱的 ${username}，` : '您好，';

		return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
		.content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
		.membership-badge { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 10px 20px; display: inline-block; border-radius: 20px; margin: 10px 0; }
		.footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 10px 10px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>🎉 恭喜升级！</h1>
		</div>
		<div class="content">
			<p>${greeting}</p>
			<p>恭喜您成功升级为：</p>
			<div style="text-align: center;">
				<div class="membership-badge">${membershipLevel}</div>
			</div>
			${expiresAt ? `<p>会员有效期至：<strong>${new Date(expiresAt).toLocaleDateString()}</strong></p>` : ''}
			<p>现在您可以享受更多高级功能：</p>
			<ul>
				<li>✨ 无限次AI创作</li>
				<li>📚 海量素材库访问</li>
				<li>🚀 更快的生成速度</li>
				<li>💎 专属客服支持</li>
			</ul>
		</div>
		<div class="footer">
			<p>感谢您的支持！</p>
			<p>© 2024 番茄小说AI · 让创作更简单</p>
		</div>
	</div>
</body>
</html>
`;
	}

	/**
	 * 生成系统通知邮件HTML
	 */
	private getSystemNotificationHtml(params: EmailTemplateParams[EmailTemplate.SYSTEM_NOTIFICATION]): string {
		const { title, content, username } = params;
		const greeting = username ? `亲爱的 ${username}，` : '您好，';

		return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
		.content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
		.footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 10px 10px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>📢 系统通知</h1>
		</div>
		<div class="content">
			<p>${greeting}</p>
			<h2 style="color: #4facfe;">${title}</h2>
			<div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4facfe; margin: 15px 0;">
				${content}
			</div>
		</div>
		<div class="footer">
			<p>此邮件由系统自动发送，请勿直接回复</p>
			<p>© 2024 番茄小说AI · 让创作更简单</p>
		</div>
	</div>
</body>
</html>
`;
	}
}

// 导出单例
export const emailService = new EmailService();
