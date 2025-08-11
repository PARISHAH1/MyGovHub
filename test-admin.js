const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let adminToken = '';
let complaintId = '';

// Test data
const testUser = {
    name: 'John Citizen',
    email: 'john@example.com',
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
async function testAdminLogin() {
    console.log('\n🔍 Testing Admin Login...');
    const result = await makeRequest('POST', '/api/auth/login', {
        email: 'admin@mygovhub.com',
        password: 'admin123'
    });
    if (result.success) {
        console.log('✅ Admin login successful:', result.data.user.email);
        console.log('Role:', result.data.user.userRole);
        adminToken = result.data.token;
    } else {
        console.log('❌ Admin login failed:', result.error);
    }
}

async function testGetAllComplaints() {
    console.log('\n🔍 Testing Get All Complaints (Admin)...');
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const result = await makeRequest('GET', '/api/complaints', null, adminToken);
    if (result.success) {
        console.log('✅ Get all complaints successful');
        console.log(`Found ${result.data.complaints.length} complaints`);
        
        if (result.data.complaints.length > 0) {
            complaintId = result.data.complaints[0]._id;
            console.log('First complaint ID:', complaintId);
            console.log('Status:', result.data.complaints[0].status);
        }
    } else {
        console.log('❌ Get all complaints failed:', result.error);
    }
}

async function testGetComplaintStats() {
    console.log('\n🔍 Testing Get Complaint Stats...');
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const result = await makeRequest('GET', '/api/complaints/stats', null, adminToken);
    if (result.success) {
        console.log('✅ Get stats successful:');
        console.log(`Total: ${result.data.total}`);
        console.log(`Pending: ${result.data.pending}`);
        console.log(`In Progress: ${result.data.inProgress}`);
        console.log(`Resolved: ${result.data.resolved}`);
    } else {
        console.log('❌ Get stats failed:', result.error);
    }
}

async function testUpdateComplaintStatus() {
    console.log('\n🔍 Testing Update Complaint Status...');
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

async function testUpdateToResolved() {
    console.log('\n🔍 Testing Update to Resolved...');
    if (!adminToken || !complaintId) {
        console.log('❌ No admin token or complaint ID available');
        return;
    }

    const result = await makeRequest('PUT', `/api/complaints/${complaintId}`, {
        status: 'Resolved'
    }, adminToken);
    if (result.success) {
        console.log('✅ Status update to Resolved successful:', result.data.status);
    } else {
        console.log('❌ Status update failed:', result.error);
    }
}

async function testGetAllUsers() {
    console.log('\n🔍 Testing Get All Users...');
    if (!adminToken) {
        console.log('❌ No admin token available');
        return;
    }

    const result = await makeRequest('GET', '/api/users', null, adminToken);
    if (result.success) {
        console.log('✅ Get all users successful');
        console.log(`Found ${result.data.length} users`);
        result.data.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
        });
    } else {
        console.log('❌ Get all users failed:', result.error);
    }
}

// Main test function
async function runAdminTests() {
    console.log('🏛️  Starting Admin Tests...');
    console.log('Base URL:', BASE_URL);

    await testAdminLogin();
    await testGetAllComplaints();
    await testGetComplaintStats();
    await testUpdateComplaintStatus();
    await testUpdateToResolved();
    await testGetAllUsers();

    console.log('\n🎉 Admin tests completed!');
    console.log('\n📋 Admin Summary:');
    console.log('- Can view all complaints');
    console.log('- Can update complaint status');
    console.log('- Can view statistics');
    console.log('- Can view all users');
}

// Run tests
runAdminTests().catch(console.error); 