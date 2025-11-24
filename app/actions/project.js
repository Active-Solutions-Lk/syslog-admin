"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

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

// Function to generate a secret key
function generateSecretKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  
  // Generate a 32-character secret key
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return key;
}

// Function to ensure the secret key is unique
async function generateUniqueSecretKey() {
  let key;
  let isUnique = false;
  
  while (!isUnique) {
    key = generateSecretKey();
    
    // Check if this key already exists
    const existingProject = await prisma.projects.findUnique({
      where: {
        secret_key: key,
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

export async function getAvailablePorts(collectorIp) {
  try {
    // First, get all ports
    const allPorts = await prisma.ports.findMany({
      select: {
        id: true,
        port: true,
      },
    });
    
    // Then, get ports that are already assigned to projects with the same collector IP
    const usedPorts = await prisma.ports.findMany({
      where: {
        projects: {
          collector_ip: collectorIp
        }
      },
      select: {
        id: true,
        port: true,
      },
    });
    
    // Create a set of used port IDs for quick lookup
    const usedPortIds = new Set(usedPorts.map(p => p.id));
    
    // Filter out used ports to get available ports
    const availablePorts = allPorts.filter(port => !usedPortIds.has(port.id));
    
    // Convert ids to strings for frontend
    const formattedPorts = availablePorts.map(port => ({
      ...port,
      id: port.id.toString(),
    }));
    
    return {
      success: true,
      ports: formattedPorts,
    };
  } catch (error) {
    console.error('Error fetching available ports:', error);
    return {
      success: false,
      error: 'Failed to fetch available ports',
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
        // secret_key is intentionally excluded from the response
        collector_ip: true,
        logger_ip: true,
        pkg_id: true,
        admin_id: true,
        reseller_id: true,
        port_id: true,
        end_customer_id: true,
        type: true, // Add type to select
        status: true,
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
        end_customer: {
          select: {
            company: true,
          }
        },
        packages: {
          select: {
            name: true,
          }
        },
        port: {
          select: {
            port: true,
          }
        },
        project_type: { // Add project_type relation
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
      port_id: project.port_id ? project.port_id.toString() : null,
      end_customer_id: project.end_customer_id ? project.end_customer_id.toString() : null,
      type: project.type.toString(), // Convert type to string
      port: project.port ? { port: project.port.port } : null,
      project_type: project.project_type ? { name: project.project_type.name } : null, // Add project_type
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
        // secret_key is intentionally excluded from the response
        collector_ip: true,
        logger_ip: true,
        pkg_id: true,
        admin_id: true,
        reseller_id: true,
        port_id: true,
        end_customer_id: true,
        type: true, // Add type to select
        status: true,
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
        end_customer: {
          select: {
            company: true,
          }
        },
        packages: {
          select: {
            name: true,
          }
        },
        port: {
          select: {
            port: true,
          }
        },
        project_type: { // Add project_type relation
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
      port_id: project.port_id ? project.port_id.toString() : null,
      end_customer_id: project.end_customer_id ? project.end_customer_id.toString() : null,
      type: project.type.toString(), // Convert type to string
      status: project.status,
      port: project.port ? { port: project.port.port } : null,
      project_type: project.project_type ? { name: project.project_type.name } : null, // Add project_type
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
  logger_ip, 
  pkg_id, 
  admin_id, 
  reseller_id, 
  port_id, 
  end_customer_id,
  type // Add type parameter
}) {
  try {
    // If a port is being assigned, check if it's already used by another project with the same collector IP
    if (port_id && collector_ip) {
      const existingProject = await prisma.projects.findFirst({
        where: {
          collector_ip: collector_ip,
          port_id: parseInt(port_id)
        }
      });
      
      if (existingProject) {
        return {
          success: false,
          error: `Port is already assigned to project ${existingProject.activation_key} with the same collector IP`
        };
      }
    }
    
    // Generate a unique activation key
    const activation_key = await generateUniqueActivationKey();
    
    // Generate a unique secret key
    const secret_key = await generateUniqueSecretKey();
    
    // Get current date for timestamps
    const now = new Date();
    
    // Create project
    const project = await prisma.projects.create({
      data: {
        activation_key,
        secret_key,
        collector_ip: collector_ip || '',
        logger_ip: logger_ip || '',
        pkg_id: pkg_id && pkg_id !== '' ? parseInt(pkg_id) : 1, // Default to package ID 1 if not provided
        admin_id: admin_id ? parseInt(admin_id) : null,
        reseller_id: reseller_id ? parseInt(reseller_id) : null,
        port_id: port_id ? parseInt(port_id) : null,
        end_customer_id: end_customer_id ? parseInt(end_customer_id) : null,
        type: type ? parseInt(type) : 1, // Default to type 1 if not provided
        status: true, // Default to enabled
        created_at: now,
        updated_at: now,
      },
      select: {
        id: true,
        activation_key: true,
        secret_key: true,
        collector_ip: true,
        logger_ip: true,
        pkg_id: true,
        admin_id: true,
        reseller_id: true,
        port_id: true,
        end_customer_id: true,
        type: true, // Add type to select
        status: true,
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
        end_customer: {
          select: {
            company: true,
          }
        },
        packages: {
          select: {
            name: true,
          }
        },
        port: {
          select: {
            port: true,
          }
        },
        project_type: { // Add project_type relation
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
      port_id: project.port_id ? project.port_id.toString() : null,
      end_customer_id: project.end_customer_id ? project.end_customer_id.toString() : null,
      type: project.type.toString(), // Convert type to string
      status: project.status,
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
  logger_ip, 
  pkg_id, 
  admin_id, 
  reseller_id, 
  port_id, 
  end_customer_id,
  type, // Add type parameter
  status
}) {
  try {
    // If a port is being assigned, check if it's already used by another project with the same collector IP
    if (port_id && collector_ip) {
      const existingProject = await prisma.projects.findFirst({
        where: {
          collector_ip: collector_ip,
          port_id: parseInt(port_id),
          NOT: {
            id: parseInt(id)
          }
        }
      });
      
      if (existingProject) {
        return {
          success: false,
          error: `Port is already assigned to project ${existingProject.activation_key} with the same collector IP`
        };
      }
    }
    
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
        logger_ip: logger_ip || '',
        pkg_id: pkg_id && pkg_id !== '' ? parseInt(pkg_id) : 1, // Default to package ID 1 if not provided
        admin_id: admin_id ? parseInt(admin_id) : null,
        reseller_id: reseller_id ? parseInt(reseller_id) : null,
        port_id: port_id ? parseInt(port_id) : null,
        end_customer_id: end_customer_id ? parseInt(end_customer_id) : null,
        type: type ? parseInt(type) : undefined, // Only update type if provided
        status: status !== undefined ? status : undefined, // Only update status if provided
        updated_at: now,
      },
      select: {
        id: true,
        activation_key: true,
        // secret_key is intentionally not updated and excluded from the response
        collector_ip: true,
        logger_ip: true,
        pkg_id: true,
        admin_id: true,
        reseller_id: true,
        port_id: true,
        end_customer_id: true,
        type: true, // Add type to select
        status: true,
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
        end_customer: {
          select: {
            company: true,
          }
        },
        packages: {
          select: {
            name: true,
          }
        },
        port: {
          select: {
            port: true,
          }
        },
        project_type: { // Add project_type relation
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
      port_id: project.port_id ? project.port_id.toString() : null,
      end_customer_id: project.end_customer_id ? project.end_customer_id.toString() : null,
      type: project.type.toString(), // Convert type to string
      status: project.status,
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

export async function updateProjectStatus(id, status) {
  try {
    // Update project status
    const project = await prisma.projects.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status: status,
        updated_at: new Date(),
      },
      select: {
        id: true,
        activation_key: true,
        // secret_key is intentionally excluded from the response
        collector_ip: true,
        logger_ip: true,
        pkg_id: true,
        admin_id: true,
        reseller_id: true,
        port_id: true,
        end_customer_id: true,
        status: true,
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
        end_customer: {
          select: {
            company: true,
          }
        },
        packages: {
          select: {
            name: true,
          }
        },
        port: {
          select: {
            port: true,
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
      port_id: project.port_id ? project.port_id.toString() : null,
      end_customer_id: project.end_customer_id ? project.end_customer_id.toString() : null,
      status: project.status,
    };
    
    return {
      success: true,
      project: formattedProject,
      message: `Project ${status ? 'enabled' : 'disabled'} successfully`,
    };
  } catch (error) {
    console.error('Error updating project status:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Project not found',
      };
    }
    return {
      success: false,
      error: 'Failed to update project status',
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

export async function getProjectTypes() {
  try {
    const projectTypes = await prisma.project_types.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    
    // Convert ids to strings for frontend
    const formattedProjectTypes = projectTypes.map(type => ({
      ...type,
      id: type.id.toString(),
    }));
    
    return {
      success: true,
      projectTypes: formattedProjectTypes,
    };
  } catch (error) {
    console.error('Error fetching project types:', error);
    return {
      success: false,
      error: 'Failed to fetch project types',
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

/**
 * Create an internal log entry
 * @param {object} logData - The log data to insert
 * @returns {Promise<object>} - The created log entry
 */
export async function createInternalLog(logData) {
  try {
    const logEntry = await prisma.internal_log.create({
      data: {
        related_table: logData.related_table || null,
        related_table_id: logData.related_table_id || null,
        severity: logData.severity || 1,
        message: logData.message,
        admin_id: logData.admin_id || null,
        action: logData.action || 'unknown',
        status_code: logData.status_code || 200,
        additional_data: logData.additional_data ? JSON.stringify(logData.additional_data) : null,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('Internal log created successfully');
    return { success: true, data: logEntry };
  } catch (error) {
    console.error('Failed to create internal log:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}
