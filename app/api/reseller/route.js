import { NextResponse } from 'next/server';
import { getResellers, createReseller } from '@/app/actions/reseller';

// GET /api/reseller - Get all resellers
export async function GET() {
  try {
    const result = await getResellers();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        resellers: result.resellers,
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
    console.error('Error in GET /api/reseller:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch resellers' 
      },
      { status: 500 }
    );
  }
}

// POST /api/reseller - Create a new reseller
export async function POST(request) {
  try {
    const data = await request.json();
    
    const result = await createReseller(data);
    
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
    console.error('Error in POST /api/reseller:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create reseller' 
      },
      { status: 500 }
    );
  }
}