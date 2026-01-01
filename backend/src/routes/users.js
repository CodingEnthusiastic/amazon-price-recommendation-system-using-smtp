const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

// POST /api/users/sync - Sync user with Clerk (NO AUTH REQUIRED - token validated by Clerk SDK)
router.post('/sync', requireAuth, userController.syncUser);

// Other routes require authentication
router.use(requireAuth);

// GET /api/users/stats - Get user dashboard stats
router.get('/stats', userController.getUserStats);

module.exports = router;
