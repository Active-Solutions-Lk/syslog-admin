import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/package_validate - Check if a package name is available
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const id = searchParams.get('id');

    if (!name) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Package name is required' 
        },
        { status: 400 }
      );
    }

    let existingPackage;
    if (id) {
      // Check if another package (not this one) has the same name
      existingPackage = await prisma.packages.findFirst({
        where: {
          name: name,
          id: {
            not: parseInt(id)
          }
        }
      });
    } else {
      // Check if any package has the same name
      existingPackage = await prisma.packages.findUnique({
        where: {
          name: name
        }
      });
    }

    return NextResponse.json({
      success: true,
      available: !existingPackage
    });
  } catch (error) {
    console.error('Error validating package name:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to validate package name' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}