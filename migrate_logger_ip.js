import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Starting migration of logger_ip...');

        // 1. Update projects.logger_ip with analyzer.id where IPs match
        // Note: We are updating a VARCHAR column with INT values, which MySQL handles by storing them as string representation.
        const updateResult = await prisma.$executeRawUnsafe(`
      UPDATE projects p 
      JOIN analyzers a ON p.logger_ip = a.ip 
      SET p.logger_ip = a.id
    `);
        console.log(`Updated ${updateResult} projects to use Analyzer ID.`);

        // 2. Set any logger_ip that is NOT a valid Analyzer ID to NULL
        // This handles cases where the IP didn't match any analyzer, or was already invalid.
        // We check if the value exists in analyzers.id. 
        // Since logger_ip is varchar and id is int, we cast id to char for comparison or rely on implicit cast.
        // Safe approach: if it wasn't updated in step 1 (still has '.') or isn't in IDs.

        const clearResult = await prisma.$executeRawUnsafe(`
      UPDATE projects 
      SET logger_ip = NULL 
      WHERE logger_ip IS NOT NULL 
      AND logger_ip NOT IN (SELECT id FROM analyzers)
    `);
        console.log(`Set ${clearResult} projects with unmatched logger_ip to NULL.`);

    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
