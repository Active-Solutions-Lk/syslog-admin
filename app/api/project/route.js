import { NextResponse } from 'next/server';
import { getProjects, createProject } from '@/app/actions/project';

// GET /api/project - Get all projects
export async function GET() {
  try {
    const result = await getProjects();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        projects: result.projects,
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
    console.error('Error in GET /api/project:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch projects' 
      },
      { status: 500 }
    );
  }
}

// POST /api/project - Create a new project
export async function POST(request) {
  try {
    const data = await request.json();
    
    const result = await createProject(data);
    
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
    console.error('Error in POST /api/project:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create project' 
      },
      { status: 500 }
    );
  }
}