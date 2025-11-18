import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPorts() {
  try {
    console.log('Checking ports in database...');
    
    // Check for duplicate project_id values in ports table
    const duplicateProjectIds = await prisma.$queryRaw`
      SELECT project_id, COUNT(*) as count 
      FROM ports 
      WHERE project_id IS NOT NULL 
      GROUP BY project_id 
      HAVING COUNT(*) > 1
    `;
    
    console.log('Duplicate project_id values in ports table:');
    console.log(duplicateProjectIds);
    
    // Check all ports
    const ports = await prisma.ports.findMany({
      include: {
        project: true
      }
    });
    
    console.log(`Found ${ports.length} ports:`);
    console.log(JSON.stringify(ports, null, 2));
    
  } catch (error) {
    console.error('Error checking ports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPorts();