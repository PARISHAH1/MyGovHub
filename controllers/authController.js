const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });
        const token = jwt.sign({ userId: user._id, userRole: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token, user: { userId: user._id, name: user.name, email: user.email, userRole: user.role } });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign({ userId: user._id, userRole: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { userId: user._id, name: user.name, email: user.email, userRole: user.role } });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password, adminCode } = req.body;
        
        if (!name || !email || !password || !adminCode) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check admin code (you can change this secret code)
        if (adminCode !== 'ADMIN123') {
            return res.status(400).json({ message: 'Invalid admin code.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword, 
            role: 'admin' 
        });

        const token = jwt.sign({ userId: user._id, userRole: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ 
            token, 
            user: { 
                userId: user._id, 
                name: user.name, 
                email: user.email, 
                userRole: user.role 
            } 
        });
    } catch (err) {
        console.error("Admin register error:", err);
        res.status(500).json({ message: 'Server error.' });
    }
}; 