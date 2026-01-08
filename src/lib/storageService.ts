import { S3Storage } from 'coze-coding-dev-sdk';

/**
 * 对象存储服务
 * 封装S3兼容对象存储的所有操作
 */

// 初始化对象存储客户端
const storage = new S3Storage({
	endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
	accessKey: '',
	secretKey: '',
	bucketName: process.env.COZE_BUCKET_NAME,
	region: 'cn-beijing',
});

/**
 * 文件上传选项
 */
export interface UploadOptions {
	fileName: string;
	fileContent: Buffer;
	contentType: string;
	bucket?: string;
}

/**
 * 上传文件
 * @returns 返回实际的文件key（注意：返回的key与传入的fileName不同，SDK会添加UUID前缀）
 */
export async function uploadFile(options: UploadOptions): Promise<string> {
	const { fileName, fileContent, contentType, bucket } = options;

	// 上传文件
	const actualKey = await storage.uploadFile({
		fileName,
		fileContent,
		contentType,
		bucket,
	});

	return actualKey;
}

/**
 * 流式上传文件
 * @returns 返回实际的文件key
 */
export async function streamUploadFile(options: {
	fileName: string;
	stream: ReadableStream<Uint8Array>;
	contentType?: string;
	bucket?: string;
}): Promise<string> {
	const { fileName, stream, contentType, bucket } = options;

	const actualKey = await storage.streamUploadFile({
		fileName,
		stream: stream as any,
		contentType,
		bucket,
	});

	return actualKey;
}

/**
 * 从URL下载并上传文件
 * @returns 返回实际的文件key
 */
export async function uploadFromUrl(options: {
	url: string;
	bucket?: string;
	timeout?: number;
}): Promise<string> {
	const { url, bucket, timeout } = options;

	const actualKey = await storage.uploadFromUrl({
		url,
		bucket,
		timeout,
	});

	return actualKey;
}

/**
 * 读取文件
 */
export async function readFile(options: {
	fileKey: string;
	bucket?: string;
}): Promise<Buffer> {
	const { fileKey, bucket } = options;

	return await storage.readFile({
		fileKey,
		bucket,
	});
}

/**
 * 删除文件
 */
export async function deleteFile(options: {
	fileKey: string;
	bucket?: string;
}): Promise<boolean> {
	const { fileKey, bucket } = options;

	return await storage.deleteFile({
		fileKey,
		bucket,
	});
}

/**
 * 检查文件是否存在
 */
export async function fileExists(options: {
	fileKey: string;
	bucket?: string;
}): Promise<boolean> {
	const { fileKey, bucket } = options;

	return await storage.fileExists({
		fileKey,
		bucket,
	});
}

/**
 * 列出文件
 */
export async function listFiles(options: {
	prefix?: string;
	bucket?: string;
	maxKeys?: number;
	continuationToken?: string;
}): Promise<{
	keys: string[];
	isTruncated: boolean;
	nextContinuationToken?: string;
}> {
	const { prefix, bucket, maxKeys, continuationToken } = options;

	const result = await storage.listFiles({
		prefix,
		bucket,
		maxKeys,
		continuationToken,
	});

	return {
		keys: result.keys,
		isTruncated: result.isTruncated,
		nextContinuationToken: result.nextContinuationToken,
	};
}

/**
 * 生成签名URL（用于文件访问）
 * @param key 文件key
 * @param expireTime 过期时间（秒），默认1天（86400秒）
 * @returns 签名URL字符串
 */
export async function generatePresignedUrl(options: {
	key: string;
	expireTime?: number;
	bucket?: string;
}): Promise<string> {
	const { key, expireTime = 86400, bucket } = options;

	return await storage.generatePresignedUrl({
		key,
		expireTime,
		bucket,
	});
}

/**
 * 生成头像访问URL
 * @param avatarKey 头像文件的key
 * @returns 签名URL，如果avatarKey为空则返回空字符串
 */
export async function getAvatarUrl(avatarKey: string | null | undefined): Promise<string> {
	if (!avatarKey) {
		return '';
	}

	try {
		return await generatePresignedUrl({
			key: avatarKey,
			expireTime: 86400 * 7, // 头像URL有效期7天
		});
	} catch (error) {
		console.error('生成头像URL失败:', error);
		return '';
	}
}

/**
 * 上传头像
 * @param userId 用户ID
 * @param fileBuffer 文件内容Buffer
 * @param contentType 文件MIME类型
 * @param originalFileName 原始文件名
 * @returns 返回头像文件的key
 */
export async function uploadAvatar(
	userId: string,
	fileBuffer: Buffer,
	contentType: string,
	originalFileName: string
): Promise<string> {
	// 生成文件名：avatars/{userId}/{originalFileName}
	const ext = originalFileName.split('.').pop() || 'jpg';
	const fileName = `avatars/${userId}/avatar_${Date.now()}.${ext}`;

	const actualKey = await uploadFile({
		fileName,
		fileContent: fileBuffer,
		contentType,
	});

	return actualKey;
}

/**
 * 上传小说封面
 * @param novelId 小说ID
 * @param fileBuffer 文件内容Buffer
 * @param contentType 文件MIME类型
 * @param originalFileName 原始文件名
 * @returns 返回封面文件的key
 */
export async function uploadNovelCover(
	novelId: string,
	fileBuffer: Buffer,
	contentType: string,
	originalFileName: string
): Promise<string> {
	// 生成文件名：covers/{novelId}/{originalFileName}
	const ext = originalFileName.split('.').pop() || 'jpg';
	const fileName = `covers/${novelId}/cover_${Date.now()}.${ext}`;

	const actualKey = await uploadFile({
		fileName,
		fileContent: fileBuffer,
		contentType,
	});

	return actualKey;
}

/**
 * 上传导出文件
 * @param userId 用户ID
 * @param novelId 小说ID
 * @param fileBuffer 文件内容Buffer
 * @param contentType 文件MIME类型
 * @param originalFileName 原始文件名
 * @returns 返回导出文件的key
 */
export async function uploadExportFile(
	userId: string,
	novelId: string,
	fileBuffer: Buffer,
	contentType: string,
	originalFileName: string
): Promise<string> {
	// 生成文件名：exports/{userId}/{novelId}/{originalFileName}
	const fileName = `exports/${userId}/${novelId}/${originalFileName}`;

	const actualKey = await uploadFile({
		fileName,
		fileContent: fileBuffer,
		contentType,
	});

	return actualKey;
}

/**
 * 生成下载URL
 * @param fileKey 文件key
 * @param filename 下载时的文件名
 * @returns 签名URL和文件名
 */
export async function generateDownloadUrl(
	fileKey: string,
	filename: string
): Promise<{
	url: string;
	filename: string;
}> {
	const url = await generatePresignedUrl({
		key: fileKey,
		expireTime: 3600, // 下载链接1小时有效
	});

	return { url, filename };
}

/**
 * 删除用户头像
 */
export async function deleteAvatar(avatarKey: string): Promise<boolean> {
	return await deleteFile({
		fileKey: avatarKey,
	});
}

/**
 * 删除小说封面
 */
export async function deleteNovelCover(coverKey: string): Promise<boolean> {
	return await deleteFile({
		fileKey: coverKey,
	});
}

export default storage;
