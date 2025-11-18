"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getPorts() {
  try {
    // First, get all ports
    const ports = await prisma.ports.findMany({
      select: {
        id: true,
        port: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    // Convert ids to strings for frontend
    const formattedPorts = ports.map(port => ({
      ...port,
      id: port.id.toString(),
    }));
    
    return {
      success: true,
      ports: formattedPorts,
    };
  } catch (error) {
    console.error('Error fetching ports:', error);
    return {
      success: false,
      error: 'Failed to fetch ports',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getPortById(id) {
  try {
    const port = await prisma.ports.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        port: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    if (!port) {
      return {
        success: false,
        error: 'Port not found',
      };
    }
    
    // Convert ids to strings for frontend
    const formattedPort = {
      ...port,
      id: port.id.toString(),
    };
    
    return {
      success: true,
      port: formattedPort,
    };
  } catch (error) {
    console.error('Error fetching port:', error);
    return {
      success: false,
      error: 'Failed to fetch port',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getProjectsUsingPort(portId) {
  try {
    const projects = await prisma.projects.findMany({
      where: {
        port_id: parseInt(portId),
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
    console.error('Error fetching projects using port:', error);
    return {
      success: false,
      error: 'Failed to fetch projects',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function createPort({ 
  port
}) {
  try {
    // Get current date for timestamps
    const now = new Date();
    
    // Create port
    const newPort = await prisma.ports.create({
      data: {
        port: parseInt(port),
        created_at: now,
        updated_at: now,
      },
      select: {
        id: true,
        port: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    // Convert ids to strings for frontend
    const formattedPort = {
      ...newPort,
      id: newPort.id.toString(),
    };
    
    return {
      success: true,
      port: formattedPort,
      message: 'Port created successfully',
    };
  } catch (error) {
    console.error('Error creating port:', error);
    return {
      success: false,
      error: 'Failed to create port',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function updatePort({ 
  id, 
  port
}) {
  try {
    // Get current date for updatedAt timestamp
    const now = new Date();
    
    // Update port
    const updatedPort = await prisma.ports.update({
      where: {
        id: parseInt(id),
      },
      data: {
        port: parseInt(port),
        updated_at: now,
      },
      select: {
        id: true,
        port: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    // Convert ids to strings for frontend
    const formattedPort = {
      ...updatedPort,
      id: updatedPort.id.toString(),
    };
    
    return {
      success: true,
      port: formattedPort,
      message: 'Port updated successfully',
    };
  } catch (error) {
    console.error('Error updating port:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Port not found',
      };
    }
    return {
      success: false,
      error: 'Failed to update port',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function deletePort(id) {
  try {
    // Delete port
    await prisma.ports.delete({
      where: {
        id: parseInt(id),
      },
    });
    
    return {
      success: true,
      message: 'Port deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting port:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Port not found',
      };
    }
    return {
      success: false,
      error: 'Failed to delete port',
    };
  } finally {
    await prisma.$disconnect();
  }
}