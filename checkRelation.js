const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if collectors exist
    const collectors = await prisma.collectors.findMany();
    console.log('Collectors:', collectors);
    
    // Check if projects exist
    const projects = await prisma.projects.findMany({
      include: {
        collector: true
      }
    });
    console.log('Projects with collectors:', projects);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();