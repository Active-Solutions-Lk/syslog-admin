import { createCollector } from '@/app/actions/collectors';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, ip, domain, secret_key, is_active } = body;

    // Validate required fields
    if (!name || !ip || !secret_key) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name, IP, and secret key are required' 
      }, { status: 400 });
    }

    const result = await createCollector({ name, ip, domain, secret_key, is_active });
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        collector: result.collector,
        message: result.message
      }, { status: 201 });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST /api/collector/create:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}