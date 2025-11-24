"use server";

import bcrypt from 'bcrypt';
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

// Generate JWT secret
async function getJwtSecret() {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  return new TextEncoder().encode(secret);
}

// Create JWT token
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
    // Find admin by email
    const admin = await prisma.admins.findUnique({
      where: {
        email: userName
      }
    });

    // If admin not found or password doesn't match
    if (!admin || !admin.passwordHash) {
      return {
        success: false,
        error: 'Invalid username or password',
      };
    }

    // Compare password
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    
    if (!isValid) {
      return {
        success: false,
        error: 'Invalid username or password',
      };
    }

    // Create session token
    const token = await createToken({
      id: admin.id,
      email: admin.email,
      role: admin.role
    });

    // Set cookie (await cookies() first)
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
      sameSite: 'strict',
    });

    // Create session in database
    const sessionId = `session_${admin.id}_${Date.now()}`;
    const now = new Date();
    const sessionData = {
      id: sessionId,
      userId: admin.id.toString(),
      sessionToken: token,
      expires: new Date(Date.now() + 60 * 60 * 24 * 1000), // 24 hours
      createdAt: now,
      updatedAt: now,
    };
    
    console.log('Creating session with data:', sessionData);
    
    await prisma.session.create({
      data: sessionData
    });
    
    // Verify session was created
    const createdSession = await prisma.session.findUnique({
      where: {
        sessionToken: token
      }
    });
    
    console.log('Created session in database:', createdSession);

    return {
      success: true,
      message: 'Login successful',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
    };
  } catch (error) {
    console.error('Login action error:', error);
    return {
      success: false,
      error: 'Login failed. Please try again.',
    };
  }
}

export async function Logout() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (token) {
      // Delete session from database
      await prisma.session.deleteMany({
        where: {
          sessionToken: token
        }
      });
      
      // Clear cookie
      cookieStore.delete('auth-token');
    }
    
    return {
      success: true,
      message: 'Logout successful'
    };
  } catch (error) {
    console.error('Logout action error:', error);
    return {
      success: false,
      error: 'Logout failed. Please try again.',
    };
  }
}

export async function Session() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return {
        success: false,
        error: 'No active session'
      };
    }
    
    // Check if session exists in database
    const session = await prisma.session.findUnique({
      where: {
        sessionToken: token
      }
    });
    
    if (!session) {
      return {
        success: false,
        error: 'Session not found'
      };
    }
    
    // Check if session is expired
    if (session.expires < new Date()) {
      // Delete expired session
      await prisma.session.delete({
        where: {
          sessionToken: token
        }
      });
      
      // Clear cookie
      cookieStore.delete('auth-token');
      
      return {
        success: false,
        error: 'Session expired'
      };
    }
    
    return {
      success: true,
      session: {
        id: session.id,
        userId: session.userId,
        expires: session.expires
      }
    };
  } catch (error) {
    console.error('Session action error:', error);
    return {
      success: false,
      error: 'Session check failed',
    };
  }
}