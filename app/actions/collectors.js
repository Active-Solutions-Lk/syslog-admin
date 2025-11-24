"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export async function getCollectors() {
  try {
    // First, get all collectors
    const collectors = await prisma.collectors.findMany({
      select: {
        id: true,
        name: true,
        ip: true,
        secret_key: true,
        last_fetched_id: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    // Convert ids to strings for frontend
    const formattedCollectors = collectors.map(collector => ({
      ...collector,
      id: collector.id.toString(),
      is_active: Boolean(collector.is_active),
    }));
    
    return {
      success: true,
      collectors: formattedCollectors,
    };
  } catch (error) {
    console.error('Error fetching collectors:', error);
    return {
      success: false,
      error: 'Failed to fetch collectors',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getCollectorById(id) {
  try {
    const collector = await prisma.collectors.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        name: true,
        ip: true,
        secret_key: true,
        last_fetched_id: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    if (!collector) {
      return {
        success: false,
        error: 'Collector not found',
      };
    }
    
    // Convert ids to strings for frontend
    const formattedCollector = {
      ...collector,
      id: collector.id.toString(),
      is_active: Boolean(collector.is_active),
    };
    
    return {
      success: true,
      collector: formattedCollector,
    };
  } catch (error) {
    console.error('Error fetching collector:', error);
    return {
      success: false,
      error: 'Failed to fetch collector',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getProjectsUsingCollector(collectorId) {
  try {
    const projects = await prisma.projects.findMany({
      where: {
        collector_ip: parseInt(collectorId),
      },
      select: {
        id: true,
        activation_key: true,
      },
    });
    
    // Convert ids to strings for frontend
    const formattedProjects = projects.map(project => ({
      ...project,
      id: project.id.toString(),
    }));
    
    return {
      success: true,
      projects: formattedProjects,
    };
  } catch (error) {
    console.error('Error fetching projects using collector:', error);
    return {
      success: false,
      error: 'Failed to fetch projects',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function createCollector({ 
  name,
  ip,
  secret_key,
  is_active
}) {
  try {
    // Get current date for timestamps
    const now = new Date();
    
    // Create collector
    const newCollector = await prisma.collectors.create({
      data: {
        name: name,
        ip: ip,
        secret_key: secret_key,
        last_fetched_id: 0,
        is_active: Boolean(is_active),
        created_at: now,
        updated_at: now,
      },
      select: {
        id: true,
        name: true,
        ip: true,
        secret_key: true,
        last_fetched_id: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    // Convert ids to strings for frontend
    const formattedCollector = {
      ...newCollector,
      id: newCollector.id.toString(),
      is_active: Boolean(newCollector.is_active),
    };
    
    return {
      success: true,
      collector: formattedCollector,
      message: 'Collector created successfully',
    };
  } catch (error) {
    console.error('Error creating collector:', error);
    return {
      success: false,
      error: 'Failed to create collector',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateCollector({ 
  id, 
  name,
  ip,
  secret_key,
  is_active
}) {
  try {
    // Get current date for updatedAt timestamp
    const now = new Date();
    
    // Update collector
    const updatedCollector = await prisma.collectors.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name: name,
        ip: ip,
        secret_key: secret_key,
        is_active: Boolean(is_active),
        updated_at: now,
      },
      select: {
        id: true,
        name: true,
        ip: true,
        secret_key: true,
        last_fetched_id: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    // Convert ids to strings for frontend
    const formattedCollector = {
      ...updatedCollector,
      id: updatedCollector.id.toString(),
      is_active: Boolean(updatedCollector.is_active),
    };
    
    return {
      success: true,
      collector: formattedCollector,
      message: 'Collector updated successfully',
    };
  } catch (error) {
    console.error('Error updating collector:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Collector not found',
      };
    }
    return {
      success: false,
      error: 'Failed to update collector',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteCollector(id) {
  try {
    // Check if collector is being used by any projects
    const projectsUsingCollector = await prisma.projects.findMany({
      where: {
        collector_ip: parseInt(id),
      },
    });
    
    if (projectsUsingCollector.length > 0) {
      return {
        success: false,
        error: 'Cannot delete collector because it is being used by one or more projects',
      };
    }
    
    // Delete collector
    await prisma.collectors.delete({
      where: {
        id: parseInt(id),
      },
    });
    
    return {
      success: true,
      message: 'Collector deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting collector:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Collector not found',
      };
    }
    return {
      success: false,
      error: 'Failed to delete collector',
    };
  } finally {
    await prisma.$disconnect();
  }
}