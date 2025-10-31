"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to generate a unique activation key
function generateActivationKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  
  // Generate a key in the format XXXX-XXXX-XXXX
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 2) key += '-';
  }
  
  return key;
}

// Function to ensure the activation key is unique
async function generateUniqueActivationKey() {
  let key;
  let isUnique = false;
  
  while (!isUnique) {
    key = generateActivationKey();
    
    // Check if this key already exists
    const existingProject = await prisma.projects.findUnique({
      where: {
        activation_key: key,
      },
    });
    
    if (!existingProject) {
      isUnique = true;
    }
  }
  
  return key;
}

export async function getPackages() {
  try {
    const packages = await prisma.packages.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    
    // Convert ids to strings for frontend
    const formattedPackages = packages.map(pkg => ({
      ...pkg,
      id: pkg.id.toString(),
    }));
    
    return {
      success: true,
      packages: formattedPackages,
    };
  } catch (error) {
    console.error('Error fetching packages:', error);
    return {
      success: false,
      error: 'Failed to fetch packages',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getProjects() {
  try {
    const projects = await prisma.projects.findMany({
      select: {
        id: true,
        activation_key: true,
        collector_ip: true,
        loggert_ip: true,
        pkg_id: true,
        admin_id: true,
        reseller_id: true,
        created_at: true,
        updated_at: true,
        admins: {
          select: {
            name: true,
            email: true,
          }
        },
        reseller: {
          select: {
            company_name: true,
          }
        },
        packages: {
          select: {
            name: true,
          }
        }
      },
    });
    
    // Convert ids to strings for frontend
    const formattedProjects = projects.map(project => ({
      ...project,
      id: project.id.toString(),
      pkg_id: project.pkg_id.toString(),
      admin_id: project.admin_id ? project.admin_id.toString() : null,
      reseller_id: project.reseller_id ? project.reseller_id.toString() : null,
    }));
    
    return {
      success: true,
      projects: formattedProjects,
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      success: false,
      error: 'Failed to fetch projects',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getProjectById(id) {
  try {
    const project = await prisma.projects.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        activation_key: true,
        collector_ip: true,
        loggert_ip: true,
        pkg_id: true,
        admin_id: true,
        reseller_id: true,
        created_at: true,
        updated_at: true,
        admins: {
          select: {
            name: true,
            email: true,
          }
        },
        reseller: {
          select: {
            company_name: true,
          }
        },
        packages: {
          select: {
            name: true,
          }
        }
      },
    });
    
    if (!project) {
      return {
        success: false,
        error: 'Project not found',
      };
    }
    
    // Convert ids to strings for frontend
    const formattedProject = {
      ...project,
      id: project.id.toString(),
      pkg_id: project.pkg_id.toString(),
      admin_id: project.admin_id ? project.admin_id.toString() : null,
      reseller_id: project.reseller_id ? project.reseller_id.toString() : null,
    };
    
    return {
      success: true,
      project: formattedProject,
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return {
      success: false,
      error: 'Failed to fetch project',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function createProject({ 
  collector_ip, 
  loggert_ip, 
  pkg_id, 
  admin_id, 
  reseller_id 
}) {
  try {
    // Generate a unique activation key
    const activation_key = await generateUniqueActivationKey();
    
    // Get current date for timestamps
    const now = new Date();
    
    // Create project
    const project = await prisma.projects.create({
      data: {
        activation_key,
        collector_ip: collector_ip || '',
        loggert_ip: loggert_ip || '',
        pkg_id: pkg_id && pkg_id !== '' ? parseInt(pkg_id) : 1, // Default to package ID 1 if not provided
        admin_id: admin_id ? parseInt(admin_id) : null,
        reseller_id: reseller_id ? parseInt(reseller_id) : null,
        created_at: now,
        updated_at: now,
      },
      select: {
        id: true,
        activation_key: true,
        collector_ip: true,
        loggert_ip: true,
        pkg_id: true,
        admin_id: true,
        reseller_id: true,
        created_at: true,
        updated_at: true,
        admins: {
          select: {
            name: true,
            email: true,
          }
        },
        reseller: {
          select: {
            company_name: true,
          }
        },
        packages: {
          select: {
            name: true,
          }
        }
      },
    });
    
    // Convert ids to strings for frontend
    const formattedProject = {
      ...project,
      id: project.id.toString(),
      pkg_id: project.pkg_id.toString(),
      admin_id: project.admin_id ? project.admin_id.toString() : null,
      reseller_id: project.reseller_id ? project.reseller_id.toString() : null,
    };
    
    return {
      success: true,
      project: formattedProject,
      message: 'Project created successfully',
    };
  } catch (error) {
    console.error('Error creating project:', error);
    return {
      success: false,
      error: 'Failed to create project',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateProject({ 
  id, 
  activation_key, 
  collector_ip, 
  loggert_ip, 
  pkg_id, 
  admin_id, 
  reseller_id 
}) {
  try {
    // Get current date for updatedAt timestamp
    const now = new Date();
    
    // Update project
    const project = await prisma.projects.update({
      where: {
        id: parseInt(id),
      },
      data: {
        activation_key,
        collector_ip: collector_ip || '',
        loggert_ip: loggert_ip || '',
        pkg_id: pkg_id && pkg_id !== '' ? parseInt(pkg_id) : 1, // Default to package ID 1 if not provided
        admin_id: admin_id ? parseInt(admin_id) : null,
        reseller_id: reseller_id ? parseInt(reseller_id) : null,
        updated_at: now,
      },
      select: {
        id: true,
        activation_key: true,
        collector_ip: true,
        loggert_ip: true,
        pkg_id: true,
        admin_id: true,
        reseller_id: true,
        created_at: true,
        updated_at: true,
        admins: {
          select: {
            name: true,
            email: true,
          }
        },
        reseller: {
          select: {
            company_name: true,
          }
        },
        packages: {
          select: {
            name: true,
          }
        }
      },
    });
    
    // Convert ids to strings for frontend
    const formattedProject = {
      ...project,
      id: project.id.toString(),
      pkg_id: project.pkg_id.toString(),
      admin_id: project.admin_id ? project.admin_id.toString() : null,
      reseller_id: project.reseller_id ? project.reseller_id.toString() : null,
    };
    
    return {
      success: true,
      project: formattedProject,
      message: 'Project updated successfully',
    };
  } catch (error) {
    console.error('Error updating project:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Project not found',
      };
    }
    return {
      success: false,
      error: 'Failed to update project',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteProject(id) {
  try {
    // Delete project
    await prisma.projects.delete({
      where: {
        id: parseInt(id),
      },
    });
    
    return {
      success: true,
      message: 'Project deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting project:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Project not found',
      };
    }
    return {
      success: false,
      error: 'Failed to delete project',
    };
  } finally {
    await prisma.$disconnect();
  }
}