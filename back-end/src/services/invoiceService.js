const pool = require('../db');
const productService = require('./productService');

// Create invoice
async function createInvoice({ ma_hdb, ngay_ban, id_nhan_vien, id_khach_hang, ten_khach_hang, so_dien_thoai, ma_voucher, tong_tien_hang, tien_giam, tong_can_thanh_toan, phuong_thuc_thanh_toan, trang_thai = 'CHO_XAC_NHAN' }) {
  const [result] = await pool.query(
    `INSERT INTO hoa_don_ban (ma_hdb, ngay_ban, id_nhan_vien, id_khach_hang, ten_khach_hang, so_dien_thoai, ma_voucher, tong_tien_hang, tien_giam, tong_can_thanh_toan, phuong_thuc_thanh_toan, trang_thai)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [ma_hdb, ngay_ban, id_nhan_vien, id_khach_hang, ten_khach_hang, so_dien_thoai, ma_voucher, tong_tien_hang, tien_giam, tong_can_thanh_toan, phuong_thuc_thanh_toan, trang_thai]
  );
  return result.insertId;
}

// Add invoice items
async function addInvoiceItem(id_hoa_don, id_hang_hoa, gia_ban, so_luong, thanh_tien) {
  const [result] = await pool.query(
    `INSERT INTO chi_tiet_hoa_don_ban (id_hoa_don, id_hang_hoa, gia_ban, so_luong, thanh_tien)
     VALUES (?, ?, ?, ?, ?)`,
    [id_hoa_don, id_hang_hoa, gia_ban, so_luong, thanh_tien]
  );
  return result.insertId;
}

// Get all invoices (with pagination)
async function getAllInvoices(filters = {}) {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const offset = (page - 1) * limit;

  let countQuery = `
    SELECT COUNT(*) as count
    FROM hoa_don_ban h
    LEFT JOIN nhan_vien nv ON h.id_nhan_vien = nv.id
    WHERE 1=1
  `;

  let dataQuery = `
    SELECT h.*, nv.ho_ten as ten_nhan_vien
    FROM hoa_don_ban h
    LEFT JOIN nhan_vien nv ON h.id_nhan_vien = nv.id
    WHERE 1=1
  `;
  const countParams = [];
  const dataParams = [];

  if (filters.trang_thai) {
    countQuery += ` AND h.trang_thai = ?`;
    dataQuery += ` AND h.trang_thai = ?`;
    countParams.push(filters.trang_thai);
    dataParams.push(filters.trang_thai);
  }

  if (filters.search) {
    countQuery += ` AND (h.ma_hdb LIKE ? OR h.ten_khach_hang LIKE ?)`;
    dataQuery += ` AND (h.ma_hdb LIKE ? OR h.ten_khach_hang LIKE ?)`;
    countParams.push(`%${filters.search}%`, `%${filters.search}%`);
    dataParams.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.ngay_bat_dau && filters.ngay_ket_thuc) {
    countQuery += ` AND DATE(h.ngay_ban) BETWEEN ? AND ?`;
    dataQuery += ` AND DATE(h.ngay_ban) BETWEEN ? AND ?`;
    countParams.push(filters.ngay_bat_dau, filters.ngay_ket_thuc);
    dataParams.push(filters.ngay_bat_dau, filters.ngay_ket_thuc);
  }

  const [countRows] = await pool.query(countQuery, countParams);
  const totalItems = Number(countRows[0].count);

  dataQuery += ` ORDER BY h.ngay_ban DESC LIMIT ? OFFSET ?`;
  dataParams.push(limit, offset);

  const [rows] = await pool.query(dataQuery, dataParams);
  return { rows, totalItems, page, limit };
}

// Get invoice by ID
async function getInvoiceById(id) {
  const [invoices] = await pool.query(
    `SELECT * FROM hoa_don_ban WHERE id = ?`,
    [id]
  );

  if (!invoices[0]) return null;

  const invoice = invoices[0];

  const [items] = await pool.query(
    `SELECT ct.*, h.ten_sp
     FROM chi_tiet_hoa_don_ban ct
     LEFT JOIN hang_hoa h ON ct.id_hang_hoa = h.id
     WHERE ct.id_hoa_don = ?`,
    [id]
  );

  invoice.items = items;
  return invoice;
}

// Get invoice items
async function getInvoiceItems(id_hoa_don) {
  const [rows] = await pool.query(
    `SELECT ct.*, h.ten_sp
     FROM chi_tiet_hoa_don_ban ct
     LEFT JOIN hang_hoa h ON ct.id_hang_hoa = h.id
     WHERE ct.id_hoa_don = ?`,
    [id_hoa_don]
  );
  return rows;
}

// Confirm payment
async function confirmPayment(id_hoa_don) {
  // Update invoice status
  await pool.query(
    `UPDATE hoa_don_ban SET trang_thai = 'DA_THANH_TOAN' WHERE id = ?`,
    [id_hoa_don]
  );

  // Deduct stock for each item
  const items = await getInvoiceItems(id_hoa_don);
  for (const item of items) {
    await productService.updateStock(item.id_hang_hoa, -item.so_luong);
  }
}

// Update invoice
async function updateInvoice(id, updateData) {
  const fields = Object.keys(updateData).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updateData);
  
  await pool.query(
    `UPDATE hoa_don_ban SET ${fields} WHERE id = ?`,
    [...values, id]
  );
}

// Delete invoice
async function deleteInvoice(id) {
  await pool.query(
    `UPDATE hoa_don_ban SET trang_thai = 'DA_HUY' WHERE id = ?`,
    [id]
  );
}

// Generate invoice ID
async function generateInvoiceId() {
  const [rows] = await pool.query(`
    SELECT COUNT(*) as count FROM hoa_don_ban WHERE DATE(ngay_ban) = CURDATE()
  `);
  const count = rows[0].count + 1;
  const today = new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7);
  return `HDB${today}${String(count).padStart(4, '0')}`;
}

// Get today's revenue
async function getTodayRevenue() {
  const [rows] = await pool.query(`
    SELECT SUM(tong_can_thanh_toan) as tong_doanh_thu
    FROM hoa_don_ban
    WHERE DATE(ngay_ban) = CURDATE() AND trang_thai = 'DA_THANH_TOAN'
  `);
  return rows[0].tong_doanh_thu || 0;
}

// Get recent invoices
async function getRecentInvoices(limit = 10) {
  const [rows] = await pool.query(`
    SELECT h.*, nv.ho_ten as ten_nhan_vien
    FROM hoa_don_ban h
    LEFT JOIN nhan_vien nv ON h.id_nhan_vien = nv.id
    ORDER BY h.ngay_ban DESC
    LIMIT ?
  `, [limit]);
  return rows;
}

module.exports = {
  createInvoice,
  addInvoiceItem,
  getAllInvoices,
  getInvoiceById,
  getInvoiceItems,
  confirmPayment,
  updateInvoice,
  deleteInvoice,
  generateInvoiceId,
  getTodayRevenue,
  getRecentInvoices,
};
