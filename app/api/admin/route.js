import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/admin - Get all admins
export async function GET() {
  try {
    const admins = await prisma.admins.findMany({
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
    const formattedAdmins = admins.map(admin => ({
      ...admin,
      status: admin.status === 1 ? 'active' : 'inactive',
      id: admin.id.toString(), // Convert to string to match frontend expectations
    }));
    
    return NextResponse.json({
      success: true,
      admins: formattedAdmins,
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch admins' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}