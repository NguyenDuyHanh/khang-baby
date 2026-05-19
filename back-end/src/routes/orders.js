const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const { checkRole } = auth;

// All order routes require authentication
router.use(auth);

// Stats - Specific endpoints first
router.get('/stats/pending', orderController.getPendingOrdersCount);
router.get('/recent', orderController.getRecentOrders);

// Orders - General & Parameterized routes
router.get('/', checkRole('MANAGER', 'ONLINE_SALES'), orderController.getAllOrders);
router.get('/:id', checkRole('MANAGER', 'ONLINE_SALES'), orderController.getOrderById);
router.post('/', checkRole('MANAGER', 'ONLINE_SALES'), orderController.createOrder);
router.put('/:id', checkRole('MANAGER', 'ONLINE_SALES'), orderController.updateOrder);

// Order actions
router.post('/:id/confirm', checkRole('MANAGER', 'ONLINE_SALES'), orderController.confirmOrder);
router.post('/:id/cancel', checkRole('MANAGER', 'ONLINE_SALES'), orderController.cancelOrder);
router.post('/:id/complete', checkRole('MANAGER', 'ONLINE_SALES'), orderController.completeOrder);

module.exports = router;
