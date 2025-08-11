const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testServer() {
    console.log('🔍 Testing MyGovHub Server...');
    console.log('Base URL:', BASE_URL);

    try {
        // Test 1: Health Check
        console.log('\n1. Testing Health Check...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check passed:', healthResponse.data);

        // Test 2: Check if auth routes are available
        console.log('\n2. Testing Auth Routes...');
        const authResponse = await axios.get(`${BASE_URL}/api/auth`);
        console.log('✅ Auth routes accessible:', authResponse.data);
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Server is not running!');
            console.log('Please start the server with: cd server && node server.js');
        } else if (error.response?.status === 404) {
            console.log('❌ Route not found. Server might not be running properly.');
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

testServer(); 