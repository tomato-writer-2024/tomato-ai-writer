import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JWT_SECRET = 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

console.log('========== JWT Token 测试 ==========');
const pkgPath = join(__dirname, 'node_modules', 'jsonwebtoken', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
console.log('JWT库版本:', pkg.version);

// 测试1：直接使用expiresIn字符串
console.log('\n测试1: 使用expiresIn: "7d"');
const token1 = jwt.sign(
  { userId: 'test', email: 'test@example.com' },
  JWT_SECRET,
  { expiresIn: '7d' }
);
const decoded1 = jwt.decode(token1);
console.log('iat:', decoded1.iat);
console.log('exp:', decoded1.exp);
console.log('expiresIn (秒):', decoded1.exp - decoded1.iat);
console.log('expiresIn (天):', (decoded1.exp - decoded1.iat) / 86400);

// 测试2：使用expiresIn数字（秒）
console.log('\n测试2: 使用expiresIn: 604800 (7天)');
const token2 = jwt.sign(
  { userId: 'test', email: 'test@example.com' },
  JWT_SECRET,
  { expiresIn: 604800 }
);
const decoded2 = jwt.decode(token2);
console.log('iat:', decoded2.iat);
console.log('exp:', decoded2.exp);
console.log('expiresIn (秒):', decoded2.exp - decoded2.iat);
console.log('expiresIn (天):', (decoded2.exp - decoded2.iat) / 86400);

// 测试3：不使用expiresIn（默认立即过期）
console.log('\n测试3: 不使用expiresIn');
const token3 = jwt.sign(
  { userId: 'test', email: 'test@example.com' },
  JWT_SECRET
);
const decoded3 = jwt.decode(token3);
console.log('iat:', decoded3.iat);
console.log('exp:', decoded3.exp);
console.log('expiresIn (秒):', decoded3.exp ? decoded3.exp - decoded3.iat : 'undefined');
console.log('expiresIn (天):', decoded3.exp ? (decoded3.exp - decoded3.iat) / 86400 : 'undefined');

// 测试4：手动计算exp
console.log('\n测试4: 手动设置exp');
const now = Math.floor(Date.now() / 1000);
const token4 = jwt.sign(
  { userId: 'test', email: 'test@example.com', iat: now, exp: now + 604800 },
  JWT_SECRET
);
const decoded4 = jwt.decode(token4);
console.log('iat:', decoded4.iat);
console.log('exp:', decoded4.exp);
console.log('expiresIn (秒):', decoded4.exp - decoded4.iat);
console.log('expiresIn (天):', (decoded4.exp - decoded4.iat) / 86400);

console.log('\n========== 测试完成 ==========');
