import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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

    // Return success response (in a real app, you would generate a session token here)
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });

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