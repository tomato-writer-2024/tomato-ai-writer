import { getDb } from 'coze-coding-dev-sdk';
import { users } from './storage/database/shared/schema';

async function test() {
  try {
    const db = await getDb();
    console.log('Database connection successful!');

    // 尝试查询users表
    const result = await db.select().from(users).limit(1);
    console.log('Users table exists, count:', result.length);

    return true;
  } catch (error) {
    console.error('Database query failed:', error);
    return false;
  }
}

test();
