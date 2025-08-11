const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/register-admin (Admin registration with secret code)
router.post('/register-admin', authController.registerAdmin);

// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router; 