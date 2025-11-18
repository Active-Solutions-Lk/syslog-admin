import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProjects() {
  try {
    console.log('Checking projects in database...');
    
    const projects = await prisma.projects.findMany({
      include: {
        admins: true,
        reseller: true,
        end_customer: true,
        packages: true
      }
    });
    
    console.log(`Found ${projects.length} projects:`);
    console.log(JSON.stringify(projects, null, 2));
    
    // Also check the column names
    const projectWithSelect = await prisma.projects.findMany({
      select: {
        id: true,
        activation_key: true,
        collector_ip: true,
        logger_ip: true,
        pkg_id: true,
        admin_id: true,
        reseller_id: true,
        end_customer_id: true,
        created_at: true,
        updated_at: true,
      }
    });
    
    console.log('Projects with selected fields:');
    console.log(JSON.stringify(projectWithSelect, null, 2));
    
  } catch (error) {
    console.error('Error checking projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProjects();