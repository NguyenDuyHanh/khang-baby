const pool = require('../db');
const productService = require('./productService');

// Create receipt
async function createReceipt({ ma_pnh, ngay_nhap, id_nha_cung_cap, id_nhan_vien, so_luong_dat, so_luong_thuc_nhan, tong_tien }) {
  const [result] = await pool.query(
    `INSERT INTO phieu_nhap_hang (ma_pnh, ngay_nhap, id_nha_cung_cap, id_nhan_vien, so_luong_dat, so_luong_thuc_nhan, con_thieu, tong_tien)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [ma_pnh, ngay_nhap, id_nha_cung_cap, id_nhan_vien, so_luong_dat, so_luong_thuc_nhan, so_luong_dat - so_luong_thuc_nhan, tong_tien]
  );
  return result.insertId;
}

// Add receipt item
async function addReceiptItem(id_phieu_nhap, id_hang_hoa, gia_nhap, so_luong, ngay_san_xuat, han_su_dung, thanh_tien) {
  const [result] = await pool.query(
    `INSERT INTO chi_tiet_phieu_nhap (id_phieu_nhap, id_hang_hoa, gia_nhap, so_luong, ngay_san_xuat, han_su_dung, thanh_tien)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id_phieu_nhap, id_hang_hoa, gia_nhap, so_luong, ngay_san_xuat, han_su_dung, thanh_tien]
  );

  // Update stock
  await productService.updateStock(id_hang_hoa, so_luong);

  return result.insertId;
}

// Get all receipts
async function getAllReceipts(filters = {}) {
  let query = `
    SELECT p.*, n.ten_ncc, nv.ho_ten as ten_nhan_vien
    FROM phieu_nhap_hang p
    LEFT JOIN nha_cung_cap n ON p.id_nha_cung_cap = n.id
    LEFT JOIN nhan_vien nv ON p.id_nhan_vien = nv.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.trang_thai_thanh_toan) {
    query += ` AND p.trang_thai_thanh_toan = ?`;
    params.push(filters.trang_thai_thanh_toan);
  }

  if (filters.search) {
    query += ` AND (p.ma_pnh LIKE ? OR n.ten_ncc LIKE ?)`;
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  query += ` ORDER BY p.ngay_nhap DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
}

// Get receipt by ID
async function getReceiptById(id) {
  const [receipts] = await pool.query(
    `SELECT p.*, n.ten_ncc, nv.ho_ten as ten_nhan_vien
     FROM phieu_nhap_hang p
     LEFT JOIN nha_cung_cap n ON p.id_nha_cung_cap = n.id
     LEFT JOIN nhan_vien nv ON p.id_nhan_vien = nv.id
     WHERE p.id = ?`,
    [id]
  );

  if (!receipts[0]) return null;

  const receipt = receipts[0];

  const [items] = await pool.query(
    `SELECT ct.*, h.ten_sp
     FROM chi_tiet_phieu_nhap ct
     LEFT JOIN hang_hoa h ON ct.id_hang_hoa = h.id
     WHERE ct.id_phieu_nhap = ?`,
    [id]
  );

  receipt.items = items;
  return receipt;
}

// Update receipt
async function updateReceipt(id, updateData) {
  const fields = Object.keys(updateData).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updateData);
  
  await pool.query(
    `UPDATE phieu_nhap_hang SET ${fields} WHERE id = ?`,
    [...values, id]
  );
}

// Delete receipt
async function deleteReceipt(id) {
  // Get items to reverse stock
  const [items] = await pool.query(
    `SELECT * FROM chi_tiet_phieu_nhap WHERE id_phieu_nhap = ?`,
    [id]
  );

  // Reverse stock for each item
  for (const item of items) {
    await productService.updateStock(item.id_hang_hoa, -item.so_luong);
  }

  // Delete receipt
  await pool.query(
    `DELETE FROM phieu_nhap_hang WHERE id = ?`,
    [id]
  );
}

// Generate receipt ID
async function generateReceiptId() {
  const [rows] = await pool.query(`
    SELECT COUNT(*) as count FROM phieu_nhap_hang
  `);
  const count = rows[0].count + 1;
  return `PN${String(count).padStart(4, '0')}`;
}

module.exports = {
  createReceipt,
  addReceiptItem,
  getAllReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt,
  generateReceiptId,
};
