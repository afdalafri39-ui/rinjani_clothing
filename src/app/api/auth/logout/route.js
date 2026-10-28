import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  return clearAuthCookie(response);
}

export async function GET() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  return clearAuthCookie(response);
}
