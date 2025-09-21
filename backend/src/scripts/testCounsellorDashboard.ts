const testCounsellorDashboard = async () => {
  try {
    console.log('🧪 Testing Counsellor Dashboard Endpoint...');

    // First, login as a counsellor to get token
    console.log('1. Logging in as counsellor...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'sarah@counsellor.com',
        password: 'counsellor123'
      })
    });

    const loginData = await loginResponse.json() as any;
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginData.message || 'Unknown error'}`);
    }

    const { accessToken } = loginData;
    console.log('✅ Login successful, got access token');

    // Test the counsellor dashboard endpoint
    console.log('2. Testing counsellor dashboard endpoint...');
    const dashboardResponse = await fetch('http://localhost:3001/api/counsellor/extended/dashboard-summary', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const dashboardData = await dashboardResponse.json() as any;
    if (!dashboardResponse.ok) {
      throw new Error(`Dashboard request failed: ${dashboardData.message || 'Unknown error'}`);
    }

    console.log('✅ Dashboard endpoint successful!');
    console.log('📊 Dashboard Data:');
    console.log('   Summary:', dashboardData.summary);
    console.log('   Upcoming Bookings:', dashboardData.upcomingBookings?.length || 0);
    console.log('   Recent Sessions:', dashboardData.recentSessions?.length || 0);
    
    if (dashboardData.upcomingBookings && dashboardData.upcomingBookings.length > 0) {
      console.log('\n📅 Upcoming Bookings:');
      dashboardData.upcomingBookings.slice(0, 3).forEach((booking: any, index: number) => {
        console.log(`   ${index + 1}. ${booking.studentId?.name || 'Unknown'} - ${booking.status} - ${booking.slotStart}`);
      });
    }

  } catch (error: any) {
    console.error('❌ Error testing counsellor dashboard:', error.message);
  }
};

testCounsellorDashboard();
