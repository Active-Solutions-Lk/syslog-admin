"use server";

import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

async function getJwtSecret() {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  return new TextEncoder().encode(secret);
}

export async function verifyToken(token: string) {
  try {
    const secret = await getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return { payload, error: null };
  } catch (error) {
    return { payload: null, error: error };
  }
}

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return { user: null, error: 'No token provided' };
    }

    const { payload, error } = await verifyToken(token);
    if (error || !payload) {
      return { user: null, error: error || 'Invalid token' };
    }

    return {
      user: {
        id: (payload as unknown as JWTPayload).id,
        email: (payload as unknown as JWTPayload).email,
        role: (payload as unknown as JWTPayload).role
      },
      error: null
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return { user: null, error: 'Session verification failed' };
  }
}

interface User {
  id: string;
  email: string;
  role: string;
}

export async function withAuth(handler: (user: User) => Promise<Response> | Response) {
  try {
    const { user, error } = await getCurrentUser();

    if (error || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return handler(user);
  } catch (error: unknown) {
    console.error('Authentication error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
  }
}