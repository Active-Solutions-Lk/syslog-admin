const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all projects and their activation keys
    const projects = await prisma.projects.findMany({
      select: {
        id: true,
        activation_key: true,
        collector_ip: true,
        loggert_ip: true
      }
    });
    console.log('Projects in database:');
    console.log(JSON.stringify(projects, null, 2));
  } catch (error) {
    console.error('Error fetching projects:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();