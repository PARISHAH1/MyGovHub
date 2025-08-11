const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// GET /api/users/profile (protected)
router.get('/profile', auth, userController.getProfile);

// PUT /api/users/profile (protected)
router.put('/profile', auth, userController.updateProfile);

// GET /api/users (admin only)
router.get('/', auth, userController.getAllUsers);

module.exports = router; 