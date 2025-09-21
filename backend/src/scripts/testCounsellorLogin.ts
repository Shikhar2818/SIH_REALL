const testCounsellorLogin = async () => {
  try {
    console.log('🧪 Testing Counsellor Login...');

    // Test different counsellor credentials
    const counsellorCredentials = [
      { email: 'sarah@counsellor.com', password: 'counsellor123' },
      { email: 'counsellor@test.com', password: 'counsellor123' },
      { email: 'amaan@counsellor.com', password: 'counsellor123' },
      { email: 'monis@counsellor.com', password: 'counsellor123' }
    ];

    for (const cred of counsellorCredentials) {
      console.log(`\nTesting: ${cred.email}`);
      
      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cred)
      });

      const loginData = await loginResponse.json() as any;
      
      if (loginResponse.ok) {
        console.log(`✅ Login successful for ${cred.email}`);
        console.log(`   User: ${loginData.user.name} (${loginData.user.role})`);
        
        // Test dashboard endpoint
        const dashboardResponse = await fetch('http://localhost:3001/api/counsellor/extended/dashboard-summary', {
          headers: {
            'Authorization': `Bearer ${loginData.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        const dashboardData = await dashboardResponse.json() as any;
        
        if (dashboardResponse.ok) {
          console.log(`   Dashboard: ✅ Success`);
          console.log(`   Summary:`, dashboardData.summary);
          console.log(`   Upcoming Bookings: ${dashboardData.upcomingBookings?.length || 0}`);
          console.log(`   Recent Sessions: ${dashboardData.recentSessions?.length || 0}`);
        } else {
          console.log(`   Dashboard: ❌ Failed - ${dashboardData.message || 'Unknown error'}`);
        }
        
        break; // Found working credentials, stop testing
      } else {
        console.log(`❌ Login failed: ${loginData.message || 'Unknown error'}`);
      }
    }

  } catch (error: any) {
    console.error('❌ Error testing counsellor login:', error.message);
  }
};

testCounsellorLogin();
