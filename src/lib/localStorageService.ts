/**
 * 本地文件存储服务
 *
 * 用于0成本部署，替代S3对象存储
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// ============================================================================
// 配置
// ============================================================================

const STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || './uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.docx', '.txt'];

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 生成唯一文件名
 */
function generateUniqueFileName(originalName: string): string {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${name}_${timestamp}_${random}${ext}`;
}

/**
 * 验证文件扩展名
 */
function validateExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * 验证文件大小
 */
function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

/**
 * 确保目录存在
 */
async function ensureDirectory(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// ============================================================================
// 存储操作
// ============================================================================

/**
 * 上传文件
 */
export async function uploadFile(options: {
  fileName: string;
  fileContent: Buffer;
  subDir?: string;
}): Promise<string> {
  const { fileName, fileContent, subDir = '' } = options;

  // 验证扩展名
  if (!validateExtension(fileName)) {
    throw new Error(`不支持的文件类型: ${path.extname(fileName)}`);
  }

  // 验证大小
  if (!validateFileSize(fileContent.length)) {
    throw new Error(`文件大小超过限制 (${MAX_FILE_SIZE / 1024 / 1024}MB)`);
  }

  // 生成唯一文件名
  const uniqueFileName = generateUniqueFileName(fileName);

  // 确定目标路径
  const targetDir = path.join(STORAGE_PATH, subDir);
  await ensureDirectory(targetDir);

  const filePath = path.join(targetDir, uniqueFileName);

  // 写入文件
  await fs.writeFile(filePath, fileContent);

  // 返回相对路径（作为key）
  return subDir ? path.join(subDir, uniqueFileName) : uniqueFileName;
}

/**
 * 读取文件
 */
export async function readFile(options: {
  fileKey: string;
}): Promise<Buffer> {
  const { fileKey } = options;
  const filePath = path.join(STORAGE_PATH, fileKey);

  if (!existsSync(filePath)) {
    throw new Error(`文件不存在: ${fileKey}`);
  }

  return await fs.readFile(filePath);
}

/**
 * 删除文件
 */
export async function deleteFile(options: {
  fileKey: string;
}): Promise<void> {
  const { fileKey } = options;
  const filePath = path.join(STORAGE_PATH, fileKey);

  if (!existsSync(filePath)) {
    throw new Error(`文件不存在: ${fileKey}`);
  }

  await fs.unlink(filePath);
}

/**
 * 列出目录中的文件
 */
export async function listFiles(options: {
  subDir?: string;
}): Promise<string[]> {
  const { subDir = '' } = options;
  const dirPath = path.join(STORAGE_PATH, subDir);

  if (!existsSync(dirPath)) {
    return [];
  }

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter(entry => entry.isFile())
    .map(entry => subDir ? path.join(subDir, entry.name) : entry.name);
}

/**
 * 获取文件信息
 */
export async function getFileInfo(options: {
  fileKey: string;
}): Promise<{
  size: number;
  createdAt: Date;
  modifiedAt: Date;
}> {
  const { fileKey } = options;
  const filePath = path.join(STORAGE_PATH, fileKey);

  if (!existsSync(filePath)) {
    throw new Error(`文件不存在: ${fileKey}`);
  }

  const stats = await fs.stat(filePath);

  return {
    size: stats.size,
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime,
  };
}

/**
 * 复制文件
 */
export async function copyFile(options: {
  sourceKey: string;
  targetKey: string;
}): Promise<void> {
  const { sourceKey, targetKey } = options;
  const sourcePath = path.join(STORAGE_PATH, sourceKey);
  const targetPath = path.join(STORAGE_PATH, targetKey);

  if (!existsSync(sourcePath)) {
    throw new Error(`源文件不存在: ${sourceKey}`);
  }

  const targetDir = path.dirname(targetPath);
  await ensureDirectory(targetDir);

  await fs.copyFile(sourcePath, targetPath);
}

/**
 * 移动文件
 */
export async function moveFile(options: {
  sourceKey: string;
  targetKey: string;
}): Promise<void> {
  const { sourceKey, targetKey } = options;
  const sourcePath = path.join(STORAGE_PATH, sourceKey);
  const targetPath = path.join(STORAGE_PATH, targetKey);

  if (!existsSync(sourcePath)) {
    throw new Error(`源文件不存在: ${sourceKey}`);
  }

  const targetDir = path.dirname(targetPath);
  await ensureDirectory(targetDir);

  await fs.rename(sourcePath, targetPath);
}

/**
 * 获取存储使用情况
 */
export async function getStorageUsage(): Promise<{
  totalSize: number;
  fileCount: number;
}> {
  async function scanDirectory(dirPath: string): Promise<{ totalSize: number; fileCount: number }> {
    let totalSize = 0;
    let fileCount = 0;

    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const result = await scanDirectory(fullPath);
        totalSize += result.totalSize;
        fileCount += result.fileCount;
      } else if (entry.isFile()) {
        const stats = await fs.stat(fullPath);
        totalSize += stats.size;
        fileCount++;
      }
    }

    return { totalSize, fileCount };
  }

  if (!existsSync(STORAGE_PATH)) {
    return { totalSize: 0, fileCount: 0 };
  }

  return await scanDirectory(STORAGE_PATH);
}

/**
 * 清理过期文件
 */
export async function cleanupExpiredFiles(options: {
  olderThanHours: number;
  subDir?: string;
}): Promise<number> {
  const { olderThanHours, subDir = '' } = options;
  const dirPath = path.join(STORAGE_PATH, subDir);
  const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;
  let deletedCount = 0;

  if (!existsSync(dirPath)) {
    return 0;
  }

  async function cleanupRecursive(currentPath: string): Promise<void> {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await cleanupRecursive(fullPath);
      } else if (entry.isFile()) {
        const stats = await fs.stat(fullPath);
        if (stats.mtimeMs < cutoffTime) {
          await fs.unlink(fullPath);
          deletedCount++;
        }
      }
    }
  }

  await cleanupRecursive(dirPath);
  return deletedCount;
}

/**
 * 获取公开访问URL（仅用于本地开发）
 */
export function getPublicUrl(fileKey: string): string {
  // 在实际部署中，这里应该返回CDN或Nginx代理的URL
  return `/api/files/download?key=${fileKey}`;
}

// ============================================================================
// 类型定义
// ============================================================================

export interface UploadOptions {
  fileName: string;
  fileContent: Buffer;
  subDir?: string;
}

export interface ReadFileOptions {
  fileKey: string;
}

export interface DeleteFileOptions {
  fileKey: string;
}

export interface FileInfo {
  size: number;
  createdAt: Date;
  modifiedAt: Date;
}

export interface StorageUsage {
  totalSize: number;
  fileCount: number;
}

// ============================================================================
// 初始化
// ============================================================================

/**
 * 初始化存储目录
 */
export async function initStorage(): Promise<void> {
  await ensureDirectory(STORAGE_PATH);
  console.log(`✅ 本地存储初始化完成: ${STORAGE_PATH}`);
}

// 自动初始化（如果需要）
if (process.env.USE_LOCAL_STORAGE === 'true') {
  initStorage().catch(console.error);
}
