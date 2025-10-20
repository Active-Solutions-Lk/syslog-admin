// Comprehensive test script for the project validation API endpoint
const testValidRequest = async () => {
  try {
    console.log('=== Testing Valid Request ===');
    const testData = {
      activationKey: 'AB12-CD34-EF58',
      secretKey: 'I3UYA2HSQPB86XpsdVUb9szDu5tn2W3fOpg8',
      collectorIp: '192.168.1.100',
      loggerIp: '192.168.1.101'
    };

    const response = await fetch('http://localhost:3001/api/project_validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('');
  } catch (error) {
    console.error('Error testing valid request:', error);
  }
};

const testInvalidSecret = async () => {
  try {
    console.log('=== Testing Invalid Secret ===');
    const testData = {
      activationKey: 'AB12-CD34-EF58',
      secretKey: 'invalid-secret-key',
      collectorIp: '192.168.1.100',
      loggerIp: '192.168.1.101'
    };

    const response = await fetch('http://localhost:3001/api/project_validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('');
  } catch (error) {
    console.error('Error testing invalid secret:', error);
  }
};

const testInvalidActivation = async () => {
  try {
    console.log('=== Testing Invalid Activation Key ===');
    const testData = {
      activationKey: 'INVALID-ACTIVATION-KEY',
      secretKey: 'I3UYA2HSQPB86XpsdVUb9szDu5tn2W3fOpg8',
      collectorIp: '192.168.1.100',
      loggerIp: '192.168.1.101'
    };

    const response = await fetch('http://localhost:3001/api/project_validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('');
  } catch (error) {
    console.error('Error testing invalid activation key:', error);
  }
};

const runAllTests = async () => {
  await testValidRequest();
  await testInvalidSecret();
  await testInvalidActivation();
  console.log('=== All tests completed ===');
};

runAllTests();