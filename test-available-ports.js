import { getAvailablePorts } from './app/actions/project.js';

async function testAvailablePorts() {
  try {
    console.log('Testing getAvailablePorts function...');
    
    // Test with a collector IP that should have available ports
    const result = await getAvailablePorts('192.168.2.10');
    
    console.log('Result:', result);
    
    if (result.success) {
      console.log('Available ports:');
      result.ports.forEach(port => {
        console.log(`  Port ${port.port} (ID: ${port.id})`);
      });
    } else {
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('Error testing getAvailablePorts:', error);
  }
}

testAvailablePorts();