import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestPorts() {
  try {
    console.log('Adding test ports...');
    
    // Create some additional ports that are not assigned to any project
    const newPorts = [
      { port: 3000 },
      { port: 5432 },
      { port: 8081 },
      { port: 8082 }
    ];
    
    for (const portData of newPorts) {
      const newPort = await prisma.ports.create({
        data: {
          port: portData.port,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log(`Created port ${newPort.port} with ID ${newPort.id}`);
    }
    
    // Check all ports
    const ports = await prisma.ports.findMany();
    console.log(`\nAll ports after adding new ones:`);
    ports.forEach(port => {
      console.log(`  Port ${port.id}: ${port.port} (project_id: ${port.project_id})`);
    });
    
  } catch (error) {
    console.error('Error adding test ports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestPorts();