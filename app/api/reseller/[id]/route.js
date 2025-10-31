import { NextResponse } from 'next/server';
import { getResellerById, updateReseller, deleteReseller } from '@/app/actions/reseller';

// GET /api/reseller/[id] - Get a specific reseller by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await getResellerById(id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        reseller: result.reseller,
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
    console.error('Error in GET /api/reseller/[id]:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch reseller' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/reseller/[id] - Update a specific reseller by ID
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const result = await updateReseller({ customer_id: id, ...data });
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        reseller: result.reseller,
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
    console.error('Error in PUT /api/reseller/[id]:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update reseller' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/reseller/[id] - Delete a specific reseller by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await deleteReseller(id);
    
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
    console.error('Error in DELETE /api/reseller/[id]:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete reseller' 
      },
      { status: 500 }
    );
  }
}