"use server";

import { PrismaClient } from '@prisma/client';

// Create a single Prisma client instance
const prisma = new PrismaClient();

export async function getEndCustomers() {
  try {
    const endCustomers = await prisma.end_customer.findMany({
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
    
    // Convert id to string for frontend
    const formattedEndCustomers = endCustomers.map(endCustomer => ({
      ...endCustomer,
      id: endCustomer.id.toString(),
      status: endCustomer.status ? 'active' : 'inactive',
      tel: endCustomer.tel.toString(),
    }));
    
    return {
      success: true,
      endCustomers: formattedEndCustomers,
    };
  } catch (error) {
    console.error('Error fetching end customers:', error);
    return {
      success: false,
      error: 'Failed to fetch end customers',
    };
  }
}

export async function getEndCustomerById(id) {
  try {
    const endCustomer = await prisma.end_customer.findUnique({
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
    
    if (!endCustomer) {
      return {
        success: false,
        error: 'End customer not found',
      };
    }
    
    // Convert id to string for frontend
    const formattedEndCustomer = {
      ...endCustomer,
      id: endCustomer.id.toString(),
      status: endCustomer.status ? 'active' : 'inactive',
      tel: endCustomer.tel.toString(),
    };
    
    return {
      success: true,
      endCustomer: formattedEndCustomer,
    };
  } catch (error) {
    console.error('Error fetching end customer:', error);
    return {
      success: false,
      error: 'Failed to fetch end customer',
    };
  }
}

export async function createEndCustomer({ 
  company, 
  address, 
  contact_person, 
  tel, 
  email, 
  status 
}) {
  try {
    // Get current date for timestamps
    const now = new Date();
    
    // Create end customer
    const endCustomer = await prisma.end_customer.create({
      data: {
        company: company || null,
        address: address || null,
        contact_person,
        tel: parseInt(tel),
        email: email || null,
        status: status === 'active' ? true : false,
        created_at: now,
        updated_at: now,
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
    
    // Convert id to string for frontend
    const formattedEndCustomer = {
      ...endCustomer,
      id: endCustomer.id.toString(),
      status: endCustomer.status ? 'active' : 'inactive',
      tel: endCustomer.tel.toString(),
    };
    
    return {
      success: true,
      endCustomer: formattedEndCustomer,
      message: 'End customer created successfully',
    };
  } catch (error) {
    console.error('Error creating end customer:', error);
    return {
      success: false,
      error: 'Failed to create end customer',
    };
  }
}

export async function updateEndCustomer({ 
  id, 
  company, 
  address, 
  contact_person, 
  tel, 
  email, 
  status 
}) {
  try {
    // Get current date for updatedAt timestamp
    const now = new Date();
    
    // Update end customer
    const endCustomer = await prisma.end_customer.update({
      where: {
        id: parseInt(id),
      },
      data: {
        company: company || null,
        address: address || null,
        contact_person,
        tel: parseInt(tel),
        email: email || null,
        status: status === 'active' ? true : false,
        updated_at: now,
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
    
    // Convert id to string for frontend
    const formattedEndCustomer = {
      ...endCustomer,
      id: endCustomer.id.toString(),
      status: endCustomer.status ? 'active' : 'inactive',
      tel: endCustomer.tel.toString(),
    };
    
    return {
      success: true,
      endCustomer: formattedEndCustomer,
      message: 'End customer updated successfully',
    };
  } catch (error) {
    console.error('Error updating end customer:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'End customer not found',
      };
    }
    return {
      success: false,
      error: 'Failed to update end customer',
    };
  }
}

export async function deleteEndCustomer(id) {
  try {
    // Delete end customer
    await prisma.end_customer.delete({
      where: {
        id: parseInt(id),
      },
    });
    
    return {
      success: true,
      message: 'End customer deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting end customer:', error);
    if (error.code === 'P2025') {
      return {
        success: false,
        error: 'End customer not found',
      };
    }
    return {
      success: false,
      error: 'Failed to delete end customer',
    };
  }
}