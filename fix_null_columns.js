import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Starting fix for NULL columns...');

        // 1. Fix is_active_coll (Set to 1 by default, assuming active)
        const collResult = await prisma.$executeRawUnsafe(`
      UPDATE projects 
      SET is_active_coll = 1 
      WHERE is_active_coll IS NULL
    `);
        console.log(`Updated ${collResult} projects: set is_active_coll = 1`);

        // 2. Fix is_active_an (Set to 1 by default)
        const anResult = await prisma.$executeRawUnsafe(`
      UPDATE projects 
      SET is_active_an = 1 
      WHERE is_active_an IS NULL
    `);
        console.log(`Updated ${anResult} projects: set is_active_an = 1`);

    } catch (e) {
        console.error('Fix failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
