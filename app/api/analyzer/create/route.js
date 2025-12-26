import { createAnalyzer } from '@/app/actions/analyzers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, ip, domain, status } = body;

    // Validate required fields
    if (!name || !ip) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and IP are required' 
      }, { status: 400 });
    }

    const result = await createAnalyzer({ name, ip, domain, status });
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        analyzer: result.analyzer,
        message: result.message
      }, { status: 201 });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/analyzer/create:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}