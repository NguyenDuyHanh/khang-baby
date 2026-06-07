const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');

const auth = require('../middleware/auth');
const { checkRole } = auth;

const voucherService = require('../services/voucherService');

// Public Product Routes
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.get('/categories', productController.getCategories);

// Public Voucher Routes
router.get('/vouchers', async (req, res) => {
  try {
    const vouchers = await voucherService.getAllVouchers({ trang_thai: 'HOAT_DONG' });
    // Filter out expired vouchers or ones that haven't started yet
    const today = new Date().toISOString().split('T')[0];
    const validVouchers = vouchers.filter(v => {
      const tu = v.han_su_dung_tu ? new Date(v.han_su_dung_tu).toISOString().split('T')[0] : '1970-01-01';
      const den = v.han_su_dung_den ? new Date(v.han_su_dung_den).toISOString().split('T')[0] : '2099-12-31';
      return today >= tu && today <= den;
    });
    res.json({ ok: true, data: validVouchers });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Authenticated Storefront Route (Customer & Admin)
router.get('/orders/me', auth, orderController.getUserOrders);
router.post('/orders/:id/feedback', auth, orderController.updateFeedback);
router.post('/orders/:id/cancel', auth, orderController.cancelUserOrder);
router.post('/orders', auth, checkRole('CUSTOMER', 'MANAGER', 'ONLINE_SALES', 'SALES', 'WAREHOUSE', 'MARKETING'), orderController.createOrder);

module.exports = router;
