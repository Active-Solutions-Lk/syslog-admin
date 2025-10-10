// Test script for the project validation API endpoint with invalid activation key
const testInvalidActivationKey = async () => {
  try {
    // Test data with invalid activation key
    const testData = {
      activationKey: 'INVALID-ACTIVATION-KEY',
      secretKey: 'your-secret-key-here',
      collectorIp: '192.168.1.100',
      loggerIp: '192.168.1.101'
    };

    // Make the API request
    const response = await fetch('http://localhost:3000/api/project_validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log('API Response Status (Invalid Activation Key):', response.status);
    console.log('API Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error testing API endpoint:', error);
  }
};

testInvalidActivationKey();