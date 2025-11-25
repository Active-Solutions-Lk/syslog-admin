import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';

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

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    let admin;
    try {
      // Find admin by email (assuming username is email based on schema)
      admin = await prisma.admins.findUnique({
        where: {
          email: username,
        },
      });
    } catch (dbError) {
      // Handle database connection errors gracefully
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Server error' },
        { status: 401 }
      );
    }

    // If admin not found
    if (!admin) {
      return NextResponse.json(
        { error: 'User not valid' },
        { status: 401 }
      );
    }

    // Check if passwordHash exists
    if (!admin.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session token
    const token = await createToken({
      id: admin.id.toString(), // Convert to string to match session storage
      email: admin.email,
      role: admin.role
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

    // Create response with Set-Cookie header
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
    });

    // Set the auth cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // Force to false for development
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    // For any other unexpected errors, return a generic message to avoid exposing system details
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
  } finally {
    await prisma.$disconnect();
  }
}