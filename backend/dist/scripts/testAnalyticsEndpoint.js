const testAnalyticsEndpoint = async () => {
    try {
        console.log('🧪 Testing Analytics API Endpoint...');
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
        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginData.message || 'Unknown error'}`);
        }
        const { accessToken } = loginData;
        console.log('✅ Login successful, got access token');
        console.log('2. Testing analytics dashboard endpoint...');
        const analyticsResponse = await fetch('http://localhost:3001/api/admin-analytics/dashboard', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const analyticsData = await analyticsResponse.json();
        if (!analyticsResponse.ok) {
            console.error('Analytics response status:', analyticsResponse.status);
            console.error('Analytics response data:', analyticsData);
            throw new Error(`Analytics request failed: ${analyticsData.message || JSON.stringify(analyticsData)}`);
        }
        console.log('✅ Analytics endpoint successful!');
        console.log('📊 Response data keys:', Object.keys(analyticsData));
    }
    catch (error) {
        console.error('❌ Error testing analytics endpoint:', error.message);
    }
};
testAnalyticsEndpoint();
//# sourceMappingURL=testAnalyticsEndpoint.js.map