import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    jwtSecret: process.env.JWT_SECRET,
    jwtSecretLength: process.env.JWT_SECRET?.length,
    jwtSecretFirst20: process.env.JWT_SECRET?.substring(0, 20),
  });
}
