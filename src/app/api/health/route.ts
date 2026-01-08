import { NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';

export async function GET() {
  try {
    const db = await getDb();
    const result = await db.select().from(users).limit(1);
    
    return NextResponse.json({
      success: true,
      message: 'API is healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
