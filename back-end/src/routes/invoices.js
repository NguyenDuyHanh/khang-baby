const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middleware/auth');
const { checkRole } = auth;

// All invoice routes require authentication
router.use(auth);

// Invoices - Specific endpoints first
router.get('/revenue/today', invoiceController.getTodayRevenue);
router.get('/recent', invoiceController.getRecentInvoices);

// Invoices - General endpoints
router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.post('/', checkRole('MANAGER', 'SALES'), invoiceController.createInvoice);
router.put('/:id', checkRole('MANAGER', 'SALES'), invoiceController.updateInvoice);
router.delete('/:id', checkRole('MANAGER', 'SALES'), invoiceController.deleteInvoice);

// Payment
router.post('/:id/confirm-payment', checkRole('MANAGER', 'SALES'), invoiceController.confirmPayment);

module.exports = router;
