"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all packages
export async function getPackages() {
  try {
    const packages = await prisma.packages.findMany({
      select: {
        id: true,
        name: true,
        log_count: true,
        duration: true,
        device_count: true,
        log_analyce: true,
        created_at: true,
        updated_at: true,
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

// Get package by ID
export async function getPackageById(id) {
  try {
    const pkg = await prisma.packages.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        name: true,
        log_count: true,
        duration: true,
        device_count: true,
        log_analyce: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    if (!pkg) {
      return {
        success: false,
        error: 'Package not found',
      };
    }
    
    // Convert id to string for frontend
    const formattedPackage = {
      ...pkg,
      id: pkg.id.toString(),
    };
    
    return {
      success: true,
      package: formattedPackage,
    };
  } catch (error) {
    console.error('Error fetching package:', error);
    return {
      success: false,
      error: 'Failed to fetch package',
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Create a new package
export async function createPackage({ 
  name, 
  log_count, 
  duration, 
  device_count, 
  log_analyce 
}) {
  try {
    // Get current date for timestamps
    const now = new Date();
    
    // Create package
    const pkg = await prisma.packages.create({
      data: {
        name,
        log_count: parseInt(log_count) || 0,
        duration: parseFloat(duration) || 0,
        device_count: parseInt(device_count) || 0,
        log_analyce: parseInt(log_analyce) || 0,
        created_at: now,
        updated_at: now,
      },
      select: {
        id: true,
        name: true,
        log_count: true,
        duration: true,
        device_count: true,
        log_analyce: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    // Convert id to string for frontend
    const formattedPackage = {
      ...pkg,
      id: pkg.id.toString(),
    };
    
    return {
      success: true,
      package: formattedPackage,
      message: 'Package created successfully',
    };
  } catch (error) {
    console.error('Error creating package:', error);
    return {
      success: false,
      error: 'Failed to create package',
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Update a package
export async function updatePackage({ 
  id, 
  name, 
  log_count, 
  duration, 
  device_count, 
  log_analyce 
}) {
  try {
    // Get current date for updatedAt timestamp
    const now = new Date();
    
    // Update package
    const pkg = await prisma.packages.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        log_count: parseInt(log_count) || 0,
        duration: parseFloat(duration) || 0,
        device_count: parseInt(device_count) || 0,
        log_analyce: parseInt(log_analyce) || 0,
        updated_at: now,
      },
      select: {
        id: true,
        name: true,
        log_count: true,
        duration: true,
        device_count: true,
        log_analyce: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    // Convert id to string for frontend
    const formattedPackage = {
      ...pkg,
      id: pkg.id.toString(),
    };
    
    return {
      success: true,
      package: formattedPackage,
      message: 'Package updated successfully',
    };
  } catch (error) {
    console.error('Error updating package:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Package not found',
      };
    }
    return {
      success: false,
      error: 'Failed to update package',
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Delete a package
export async function deletePackage(id) {
  try {
    // Delete package
    await prisma.packages.delete({
      where: {
        id: parseInt(id),
      },
    });
    
    return {
      success: true,
      message: 'Package deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting package:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Package not found',
      };
    }
    return {
      success: false,
      error: 'Failed to delete package',
    };
  } finally {
    await prisma.$disconnect();
  }
}