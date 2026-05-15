const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const auth = require('../middleware/auth');
const { checkRole } = auth;

// All receipt routes require authentication
router.use(auth);

// Receipts
router.get('/', checkRole('MANAGER', 'WAREHOUSE'), receiptController.getAllReceipts);
router.get('/:id', checkRole('MANAGER', 'WAREHOUSE'), receiptController.getReceiptById);
router.post('/', checkRole('MANAGER', 'WAREHOUSE'), receiptController.createReceipt);
router.put('/:id', checkRole('MANAGER', 'WAREHOUSE'), receiptController.updateReceipt);
router.delete('/:id', checkRole('MANAGER', 'WAREHOUSE'), receiptController.deleteReceipt);

module.exports = router;
