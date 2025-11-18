import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting database...');
  
  // Delete all data in the correct order to avoid foreign key constraints
  await prisma.session.deleteMany();
  console.log('Deleted sessions');
  
  await prisma.ports.deleteMany();
  console.log('Deleted ports');
  
  await prisma.projects.deleteMany();
  console.log('Deleted projects');
  
  await prisma.reseller.deleteMany();
  console.log('Deleted resellers');
  
  await prisma.packages.deleteMany();
  console.log('Deleted packages');
  
  await prisma.admins.deleteMany();
  console.log('Deleted admins');
  
  console.log('Database reset complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });