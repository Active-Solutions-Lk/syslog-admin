import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPorts() {
  try {
    console.log('Fixing ports in database...');
    
    // First, let's see what we're working with
    const allPorts = await prisma.ports.findMany({
      orderBy: [
        { project_id: 'asc' },
        { id: 'asc' }
      ]
    });
    
    console.log('All ports before cleanup:');
    allPorts.forEach(port => {
      console.log(`  Port ${port.id}: ${port.port} (project_id: ${port.project_id})`);
    });
    
    // Group ports by project_id
    const portsByProject = {};
    allPorts.forEach(port => {
      if (port.project_id !== null) {
        if (!portsByProject[port.project_id]) {
          portsByProject[port.project_id] = [];
        }
        portsByProject[port.project_id].push(port);
      }
    });
    
    console.log('\nPorts grouped by project:');
    Object.keys(portsByProject).forEach(projectId => {
      console.log(`  Project ${projectId}: ${portsByProject[projectId].length} ports`);
    });
    
    // For projects with multiple ports, keep only the first one and delete the rest
    const portsToDelete = [];
    Object.keys(portsByProject).forEach(projectId => {
      const ports = portsByProject[projectId];
      if (ports.length > 1) {
        // Keep the first port (lowest ID) and mark the rest for deletion
        for (let i = 1; i < ports.length; i++) {
          portsToDelete.push(ports[i].id);
        }
        console.log(`  Will delete ports ${portsToDelete.filter(id => ports.map(p => p.id).includes(id)).join(', ')} for project ${projectId}`);
      }
    });
    
    if (portsToDelete.length > 0) {
      console.log(`\nDeleting ${portsToDelete.length} duplicate ports...`);
      await prisma.ports.deleteMany({
        where: {
          id: {
            in: portsToDelete
          }
        }
      });
      console.log('Duplicate ports deleted successfully.');
    } else {
      console.log('\nNo duplicate ports found.');
    }
    
    // Now let's see the final state
    const finalPorts = await prisma.ports.findMany({
      orderBy: [
        { project_id: 'asc' },
        { id: 'asc' }
      ]
    });
    
    console.log('\nAll ports after cleanup:');
    finalPorts.forEach(port => {
      console.log(`  Port ${port.id}: ${port.port} (project_id: ${port.project_id})`);
    });
    
  } catch (error) {
    console.error('Error fixing ports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPorts();