const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let adminToken = '';
let complaintId = '';

// Test data
const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: '123456'
};

const testComplaint = {
    category: 'Pothole',
    description: 'Large pothole on main road',
    lat: '23.0225',
    lng: '72.5714'
};

// Helper function to make requests
async function makeRequest(method, endpoint, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message, 
            status: error.response?.status 
        };
    }
}

// Test functions
async function testHealthCheck() {
    console.log('\n🔍 Testing Health Check...');
    const result = await makeRequest('GET', '/health');
    if (result.success) {
        console.log('✅ Health check passed:', result.data);
    } else {
        console.log('❌ Health check failed:', result.error);
    }
}

async function testRegister() {
    console.log('\n🔍 Testing User Registration...');
    const result = await makeRequest('POST', '/api/auth/register', testUser);
    if (result.success) {
        console.log('✅ Registration successful:', result.data.user.email);
        authToken = result.data.token;
    } else {
        console.log('❌ Registration failed:', result.error);
    }
}

async function testLogin() {
    console.log('\n🔍 Testing User Login...');
    const result = await makeRequest('POST', '/api/auth/login', {
        email: testUser.email,
        password: testUser.password
    });
    if (result.success) {
        console.log('✅ Login successful:', result.data.user.email);
        authToken = result.data.token;
    } else {
        console.log('❌ Login failed:', result.error);
    }
}

async function testAdminLogin() {
    console.log('\n🔍 Testing Admin Login...');
    const result = await makeRequest('POST', '/api/auth/login', {
        email: 'admin@mygovhub.com',
        password: 'admin123'
    });
    if (result.success) {
        console.log('✅ Admin login successful:', result.data.user.email);
        adminToken = result.data.token;
    } else {
        console.log('❌ Admin login failed:', result.error);
    }
}

async function testSubmitComplaint() {
    console.log('\n🔍 Testing Submit Complaint...');
    if (!authToken) {
        console.log('❌ No auth token available');
        return;
    }

    // For this test, we'll use a simple JSON request without file upload
    const result = await makeRequest('POST', '/api/complaints', testComplaint, authToken);
    if (result.success) {
        console.log('✅ Complaint submitted successfully');
        complaintId = result.data._id;
    } else {
        console.log('❌ Complaint submission failed:', result.error);
    }
}

async function testGetComplaints() {
    console.log('\n🔍 Testing Get Complaints...');
    if (!authToken) {
        console.log('❌ No auth token available');
        return;
    }

    const result = await makeRequest('GET', '/api/complaints', null, authToken);
    if (result.success) {
        console.log('✅ Get complaints successful');
        console.log(`Found ${result.data.complaints.length} complaints`);
    } else {
        console.log('❌ Get complaints failed:', result.error);
    }
}

async function testGetComplaintStats() {
    console.log('\n🔍 Testing Get Complaint Stats (Admin)...');
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const result = await makeRequest('GET', '/api/complaints/stats', null, adminToken);
    if (result.success) {
        console.log('✅ Get stats successful:', result.data);
    } else {
        console.log('❌ Get stats failed:', result.error);
    }
}

async function testUpdateComplaintStatus() {
    console.log('\n🔍 Testing Update Complaint Status (Admin)...');
    if (!adminToken || !complaintId) {
        console.log('❌ No admin token or complaint ID available');
        return;
    }

    const result = await makeRequest('PUT', `/api/complaints/${complaintId}`, {
        status: 'In Progress'
    }, adminToken);
    if (result.success) {
        console.log('✅ Status update successful:', result.data.status);
    } else {
        console.log('❌ Status update failed:', result.error);
    }
}

async function testGetUserProfile() {
    console.log('\n🔍 Testing Get User Profile...');
    if (!authToken) {
        console.log('❌ No auth token available');
        return;
    }

    const result = await makeRequest('GET', '/api/users/profile', null, authToken);
    if (result.success) {
        console.log('✅ Get profile successful:', result.data.name);
    } else {
        console.log('❌ Get profile failed:', result.error);
    }
}

async function testUpdateUserProfile() {
    console.log('\n🔍 Testing Update User Profile...');
    if (!authToken) {
        console.log('❌ No auth token available');
        return;
    }

    const result = await makeRequest('PUT', '/api/users/profile', {
        name: 'Updated Test User'
    }, authToken);
    if (result.success) {
        console.log('✅ Profile update successful:', result.data.name);
    } else {
        console.log('❌ Profile update failed:', result.error);
    }
}

// Main test function
async function runAllTests() {
    console.log('🚀 Starting API Tests...');
    console.log('Base URL:', BASE_URL);

    await testHealthCheck();
    await testRegister();
    await testLogin();
    await testAdminLogin();
    await testSubmitComplaint();
    await testGetComplaints();
    await testGetComplaintStats();
    await testUpdateComplaintStatus();
    await testGetUserProfile();
    await testUpdateUserProfile();

    console.log('\n🎉 All tests completed!');
}

// Run tests
runAllTests().catch(console.error); 