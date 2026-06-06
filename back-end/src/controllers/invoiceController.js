const invoiceService = require('../services/invoiceService');
const voucherService = require('../services/voucherService');

// Get all invoices
async function getAllInvoices(req, res) {
  try {
    const filters = {
      trang_thai: req.query.trang_thai,
      search: req.query.search,
      ngay_bat_dau: req.query.ngay_bat_dau,
      ngay_ket_thuc: req.query.ngay_ket_thuc,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    const { rows, totalItems, page, limit } = await invoiceService.getAllInvoices(filters);
    res.json({ 
      ok: true, 
      data: rows,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Get invoice by ID
async function getInvoiceById(req, res) {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ ok: false, message: 'Invoice not found' });
    }
    res.json({ ok: true, data: invoice });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Create invoice
async function createInvoice(req, res) {
  try {
    const { ten_khach_hang, so_dien_thoai, id_khach_hang, ma_voucher, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, message: 'Invoice must have at least one item' });
    }

    // Generate invoice ID
    const ma_hdb = await invoiceService.generateInvoiceId();

    // Calculate totals
    let tong_tien_hang = 0;
    for (const item of items) {
      tong_tien_hang += item.gia_ban * item.so_luong;
    }

    // Apply voucher if provided
    let tien_giam = 0;
    if (ma_voucher) {
      const voucherResult = await voucherService.validateVoucher(ma_voucher, tong_tien_hang);
      if (!voucherResult.valid) {
        return res.status(400).json({ ok: false, message: voucherResult.message });
      }
      tien_giam = voucherResult.discount;
    }

    const invoiceData = {
      ma_hdb,
      ngay_ban: new Date(),
      id_nhan_vien: req.user.id,
      id_khach_hang,
      ten_khach_hang: ten_khach_hang || 'Khách lẻ',
      so_dien_thoai: so_dien_thoai || null,
      ma_voucher,
      tong_tien_hang,
      tien_giam,
      tong_can_thanh_toan: tong_tien_hang - tien_giam,
      phuong_thuc_thanh_toan: req.body.phuong_thuc_thanh_toan || 'TIEN_MAT',
      trang_thai: 'CHO_XAC_NHAN',
    };

    const id = await invoiceService.createInvoice(invoiceData);

    // Add items
    for (const item of items) {
      const thanh_tien = item.gia_ban * item.so_luong;
      await invoiceService.addInvoiceItem(id, item.id_hang_hoa, item.gia_ban, item.so_luong, thanh_tien);
    }

    res.status(201).json({
      ok: true,
      message: 'Invoice created successfully',
      id,
      ma_hdb,
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Confirm payment
async function confirmPayment(req, res) {
  try {
    await invoiceService.confirmPayment(req.params.id);

    // Increment voucher usage if applied
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    if (invoice.ma_voucher) {
      await voucherService.incrementVoucherUsage(invoice.ma_voucher);
    }

    // Also create a don_hang_online record for tracking unified orders
    try {
      const orderService = require('../services/orderService');
      const orderData = {
        ma_don: await orderService.generateOrderId(),
        ngay_dat: new Date(),
        ten_khach_hang: invoice.ten_khach_hang || 'Khách lẻ',
        so_dien_thoai: '',
        dia_chi_giao: 'Bán tại quầy',
        ghi_chu_don: `Hóa đơn: ${invoice.ma_hdb}`,
        kenh_dat_hang: 'TRỰC TIẾP',
        id_nhan_vien: invoice.id_nhan_vien,
        ma_voucher: invoice.ma_voucher,
        don_vi_van_chuyen: '',
        phi_giao_hang: 0,
        ngay_giao_du_kien: null,
        tong_tien_hang: invoice.tong_tien_hang,
        tien_giam: invoice.tien_giam,
        tong_thanh_toan: invoice.tong_can_thanh_toan,
        phuong_thuc_thanh_toan: invoice.phuong_thuc_thanh_toan
      };
      
      const orderId = await orderService.createOrder(orderData);
      
      for (const item of invoice.items) {
         await orderService.addOrderItem(orderId, item.id_hang_hoa, item.gia_ban, item.so_luong, item.gia_ban * item.so_luong);
      }
      
      await orderService.completeOrder(orderId);
    } catch (orderErr) {
      console.error('Failed to create synced order:', orderErr);
    }

    // Upsert customer if phone number is provided
    if (invoice.so_dien_thoai) {
      try {
        const customerService = require('../services/customerService');
        await customerService.upsertCustomer({
          ho_ten: invoice.ten_khach_hang,
          so_dien_thoai: invoice.so_dien_thoai,
          dia_chi: 'Mua trực tiếp',
          chi_tieu_moi: invoice.tong_can_thanh_toan
        });
      } catch (custErr) {
        console.error('Failed to upsert customer:', custErr);
      }
    }

    res.json({
      ok: true,
      message: 'Payment confirmed successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Update invoice
async function updateInvoice(req, res) {
  try {
    await invoiceService.updateInvoice(req.params.id, req.body);

    res.json({
      ok: true,
      message: 'Invoice updated successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Delete invoice
async function deleteInvoice(req, res) {
  try {
    await invoiceService.deleteInvoice(req.params.id);

    res.json({
      ok: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Get today's revenue
async function getTodayRevenue(req, res) {
  try {
    const revenue = await invoiceService.getTodayRevenue();
    res.json({ ok: true, data: revenue });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Get recent invoices
async function getRecentInvoices(req, res) {
  try {
    const limit = req.query.limit || 10;
    const invoices = await invoiceService.getRecentInvoices(limit);
    res.json({ ok: true, data: invoices });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  confirmPayment,
  updateInvoice,
  deleteInvoice,
  getTodayRevenue,
  getRecentInvoices,
};
