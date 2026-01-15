import nodemailer from 'nodemailer';

/**
 * 邮件模板类型
 */
export interface EmailTemplate {
	subject: string;
	html: string;
	text?: string;
}

/**
 * 邮件服务
 */
class EmailService {
	private transporter: nodemailer.Transporter | null = null;
	private isMockMode: boolean = true;

	/**
	 * 初始化邮件服务
	 */
	private async initTransporter() {
		if (this.transporter) {
			return;
		}

		// 检查是否为Mock模式
		const isMockMode = process.env.EMAIL_MOCK_MODE === 'true';
		this.isMockMode = isMockMode;

		if (isMockMode) {
			console.log('[EmailService] Running in Mock mode - emails will not be sent');
			return;
		}

		// 创建真实的邮件传输器
		this.transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: parseInt(process.env.EMAIL_PORT || '587'),
			secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		// 验证连接
		try {
			await this.transporter.verify();
			console.log('[EmailService] Email server connection verified');
		} catch (error) {
			console.error('[EmailService] Failed to verify email server connection:', error);
			this.transporter = null;
		}
	}

	/**
	 * 发送邮件
	 */
	async sendEmail(options: {
		to: string;
		subject: string;
		html: string;
		text?: string;
	}): Promise<boolean> {
		await this.initTransporter();

		if (this.isMockMode) {
			console.log('[EmailService Mock] Email would be sent:', {
				to: options.to,
				subject: options.subject,
				html: options.html.substring(0, 200) + '...',
			});
			return true;
		}

		if (!this.transporter) {
			console.error('[EmailService] Transporter not initialized');
			return false;
		}

		try {
			const info = await this.transporter.sendMail({
				from: process.env.EMAIL_FROM,
				to: options.to,
				subject: options.subject,
				html: options.html,
				text: options.text,
			});

			console.log('[EmailService] Email sent successfully:', info.messageId);
			return true;
		} catch (error) {
			console.error('[EmailService] Failed to send email:', error);
			return false;
		}
	}

	/**
	 * 发送模板邮件
	 */
	async sendTemplateEmail(
		email: string,
		template: EmailTemplate,
		data?: Record<string, any>
	): Promise<{ success: boolean; error?: string }> {
		// 替换模板中的变量
		let html = template.html;
		let subject = template.subject;
		let text = template.text;

		if (data) {
			Object.entries(data).forEach(([key, value]) => {
				const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
				html = html.replace(regex, String(value));
				subject = subject.replace(regex, String(value));
				if (text) {
					text = text.replace(regex, String(value));
				}
			});
		}

		const success = await this.sendEmail({
			to: email,
			subject,
			html,
			text,
		});

		if (success) {
			return { success: true };
		} else {
			return { success: false, error: 'Failed to send email' };
		}
	}

