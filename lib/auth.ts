"use server";

import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
// import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Get JWT secret
async function getJwtSecret() {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  return new TextEncoder().encode(secret);
}

// Verify JWT token
export async function verifyToken(token: string) {
  try {
    const secret = await getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return { payload, error: null };
  } catch (error) {
    return { payload: null, error: error };
  }
}

// Define interface for JWT payload
interface JWTPayload {
  id: string;
  email: string;
  role: string;
  // Add other possible JWT payload properties here if needed
  // For now, we'll be explicit about the properties we know we need
  [key: string]: string | number | boolean | object | null | undefined;
}

// Get session from cookie
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    console.log('Token from cookie:', token);
    
    if (!token) {
      return { user: null, error: 'No token provided' };
    }
    
    // Verify token
    const { payload, error } = await verifyToken(token);
    if (error || !payload) {
      return { user: null, error: error || 'Invalid token' };
    }
    
    console.log('Token verified, payload:', payload);
    
    // Check if session exists in database
    const session = await prisma.session.findUnique({
      where: {
        sessionToken: token
      }
    });
    
    console.log('Session from database:', session);
    
    if (!session) {
      return { user: null, error: 'Session not found' };
    }
    
    // Check if session is expired
    if (session.expires < new Date()) {
      // Delete expired session
      await prisma.session.delete({
        where: {
          sessionToken: token
        }
      });
      
      return { user: null, error: 'Session expired' };
    }
    
    return { 
      user: {
        id: (payload as JWTPayload).id,
        email: (payload as JWTPayload).email,
        role: (payload as JWTPayload).role
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return { user: null, error: 'Session verification failed' };
  }
}

// Define interface for user object
interface User {
  id: string;
  email: string;
  role: string;
}

// Middleware function for API routes
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
      { status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}