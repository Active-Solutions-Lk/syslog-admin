const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Check foreign key constraints on projects table
    const constraints = await prisma.$queryRaw`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE
        TABLE_SCHEMA = 'remote_admin'
        AND TABLE_NAME = 'projects'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY
        CONSTRAINT_NAME;
    `;
    
    console.log('Foreign key constraints on projects table:');
    console.log(constraints);
    
    // Check if the specific collector constraint exists
    const collectorConstraint = await prisma.$queryRaw`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE
        TABLE_SCHEMA = 'remote_admin'
        AND TABLE_NAME = 'projects'
        AND COLUMN_NAME = 'collector_ip'
        AND REFERENCED_TABLE_NAME = 'collectors'
      ORDER BY
        CONSTRAINT_NAME;
    `;
    
    console.log('Collector foreign key constraint:');
    console.log(collectorConstraint);
    
  } catch (error) {
    console.error('Error checking constraints:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();