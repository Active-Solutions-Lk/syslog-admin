import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Check current column type
        const columnInfo = await prisma.$queryRaw`
      SELECT DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'remote_admin' 
      AND TABLE_NAME = 'projects' 
      AND COLUMN_NAME = 'logger_ip'
    `;
        console.log('--- Column Type ---');
        console.table(columnInfo);

        // Fetch projects with logger_ip
        // We use raw query to avoid casting errors if schema mismatches db
        const projects = await prisma.$queryRaw`SELECT id, logger_ip FROM projects WHERE logger_ip IS NOT NULL AND logger_ip != '' LIMIT 20`;
        console.log('--- Projects with logger_ip (first 20) ---');
        console.table(projects);

        // Fetch analyzers
        const analyzers = await prisma.$queryRaw`SELECT id, ip FROM analyzers`;
        console.log('--- Analyzers ---');
        console.table(analyzers);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
