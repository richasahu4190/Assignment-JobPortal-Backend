const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email/', authController.verifyOTP);

// Protected route
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;