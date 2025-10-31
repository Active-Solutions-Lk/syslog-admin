import { NextResponse } from 'next/server';
import { getPackages, createPackage } from '@/app/actions/package';

// GET /api/package - Get all packages
export async function GET() {
  try {
    const result = await getPackages();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        packages: result.packages,
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in GET /api/package:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch packages' 
      },
      { status: 500 }
    );
  }
}

// POST /api/package - Create a new package
export async function POST(request) {
  try {
    const data = await request.json();
    
    const result = await createPackage(data);
    
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
    console.error('Error in POST /api/package:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create package' 
      },
      { status: 500 }
    );
  }
}