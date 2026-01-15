import { NextRequest, NextResponse } from 'next/server';
import { emailService, EmailTemplate } from '@/lib/emailService';

/**
 * 发送邮件API
 *
 * 支持发送模板邮件和自定义邮件
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { type, params, to, subject, html, text } = body;

		// 验证必填字段
		if (!to) {
			return NextResponse.json(
				{ success: false, error: '收件人地址不能为空' },
				{ status: 400 }
			);
		}

		// 验证邮箱格式
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(to)) {
			return NextResponse.json(
				{ success: false, error: '邮箱格式不正确' },
				{ status: 400 }
			);
		}

		let result;

		// 使用模板邮件
		if (type && params) {
			result = await emailService.sendTemplateEmail(to, { subject: '', html: '' }, params);
		}
		// 使用自定义邮件
		else if (subject) {
			const success = await emailService.sendEmail({ to, subject, html, text });
			result = success ? { success: true } : { success: false, error: '邮件发送失败' };
		}
		// 参数不完整
		else {
			return NextResponse.json(
				{
					success: false,
					error: '请提供type+params或subject参数',
				},
				{ status: 400 }
			);
		}

		if (result.success) {
			return NextResponse.json({
				success: true,
				message: '邮件发送成功',
			});
		} else {
			return NextResponse.json(
				{
					success: false,
					error: result.error || '邮件发送失败',
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('发送邮件失败:', error);
		return NextResponse.json(
			{ success: false, error: '发送邮件失败，请稍后重试' },
			{ status: 500 }
		);
	}
}

/**
 * 获取支持的邮件模板列表
 */
export async function GET() {
	return NextResponse.json({
		success: true,
		data: {
			templates: [
				{
					value: 'custom',
					name: '自定义邮件',
				},
				{
					value: 'registration_code',
					name: '注册验证码',
				},
				{
					value: 'forgot_password',
					name: '密码重置',
				},
				{
					value: 'membership_upgrade',
					name: '会员升级通知',
				},
				{
					value: 'system_notification',
					name: '系统通知',
				},
			],
		},
	});
}
