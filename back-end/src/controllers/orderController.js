const orderService = require('../services/orderService');
const voucherService = require('../services/voucherService');
const customerService = require('../services/customerService');
const pool = require('../db');

// Get all orders
async function getAllOrders(req, res) {
  try {
    const filters = {
      trang_thai: req.query.trang_thai,
      search: req.query.search,
      kenh_dat_hang: req.query.kenh_dat_hang,
      ngay_bat_dau: req.query.ngay_bat_dau,
      ngay_ket_thuc: req.query.ngay_ket_thuc,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    const { rows, totalItems, page, limit } = await orderService.getAllOrders(filters);
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

// Get order by ID
async function getOrderById(req, res) {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ ok: false, message: 'Order not found' });
    }
    res.json({ ok: true, data: order });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Create order
async function createOrder(req, res) {
  try {
    const { ten_khach_hang, so_dien_thoai, dia_chi_giao, kenh_dat_hang, ma_voucher, items } = req.body;

    if (!ten_khach_hang || !so_dien_thoai || !dia_chi_giao || !items || items.length === 0) {
      return res.status(400).json({ ok: false, message: 'Missing required fields' });
    }

    // Generate order ID
    const ma_don = await orderService.generateOrderId();

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

    const phi_giao_hang = req.body.phi_giao_hang || 0;
    const tong_thanh_toan = tong_tien_hang - tien_giam + phi_giao_hang;

    const orderData = {
      ma_don,
      ngay_dat: new Date(),
      ten_khach_hang,
      so_dien_thoai,
      dia_chi_giao,
      ghi_chu_don: req.body.ghi_chu_don,
      kenh_dat_hang: kenh_dat_hang || 'WEBSITE',
      id_nhan_vien: req.user ? req.user.id : null,
      ma_voucher,
      don_vi_van_chuyen: req.body.don_vi_van_chuyen,
      phi_giao_hang,
      ngay_giao_du_kien: req.body.ngay_giao_du_kien,
      tong_tien_hang,
      tien_giam,
      tong_thanh_toan,
      phuong_thuc_thanh_toan: req.body.phuong_thuc_thanh_toan || 'COD',
    };

    const id = await orderService.createOrder(orderData);

    // Add items
    for (const item of items) {
      const thanh_tien = item.gia_ban * item.so_luong;
      await orderService.addOrderItem(id, item.id_hang_hoa, item.gia_ban, item.so_luong, thanh_tien);
    }

    if (ma_voucher) {
      await voucherService.incrementVoucherUsage(ma_voucher);
    }

    // Upsert customer record
    if (so_dien_thoai) {
      try {
        await customerService.upsertCustomer({
          ho_ten: ten_khach_hang,
          so_dien_thoai: so_dien_thoai,
          dia_chi: dia_chi_giao,
          chi_tieu_moi: tong_thanh_toan
        });
      } catch (err) {
        console.error('Failed to upsert customer:', err);
      }
    }

    res.status(201).json({
      ok: true,
      message: 'Order created successfully',
      id,
      ma_don,
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Confirm order
async function confirmOrder(req, res) {
  try {
    await orderService.confirmOrder(req.params.id);

    res.json({
      ok: true,
      message: 'Order confirmed successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Cancel order
async function cancelOrder(req, res) {
  try {
    await orderService.cancelOrder(req.params.id);

    res.json({
      ok: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Complete order
async function completeOrder(req, res) {
  try {
    await orderService.completeOrder(req.params.id);

    res.json({
      ok: true,
      message: 'Order completed successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Update order
async function updateOrder(req, res) {
  try {
    await orderService.updateOrder(req.params.id, req.body);

    res.json({
      ok: true,
      message: 'Order updated successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Get pending orders count
async function getPendingOrdersCount(req, res) {
  try {
    const count = await orderService.getPendingOrdersCount();
    res.json({ ok: true, data: count });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Get recent orders
async function getRecentOrders(req, res) {
  try {
    const limit = req.query.limit || 10;
    const orders = await orderService.getRecentOrders(limit);
    res.json({ ok: true, data: orders });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Get user orders
async function getUserOrders(req, res) {
  try {
    if (!req.user) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    const orders = await orderService.getUserOrders(req.user.id);
    res.json({ ok: true, data: orders });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Update user order feedback
async function updateFeedback(req, res) {
  try {
    if (!req.user) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    const { status, reason } = req.body;
    
    if (!['KHACH_DA_NHAN', 'KHIEU_NAI'].includes(status)) {
      return res.status(400).json({ ok: false, message: 'Invalid status' });
    }
    
    if (status === 'KHIEU_NAI' && !reason) {
      return res.status(400).json({ ok: false, message: 'Vui lòng cung cấp lý do khiếu nại' });
    }

    const success = await orderService.updateOrderFeedback(req.params.id, req.user.id, status, reason);
    if (!success) {
      return res.status(404).json({ ok: false, message: 'Order not found or unauthorized' });
    }

    res.json({ ok: true, message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Resolve complaint - close it and mark as success
async function closeComplaint(req, res) {
  try {
    const [order] = await pool.query('SELECT * FROM don_hang_online WHERE id = ?', [req.params.id]);
    if (order.length === 0) return res.status(404).json({ ok: false, message: 'Not found' });
    
    await pool.query('UPDATE don_hang_online SET trang_thai = ?, ly_do_khieu_nai = ? WHERE id = ?', ['KHACH_DA_NHAN', 'Đã giải quyết khiếu nại', req.params.id]);
    res.json({ ok: true, message: 'Đã đóng khiếu nại thành công' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Retry delivery
async function retryDelivery(req, res) {
  try {
    const [order] = await pool.query('SELECT * FROM don_hang_online WHERE id = ?', [req.params.id]);
    if (order.length === 0) return res.status(404).json({ ok: false, message: 'Not found' });
    
    await pool.query('UPDATE don_hang_online SET trang_thai = ?, ly_do_khieu_nai = ? WHERE id = ?', ['DANG_GIAO', 'Tiếp tục giao lại', req.params.id]);
    res.json({ ok: true, message: 'Đã chuyển trạng thái Đang giao' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  confirmOrder,
  cancelOrder,
  completeOrder,
  updateOrder,
  getPendingOrdersCount,
  getRecentOrders,
  getUserOrders,
  updateFeedback,
  closeComplaint,
  retryDelivery,
};
