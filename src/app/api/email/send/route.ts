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
			result = await emailService.sendTemplateEmail(type, params, to);
		}
		// 使用自定义邮件
		else if (subject) {
			result = await emailService.sendEmail({ to, subject, html, text });
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
			templates: Object.values(EmailTemplate).map((value) => ({
				value,
				name: {
					REGISTRATION_CODE: '注册验证码',
					FORGOT_PASSWORD: '密码重置',
					MEMBERSHIP_UPGRADE: '会员升级通知',
					SYSTEM_NOTIFICATION: '系统通知',
				}[value as string],
			})),
		},
	});
}
