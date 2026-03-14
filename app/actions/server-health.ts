"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getCollectorHealth(collectorId: number | string) {
    try {
        const healthData = await prisma.collector_health.findMany({
            where: { collector_id: Number(collectorId) },
            orderBy: { created_at: 'asc' }, // For time series
            take: 24, // Last 24 entries (assuming hourly, or adjust as needed)
        });

        // Convert dates to strings for serialization
        return {
            success: true,
            data: healthData.map(d => ({
                ...d,
                created_at: d.created_at.toISOString(),
                updated_at: d.updated_at.toISOString()
            }))
        };
    } catch (error) {
        console.error('Error fetching collector health:', error);
        return { success: false, error: 'Failed to fetch collector health' };
    } finally {
        await prisma.$disconnect();
    }
}

export async function getAnalyzerHealth(analyzerId: number | string) {
    try {
        const healthData = await prisma.analyzer_health.findMany({
            where: { analyzer_id: Number(analyzerId) },
            orderBy: { created_at: 'asc' }, // For time series
            take: 24, // Last 24 entries
        });

        return {
            success: true,
            data: healthData.map(d => ({
                ...d,
                created_at: d.created_at.toISOString(),
                updated_at: d.updated_at.toISOString()
            }))
        };
    } catch (error) {
        console.error('Error fetching analyzer health:', error);
        return { success: false, error: 'Failed to fetch analyzer health' };
    } finally {
        await prisma.$disconnect();
    }
}
