import { getDb } from 'coze-coding-dev-sdk';

async function test() {
  try {
    const db = await getDb();
    console.log('Database connection successful!');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

test();
