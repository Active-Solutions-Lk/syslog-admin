"use server";

import { PrismaClient } from '@prisma/client';

// Create a single Prisma client instance
const prisma = new PrismaClient();

export async function getResellers() {
  try {
    const resellers = await prisma.reseller.findMany({
      select: {
        customer_id: true,
        company_name: true,
        address: true,
        type: true,
        credit_limit: true,
        payment_terms: true,
        note: true,
        vat: true,
        city: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    // Convert customer_id to string for frontend
    const formattedResellers = resellers.map(reseller => ({
      ...reseller,
      customer_id: reseller.customer_id.toString(),
      city: reseller.city ? reseller.city.toString() : null,
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
        customer_id: parseInt(id),
      },
      select: {
        customer_id: true,
        company_name: true,
        address: true,
        type: true,
        credit_limit: true,
        payment_terms: true,
        note: true,
        vat: true,
        city: true,
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
    
    // Convert customer_id to string for frontend
    const formattedReseller = {
      ...reseller,
      customer_id: reseller.customer_id.toString(),
      city: reseller.city ? reseller.city.toString() : null,
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
  company_name, 
  address, 
  type, 
  credit_limit, 
  payment_terms, 
  note, 
  vat, 
  city 
}) {
  try {
    // Check if reseller with this company name already exists
    const existingReseller = await prisma.reseller.findUnique({
      where: {
        company_name,
      },
    });
    
    if (existingReseller) {
      return {
        success: false,
        error: 'Reseller with this company name already exists',
      };
    }
    
    // Get current date for timestamps
    const now = new Date();
    
    // Create reseller
    const reseller = await prisma.reseller.create({
      data: {
        company_name,
        address: address || null,
        type: type || 'Standard',
        credit_limit: credit_limit || null,
        payment_terms: payment_terms || null,
        note: note || null,
        vat: vat || null,
        city: city ? parseInt(city) : null,
        created_at: now,
        updated_at: now,
      },
      select: {
        customer_id: true,
        company_name: true,
        address: true,
        type: true,
        credit_limit: true,
        payment_terms: true,
        note: true,
        vat: true,
        city: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    // Convert customer_id to string for frontend
    const formattedReseller = {
      ...reseller,
      customer_id: reseller.customer_id.toString(),
      city: reseller.city ? reseller.city.toString() : null,
    };
    
    return {
      success: true,
      reseller: formattedReseller,
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
  customer_id, 
  company_name, 
  address, 
  type, 
  credit_limit, 
  payment_terms, 
  note, 
  vat, 
  city 
}) {
  try {
    // Check if another reseller with this company name already exists
    const existingReseller = await prisma.reseller.findUnique({
      where: {
        company_name,
      },
    });
    
    if (existingReseller && existingReseller.customer_id !== parseInt(customer_id)) {
      return {
        success: false,
        error: 'Another reseller with this company name already exists',
      };
    }
    
    // Get current date for updatedAt timestamp
    const now = new Date();
    
    // Update reseller
    const reseller = await prisma.reseller.update({
      where: {
        customer_id: parseInt(customer_id),
      },
      data: {
        company_name,
        address: address || null,
        type: type || 'Standard',
        credit_limit: credit_limit || null,
        payment_terms: payment_terms || null,
        note: note || null,
        vat: vat || null,
        city: city ? parseInt(city) : null,
        updated_at: now,
      },
      select: {
        customer_id: true,
        company_name: true,
        address: true,
        type: true,
        credit_limit: true,
        payment_terms: true,
        note: true,
        vat: true,
        city: true,
        created_at: true,
        updated_at: true,
      },
    });
    
    // Convert customer_id to string for frontend
    const formattedReseller = {
      ...reseller,
      customer_id: reseller.customer_id.toString(),
      city: reseller.city ? reseller.city.toString() : null,
    };
    
    return {
      success: true,
      reseller: formattedReseller,
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

export async function deleteReseller(customer_id) {
  try {
    // Delete reseller
    await prisma.reseller.delete({
      where: {
        customer_id: parseInt(customer_id),
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