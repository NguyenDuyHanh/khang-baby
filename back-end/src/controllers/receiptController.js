const receiptService = require('../services/receiptService');

// Get all receipts
async function getAllReceipts(req, res) {
  try {
    const filters = {
      trang_thai_thanh_toan: req.query.trang_thai_thanh_toan,
      search: req.query.search,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    const { rows, totalItems, page, limit } = await receiptService.getAllReceipts(filters);
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

// Get receipt by ID
async function getReceiptById(req, res) {
  try {
    const receipt = await receiptService.getReceiptById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ ok: false, message: 'Receipt not found' });
    }
    res.json({ ok: true, data: receipt });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Create receipt
async function createReceipt(req, res) {
  try {
    const { id_nha_cung_cap, items } = req.body;

    if (!id_nha_cung_cap || !items || items.length === 0) {
      return res.status(400).json({ ok: false, message: 'Supplier and items required' });
    }

    // Generate receipt ID
    const ma_pnh = await receiptService.generateReceiptId();

    // Calculate totals
    let so_luong_dat = 0;
    let so_luong_thuc_nhan = 0;
    let tong_tien = 0;

    for (const item of items) {
      so_luong_dat += item.so_luong || 0;
      so_luong_thuc_nhan += item.so_luong || 0;
      tong_tien += (item.gia_nhap || 0) * (item.so_luong || 0);
    }

    const receiptData = {
      ma_pnh,
      ngay_nhap: new Date(),
      id_nha_cung_cap,
      id_nhan_vien: req.user.id,
      so_luong_dat,
      so_luong_thuc_nhan,
      tong_tien,
    };

    const id = await receiptService.createReceipt(receiptData);

    // Add items
    for (const item of items) {
      await receiptService.addReceiptItem(
        id,
        item.id_hang_hoa,
        item.gia_nhap,
        item.so_luong,
        item.ngay_san_xuat,
        item.han_su_dung,
        (item.gia_nhap || 0) * (item.so_luong || 0)
      );
    }

    res.status(201).json({
      ok: true,
      message: 'Receipt created successfully',
      id,
      ma_pnh,
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Update receipt
async function updateReceipt(req, res) {
  try {
    await receiptService.updateReceipt(req.params.id, req.body);

    res.json({
      ok: true,
      message: 'Receipt updated successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Delete receipt
async function deleteReceipt(req, res) {
  try {
    await receiptService.deleteReceipt(req.params.id);

    res.json({
      ok: true,
      message: 'Receipt deleted successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

module.exports = {
  getAllReceipts,
  getReceiptById,
  createReceipt,
  updateReceipt,
  deleteReceipt,
};
