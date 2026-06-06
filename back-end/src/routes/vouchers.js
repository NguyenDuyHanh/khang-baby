const express = require('express');
const router = express.Router();
const voucherService = require('../services/voucherService');
const auth = require('../middleware/auth');

// All voucher routes require authentication
router.use(auth);

// Validate a voucher
router.get('/validate', async (req, res, next) => {
  try {
    const { code, amount } = req.query;
    
    if (!code) {
      return res.status(400).json({ ok: false, message: 'Vui lòng cung cấp mã voucher' });
    }

    const totalAmount = Number(amount) || 0;
    const result = await voucherService.validateVoucher(code.trim(), totalAmount);

    if (!result.valid) {
      return res.status(400).json({ ok: false, message: result.message });
    }

    res.json({
      ok: true,
      valid: true,
      discount: result.discount,
      voucher: {
        id: result.voucher.id,
        ma_voucher: result.voucher.ma_voucher,
        gia_tri_giam: result.voucher.gia_tri_giam,
        phan_tram_giam: result.voucher.phan_tram_giam,
        gia_toi_thieu: result.voucher.gia_toi_thieu,
        han_su_dung_tu: result.voucher.han_su_dung_tu,
        han_su_dung_den: result.voucher.han_su_dung_den
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
