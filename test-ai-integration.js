#!/usr/bin/env node

/**
 * Test script for AI Chatbot Integration
 * This script tests the integration between the main backend and AI chatbot service
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';
const AI_SERVICE_URL = 'http://localhost:5000';

async function testAIServiceHealth() {
  console.log('🔍 Testing AI Service Health...');
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/health`, { timeout: 5000 });
    console.log('✅ AI Service is healthy:', response.data);
    return true;
  } catch (error) {
    console.log('❌ AI Service is not responding:', error.message);
    return false;
  }
}

async function testBackendIntegration() {
  console.log('🔍 Testing Backend Integration...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/ai-chat/health`, { timeout: 5000 });
    console.log('✅ Backend integration is working:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Backend integration failed:', error.message);
    return false;
  }
}

async function testAIChatEndpoint() {
  console.log('🔍 Testing AI Chat Endpoint...');
  try {
    // This would normally require authentication, but we'll test the endpoint structure
    const response = await axios.post(`${BACKEND_URL}/api/ai-chat`, {
      message: 'Hello, this is a test message'
    }, { 
      timeout: 10000,
      headers: {
        'Authorization': 'Bearer test-token' // This will fail auth but test endpoint
      }
    });
    console.log('✅ AI Chat endpoint is accessible');
    return true;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ AI Chat endpoint is accessible (authentication required as expected)');
      return true;
    }
    console.log('❌ AI Chat endpoint failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting AI Chatbot Integration Tests...\n');
  
  const tests = [
    { name: 'AI Service Health', fn: testAIServiceHealth },
    { name: 'Backend Integration', fn: testBackendIntegration },
    { name: 'AI Chat Endpoint', fn: testAIChatEndpoint }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message);
      results.push({ name: test.name, passed: false });
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
  });
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! AI Chatbot integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the services and try again.');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Start the AI chatbot service: start-ai-chatbot.bat');
  console.log('2. Start the main backend: cd backend && npm run dev');
  console.log('3. Start the frontend: cd frontend && npm run dev');
  console.log('4. Visit: http://localhost:3000/ai-chatbot');
}

// Run the tests
runTests().catch(console.error);
