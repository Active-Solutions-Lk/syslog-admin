"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Helper: format a Date's UTC components as an ISO string with Sri Lanka offset (+05:30)
function sriLankanIso(date) {
  if (!date) return null;
  const Y = date.getUTCFullYear();
  const M = String(date.getUTCMonth() + 1).padStart(2, '0');
  const D = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  // Sri Lanka is +05:30
  return `${Y}-${M}-${D}T${hh}:${mm}:${ss}+05:30`;
} 

export async function getApiLogs() {
  try {
    // Get all API logs with related project information
    const apiLogs = await prisma.api_logs.findMany({
      select: {
        id: true,
        project_id: true,
        cpu_status: true,
        ram_status: true,
        log_count: true,
        device_count: true,
        last_login_date: true,
        description: true,
        created_at: true,
        updated_at: true,
        project: {
          select: {
            activation_key: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    // Convert ids to strings for frontend and normalize timestamps to Sri Lanka timezone
    const formattedApiLogs = apiLogs.map(log => ({
      ...log,
      id: log.id.toString(),
      project_id: log.project_id.toString(),
      cpu_status: Number(log.cpu_status),
      ram_status: Number(log.ram_status),
      log_count: Number(log.log_count),
      device_count: Number(log.device_count),
      created_at: log.created_at ? sriLankanIso(log.created_at) : null,
      updated_at: log.updated_at ? sriLankanIso(log.updated_at) : null,
    }));
    
    return {
      success: true,
      apiLogs: formattedApiLogs,
    };
  } catch (error) {
    console.error('Error fetching API logs:', error);
    return {
      success: false,
      error: 'Failed to fetch API logs',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getApiLogsByActivationKey(activationKey) {
  try {
    // Get API logs for a specific project activation key
    const apiLogs = await prisma.api_logs.findMany({
      where: {
        project: {
          activation_key: activationKey
        }
      },
      select: {
        id: true,
        project_id: true,
        cpu_status: true,
        ram_status: true,
        log_count: true,
        device_count: true,
        last_login_date: true,
        description: true,
        created_at: true,
        updated_at: true,
        project: {
          select: {
            activation_key: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    // Convert ids to strings for frontend and normalize timestamps to Sri Lanka timezone
    const formattedApiLogs = apiLogs.map(log => ({
      ...log,
      id: log.id.toString(),
      project_id: log.project_id.toString(),
      cpu_status: Number(log.cpu_status),
      ram_status: Number(log.ram_status),
      log_count: Number(log.log_count),
      device_count: Number(log.device_count),
      created_at: log.created_at ? sriLankanIso(log.created_at) : null,
      updated_at: log.updated_at ? sriLankanIso(log.updated_at) : null,
    }));
    
    return {
      success: true,
      apiLogs: formattedApiLogs,
    };
  } catch (error) {
    console.error('Error fetching API logs by activation key:', error);
    return {
      success: false,
      error: 'Failed to fetch API logs',
    };
  } finally {
    await prisma.$disconnect();
  }
}
export async function getApiLogById(id) {
  try {
    const apiLog = await prisma.api_logs.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        project_id: true,
        cpu_status: true,
        ram_status: true,
        log_count: true,
        device_count: true,
        last_login_date: true,
        description: true,
        created_at: true,
        updated_at: true,
        project: {
          select: {
            activation_key: true,
          }
        }
      },
    });
    
    if (!apiLog) {
      return {
        success: false,
        error: 'API log not found',
      };
    }
    
    // Convert ids to strings for frontend and normalize timestamps to Sri Lanka timezone
    const formattedApiLog = {
      ...apiLog,
      id: apiLog.id.toString(),
      project_id: apiLog.project_id.toString(),
      cpu_status: Number(apiLog.cpu_status),
      ram_status: Number(apiLog.ram_status),
      log_count: Number(apiLog.log_count),
      device_count: Number(apiLog.device_count),
      created_at: apiLog.created_at ? sriLankanIso(apiLog.created_at) : null,
      updated_at: apiLog.updated_at ? sriLankanIso(apiLog.updated_at) : null,
    };
    
    return {
      success: true,
      apiLog: formattedApiLog,
    };
  } catch (error) {
    console.error('Error fetching API log:', error);
    return {
      success: false,
      error: 'Failed to fetch API log',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getProjectPackageInfo(activationKey) {
  try {
    // Get project package information
    const project = await prisma.projects.findFirst({
      where: {
        activation_key: activationKey
      },
      select: {
        packages: {
          select: {
            id: true,
            name: true,
            log_count: true, // This is the log quota
            device_count: true,
            created_at: true,
            updated_at: true
          }
        }
      }
    });
    
    if (!project || !project.packages) {
      return {
        success: false,
        error: 'Project or package not found',
      };
    }
    
    return {
      success: true,
      packageInfo: {
        ...project.packages,
        id: project.packages.id.toString(),
        log_quota: Number(project.packages.log_count),
        device_quota: Number(project.packages.device_count),
      },
    };
  } catch (error) {
    console.error('Error fetching project package info:', error);
    return {
      success: false,
      error: 'Failed to fetch project package info',
    };
  } finally {
    await prisma.$disconnect();
  }
}