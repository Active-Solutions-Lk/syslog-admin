"use server";

//udhfbghdfbvgfdhb

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

export async function getAvailablePorts(collectorId) {
  try {
    console.log("Getting available ports for collector:", collectorId);

    // Validate collectorId
    if (!collectorId) {
      console.log("No collector ID provided");
      return {
        success: true,
        ports: [],
        isDefaultCollector: false
      };
    }

    // First, get the collector to check if it's a "default" collector
    const collector = await prisma.collectors.findUnique({
      where: {
        id: parseInt(collectorId)
      },
      select: {
        id: true,
        name: true,
        is_active: true
      }
    });

    console.log("Collector info:", collector);

    // Check if collector exists
    if (!collector) {
      console.log("Collector not found");
      return {
        success: true,
        ports: [],
        isDefaultCollector: false
      };
    }

    // Check if this is a "default" collector
    // For now, we'll consider collectors with ID 1 or named "default" as default collectors
    // Also consider collectors that are inactive as default (to allow any port assignment)
    const isDefaultCollector = collector && (collector.id === 1 ||
      collector.name.toLowerCase().includes('default') ||
      !collector.is_active);

    console.log("Is default collector:", isDefaultCollector);

    let availablePorts = [];

    if (isDefaultCollector) {
      // For default collectors, all ports are available
      console.log("Fetching all ports for default collector");
      const allPorts = await prisma.ports.findMany({
        select: {
          id: true,
          port: true,
        },
      });
      availablePorts = allPorts;
      console.log("All ports count:", allPorts.length);
    } else {
      // For non-default collectors, only get ports that are not assigned to other projects with the same collector
      console.log("Fetching available ports for non-default collector");

      // First, get all ports
      const allPorts = await prisma.ports.findMany({
        select: {
          id: true,
          port: true,
        },
      });
      console.log("All ports count:", allPorts.length);

      // Then, get ports that are already assigned to projects with the same collector ID
      const usedPorts = await prisma.ports.findMany({
        where: {
          projects: {
            some: {
              collector_ip: parseInt(collectorId)
            }
          }
        },
        select: {
          id: true,
          port: true,
        },
      });

      console.log("Used ports count:", usedPorts.length);

      // Create a set of used port IDs for quick lookup
      const usedPortIds = new Set(usedPorts.map(p => p.id));

      // Filter out used ports to get available ports
      availablePorts = allPorts.filter(port => !usedPortIds.has(port.id));
      console.log("Available ports count:", availablePorts.length);
    }

    // Convert ids to strings for frontend
    const formattedPorts = availablePorts.map(port => ({
      ...port,
      id: port.id.toString(),
    }));

    console.log("Formatted ports count:", formattedPorts.length);

    return {
      success: true,
      ports: formattedPorts,
      isDefaultCollector: isDefaultCollector // Return this info to frontend
    };
  } catch (error) {
    console.error('Error fetching available ports:', error);
    return {
      success: false,
      error: 'Failed to fetch available ports: ' + error.message,
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
        logger_ip: true,
        pkg_id: true,
        admin_id: true,
        reseller_id: true,
        port_id: true,
        end_customer_id: true,
        type: true,
        status: true,
        created_at: true,
        updated_at: true,
        admins: {
          select: {
            name: true,
            email: true,
          }
        },
        collector: { // Add collector relation
          select: {
            name: true,
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
        project_type: {
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
      collector_ip: project.collector_ip ? project.collector_ip.toString() : null, // Convert to string
      logger_ip: project.logger_ip ? project.logger_ip.toString() : null, // Convert to string
      type: project.type.toString(),
      port: project.port ? { port: project.port.port } : null,
      project_type: project.project_type ? { name: project.project_type.name } : null,
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
        logger_ip: true,
        pkg_id: true,
        admin_id: true,
        reseller_id: true,
        port_id: true,
        end_customer_id: true,
        type: true,
        status: true,
        created_at: true,
        updated_at: true,
        admins: {
          select: {
            name: true,
            email: true,
          }
        },
        collector: { // Add collector relation
          select: {
            name: true,
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
        project_type: {
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
      collector_ip: project.collector_ip ? project.collector_ip.toString() : null, // Convert to string
      logger_ip: project.logger_ip ? project.logger_ip.toString() : null, // Convert to string
      type: project.type.toString(),
      status: project.status,
      port: project.port ? { port: project.port.port } : null,
      project_type: project.project_type ? { name: project.project_type.name } : null,
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
  type
}) {
  try {
    // If a port is being assigned, check if it's already used by another project with the same collector
    if (port_id && collector_ip) {
      // First, check if this is a default collector
      const collector = await prisma.collectors.findUnique({
        where: {
          id: parseInt(collector_ip)
        },
        select: {
          id: true,
          name: true,
          is_active: true
        }
      });

      // Check if this is a "default" collector
      const isDefaultCollector = collector && (collector.id === 1 ||
        collector.name.toLowerCase().includes('default') ||
        !collector.is_active);

      // For non-default collectors, verify port is not already assigned to another project with the same collector
      if (!isDefaultCollector) {
        const existingProject = await prisma.projects.findFirst({
          where: {
            collector_ip: parseInt(collector_ip),
            port_id: parseInt(port_id)
          }
        });

        if (existingProject) {
          return {
            success: false,
            error: `Port is already assigned to project ${existingProject.activation_key} with the same collector`
          };
        }
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
        collector_ip: collector_ip ? parseInt(collector_ip) : null,
        logger_ip: logger_ip ? parseInt(logger_ip) : null,
        pkg_id: pkg_id && pkg_id !== '' ? parseInt(pkg_id) : 1,
        admin_id: admin_id ? parseInt(admin_id) : null,
        reseller_id: reseller_id ? parseInt(reseller_id) : null,
        port_id: port_id ? parseInt(port_id) : null,
        end_customer_id: end_customer_id ? parseInt(end_customer_id) : null,
        type: type ? parseInt(type) : 1,
        status: true,
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
        type: true,
        status: true,
        created_at: true,
        updated_at: true,
        admins: {
          select: {
            name: true,
            email: true,
          }
        },
        collector: {
          select: {
            name: true,
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
        project_type: {
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
      collector_ip: project.collector_ip ? project.collector_ip.toString() : null,
      logger_ip: project.logger_ip ? project.logger_ip.toString() : null,
      type: project.type.toString(),
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
  type,
  status
}) {
  try {
    // If a port is being assigned, check if it's already used by another project with the same collector
    if (port_id && collector_ip) {
      // First, check if this is a default collector
      const collector = await prisma.collectors.findUnique({
        where: {
          id: parseInt(collector_ip)
        },
        select: {
          id: true,
          name: true,
          is_active: true
        }
      });

      // Check if this is a "default" collector
      const isDefaultCollector = collector && (collector.id === 1 ||
        collector.name.toLowerCase().includes('default') ||
        !collector.is_active);

      // For non-default collectors, verify port is not already assigned to another project with the same collector
      if (!isDefaultCollector) {
        const existingProject = await prisma.projects.findFirst({
          where: {
            collector_ip: parseInt(collector_ip),
            port_id: parseInt(port_id),
            NOT: {
              id: parseInt(id)
            }
          }
        });

        if (existingProject) {
          return {
            success: false,
            error: `Port is already assigned to project ${existingProject.activation_key} with the same collector`
          };
        }
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
        collector_ip: collector_ip ? parseInt(collector_ip) : null,
        logger_ip: logger_ip ? parseInt(logger_ip) : null,
        pkg_id: pkg_id && pkg_id !== '' ? parseInt(pkg_id) : 1,
        admin_id: admin_id ? parseInt(admin_id) : null,
        reseller_id: reseller_id ? parseInt(reseller_id) : null,
        port_id: port_id ? parseInt(port_id) : null,
        end_customer_id: end_customer_id ? parseInt(end_customer_id) : null,
        type: type ? parseInt(type) : undefined,
        status: status !== undefined ? status : undefined,
        updated_at: now,
      },
      select: {
        id: true,
        activation_key: true,
        collector_ip: true,
        logger_ip: true,
        pkg_id: true,
        admin_id: true,
        reseller_id: true,
        port_id: true,
        end_customer_id: true,
        type: true,
        status: true,
        created_at: true,
        updated_at: true,
        admins: {
          select: {
            name: true,
            email: true,
          }
        },
        collector: {
          select: {
            name: true,
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
        project_type: {
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
      collector_ip: project.collector_ip ? project.collector_ip.toString() : null,
      logger_ip: project.logger_ip ? project.logger_ip.toString() : null,
      type: project.type.toString(),
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
      logger_ip: project.logger_ip ? project.logger_ip.toString() : null,
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
