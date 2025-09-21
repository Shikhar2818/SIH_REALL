const testCounsellorStats = async () => {
  try {
    console.log('🧪 Testing Counsellor Stats Data...');

    // First, login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json() as any;
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginData.message || 'Unknown error'}`);
    }

    const { accessToken } = loginData;
    console.log('✅ Login successful, got access token');

    // Test the analytics endpoint
    console.log('2. Testing analytics dashboard endpoint...');
    const analyticsResponse = await fetch('http://localhost:3001/api/admin-analytics/dashboard', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const analyticsData = await analyticsResponse.json() as any;
    if (!analyticsResponse.ok) {
      throw new Error(`Analytics request failed: ${analyticsData.message || 'Unknown error'}`);
    }

    console.log('✅ Analytics endpoint successful!');
    console.log('📊 Counsellor Stats Data:');
    console.log('   Length:', analyticsData.counsellorStats?.length || 0);
    
    if (analyticsData.counsellorStats && analyticsData.counsellorStats.length > 0) {
      analyticsData.counsellorStats.forEach((stat: any, index: number) => {
        console.log(`   Counsellor ${index + 1}:`, {
          id: stat._id,
          name: stat.counsellorName,
          totalBookings: stat.totalBookings,
          confirmedBookings: stat.confirmedBookings,
          completedBookings: stat.completedBookings,
          confirmationRate: stat.confirmationRate,
          completionRate: stat.completionRate
        });
      });
    } else {
      console.log('❌ No counsellor stats data found');
    }

    // Also check recent bookings to see if counsellor data is populated
    console.log('\n📊 Recent Bookings Data:');
    console.log('   Length:', analyticsData.recentBookings?.length || 0);
    
    if (analyticsData.recentBookings && analyticsData.recentBookings.length > 0) {
      analyticsData.recentBookings.slice(0, 3).forEach((booking: any, index: number) => {
        console.log(`   Booking ${index + 1}:`, {
          id: booking._id,
          studentName: booking.studentId?.name || 'null',
          counsellorName: booking.counsellorId?.name || 'null',
          status: booking.status
        });
      });
    }

  } catch (error: any) {
    console.error('❌ Error testing counsellor stats:', error.message);
  }
};

testCounsellorStats();
