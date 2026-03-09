"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export async function getResellers() {
  try {
    const resellers = await prisma.reseller.findMany({
      select: {
        id: true,
        company: true,
        address: true,
        contact_person: true,
        tel: true,
        email: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    const formattedResellers = resellers.map(reseller => ({
      ...reseller,
      id: reseller.id.toString(),
    }));

    return {
      success: true,
      resellers: formattedResellers,
    };
  } catch (error) {
    console.error('Error fetching resellers:', error);
    return {
      success: false,
      error: 'Failed to fetch resellers',
    };
  }
}

export async function getResellerById(id) {
  try {
    const reseller = await prisma.reseller.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        company: true,
        address: true,
        contact_person: true,
        tel: true,
        email: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!reseller) {
      return {
        success: false,
        error: 'Reseller not found',
      };
    }

    const formattedReseller = {
      ...reseller,
      id: reseller.id.toString(),
    };

    return {
      success: true,
      reseller: formattedReseller,
    };
  } catch (error) {
    console.error('Error fetching reseller:', error);
    return {
      success: false,
      error: 'Failed to fetch reseller',
    };
  }
}

export async function createReseller({
  company,
  address,
  contact_person,
  tel,
  email,
  status
}) {
  try {
    // Validation for email and phone number
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return { success: false, error: 'Invalid email address format' };
    }

    const telRegex = /^[0-9\-\+ ]{7,15}$/;
    if (tel && !telRegex.test(tel)) {
      return { success: false, error: 'Invalid phone number format' };
    }

    // Check for unique company name
    const existingReseller = await prisma.reseller.findFirst({
      where: {
        OR: [
          { company },
          { email: email || undefined },
          { tel }
        ]
      },
    });

    if (existingReseller) {
      if (existingReseller.company === company) {
        return { success: false, error: 'Reseller with this company name already exists' };
      }
      if (email && existingReseller.email === email) {
        return { success: false, error: 'A reseller with this email address already exists' };
      }
      if (existingReseller.tel === tel) {
        return { success: false, error: 'A reseller with this phone number already exists' };
      }
    }

    const reseller = await prisma.reseller.create({
      data: {
        company,
        address: address || null,
        contact_person,
        tel,
        email: email || null,
        status: status === undefined ? true : Boolean(status),
      },
      select: {
        id: true,
        company: true,
        address: true,
        contact_person: true,
        tel: true,
        email: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      success: true,
      reseller: {
        ...reseller,
        id: reseller.id.toString(),
      },
      message: 'Reseller created successfully',
    };
  } catch (error) {
    console.error('Error creating reseller:', error);
    return {
      success: false,
      error: 'Failed to create reseller',
    };
  }
}

export async function updateReseller({
  id,
  company,
  address,
  contact_person,
  tel,
  email,
  status
}) {
  try {
    // Validation for email and phone number
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return { success: false, error: 'Invalid email address format' };
    }

    const telRegex = /^[0-9\-\+ ]{7,15}$/;
    if (tel && !telRegex.test(tel)) {
      return { success: false, error: 'Invalid phone number format' };
    }

    // Check for unique company name, email, and phone number for update
    const existingConflict = await prisma.reseller.findFirst({
      where: {
        AND: [
          { id: { not: parseInt(id) } },
          {
            OR: [
              { company },
              { email: email || undefined },
              { tel }
            ]
          }
        ]
      }
    });

    if (existingConflict) {
      if (existingConflict.company === company) {
        return { success: false, error: 'Reseller with this company name already exists' };
      }
      if (email && existingConflict.email === email) {
        return { success: false, error: 'A reseller with this email address already exists' };
      }
      if (existingConflict.tel === tel) {
        return { success: false, error: 'A reseller with this phone number already exists' };
      }
    }

    const reseller = await prisma.reseller.update({
      where: {
        id: parseInt(id),
      },
      data: {
        company,
        address: address || null,
        contact_person,
        tel,
        email: email || null,
        status: Boolean(status),
        updated_at: new Date(),
      },
      select: {
        id: true,
        company: true,
        address: true,
        contact_person: true,
        tel: true,
        email: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return {
      success: true,
      reseller: {
        ...reseller,
        id: reseller.id.toString(),
      },
      message: 'Reseller updated successfully',
    };
  } catch (error) {
    console.error('Error updating reseller:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Reseller not found',
      };
    }
    return {
      success: false,
      error: 'Failed to update reseller',
    };
  }
}

export async function deleteReseller(id) {
  try {
    await prisma.reseller.delete({
      where: {
        id: parseInt(id),
      },
    });

    return {
      success: true,
      message: 'Reseller deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting reseller:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'Reseller not found',
      };
    }
    return {
      success: false,
      error: 'Failed to delete reseller',
    };
  }
}