	/**
	 * 发送订单通知邮件
	 */
	async sendOrderNotificationEmail(
		email: string,
		orderNumber: string,
		status: string,
		message: string
	): Promise<boolean> {
		const statusColors = {
			PENDING: '#FFA500',
			PENDING_REVIEW: '#1E90FF',
			PAID: '#32CD32',
			REFUNDING: '#FF4500',
			REFUNDED: '#808080',
			CANCELLED: '#DC143C',
			FAILED: '#FF0000',
		};

		const color = statusColors[status as keyof typeof statusColors] || '#000000';

		const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>订单状态更新通知</title>
	<style>
		body {
			font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
			background-color: #f5f5f5;
			margin: 0;
			padding: 20px;
		}
		.container {
			max-width: 600px;
			margin: 0 auto;
			background-color: #ffffff;
			border-radius: 8px;
			overflow: hidden;
			box-shadow: 0 2px 8px rgba(0,0,0,0.1);
		}
		.header {
			background: linear-gradient(135deg, #FF4757 0%, #FF6B81 100%);
			color: white;
			padding: 30px;
			text-align: center;
		}
		.header h1 {
			margin: 0;
			font-size: 24px;
		}
		.content {
			padding: 30px;
		}
		.order-number {
			background-color: #FFF5F5;
			border-left: 4px solid #FF4757;
			padding: 15px;
			margin-bottom: 20px;
		}
		.order-number strong {
			color: #FF4757;
			font-size: 18px;
		}
		.status-badge {
			display: inline-block;
			background-color: ${color};
			color: white;
			padding: 6px 16px;
			border-radius: 12px;
			font-size: 14px;
			margin-bottom: 20px;
		}
		.message {
			background-color: #F8F9FA;
			padding: 15px;
			border-radius: 4px;
			line-height: 1.6;
			color: #333;
		}
		.button {
			display: inline-block;
			background: linear-gradient(135deg, #FF4757 0%, #FF6B81 100%);
			color: white;
			padding: 12px 30px;
			text-decoration: none;
			border-radius: 6px;
			margin-top: 20px;
			font-weight: bold;
		}
		.footer {
			background-color: #F8F9FA;
			padding: 20px;
			text-align: center;
			color: #999;
			font-size: 12px;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>📦 订单状态更新</h1>
		</div>
		<div class="content">
			<div class="order-number">
				订单号：<strong>${orderNumber}</strong>
			</div>
			<div class="status-badge">当前状态：${this.getStatusText(status)}</div>
			<div class="message">
				${message}
			</div>
			<a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders" class="button">查看订单详情</a>
		</div>
		<div class="footer">
			<p>此邮件由系统自动发送，请勿直接回复</p>
			<p>© ${new Date().getFullYear()} 番茄小说AI写作助手</p>
		</div>
	</div>
</body>
</html>
`;

		return this.sendEmail({
			to: email,
			subject: `订单状态更新 - ${orderNumber}`,
			html,
		});
	}

	/**
	 * 发送会员升级通知邮件
	 */
	async sendMembershipUpgradeEmail(
		email: string,
		level: string,
		expireDate: string
	): Promise<boolean> {
		const levelNames = {
			BASIC: '基础会员',
			PREMIUM: '高级会员',
			ENTERPRISE: '企业会员',
		};

		const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>会员升级成功</title>
	<style>
		body {
			font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
			background-color: #f5f5f5;
			margin: 0;
			padding: 20px;
		}
		.container {
			max-width: 600px;
			margin: 0 auto;
			background-color: #ffffff;
			border-radius: 8px;
			overflow: hidden;
			box-shadow: 0 2px 8px rgba(0,0,0,0.1);
		}
		.header {
			background: linear-gradient(135deg, #32CD32 0%, #228B22 100%);
			color: white;
			padding: 30px;
			text-align: center;
		}
		.header h1 {
			margin: 0;
			font-size: 24px;
		}
		.content {
			padding: 30px;
		}
		.level-badge {
			background: linear-gradient(135deg, #FF4757 0%, #FF6B81 100%);
			color: white;
			padding: 12px 24px;
			border-radius: 8px;
			font-size: 20px;
			font-weight: bold;
			text-align: center;
			margin: 20px 0;
		}
		.expire-date {
			background-color: #FFF5F5;
			border-left: 4px solid #32CD32;
			padding: 15px;
			margin-bottom: 20px;
		}
		.button {
			display: inline-block;
			background: linear-gradient(135deg, #FF4757 0%, #FF6B81 100%);
			color: white;
			padding: 12px 30px;
			text-decoration: none;
			border-radius: 6px;
			margin-top: 20px;
			font-weight: bold;
		}
		.footer {
			background-color: #F8F9FA;
			padding: 20px;
			text-align: center;
			color: #999;
			font-size: 12px;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>🎉 恭喜！会员升级成功</h1>
		</div>
		<div class="content">
			<p>您的会员已成功升级！</p>
			<div class="level-badge">${levelNames[level as keyof typeof levelNames] || level}</div>
			<div class="expire-date">
				<strong>会员到期时间：</strong>${new Date(expireDate).toLocaleDateString('zh-CN')}
			</div>
			<p>现在您可以享受更多高级功能，包括：</p>
			<ul>
				<li>✓ 无限次AI生成</li>
				<li>✓ 高级写作工具</li>
				<li>✓ 优先技术支持</li>
				<li>✓ 更多专属功能</li>
			</ul>
			<a href="${process.env.NEXT_PUBLIC_BASE_URL}/workspace" class="button">立即开始写作</a>
		</div>
		<div class="footer">
			<p>此邮件由系统自动发送，请勿直接回复</p>
			<p>© ${new Date().getFullYear()} 番茄小说AI写作助手</p>
		</div>
	</div>
</body>
</html>
`;

		return this.sendEmail({
			to: email,
			subject: '会员升级成功',
			html,
		});
	}

	/**
	 * 发送系统通知邮件
	 */
	async sendSystemNotificationEmail(
		email: string,
		title: string,
		content: string,
		link?: string
	): Promise<boolean> {
		const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>系统通知</title>
	<style>
		body {
			font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
			background-color: #f5f5f5;
			margin: 0;
			padding: 20px;
		}
		.container {
			max-width: 600px;
			margin: 0 auto;
			background-color: #ffffff;
			border-radius: 8px;
			overflow: hidden;
			box-shadow: 0 2px 8px rgba(0,0,0,0.1);
		}
		.header {
			background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
			color: white;
			padding: 30px;
			text-align: center;
		}
		.header h1 {
			margin: 0;
			font-size: 24px;
		}
		.content {
			padding: 30px;
		}
		.title {
			font-size: 18px;
			font-weight: bold;
			color: #333;
			margin-bottom: 15px;
		}
		.message {
			background-color: #F8F9FA;
			padding: 15px;
			border-radius: 4px;
			line-height: 1.6;
			color: #333;
			white-space: pre-wrap;
		}
		.button {
			display: inline-block;
			background: linear-gradient(135deg, #FF4757 0%, #FF6B81 100%);
			color: white;
			padding: 12px 30px;
			text-decoration: none;
			border-radius: 6px;
			margin-top: 20px;
			font-weight: bold;
		}
		.footer {
			background-color: #F8F9FA;
			padding: 20px;
			text-align: center;
			color: #999;
			font-size: 12px;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>📢 系统通知</h1>
		</div>
		<div class="content">
			<div class="title">${title}</div>
			<div class="message">${content}</div>
			${link ? `<a href="${link}" class="button">查看详情</a>` : ''}
		</div>
		<div class="footer">
			<p>此邮件由系统自动发送，请勿直接回复</p>
			<p>© ${new Date().getFullYear()} 番茄小说AI写作助手</p>
		</div>
	</div>
</body>
</html>
`;

		return this.sendEmail({
			to: email,
			subject: title,
			html,
		});
	}

	/**
	 * 获取状态文本
	 */
	private getStatusText(status: string): string {
		const statusMap = {
			PENDING: '待支付',
			PENDING_REVIEW: '待审核',
			PAID: '已支付',
			REFUNDING: '退款中',
			REFUNDED: '已退款',
			CANCELLED: '已取消',
			FAILED: '支付失败',
		};
		return statusMap[status as keyof typeof statusMap] || status;
	}
}

// 导出单例实例
export const emailService = new EmailService();
