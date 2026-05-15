const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const { checkRole } = auth;

// All report routes require authentication
router.use(auth);

// Dashboard
router.get('/dashboard/kpis', reportController.getDashboardKPIs);

// Order reports
router.get('/orders', checkRole('MANAGER', 'ONLINE_SALES'), reportController.getOrderReport);

// Revenue reports
router.get('/revenue', checkRole('MANAGER', 'MARKETING'), reportController.getRevenueReport);

// Inventory reports
router.get('/inventory', checkRole('MANAGER', 'WAREHOUSE', 'MARKETING'), reportController.getInventoryReport);
router.get('/inventory/reorder', checkRole('MANAGER', 'WAREHOUSE'), reportController.getProductsNeedingReorder);
router.get('/inventory/expiring', checkRole('MANAGER', 'WAREHOUSE'), reportController.getExpiringProducts);

// Staff performance
router.get('/staff', checkRole('MANAGER'), reportController.getStaffPerformanceReport);

module.exports = router;
