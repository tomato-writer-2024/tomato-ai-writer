#!/usr/bin/env node

/**
 * 清理 Next.js 缓存和构建产物
 *
 * 使用方法：
 * npm run clean
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 开始清理缓存...\n');

// 清理 .next 目录
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('删除 .next 目录...');
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('✅ .next 目录已删除\n');
} else {
  console.log('ℹ️  .next 目录不存在，跳过\n');
}

// 清理 node_modules/.cache 目录（可选）
const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  console.log('删除 node_modules/.cache 目录...');
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('✅ node_modules/.cache 目录已删除\n');
}

console.log('✨ 清理完成！');
console.log('\n现在可以运行开发服务器：');
console.log('  npm run dev');
