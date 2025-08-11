const mongoose = require('mongoose');
const { MONGO_URI } = require('./config');
const Complaint = require('./models/Complaint');
const User = require('./models/User');

async function adminDashboard() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n🏛️  MyGovHub Admin Dashboard');
        console.log('=====================================');

        // Get statistics
        const totalComplaints = await Complaint.countDocuments();
        const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
        const inProgressComplaints = await Complaint.countDocuments({ status: 'In Progress' });
        const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
        const totalUsers = await User.countDocuments({ role: 'citizen' });

        console.log('\n📊 Statistics:');
        console.log(`Total Complaints: ${totalComplaints}`);
        console.log(`Pending: ${pendingComplaints}`);
        console.log(`In Progress: ${inProgressComplaints}`);
        console.log(`Resolved: ${resolvedComplaints}`);
        console.log(`Total Citizens: ${totalUsers}`);

        // Show recent complaints
        const recentComplaints = await Complaint.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        console.log('\n📝 Recent Complaints:');
        recentComplaints.forEach((complaint, index) => {
            console.log(`${index + 1}. ${complaint.category} - ${complaint.status}`);
            console.log(`   By: ${complaint.user.name} (${complaint.user.email})`);
            console.log(`   Date: ${complaint.createdAt.toLocaleDateString()}`);
            console.log(`   ID: ${complaint._id}`);
            console.log('');
        });

        // Show admin commands
        console.log('🔧 Admin Commands:');
        console.log('1. Update complaint status: PUT /api/complaints/:id');
        console.log('2. Delete complaint: DELETE /api/complaints/:id');
        console.log('3. Get all complaints: GET /api/complaints');
        console.log('4. Get complaint stats: GET /api/complaints/stats');
        console.log('5. Get all users: GET /api/users');

        console.log('\n🔑 Admin Login:');
        console.log('Email: admin@mygovhub.com');
        console.log('Password: admin123');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed');
    }
}

adminDashboard(); 