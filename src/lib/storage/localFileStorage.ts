/**
 * 0成本本地存储方案
 * 使用本地文件系统替代S3，实现0成本存储
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ============================================================================
// 配置
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_BASE_PATH = path.join(process.cwd(), 'storage');

// 确保存储目录存在
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`创建目录失败: ${dirPath}`, error);
  }
}

/**
 * 初始化存储目录
 */
export async function initLocalStorage(): Promise<void> {
  const directories = [
    STORAGE_BASE_PATH,
    path.join(STORAGE_BASE_PATH, 'avatars'),
    path.join(STORAGE_BASE_PATH, 'covers'),
    path.join(STORAGE_BASE_PATH, 'novels'),
    path.join(STORAGE_BASE_PATH, 'chapters'),
    path.join(STORAGE_BASE_PATH, 'materials'),
    path.join(STORAGE_BASE_PATH, 'exports'),
    path.join(STORAGE_BASE_PATH, 'imports'),
  ];

  for (const dir of directories) {
    await ensureDir(dir);
  }

  console.log('本地存储目录初始化完成');
}

// ============================================================================
// 文件操作接口
// ============================================================================

export interface UploadOptions {
  fileName: string;
  fileContent: Buffer;
  contentType: string;
  category?: 'avatar' | 'cover' | 'novel' | 'chapter' | 'material' | 'export' | 'import';
}

