import { getAnalyzerById, updateAnalyzer, deleteAnalyzer } from '@/app/actions/analyzers';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Analyzer ID is required' 
      }, { status: 400 });
    }

    const result = await getAnalyzerById(id);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        analyzer: result.analyzer 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in GET /api/analyzer/[id]:', error);
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
        error: 'Analyzer ID is required' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { name, ip, domain, status } = body;

    // Validate required fields
    if (!name || !ip) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and IP are required' 
      }, { status: 400 });
    }

    const result = await updateAnalyzer({ id, name, ip, domain, status });
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        analyzer: result.analyzer,
        message: result.message
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in PUT /api/analyzer/[id]:', error);
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
        error: 'Analyzer ID is required' 
      }, { status: 400 });
    }

    const result = await deleteAnalyzer(id);
    
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
    console.error('Error in DELETE /api/analyzer/[id]:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}