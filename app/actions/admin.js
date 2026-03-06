"use server";

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export async function getAdmins() {
  try {
    const admins = await prisma.admins.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    // Map to consistently use strings for IDs
    const formattedAdmins = admins.map(admin => ({
      ...admin,
      id: admin.id.toString(),
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
        username: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    if (!admin) {
      return {
        success: false,
        error: 'Admin not found',
      };
    }

    const formattedAdmin = {
      ...admin,
      id: admin.id.toString(),
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

export async function createAdmin({ username, email, password, role }) {
  try {
    const existingAdmin = await prisma.admins.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      },
    });

    if (existingAdmin) {
      return {
        success: false,
        error: 'Admin with this email or username already exists',
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await prisma.admins.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || 'admin',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    return {
      success: true,
      admin: {
        ...admin,
        id: admin.id.toString(),
      },
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

export async function updateAdmin({ id, username, email, role }) {
  try {
    const admin = await prisma.admins.update({
      where: {
        id: parseInt(id),
      },
      data: {
        username,
        email,
        role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    return {
      success: true,
      admin: {
        ...admin,
        id: admin.id.toString(),
      },
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
