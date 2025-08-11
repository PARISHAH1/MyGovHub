const mongoose = require('mongoose');
const { createNotification } = require('./controllers/notificationController');
const config = require('./config');

async function testNotifications() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Test creating a notification
        console.log('\n🧪 Testing notification creation...');
        
        // First, let's find a complaint to test with
        const Complaint = require('./models/Complaint');
        const complaint = await Complaint.findOne().populate('user');
        
        if (!complaint) {
            console.log('❌ No complaints found in database. Please create a complaint first.');
            return;
        }

        console.log(`📝 Found complaint: ${complaint.category} by ${complaint.user.name}`);

        // Test creating a resolved notification
        const notification = await createNotification(
            complaint._id.toString(),
            'Resolved',
            'test-admin-id'
        );

        console.log('✅ Notification created successfully!');
        console.log('📋 Notification details:');
        console.log(`   - Title: ${notification.title}`);
        console.log(`   - Message: ${notification.message}`);
        console.log(`   - Type: ${notification.type}`);
        console.log(`   - User: ${notification.user}`);
        console.log(`   - Read: ${notification.read}`);

        // Test getting notifications for the user
        console.log('\n🧪 Testing notification retrieval...');
        const Notification = require('./models/Notification');
        const userNotifications = await Notification.find({ user: complaint.user._id })
            .populate('complaint', 'category description')
            .sort({ createdAt: -1 });

        console.log(`✅ Found ${userNotifications.length} notifications for user`);
        userNotifications.forEach((notif, index) => {
            console.log(`   ${index + 1}. ${notif.title} - ${notif.message}`);
        });

        console.log('\n🎉 Notification system test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the test
testNotifications(); 