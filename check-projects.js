// Script to check projects in the database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if there are any projects in the database
    const projects = await prisma.projects.findMany({
      include: {
        ports: true
      }
    });
    
    console.log(`Found ${projects.length} projects in the database:`);
    
    if (projects.length > 0) {
      projects.forEach((project, index) => {
        console.log(`\nProject ${index + 1}:`);
        console.log(`  ID: ${project.id}`);
        console.log(`  Activation Key: ${project.activation_key}`);
        console.log(`  Collector IP: ${project.collector_ip}`);
        console.log(`  Logger IP: ${project.loggert_ip}`);
        console.log(`  Ports: ${project.ports.length} ports`);
        project.ports.forEach(port => {
          console.log(`    - Port ${port.port} (ID: ${port.id})`);
        });
      });
    } else {
      console.log("No projects found in the database.");
    }
    
    // Specifically check for the test activation key
    const testProject = await prisma.projects.findFirst({
      where: {
        activation_key: 'AB12-CD34-EF58'
      },
      include: {
        ports: true
      }
    });
    
    if (testProject) {
      console.log(`\nFound test project with activation key 'AB12-CD34-EF58':`);
      console.log(JSON.stringify(testProject, null, 2));
    } else {
      console.log(`\nNo project found with activation key 'AB12-CD34-EF58'`);
    }
  } catch (error) {
    console.error('Error checking projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();