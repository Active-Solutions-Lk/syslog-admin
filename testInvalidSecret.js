// Test script for the project validation API endpoint with invalid secret
const testProjectValidation = async () => {
  try {
    // Test data with invalid secret
    const testData = {
      activationKey: 'AB12-CD34-EF58',
      secretKey: 'invalid-secret-key',
      collectorIp: '192.168.1.100',
      loggerIp: '192.168.1.101'
    };

    // Make the API request
    const response = await fetch('http://localhost:3001/api/project_validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log('API Response Status:', response.status);
    console.log('API Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error testing API endpoint:', error);
  }
};

testProjectValidation();