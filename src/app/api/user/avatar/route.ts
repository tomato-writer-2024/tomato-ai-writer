import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import { userManager } from '@/storage/database';
import { uploadAvatar, deleteAvatar, getAvatarUrl } from '@/lib/storageService';

/**
 * 上传头像
 */
export async function POST(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		// 解析表单数据
		const formData = await request.formData();
		const file = formData.get('avatar') as File;

		if (!file) {
			return NextResponse.json(
				{ error: '请选择要上传的头像' },
				{ status: 400 }
			);
		}

		// 验证文件类型
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: '只支持JPEG、PNG、WebP格式的图片' },
				{ status: 400 }
			);
		}

		// 验证文件大小（限制为5MB）
		const MAX_SIZE = 5 * 1024 * 1024; // 5MB
		if (file.size > MAX_SIZE) {
			return NextResponse.json(
				{ error: '图片大小不能超过5MB' },
				{ status: 400 }
			);
		}

		// 读取文件内容
		const fileBuffer = Buffer.from(await file.arrayBuffer());

		// 删除旧头像（如果存在）
		if (user.avatarUrl) {
			try {
				await deleteAvatar(user.avatarUrl);
			} catch (error) {
				console.error('删除旧头像失败:', error);
				// 继续执行，不中断流程
			}
		}

		// 上传新头像
		const avatarKey = await uploadAvatar(
			user.id,
			fileBuffer,
			file.type,
			file.name
		);

		// 更新用户头像
		const updatedUser = await userManager.updateUser(user.id, {
			avatarUrl: avatarKey,
		});

		if (!updatedUser) {
			return NextResponse.json(
				{ error: '更新头像失败' },
				{ status: 500 }
			);
		}

		// 获取头像URL
		const avatarUrl = await getAvatarUrl(avatarKey);

		return NextResponse.json({
			success: true,
			data: {
				avatarUrl,
				message: '头像上传成功',
			},
		});
	} catch (error) {
		console.error('上传头像失败:', error);
		return NextResponse.json(
			{ error: '上传头像失败' },
			{ status: 500 }
		);
	}
}

/**
 * 删除头像
 */
export async function DELETE(request: NextRequest) {
	try {
		// 验证用户身份
		const { user, error } = await extractUserFromRequest(request);
		if (error) {
			return NextResponse.json({ error }, { status: 401 });
		}

		if (!user.avatarUrl) {
			return NextResponse.json(
				{ error: '没有可删除的头像' },
				{ status: 400 }
			);
		}

		// 删除头像文件
		await deleteAvatar(user.avatarUrl);

		// 更新用户头像
		await userManager.updateUser(user.id, {
			avatarUrl: null,
		});

		return NextResponse.json({
			success: true,
			message: '头像已删除',
		});
	} catch (error) {
		console.error('删除头像失败:', error);
		return NextResponse.json(
			{ error: '删除头像失败' },
			{ status: 500 }
		);
	}
}
