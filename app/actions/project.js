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
    const existingProject = await prisma.projects.findFirst({
      where: { activation_key: key },
    });
    if (!existingProject) isUnique = true;
  }
  return key;
}

export async function getProjects() {
  try {
    const projects = await prisma.projects.findMany({
      include: {
        project_types: true,
        port: true,
        admins: true,
        reseller: true,
        end_customer: true,
        collectors: true,
        analyzers: true
      },
      orderBy: { created_at: 'desc' }
    });

    return {
      success: true,
      projects: projects.map(p => ({
        ...p,
        id: p.id.toString(),
        project_type_id: p.project_type_id.toString(),
        port_id: p.port_id?.toString(),
        admin_id: p.admin_id?.toString(),
        reseller_id: p.reseller_id?.toString(),
        end_customer_id: p.end_customer_id?.toString(),
        collector_id: p.collector_id.toString(),
        analyzer_id: p.analyzer_id?.toString(),
      })),
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { success: false, error: 'Failed to fetch projects' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getProjectById(id) {
  try {
    const project = await prisma.projects.findUnique({
      where: { id: parseInt(id) },
      include: {
        project_types: true,
        port: true,
        admins: true,
        reseller: true,
        end_customer: true,
        collectors: true,
        analyzers: true
      }
    });

    if (!project) return { success: false, error: 'Project not found' };

    return {
      success: true,
      project: {
        ...project,
        id: project.id.toString(),
        project_type_id: project.project_type_id.toString(),
        port_id: project.port_id?.toString(),
        admin_id: project.admin_id?.toString(),
        reseller_id: project.reseller_id?.toString(),
        end_customer_id: project.end_customer_id?.toString(),
        collector_id: project.collector_id.toString(),
        analyzer_id: project.analyzer_id?.toString(),
      },
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return { success: false, error: 'Failed to fetch project' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function createProject({
  project_type_id,
  port_id,
  admin_id,
  reseller_id,
  end_customer_id,
  collector_id,
  analyzer_id,
  device_count
}) {
  try {
    const activation_key = await generateUniqueActivationKey();

    // Check if collector and port combination already exists
    const existingCombination = await prisma.projects.findFirst({
      where: {
        collector_id: parseInt(collector_id),
        port_id: parseInt(port_id)
      }
    });

    if (existingCombination) {
      return { success: false, error: 'A project with this Collector and Port already exists.' };
    }

    const project = await prisma.projects.create({
      data: {
        activation_key,
        project_type_id: parseInt(project_type_id),
        port_id: port_id ? parseInt(port_id) : null,
        admin_id: parseInt(admin_id),
        reseller_id: reseller_id ? parseInt(reseller_id) : null,
        end_customer_id: end_customer_id ? parseInt(end_customer_id) : null,
        collector_id: parseInt(collector_id),
        analyzer_id: analyzer_id ? parseInt(analyzer_id) : null,
        device_count: parseInt(device_count) || 5,
      }
    });

    return { success: true, project, message: 'Project created successfully' };
  } catch (error) {
    console.error('Error creating project:', error);
    return { success: false, error: 'Failed to create project' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateProject({
  id,
  activation_key,
  project_type_id,
  port_id,
  admin_id,
  reseller_id,
  end_customer_id,
  collector_id,
  analyzer_id,
  device_count
}) {
  try {
    // Check if collector and port combination already exists for another project
    const existingCombination = await prisma.projects.findFirst({
      where: {
        collector_id: parseInt(collector_id),
        port_id: parseInt(port_id),
        NOT: {
          id: parseInt(id)
        }
      }
    });

    if (existingCombination) {
      return { success: false, error: 'A project with this Collector and Port already exists.' };
    }

    const project = await prisma.projects.update({
      where: { id: parseInt(id) },
      data: {
        activation_key,
        project_type_id: parseInt(project_type_id),
        port_id: port_id ? parseInt(port_id) : null,
        admin_id: parseInt(admin_id),
        reseller_id: reseller_id ? parseInt(reseller_id) : null,
        end_customer_id: end_customer_id ? parseInt(end_customer_id) : null,
        collector_id: parseInt(collector_id),
        analyzer_id: analyzer_id ? parseInt(analyzer_id) : null,
        device_count: parseInt(device_count),
        updated_at: new Date()
      }
    });

    return { success: true, project, message: 'Project updated successfully' };
  } catch (error) {
    console.error('Error updating project:', error);
    return { success: false, error: 'Failed to update project' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteProject(id) {
  try {
    await prisma.projects.delete({
      where: { id: parseInt(id) },
    });
    return { success: true, message: 'Project deleted successfully' };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, error: 'Failed to delete project' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getProjectTypes() {
  try {
    const types = await prisma.project_types.findMany();
    return { success: true, projectTypes: types.map(t => ({ ...t, id: t.id.toString() })) };
  } catch (error) {
    console.error('Error fetching project types:', error);
    return { success: false, error: 'Failed to fetch project types' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function createProjectType({ type }) {
  try {
    const newType = await prisma.project_types.create({
      data: { type }
    });
    return { success: true, projectType: { ...newType, id: newType.id.toString() } };
  } catch (error) {
    console.error('Error creating project type:', error);
    return { success: false, error: 'Failed to create project type' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateProjectType({ id, type }) {
  try {
    const updatedType = await prisma.project_types.update({
      where: { id: parseInt(id) },
      data: { type }
    });
    return { success: true, projectType: { ...updatedType, id: updatedType.id.toString() } };
  } catch (error) {
    console.error('Error updating project type:', error);
    return { success: false, error: 'Failed to update project type' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteProjectType(id) {
  try {
    await prisma.project_types.delete({
      where: { id: parseInt(id) }
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting project type:', error);
    return { success: false, error: 'Failed to delete project type' };
  } finally {
    await prisma.$disconnect();
  }
}
