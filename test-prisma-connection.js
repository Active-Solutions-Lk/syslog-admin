/**
 * Test script to verify Prisma connection
 * Run with: node test-prisma-connection.js
 */

const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  try {
    // Test the connection by connecting to the database
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // Test a simple query
    const projectsCount = await prisma.projects.count();
    console.log(`📊 Found ${projectsCount} projects in the database`);
    
    // Test listing some data
    const admins = await prisma.admins.findMany({
      take: 5, // Limit to 5 records
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    console.log(`👥 First 5 admins:`);
    admins.forEach(admin => {
      console.log(`  - ${admin.name || 'N/A'} (${admin.email}) - Role: ${admin.role || 'N/A'}`);
    });
    
    console.log('\n✅ All tests passed! Prisma is working correctly.');
  } catch (error) {
    console.error('❌ Error testing Prisma connection:', error.message);
    console.error('This may be due to:');
    console.error('1. Database connection issues');
    console.error('2. Prisma Client generation issues');
    console.error('3. Missing environment variables');
    console.error('\nTry running: npx prisma generate');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
main();