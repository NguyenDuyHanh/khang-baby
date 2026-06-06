const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const auth = require('../middleware/auth');
const { checkRole } = auth;

// All staff routes require authentication
router.use(auth);

// Change password
router.post('/change-password', staffController.changePassword);

// Get all staff
router.get('/', checkRole('MANAGER'), staffController.getAllStaff);

// Parameterized routes
router.get('/:id', checkRole('MANAGER'), staffController.getStaffById);
router.post('/', checkRole('MANAGER'), staffController.createStaff);
router.put('/:id', checkRole('MANAGER'), staffController.updateStaff);
router.delete('/:id', checkRole('MANAGER'), staffController.deleteStaff);

module.exports = router;
