import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProjectsPort() {
  try {
    console.log('Updating projects with port_id values...');
    
    // Get all ports with their project_id
    const ports = await prisma.ports.findMany();
    
    console.log('Found ports:');
    ports.forEach(port => {
      console.log(`  Port ${port.id}: ${port.port} (project_id: ${port.project_id})`);
    });
    
    // Update each project with its port_id
    for (const port of ports) {
      if (port.project_id !== null) {
        console.log(`Updating project ${port.project_id} with port_id ${port.id}`);
        await prisma.projects.update({
          where: {
            id: port.project_id
          },
          data: {
            port_id: port.id
          }
        });
      }
    }
    
    // Verify the updates
    const projects = await prisma.projects.findMany({
      select: {
        id: true,
        activation_key: true,
        port_id: true,
      }
    });
    
    console.log('\nProjects after update:');
    projects.forEach(project => {
      console.log(`  Project ${project.id} (${project.activation_key}): port_id = ${project.port_id}`);
    });
    
    console.log('Projects updated successfully!');
    
  } catch (error) {
    console.error('Error updating projects port_id:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProjectsPort();