import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const admins = await prisma.admins.findMany();
    console.log('All admins:', admins);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
