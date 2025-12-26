import { getCollectors } from '@/app/actions/collectors';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await getCollectors();
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        collectors: result.collectors 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in GET /api/collector:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}