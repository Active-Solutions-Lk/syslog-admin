// Test script to check if environment variables are loaded correctly
require('dotenv').config();

console.log('PROJECT_VALIDATION_SECRET from process.env:', process.env.PROJECT_VALIDATION_SECRET);
console.log('Length of PROJECT_VALIDATION_SECRET:', process.env.PROJECT_VALIDATION_SECRET?.length);

// Test the specific value from the .env file
const expectedSecret = 'I3UYA2HSQPB86XpsdVUb9szDu5tn2W3fOpg8';
console.log('Expected secret:', expectedSecret);
console.log('Expected secret length:', expectedSecret.length);
console.log('Secrets match:', process.env.PROJECT_VALIDATION_SECRET === expectedSecret);

// Check for any whitespace issues
console.log('Secret with quotes removed:', process.env.PROJECT_VALIDATION_SECRET?.replace(/"/g, ''));
console.log('Expected secret with quotes removed:', expectedSecret.replace(/"/g, ''));
console.log('Secrets match without quotes:', process.env.PROJECT_VALIDATION_SECRET?.replace(/"/g, '') === expectedSecret.replace(/"/g, ''));