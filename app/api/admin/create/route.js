import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// POST /api/admin/create - Create a new admin
export async function POST(request) {
  try {
    const { name, email, password, role } = await request.json();
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Name, email, and password are required' 
        },
        { status: 400 }
      );
    }
    
    // Check if admin with this email already exists
    const existingAdmin = await prisma.admins.findUnique({
      where: {
        email,
      },
    });
    
    if (existingAdmin) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin with this email already exists' 
        },
        { status: 400 }
      );
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Get current date for timestamps
    const now = new Date();
    
    // Create admin
    const admin = await prisma.admins.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: role || 'Admin',
        status: 1, // Active by default
        createdAt: now,
        updatedAt: now,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    // Convert status from float to string for frontend
    const formattedAdmin = {
      ...admin,
      status: admin.status === 1 ? 'active' : 'inactive',
      id: admin.id.toString(), // Convert to string to match frontend expectations
    };
    
    return NextResponse.json({
      success: true,
      admin: formattedAdmin,
      message: 'Admin created successfully',
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create admin' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}