import { NextResponse } from 'next/server';
import { getApiLogs } from '@/app/actions/api-logs';

// GET /api/api-logs - Get all API logs
export async function GET() {
  try {
    const result = await getApiLogs();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        apiLogs: result.apiLogs,
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
    console.error('Error in GET /api/api-logs:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch API logs' 
      },
      { status: 500 }
    );
  }
}