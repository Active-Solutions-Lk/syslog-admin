import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPorts() {
  try {
    console.log('Checking ports in database...');
    
    // Check all ports
    const ports = await prisma.ports.findMany({
      include: {
        project: true
      }
    });
    
    console.log(`Found ${ports.length} ports:`);
    ports.forEach(port => {
      console.log(`  Port ${port.id}: ${port.port} (project_id: ${port.project_id}, assigned to project: ${port.project ? port.project.id : 'none'})`);
    });
    
  } catch (error) {
    console.error('Error checking ports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPorts();