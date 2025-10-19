/**
 * Test script to verify database connection without Prisma
 * Run with: node test-database-connection.js
 */

// Load environment variables
require('dotenv').config();

const mysql = require('mysql2');

// Extract database connection details from DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.error('Please ensure you have a .env file with DATABASE_URL variable');
  process.exit(1);
}

// Parse the DATABASE_URL
// Format: mysql://username:password@host:port/database
const urlParts = databaseUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!urlParts) {
  console.error('❌ Invalid DATABASE_URL format');
  console.error('Expected format: mysql://username:password@host:port/database');
  process.exit(1);
}

const [, user, password, host, port, database] = urlParts;

// Create connection
const connection = mysql.createConnection({
  host: host,
  user: user,
  password: password,
  port: port,
  database: database
});

console.log('🔧 Testing database connection...');
console.log(`Host: ${host}:${port}`);
console.log(`Database: ${database}`);
console.log(`User: ${user}`);

// Connect to database
connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('This usually means the MySQL server is not running or not accessible');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('This usually means the username or password is incorrect');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('This usually means the database does not exist');
    }
    process.exit(1);
  }
  
  console.log('✅ Successfully connected to MySQL database!');
  
  // Test a simple query
  connection.query('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) {
      console.error('❌ Error executing test query:', error.message);
      connection.end();
      process.exit(1);
    }
    
    console.log(`📊 Test query result: ${results[0].solution}`);
    
    // Test listing tables
    connection.query('SHOW TABLES', (error, results) => {
      if (error) {
        console.error('❌ Error listing tables:', error.message);
        connection.end();
        process.exit(1);
      }
      
      console.log(`📋 Database tables:`);
      results.forEach(row => {
        const tableName = Object.values(row)[0];
        console.log(`  - ${tableName}`);
      });
      
      console.log('\n✅ All database tests passed!');
      connection.end();
    });
  });
});