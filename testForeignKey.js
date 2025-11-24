import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // First, create a collector
    const collector = await prisma.collectors.create({
      data: {
        name: 'Test Collector',
        ip: '192.168.1.100',
        secret_key: 'test-secret-key',
        last_fetched_id: 0,
        is_active: true
      }
    });
    
    console.log('Created collector:', collector);
    
    // Then, create a project with the collector reference
    const project = await prisma.projects.create({
      data: {
        activation_key: 'test-activation-key',
        pkg_id: 1,
        collector_ip: collector.id,
        type: 1,
        secret_key: 'test-project-secret',
        status: true
      }
    });
    
    console.log('Created project with collector reference:', project);
    
    // Try to fetch the project with its collector
    const projectWithCollector = await prisma.projects.findUnique({
      where: { id: project.id },
      include: { collector: true }
    });
    
    console.log('Project with collector:', projectWithCollector);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();