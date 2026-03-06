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
    const collectors = await prisma.collectors.findMany({
      select: {
        id: true,
        name: true,
        ip: true,
        domain: true,
        secret_key: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      success: true,
      collectors: collectors.map(c => ({ ...c, id: c.id.toString() })),
    };
  } catch (error) {
    console.error('Error fetching collectors:', error);
    return { success: false, error: 'Failed to fetch collectors' };
  }
}

export async function getCollectorById(id) {
  try {
    const collector = await prisma.collectors.findUnique({
      where: { id: parseInt(id) },
    });
    if (!collector) return { success: false, error: 'Collector not found' };
    return { success: true, collector: { ...collector, id: collector.id.toString() } };
  } catch (error) {
    console.error('Error fetching collector:', error);
    return { success: false, error: 'Failed to fetch collector' };
  }
}

export async function createCollector(data) {
  try {
    const collector = await prisma.collectors.create({
      data: {
        name: data.name,
        ip: data.ip,
        domain: data.domain,
        secret_key: data.secret_key,
        is_active: data.is_active === undefined ? true : Boolean(data.is_active),
      }
    });
    return { success: true, collector, message: 'Collector created successfully' };
  } catch (error) {
    console.error('Error creating collector:', error);
    return { success: false, error: 'Failed to create collector' };
  }
}

export async function updateCollector(id, data) {
  try {
    const collector = await prisma.collectors.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        ip: data.ip,
        domain: data.domain,
        secret_key: data.secret_key,
        is_active: Boolean(data.is_active),
        updated_at: new Date()
      }
    });
    return { success: true, collector, message: 'Collector updated successfully' };
  } catch (error) {
    console.error('Error updating collector:', error);
    return { success: false, error: 'Failed to update collector' };
  }
}

export async function deleteCollector(id) {
  try {
    await prisma.collectors.delete({
      where: { id: parseInt(id) },
    });
    return { success: true, message: 'Collector deleted successfully' };
  } catch (error) {
    console.error('Error deleting collector:', error);
    return { success: false, error: 'Failed to delete collector' };
  }
}