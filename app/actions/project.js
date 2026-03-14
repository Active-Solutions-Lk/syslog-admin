"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ------------------------------
   Activation Key Generator
--------------------------------*/

function generateActivationKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "";

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 2) key += "-";
  }
  return key;
}

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
        analyzers: true,
      },
      orderBy: { created_at: "desc" },
    });

    return {
      success: true,
      projects: projects.map((p) => ({
        ...p,
        id: p.id.toString(),
        project_type_id: p.project_type_id?.toString(),
        port_id: p.port_id?.toString(),
        admin_id: p.admin_id?.toString(),
        reseller_id: p.reseller_id?.toString(),
        end_customer_id: p.end_customer_id?.toString(),
        collector_id: p.collector_id?.toString(),
        analyzer_id: p.analyzer_id?.toString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { success: false, error: "Failed to fetch projects" };
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
        analyzers: true,
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    return {
      success: true,
      project: {
        ...project,
        id: project.id.toString(),
        project_type_id: project.project_type_id?.toString(),
        port_id: project.port_id?.toString(),
        admin_id: project.admin_id?.toString(),
        reseller_id: project.reseller_id?.toString(),
        end_customer_id: project.end_customer_id?.toString(),
        collector_id: project.collector_id?.toString(),
        analyzer_id: project.analyzer_id?.toString(),
      },
    };
  } catch (error) {
    console.error("Error fetching project:", error);
    return { success: false, error: "Failed to fetch project" };
  }
}

export async function createProject(data) {
  try {
    const activation_key = await generateUniqueActivationKey();

    const existingCombination = await prisma.projects.findFirst({
      where: {
        collector_id: parseInt(data.collector_id),
        port_id: parseInt(data.port_id),
      },
    });

    if (existingCombination) {
      return {
        success: false,
        error: "A project with this Collector and Port already exists.",
      };
    }

    const project = await prisma.projects.create({
      data: {
        activation_key,
        project_type_id: parseInt(data.project_type_id),
        port_id: data.port_id ? parseInt(data.port_id) : null,
        admin_id: parseInt(data.admin_id),
        reseller_id: data.reseller_id ? parseInt(data.reseller_id) : null,
        end_customer_id: data.end_customer_id
          ? parseInt(data.end_customer_id)
          : null,
        collector_id: parseInt(data.collector_id),
        analyzer_id: data.analyzer_id ? parseInt(data.analyzer_id) : null,
        device_count: parseInt(data.device_count) || 5,
      },
    });

    return {
      success: true,
      project,
      message: "Project created successfully",
    };
  } catch (error) {
    console.error("Error creating project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function updateProject(data) {
  try {
    const existingCombination = await prisma.projects.findFirst({
      where: {
        collector_id: parseInt(data.collector_id),
        port_id: parseInt(data.port_id),
        NOT: {
          id: parseInt(data.id),
        },
      },
    });

    if (existingCombination) {
      return {
        success: false,
        error: "A project with this Collector and Port already exists.",
      };
    }

    const project = await prisma.projects.update({
      where: { id: parseInt(data.id) },
      data: {
        activation_key: data.activation_key,
        project_type_id: parseInt(data.project_type_id),
        port_id: data.port_id ? parseInt(data.port_id) : null,
        admin_id: parseInt(data.admin_id),
        reseller_id: data.reseller_id ? parseInt(data.reseller_id) : null,
        end_customer_id: data.end_customer_id
          ? parseInt(data.end_customer_id)
          : null,
        collector_id: parseInt(data.collector_id),
        analyzer_id: data.analyzer_id ? parseInt(data.analyzer_id) : null,
        device_count: parseInt(data.device_count),
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      project,
      message: "Project updated successfully",
    };
  } catch (error) {
    console.error("Error updating project:", error);
    return { success: false, error: "Failed to update project" };
  }
}

export async function deleteProject(id) {
  try {
    await prisma.projects.delete({
      where: { id: parseInt(id) },
    });

    return { success: true, message: "Project deleted successfully" };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: "Failed to delete project" };
  }
}

/* ------------------------------
   PROJECT TYPES
--------------------------------*/

export async function getProjectTypes() {
  try {
    const types = await prisma.project_types.findMany({
      orderBy: { id: "desc" },
    });

    return {
      success: true,
      projectTypes: types.map((t) => ({
        id: t.id.toString(),
        type: t.type,
        description: t.description,
      })),
    };
  } catch (error) {
    console.error("Error fetching project types:", error);
    return { success: false, error: "Failed to fetch project types" };
  }
}

export async function createProjectType({ type, description }) {
  try {
    const newType = await prisma.project_types.create({
      data: {
        type,
        description: description || null,
      },
    });

    return {
      success: true,
      projectType: {
        id: newType.id.toString(),
        type: newType.type,
        description: newType.description,
      },
    };
  } catch (error) {
    console.error("Error creating project type:", error);
    return { success: false, error: "Failed to create project type" };
  }
}

export async function updateProjectType({ id, type, description }) {
  try {
    const updatedType = await prisma.project_types.update({
      where: { id: parseInt(id) },
      data: {
        type,
        description: description || null,
      },
    });

    return {
      success: true,
      projectType: {
        id: updatedType.id.toString(),
        type: updatedType.type,
        description: updatedType.description,
      },
    };
  } catch (error) {
    console.error("Error updating project type:", error);
    return { success: false, error: "Failed to update project type" };
  }
}

export async function deleteProjectType(id) {
  try {
    await prisma.project_types.delete({
      where: { id: parseInt(id) },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting project type:", error);
    return { success: false, error: "Failed to delete project type" };
  }
}