export interface FileMetadata {
  key: string; // 文件唯一标识
  originalName: string;
  contentType: string;
  size: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 文件存储索引（内存缓存）
// ============================================================================

const fileIndex = new Map<string, FileMetadata>();

/**
 * 生成文件唯一标识
 */
function generateFileKey(fileName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(fileName);
  return `${timestamp}-${random}${ext}`;
}

/**
 * 获取分类目录路径
 */
function getCategoryPath(category: string): string {
  const categoryMap: Record<string, string> = {
    avatar: 'avatars',
    cover: 'covers',
    novel: 'novels',
    chapter: 'chapters',
    material: 'materials',
    export: 'exports',
    import: 'imports',
  };

  const dirName = categoryMap[category] || 'others';
  return path.join(STORAGE_BASE_PATH, dirName);
}

// ============================================================================
// 文件操作
// ============================================================================

/**
 * 上传文件
 */
export async function uploadFile(options: UploadOptions): Promise<string> {
  const { fileName, fileContent, contentType, category = 'novel' } = options;

  // 生成文件key
  const key = generateFileKey(fileName);

  // 确保目录存在
  const categoryPath = getCategoryPath(category);
  await ensureDir(categoryPath);

  // 构建完整路径
  const filePath = path.join(categoryPath, key);

  // 写入文件
  try {
    await fs.writeFile(filePath, fileContent, 'binary');
  } catch (error) {
    console.error('写入文件失败:', error);
    throw new Error(`写入文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }

  // 更新索引
  fileIndex.set(key, {
    key,
    originalName: fileName,
    contentType,
    size: fileContent.length,
    category,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return key;
}

/**
 * 读取文件
 */
export async function readFile(key: string): Promise<Buffer> {
  // 查找文件
  const metadata = fileIndex.get(key);
  if (!metadata) {
    throw new Error(`文件不存在: ${key}`);
  }

  const categoryPath = getCategoryPath(metadata.category);
  const filePath = path.join(categoryPath, key);

  try {
    return await fs.readFile(filePath);
  } catch (error) {
    console.error('读取文件失败:', error);
    throw new Error(`读取文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 删除文件
 */
export async function deleteFile(key: string): Promise<boolean> {
  // 查找文件
  const metadata = fileIndex.get(key);
  if (!metadata) {
    return false;
  }

  const categoryPath = getCategoryPath(metadata.category);
  const filePath = path.join(categoryPath, key);

  try {
    await fs.unlink(filePath);
    fileIndex.delete(key);
    return true;
  } catch (error) {
    console.error('删除文件失败:', error);
    return false;
  }
}

/**
 * 检查文件是否存在
 */
export async function fileExists(key: string): Promise<boolean> {
  const metadata = fileIndex.get(key);
  if (!metadata) {
    return false;
  }

  const categoryPath = getCategoryPath(metadata.category);
  const filePath = path.join(categoryPath, key);

  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 列出文件
 */
export async function listFiles(options: {
  category?: string;
  prefix?: string;
  maxKeys?: number;
}): Promise<string[]> {
  const { category, prefix, maxKeys } = options;

  let keys: string[] = [];

  for (const [key, metadata] of fileIndex.entries()) {
    // 过滤分类
    if (category && metadata.category !== category) {
      continue;
    }

    // 过滤前缀
    if (prefix && !key.startsWith(prefix)) {
      continue;
    }

    keys.push(key);
  }

  // 限制数量
  if (maxKeys && maxKeys > 0) {
    keys = keys.slice(0, maxKeys);
  }

  return keys;
}

/**
 * 获取文件元数据
 */
export function getFileMetadata(key: string): FileMetadata | undefined {
  return fileIndex.get(key);
}

/**
 * 获取文件URL（本地访问）
 */
export function getFileUrl(key: string): string {
  return `/api/files/${key}`;
}

/**
 * 批量上传文件
 */
export async function uploadBatchFiles(
  files: UploadOptions[]
): Promise<{ success: string[]; failed: string[] }> {
  const success: string[] = [];
  const failed: string[] = [];

  for (const file of files) {
    try {
      const key = await uploadFile(file);
      success.push(key);
    } catch (error) {
      console.error('批量上传失败:', file.fileName, error);
      failed.push(file.fileName);
    }
  }

  return { success, failed };
}

/**
 * 批量删除文件
 */
export async function deleteBatchFiles(keys: string[]): Promise<{ success: string[]; failed: string[] }> {
  const success: string[] = [];
  const failed: string[] = [];

  for (const key of keys) {
    try {
      const result = await deleteFile(key);
      if (result) {
        success.push(key);
      } else {
        failed.push(key);
      }
    } catch (error) {
      console.error('批量删除失败:', key, error);
      failed.push(key);
    }
  }

  return { success, failed };
}

/**
 * 清理过期文件
 */
export async function cleanupExpiredFiles(maxAge: number): Promise<number> {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [key, metadata] of fileIndex.entries()) {
    const age = now - metadata.createdAt.getTime();
    if (age > maxAge) {
      expiredKeys.push(key);
    }
  }

  for (const key of expiredKeys) {
    await deleteFile(key);
  }

  return expiredKeys.length;
}

/**
 * 获取存储统计
 */
export function getStorageStats(): {
  totalFiles: number;
  totalSize: number;
  categories: Record<string, number>;
} {
  let totalSize = 0;
  const categories: Record<string, number> = {};

  for (const [key, metadata] of fileIndex.entries()) {
    totalSize += metadata.size;
    categories[metadata.category] = (categories[metadata.category] || 0) + 1;
  }

  return {
    totalFiles: fileIndex.size,
    totalSize,
    categories,
  };
}

/**
 * 导出文件索引（用于持久化）
 */
export function exportFileIndex(): FileMetadata[] {
  return Array.from(fileIndex.values());
}

/**
 * 导入文件索引（用于恢复）
 */
export function importFileIndex(metadataList: FileMetadata[]): void {
  for (const metadata of metadataList) {
    fileIndex.set(metadata.key, metadata);
  }
}

/**
 * 同步文件索引（从磁盘恢复）
 */
export async function syncFileIndex(): Promise<void> {
  const categories = [
    'avatars',
    'covers',
    'novels',
    'chapters',
    'materials',
    'exports',
    'imports',
  ];

  let totalFiles = 0;

  for (const category of categories) {
    const categoryPath = path.join(STORAGE_BASE_PATH, category);

    try {
      const files = await fs.readdir(categoryPath);

      for (const fileName of files) {
        const key = fileName;
        const filePath = path.join(categoryPath, fileName);

        const stats = await fs.stat(filePath);

        // 如果文件不在索引中，添加到索引
        if (!fileIndex.has(key)) {
          fileIndex.set(key, {
            key,
            originalName: fileName,
            contentType: 'application/octet-stream',
            size: stats.size,
            category: category.slice(0, -1), // 移除复数s
            createdAt: stats.birthtime,
            updatedAt: stats.mtime,
          });
        }

        totalFiles++;
      }
    } catch (error) {
      console.error(`同步目录失败: ${categoryPath}`, error);
    }
  }

  console.log(`同步文件索引完成，共发现 ${totalFiles} 个文件`);
}

// ============================================================================
// 初始化
// ============================================================================

// 自动初始化存储目录
(async () => {
  try {
    await initLocalStorage();
    await syncFileIndex();
  } catch (error) {
    console.error('初始化本地存储失败:', error);
  }
})();

export default {
  uploadFile,
  readFile,
  deleteFile,
  fileExists,
  listFiles,
  getFileMetadata,
  getFileUrl,
  uploadBatchFiles,
  deleteBatchFiles,
  cleanupExpiredFiles,
  getStorageStats,
  exportFileIndex,
  importFileIndex,
  syncFileIndex,
  initLocalStorage,
};
