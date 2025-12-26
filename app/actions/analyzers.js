"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export async function getAnalyzers() {
  try {
    // First, get all analyzers
    const analyzers = await prisma.analyzers.findMany({
      select: {
        id: true,
        name: true,
        ip: true,
        domain: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    // Convert ids to strings for frontend
    const formattedAnalyzers = analyzers.map(analyzer => ({
      ...analyzer,
      id: analyzer.id.toString(),
      status: Number(analyzer.status),
    }));
    
    return {
      success: true,
      analyzers: formattedAnalyzers,
    };
  } catch (error) {
    console.error('Error fetching analyzers:', error);
    return {
      success: false,
      error: 'Failed to fetch analyzers',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAnalyzerById(id) {
  try {
    const analyzer = await prisma.analyzers.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        name: true,
        ip: true,
        domain: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    if (!analyzer) {
      return {
        success: false,
        error: 'Analyzer not found',
      };
    }
    
    // Convert ids to strings for frontend
    const formattedAnalyzer = {
      ...analyzer,
      id: analyzer.id.toString(),
      status: Number(analyzer.status),
    };
    
    return {
      success: true,
      analyzer: formattedAnalyzer,
    };
  } catch (error) {
    console.error('Error fetching analyzer:', error);
    return {
      success: false,
      error: 'Failed to fetch analyzer',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function createAnalyzer({ 
  name,
  ip,
  domain,
  status
}) {
  try {
    // Get current date for timestamps
    const now = new Date();
    
    // Create analyzer
    const newAnalyzer = await prisma.analyzers.create({
      data: {
        name: name,
        ip: ip,
        domain: domain,
        status: Number(status),
        created_at: now,
        updated_at: now,
      },
      select: {
        id: true,
        name: true,
        ip: true,
        domain: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    // Convert ids to strings for frontend
    const formattedAnalyzer = {
      ...newAnalyzer,
      id: newAnalyzer.id.toString(),
      status: Number(newAnalyzer.status),
    };
    
    return {
      success: true,
      analyzer: formattedAnalyzer,
      message: 'Analyzer created successfully',
    };
  } catch (error) {
    console.error('Error creating analyzer:', error);
    return {
      success: false,
      error: 'Failed to create analyzer',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateAnalyzer({ 
  id,
  name,
  ip,
  domain,
  status
}) {
  try {
    // Update analyzer
    const updatedAnalyzer = await prisma.analyzers.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name: name,
        ip: ip,
        domain: domain,
        status: Number(status),
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        ip: true,
        domain: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    // Convert ids to strings for frontend
    const formattedAnalyzer = {
      ...updatedAnalyzer,
      id: updatedAnalyzer.id.toString(),
      status: Number(updatedAnalyzer.status),
    };
    
    return {
      success: true,
      analyzer: formattedAnalyzer,
      message: 'Analyzer updated successfully',
    };
  } catch (error) {
    console.error('Error updating analyzer:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Analyzer not found',
      };
    }
    return {
      success: false,
      error: 'Failed to update analyzer',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteAnalyzer(id) {
  try {
    // Delete analyzer
    await prisma.analyzers.delete({
      where: {
        id: parseInt(id),
      },
    });
    
    return {
      success: true,
      message: 'Analyzer deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting analyzer:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Analyzer not found',
      };
    }
    return {
      success: false,
      error: 'Failed to delete analyzer',
    };
  } finally {
    await prisma.$disconnect();
  }
}