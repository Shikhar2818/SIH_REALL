const testBackendConnection = async () => {
  try {
    console.log('🧪 Testing Backend Connection...');

    // Test basic connection
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is responding');
      console.log('   Status:', response.status);
      console.log('   User:', (data as any).user?.name);
    } else {
      console.log('❌ Backend responded with error');
      console.log('   Status:', response.status);
      const errorData = await response.text();
      console.log('   Error:', errorData);
    }

  } catch (error: any) {
    console.error('❌ Backend connection failed:', error.message);
    console.log('   This usually means the backend server is not running');
  }
};

testBackendConnection();
