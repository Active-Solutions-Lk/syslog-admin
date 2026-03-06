"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to generate a random hex device key
function generateDeviceKey() {
    const chars = '0123456789ABCDEF';
    let key = '';
    for (let i = 0; i < 32; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

export async function getDevices() {
    try {
        const devices = await prisma.devices.findMany({
            include: {
                projects: {
                    include: {
                        end_customer: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return {
            success: true,
            devices: devices.map(d => ({
                ...d,
                id: d.id.toString(),
                project_id: d.project_id.toString(),
            })),
        };
    } catch (error) {
        console.error('Error fetching devices:', error);
        return { success: false, error: 'Failed to fetch devices' };
    }
}

export async function createDevice(data) {
    try {
        const device = await prisma.devices.create({
            data: {
                project_id: parseInt(data.project_id),
                device_key: data.device_key || generateDeviceKey(),
                log_duration: parseInt(data.log_duration) || 30,
                package_start_at: new Date(data.package_start_at),
                package_end_at: new Date(data.package_end_at),
            }
        });

        return { success: true, device, message: 'Device created successfully' };
    } catch (error) {
        console.error('Error creating device:', error);
        return { success: false, error: 'Failed to create device' };
    }
}

export async function updateDevice(id, data) {
    try {
        const device = await prisma.devices.update({
            where: { id: parseInt(id) },
            data: {
                project_id: parseInt(data.project_id),
                device_key: data.device_key,
                log_duration: parseInt(data.log_duration),
                package_start_at: new Date(data.package_start_at),
                package_end_at: new Date(data.package_end_at),
                updated_at: new Date()
            }
        });

        return { success: true, device, message: 'Device updated successfully' };
    } catch (error) {
        console.error('Error updating device:', error);
        return { success: false, error: 'Failed to update device' };
    }
}

export async function deleteDevice(id) {
    try {
        await prisma.devices.delete({
            where: { id: parseInt(id) },
        });
        return { success: true, message: 'Device deleted successfully' };
    } catch (error) {
        console.error('Error deleting device:', error);
        return { success: false, error: 'Failed to delete device' };
    }
}

export async function getDevicesByProjectId(projectId) {
    try {
        const devices = await prisma.devices.findMany({
            where: { project_id: parseInt(projectId) },
            orderBy: { created_at: 'desc' }
        });
        return {
            success: true,
            devices: devices.map(d => ({
                ...d,
                id: d.id.toString(),
                project_id: d.project_id.toString(),
                package_start_at: d.package_start_at.toISOString(),
                package_end_at: d.package_end_at.toISOString()
            })),
        };
    } catch (error) {
        console.error('Error fetching devices by project id:', error);
        return { success: false, error: 'Failed to fetch devices' };
    }
}
