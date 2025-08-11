const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json(user);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword, phone, address, city, pincode } = req.body;

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update basic info
        if (name) user.name = name;
        if (email) {
            // Check if email is already taken by another user
            const existingUser = await User.findOne({ email, _id: { $ne: req.user.userId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use.' });
            }
            user.email = email;
        }

        // Update additional profile fields
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (city !== undefined) user.city = city;
        if (pincode !== undefined) user.pincode = pincode;

        // Update password if provided
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect.' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters.' });
            }

            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json(userResponse);
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        // Admin only
        if (req.user.userRole !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admins only.' });
        }

        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.json(users);
    } catch (err) {
        console.error('Get all users error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
}; 