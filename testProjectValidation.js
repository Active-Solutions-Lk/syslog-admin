// Test script for the project validation API endpoint
const testProjectValidation = async () => {
  try {
    // Test data
    const testData = {
      activationKey: 'AB12-CD34-EF58', // Actual activation key from DB
      secretKey: 'I3UYA2HSQPB86XpsdVUb9szDu5tn2W3fOpg8',
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
    console.log('API Response Status:', response.status);
    console.log('API Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error testing API endpoint:', error);
  }
};

testProjectValidation();