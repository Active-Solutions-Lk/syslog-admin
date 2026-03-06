"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export async function getPorts() {
  try {
    const ports = await prisma.ports.findMany({
      select: {
        id: true,
        port: true,
        created_at: true,
      },
    });

    return {
      success: true,
      ports: ports.map(port => ({
        ...port,
        id: port.id.toString(),
      })),
    };
  } catch (error) {
    console.error('Error fetching ports:', error);
    return { success: false, error: 'Failed to fetch ports' };
  }
}

export async function getPortById(id) {
  try {
    const port = await prisma.ports.findUnique({
      where: { id: parseInt(id) },
    });
    if (!port) return { success: false, error: 'Port not found' };
    return { success: true, port: { ...port, id: port.id.toString() } };
  } catch (error) {
    console.error('Error fetching port:', error);
    return { success: false, error: 'Failed to fetch port' };
  }
}

export async function createPort({ port }) {
  try {
    const newPort = await prisma.ports.create({
      data: {
        port: parseInt(port),
      }
    });
    return { success: true, port: { ...newPort, id: newPort.id.toString() }, message: 'Port created successfully' };
  } catch (error) {
    console.error('Error creating port:', error);
    return { success: false, error: 'Failed to create port' };
  }
}

export async function updatePort({ id, port }) {
  try {
    const updatedPort = await prisma.ports.update({
      where: { id: parseInt(id) },
      data: {
        port: parseInt(port),
      }
    });
    return { success: true, port: { ...updatedPort, id: updatedPort.id.toString() }, message: 'Port updated successfully' };
  } catch (error) {
    console.error('Error updating port:', error);
    return { success: false, error: 'Failed to update port' };
  }
}

export async function deletePort(id) {
  try {
    await prisma.ports.delete({
      where: { id: parseInt(id) },
    });
    return { success: true, message: 'Port deleted successfully' };
  } catch (error) {
    console.error('Error deleting port:', error);
    return { success: false, error: 'Failed to delete port' };
  }
}