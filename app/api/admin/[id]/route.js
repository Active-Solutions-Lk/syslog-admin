import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/admin/[id] - Get admin by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const admin = await prisma.admins.findUnique({
      where: {
        id: parseInt(id),
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
    
    if (!admin) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin not found' 
        },
        { status: 404 }
      );
    }
    
    // Convert status from float to string for frontend
    const formattedAdmin = {
      ...admin,
      status: admin.status === 1 ? 'active' : 'inactive',
      id: admin.id.toString(), // Convert to string to match frontend expectations
    };
    
    return NextResponse.json({
      success: true,
      admin: formattedAdmin,
    });
  } catch (error) {
    console.error('Error fetching admin:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch admin' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/admin/[id] - Update admin by ID
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, email, role, status } = await request.json();
    
    // Check if another admin with this email already exists
    const existingAdmin = await prisma.admins.findUnique({
      where: {
        email,
      },
    });
    
    if (existingAdmin && existingAdmin.id !== parseInt(id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Another admin with this email already exists' 
        },
        { status: 400 }
      );
    }
    
    // Get current date for updatedAt timestamp
    const now = new Date();
    
    // Update admin
    const admin = await prisma.admins.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        email,
        role,
        status: status === 'active' ? 1 : 0,
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
      message: 'Admin updated successfully',
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin not found' 
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update admin' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/admin/[id] - Delete admin by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Delete admin
    await prisma.admins.delete({
      where: {
        id: parseInt(id),
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting admin:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin not found' 
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete admin' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}