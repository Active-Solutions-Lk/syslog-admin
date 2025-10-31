import { NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteProject } from '@/app/actions/project';

// GET /api/project/[id] - Get a specific project by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const result = await getProjectById(id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        project: result.project,
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
    console.error('Error in GET /api/project/[id]:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch project' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/project/[id] - Update a specific project by ID
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const result = await updateProject({ id, ...data });
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        project: result.project,
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
    console.error('Error in PUT /api/project/[id]:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update project' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/project/[id] - Delete a specific project by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await deleteProject(id);
    
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
    console.error('Error in DELETE /api/project/[id]:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete project' 
      },
      { status: 500 }
    );
  }
}