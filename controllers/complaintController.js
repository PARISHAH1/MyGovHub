const Complaint = require('../models/Complaint');
const { createNotification } = require('./notificationController');
const fs = require('fs');
const path = require('path');

exports.createComplaint = async (req, res) => {
    try {
        console.log('Creating complaint with data:', req.body);
        console.log('User:', req.user);
        console.log('File:', req.file);

        const { category, description, lat, lng } = req.body;

        // Validate required fields
        if (!category || !description || !lat || !lng) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ message: 'Invalid coordinates.' });
        }

        const image = req.file ? req.file.filename : null;

        console.log('Image filename:', image);

        const complaint = await Complaint.create({
            user: req.user.userId,
            category,
            description,
            image,
            location: { lat: parseFloat(lat), lng: parseFloat(lng) },
            status: 'Pending',
        });

        console.log('Complaint created:', complaint);

        // Populate user info for response
        await complaint.populate('user', 'name email');

        res.status(201).json(complaint);
    } catch (err) {
        console.error('Create complaint error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

exports.getComplaints = async (req, res) => {
    try {
        const { status, category, page = 1, limit = 10 } = req.query;

        let query = {};

        // Filter by status if provided
        if (status && ['Pending', 'In Progress', 'Resolved'].includes(status)) {
            query.status = status;
        }

        // Filter by category if provided
        if (category) {
            query.category = category;
        }

        // Apply user role filter
        if (req.user.userRole !== 'admin') {
            query.user = req.user.userId;
        }

        const skip = (page - 1) * limit;

        const complaints = await Complaint.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Complaint.countDocuments(query);

        res.json({
            complaints,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                hasNext: skip + complaints.length < total,
                hasPrev: page > 1
            }
        });
    } catch (err) {
        console.error('Get complaints error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('user', 'name email');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found.' });
        }

        // Check if user has permission to view this complaint
        if (req.user.userRole !== 'admin' && complaint.user._id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        res.json(complaint);
    } catch (err) {
        console.error('Get complaint by ID error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid complaint ID.' });
        }
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.updateComplaintStatus = async (req, res) => {
    try {
        // Admin only
        if (req.user.userRole !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admins only.' });
        }

        const { status } = req.body;

        if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status.' });
        }

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'name email');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found.' });
        }

        // Create notification for the user when admin updates status
        try {
            await createNotification(req.params.id, status, req.user.userId);
        } catch (notificationError) {
            console.error('Error creating notification:', notificationError);
            // Don't fail the request if notification creation fails
        }

        res.json(complaint);
    } catch (err) {
        console.error('Update complaint status error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid complaint ID.' });
        }
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.deleteComplaint = async (req, res) => {
    try {
        // Admin only
        if (req.user.userRole !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admins only.' });
        }

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found.' });
        }

        // Delete associated image file if it exists
        if (complaint.image) {
            const imagePath = path.join(__dirname, '../uploads', complaint.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Complaint.findByIdAndDelete(req.params.id);

        res.json({ message: 'Complaint deleted successfully.' });
    } catch (err) {
        console.error('Delete complaint error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid complaint ID.' });
        }
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get complaint statistics
exports.getComplaintStats = async (req, res) => {
    try {
        // Admin only
        if (req.user.userRole !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admins only.' });
        }

        const stats = await Complaint.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await Complaint.countDocuments();

        const statsObj = {
            total,
            pending: 0,
            inProgress: 0,
            resolved: 0
        };

        stats.forEach(stat => {
            if (stat._id === 'Pending') statsObj.pending = stat.count;
            else if (stat._id === 'In Progress') statsObj.inProgress = stat.count;
            else if (stat._id === 'Resolved') statsObj.resolved = stat.count;
        });

        res.json(statsObj);
    } catch (err) {
        console.error('Get complaint stats error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
}; 