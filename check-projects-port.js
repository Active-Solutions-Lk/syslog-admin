import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProjectsPort() {
  try {
    console.log('Checking projects port_id values...');
    
    // Check if projects table has port_id column
    const projects = await prisma.projects.findMany({
      select: {
        id: true,
        activation_key: true,
        port_id: true,
      }
    });
    
    console.log('Projects and their port_id values:');
    projects.forEach(project => {
      console.log(`  Project ${project.id} (${project.activation_key}): port_id = ${project.port_id}`);
    });
    
  } catch (error) {
    console.error('Error checking projects port_id:', error);
    
    // If the column doesn't exist yet, let's check the structure
    if (error.code === 'P2022') {
      console.log('port_id column does not exist yet. This is expected.');
      
      // Check projects without port_id
      const projects = await prisma.projects.findMany({
        select: {
          id: true,
          activation_key: true,
        }
      });
      
      console.log('Projects (without port_id column):');
      projects.forEach(project => {
        console.log(`  Project ${project.id} (${project.activation_key})`);
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkProjectsPort();