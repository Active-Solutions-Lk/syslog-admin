import { getAnalyzers } from '@/app/actions/analyzers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await getAnalyzers();
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        analyzers: result.analyzers 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in GET /api/analyzer:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}