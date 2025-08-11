const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { MONGO_URI } = require('./config');

async function createAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@mygovhub.com' });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            console.log('Email: admin@mygovhub.com');
            console.log('Password: admin123');
            process.exit(0);
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@mygovhub.com',
            password: hashedPassword,
            role: 'admin'
        });

        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@mygovhub.com');
        console.log('Password: admin123');
        console.log('Role: admin');
        console.log('User ID:', adminUser._id);

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
        process.exit(0);
    }
}

createAdminUser(); 