import { withAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

interface User {
  id: string;
  email: string;
  role: string;
}

export async function GET() {
  return withAuth(async (user: User) => {
    return NextResponse.json({
      message: 'This is a protected route',
      user: user
    });
  });
}