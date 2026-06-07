const express = require('express');
const router = express.Router();
const voucherService = require('../services/voucherService');
const auth = require('../middleware/auth');
const { checkRole } = auth;

// All voucher routes require authentication
router.use(auth);

// GET all vouchers (Admin only)
router.get('/', checkRole('MANAGER', 'MARKETING'), async (req, res, next) => {
  try {
    const filters = {
      trang_thai: req.query.trang_thai,
      search: req.query.search
    };
    const vouchers = await voucherService.getAllVouchers(filters);
    res.json({ ok: true, data: vouchers });
  } catch (error) {
    next(error);
  }
});

// POST create voucher (Admin only)
router.post('/', checkRole('MANAGER', 'MARKETING'), async (req, res, next) => {
  try {
    const id = await voucherService.createVoucher(req.body);
    res.status(201).json({ ok: true, message: 'Voucher created successfully', id });
  } catch (error) {
    next(error);
  }
});

// PUT update voucher (Admin only)
router.put('/:id', checkRole('MANAGER', 'MARKETING'), async (req, res, next) => {
  try {
    await voucherService.updateVoucher(req.params.id, req.body);
    res.json({ ok: true, message: 'Voucher updated successfully' });
  } catch (error) {
    next(error);
  }
});

// DELETE voucher (Admin only)
router.delete('/:id', checkRole('MANAGER', 'MARKETING'), async (req, res, next) => {
  try {
    await voucherService.deleteVoucher(req.params.id);
    res.json({ ok: true, message: 'Voucher deleted successfully' });
  } catch (error) {
    next(error);
  }
});

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
