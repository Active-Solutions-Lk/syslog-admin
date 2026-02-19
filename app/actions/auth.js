"use server";

import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function getJwtSecret() {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  return new TextEncoder().encode(secret);
}

async function createToken(payload) {
  const secret = await getJwtSecret();
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24; // 24 hours

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(secret);
}

export async function Login({ userName, password }) {
  try {
    const admin = await prisma.admins.findFirst({
      where: {
        OR: [
          { email: userName },
          { username: userName }
        ]
      }
    });

    if (!admin || !admin.password) {
      return { success: false, error: 'Invalid username or password' };
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return { success: false, error: 'Invalid username or password' };
    }

    const token = await createToken({
      id: admin.id.toString(),
      email: admin.email,
      role: admin.role
    });

    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax',
    });

    return {
      success: true,
      message: 'Login successful',
      admin: {
        id: admin.id.toString(),
        email: admin.email,
        username: admin.username,
        role: admin.role
      }
    };
  } catch (error) {
    console.error('Login action error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

export async function Logout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
    return { success: true, message: 'Logout successful' };
  } catch (error) {
    console.error('Logout action error:', error);
    return { success: false, error: 'Logout failed.' };
  }
}