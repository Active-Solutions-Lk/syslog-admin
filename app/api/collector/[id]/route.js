import { getCollectorById, updateCollector, deleteCollector } from '@/app/actions/collectors';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Collector ID is required' 
      }, { status: 400 });
    }

    const result = await getCollectorById(id);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        collector: result.collector 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in GET /api/collector/[id]:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Collector ID is required' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { name, ip, domain, secret_key, is_active } = body;

    // Validate required fields
    if (!name || !ip || !secret_key) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name, IP, and secret key are required' 
      }, { status: 400 });
    }

    const result = await updateCollector({ id, name, ip, domain, secret_key, is_active });
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        collector: result.collector,
        message: result.message
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in PUT /api/collector/[id]:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Collector ID is required' 
      }, { status: 400 });
    }

    const result = await deleteCollector(id);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message
      }, { status: 200 });
    } else {
      // Return appropriate status based on error type
      const statusCode = result.error.includes('not found') ? 404 : 400;
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: statusCode });
    }
  } catch (error) {
    console.error('Error in DELETE /api/collector/[id]:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}