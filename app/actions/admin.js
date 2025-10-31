"use server";

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function getAdmins() {
  try {
    const admins = await prisma.admins.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    // Convert status from float to string for frontend
    const formattedAdmins = admins.map(admin => ({
      ...admin,
      status: admin.status === 1 ? 'active' : 'inactive',
      id: admin.id.toString(), // Convert to string to match frontend expectations
    }));
    
    return {
      success: true,
      admins: formattedAdmins,
    };
  } catch (error) {
    console.error('Error fetching admins:', error);
    return {
      success: false,
      error: 'Failed to fetch admins',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAdminById(id) {
  try {
    const admin = await prisma.admins.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!admin) {
      return {
        success: false,
        error: 'Admin not found',
      };
    }
    
    // Convert status from float to string for frontend
    const formattedAdmin = {
      ...admin,
      status: admin.status === 1 ? 'active' : 'inactive',
      id: admin.id.toString(), // Convert to string to match frontend expectations
    };
    
    return {
      success: true,
      admin: formattedAdmin,
    };
  } catch (error) {
    console.error('Error fetching admin:', error);
    return {
      success: false,
      error: 'Failed to fetch admin',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function createAdmin({ name, email, password, role }) {
  try {
    // Check if admin with this email already exists
    const existingAdmin = await prisma.admins.findUnique({
      where: {
        email,
      },
    });
    
    if (existingAdmin) {
      return {
        success: false,
        error: 'Admin with this email already exists',
      };
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Get current date for timestamps
    const now = new Date();
    
    // Create admin
    const admin = await prisma.admins.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: role || 'Admin',
        status: 1, // Active by default
        createdAt: now,
        updatedAt: now,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    // Convert status from float to string for frontend
    const formattedAdmin = {
      ...admin,
      status: admin.status === 1 ? 'active' : 'inactive',
      id: admin.id.toString(), // Convert to string to match frontend expectations
    };
    
    return {
      success: true,
      admin: formattedAdmin,
      message: 'Admin created successfully',
    };
  } catch (error) {
    console.error('Error creating admin:', error);
    return {
      success: false,
      error: 'Failed to create admin',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateAdmin({ id, name, email, role, status }) {
  try {
    // Check if another admin with this email already exists
    const existingAdmin = await prisma.admins.findUnique({
      where: {
        email,
      },
    });
    
    if (existingAdmin && existingAdmin.id !== parseInt(id)) {
      return {
        success: false,
        error: 'Another admin with this email already exists',
      };
    }
    
    // Get current date for updatedAt timestamp
    const now = new Date();
    
    // Update admin
    const admin = await prisma.admins.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name,
        email,
        role,
        status: status === 'active' ? 1 : 0,
        updatedAt: now,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    // Convert status from float to string for frontend
    const formattedAdmin = {
      ...admin,
      status: admin.status === 1 ? 'active' : 'inactive',
      id: admin.id.toString(), // Convert to string to match frontend expectations
    };
    
    return {
      success: true,
      admin: formattedAdmin,
      message: 'Admin updated successfully',
    };
  } catch (error) {
    console.error('Error updating admin:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Admin not found',
      };
    }
    return {
      success: false,
      error: 'Failed to update admin',
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteAdmin(id) {
  try {
    // Delete admin
    await prisma.admins.delete({
      where: {
        id: parseInt(id),
      },
    });
    
    return {
      success: true,
      message: 'Admin deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting admin:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Admin not found',
      };
    }
    return {
      success: false,
      error: 'Failed to delete admin',
    };
  } finally {
    await prisma.$disconnect();
  }
}