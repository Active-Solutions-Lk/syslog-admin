"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export async function getEndCustomers() {
  try {
    const customers = await prisma.end_customer.findMany({
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
      customers: customers.map(c => ({ ...c, id: c.id.toString() })),
    };
  } catch (error) {
    console.error('Error fetching end customers:', error);
    return { success: false, error: 'Failed to fetch end customers' };
  }
}

export async function getEndCustomerById(id) {
  try {
    const customer = await prisma.end_customer.findUnique({
      where: { id: parseInt(id) },
    });

    if (!customer) return { success: false, error: 'End customer not found' };

    return {
      success: true,
      customer: { ...customer, id: customer.id.toString() },
    };
  } catch (error) {
    console.error('Error fetching end customer:', error);
    return { success: false, error: 'Failed to fetch end customer' };
  }
}

export async function createEndCustomer(data) {
  try {
    const customer = await prisma.end_customer.create({
      data: {
        company: data.company,
        address: data.address,
        contact_person: data.contact_person,
        tel: data.tel,
        email: data.email,
        status: data.status === undefined ? true : Boolean(data.status),
      }
    });
    return { success: true, customer, message: 'End customer created successfully' };
  } catch (error) {
    console.error('Error creating end customer:', error);
    return { success: false, error: 'Failed to create end customer' };
  }
}

export async function updateEndCustomer(id, data) {
  try {
    const customer = await prisma.end_customer.update({
      where: { id: parseInt(id) },
      data: {
        company: data.company,
        address: data.address,
        contact_person: data.contact_person,
        tel: data.tel,
        email: data.email,
        status: Boolean(data.status),
        updated_at: new Date()
      }
    });
    return { success: true, customer, message: 'End customer updated successfully' };
  } catch (error) {
    console.error('Error updating end customer:', error);
    return { success: false, error: 'Failed to update end customer' };
  }
}

export async function deleteEndCustomer(id) {
  try {
    await prisma.end_customer.delete({
      where: { id: parseInt(id) },
    });
    return { success: true, message: 'End customer deleted successfully' };
  } catch (error) {
    console.error('Error deleting end customer:', error);
    return { success: false, error: 'Failed to delete end customer' };
  }
}