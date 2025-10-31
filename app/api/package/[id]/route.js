import { NextResponse } from 'next/server';
import { getPackageById, updatePackage, deletePackage } from '@/app/actions/package';

// GET /api/package/[id] - Get a specific package by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await getPackageById(id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        package: result.package,
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error in GET /api/package/[id]:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch package' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/package/[id] - Update a specific package by ID
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const result = await updatePackage({ id, ...data });
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        package: result.package,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in PUT /api/package/[id]:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update package' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/package/[id] - Delete a specific package by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await deletePackage(id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in DELETE /api/package/[id]:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete package' 
      },
      { status: 500 }
    );
  }
}