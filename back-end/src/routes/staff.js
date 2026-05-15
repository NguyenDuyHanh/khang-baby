const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const auth = require('../middleware/auth');
const { checkRole } = auth;

// All staff routes require authentication
router.use(auth);

// Get all staff
router.get('/', checkRole('MANAGER'), staffController.getAllStaff);

// Get staff by ID
router.get('/:id', checkRole('MANAGER'), staffController.getStaffById);

// Create staff
router.post('/', checkRole('MANAGER'), staffController.createStaff);

// Update staff
router.put('/:id', checkRole('MANAGER'), staffController.updateStaff);

// Delete staff
router.delete('/:id', checkRole('MANAGER'), staffController.deleteStaff);

// Change password
router.post('/change-password', staffController.changePassword);

module.exports = router;
