import { NextResponse } from 'next/server';
import { Login } from '@/app/actions/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const result = await Login({ userName: username, password });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}