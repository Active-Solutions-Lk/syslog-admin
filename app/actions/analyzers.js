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

    return {
      success: true,
      analyzers: analyzers.map(analyzer => ({
        ...analyzer,
        id: analyzer.id.toString(),
        // status is returned as boolean from Prisma
      })),
    };
  } catch (error) {
    console.error('Error fetching analyzers:', error);
    return { success: false, error: 'Failed to fetch analyzers' };
  }
}

export async function getAnalyzerById(id) {
  try {
    const analyzer = await prisma.analyzers.findUnique({
      where: { id: parseInt(id) },
    });
    if (!analyzer) return { success: false, error: 'Analyzer not found' };
    return { success: true, analyzer: { ...analyzer, id: analyzer.id.toString() } };
  } catch (error) {
    console.error('Error fetching analyzer:', error);
    return { success: false, error: 'Failed to fetch analyzer' };
  }
}

export async function createAnalyzer({ name, ip, domain, status }) {
  try {
    // Validation for IP address
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ip && !ipRegex.test(ip)) {
      return { success: false, error: 'Invalid IP address format' };
    }

    // Check for unique IP address
    const existingAnalyzer = await prisma.analyzers.findFirst({
      where: {
        ip: ip || undefined
      }
    });

    if (existingAnalyzer) {
      return { success: false, error: 'An analyzer with this IP address already exists' };
    }

    const newAnalyzer = await prisma.analyzers.create({
      data: {
        name,
        ip,
        domain,
        status: status !== undefined ? Boolean(status) : true,
      }
    });
    return { success: true, analyzer: { ...newAnalyzer, id: newAnalyzer.id.toString() }, message: 'Analyzer created successfully' };
  } catch (error) {
    console.error('Error creating analyzer:', error);
    return { success: false, error: 'Failed to create analyzer' };
  }
}

export async function updateAnalyzer({ id, name, ip, domain, status }) {
  try {
    // Validation for IP address
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ip && !ipRegex.test(ip)) {
      return { success: false, error: 'Invalid IP address format' };
    }

    // Check for unique IP address for update
    const existingConflict = await prisma.analyzers.findFirst({
      where: {
        AND: [
          { id: { not: parseInt(id) } },
          { ip: ip || undefined }
        ]
      }
    });

    if (existingConflict) {
      return { success: false, error: 'An analyzer with this IP address already exists' };
    }

    const updatedAnalyzer = await prisma.analyzers.update({
      where: { id: parseInt(id) },
      data: {
        name,
        ip,
        domain,
        status: Boolean(status),
        updated_at: new Date()
      }
    });
    return { success: true, analyzer: { ...updatedAnalyzer, id: updatedAnalyzer.id.toString() }, message: 'Analyzer updated successfully' };
  } catch (error) {
    console.error('Error updating analyzer:', error);
    return { success: false, error: 'Failed to update analyzer' };
  }
}

export async function deleteAnalyzer(id) {
  try {
    // Check if any projects are using this analyzer
    const linkedProject = await prisma.projects.findFirst({
      where: {
        analyzer_id: parseInt(id),
      },
    });

    if (linkedProject) {
      return {
        success: false,
        error: 'Cannot delete analyzer because it is assigned to an existing project.',
      };
    }

    await prisma.analyzers.delete({
      where: { id: parseInt(id) },
    });
    return { success: true, message: 'Analyzer deleted successfully' };
  } catch (error) {
    console.error('Error deleting analyzer:', error);
    return { success: false, error: 'Failed to delete analyzer' };
  }
}