const pool = require('../db');
const productService = require('./productService');

// Create return sheet
async function createReturn({ ma_pth, id_phieu_nhap, id_nhan_vien, ngay_tra, ly_do, items = [] }) {
  // Generate code if not provided
  let code = ma_pth;
  if (!code) {
    const [rows] = await pool.query(`SELECT COUNT(*) as count FROM phieu_tra_hang`);
    const count = Number(rows[0].count) + 1;
    code = `PTH${String(count).padStart(4, '0')}`;
  }

  const [result] = await pool.query(
    `INSERT INTO phieu_tra_hang (ma_pth, id_phieu_nhap, id_nhan_vien, ngay_tra, ly_do)
     VALUES (?, ?, ?, ?, ?)`,
    [code, id_phieu_nhap, id_nhan_vien, ngay_tra, ly_do]
  );

  const returnId = result.insertId;

  // Insert items and decrease stock
  for (const item of items) {
    await pool.query(
      `INSERT INTO chi_tiet_phieu_tra (id_phieu_tra, id_hang_hoa, so_luong_tra, gia_nhap)
       VALUES (?, ?, ?, ?)`,
      [returnId, item.id_hang_hoa, item.so_luong_tra, item.gia_nhap]
    );

    // Decrease stock because we returned goods to supplier
    await productService.updateStock(item.id_hang_hoa, -Number(item.so_luong_tra));
  }

  return returnId;
}

// Get all returns (with pagination)
async function getAllReturns(filters = {}) {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const offset = (page - 1) * limit;

  let countQuery = `
    SELECT COUNT(*) as count
    FROM phieu_tra_hang r
    LEFT JOIN phieu_nhap_hang p ON r.id_phieu_nhap = p.id
    WHERE 1=1
  `;

  let dataQuery = `
    SELECT r.*, nv.ho_ten as ten_nhan_vien, p.ma_pnh
    FROM phieu_tra_hang r
    LEFT JOIN nhan_vien nv ON r.id_nhan_vien = nv.id
    LEFT JOIN phieu_nhap_hang p ON r.id_phieu_nhap = p.id
    WHERE 1=1
  `;
  const countParams = [];
  const dataParams = [];

  if (filters.search) {
    countQuery += ` AND (r.ma_pth LIKE ? OR p.ma_pnh LIKE ?)`;
    dataQuery += ` AND (r.ma_pth LIKE ? OR p.ma_pnh LIKE ?)`;
    countParams.push(`%${filters.search}%`, `%${filters.search}%`);
    dataParams.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const [countRows] = await pool.query(countQuery, countParams);
  const totalItems = Number(countRows[0].count);

  dataQuery += ` ORDER BY r.ngay_tra DESC LIMIT ? OFFSET ?`;
  dataParams.push(limit, offset);

  const [rows] = await pool.query(dataQuery, dataParams);
  return { rows, totalItems, page, limit };
}

// Get return by ID
async function getReturnById(id) {
  const [returns] = await pool.query(
    `SELECT r.*, nv.ho_ten as ten_nhan_vien, p.ma_pnh
     FROM phieu_tra_hang r
     LEFT JOIN nhan_vien nv ON r.id_nhan_vien = nv.id
     LEFT JOIN phieu_nhap_hang p ON r.id_phieu_nhap = p.id
     WHERE r.id = ?`,
    [id]
  );

  if (!returns[0]) return null;

  const returnSheet = returns[0];

  const [items] = await pool.query(
    `SELECT ct.*, h.ten_sp, h.sku
     FROM chi_tiet_phieu_tra ct
     LEFT JOIN hang_hoa h ON ct.id_hang_hoa = h.id
     WHERE ct.id_phieu_tra = ?`,
    [id]
  );

  returnSheet.items = items;
  return returnSheet;
}

// Update return
async function updateReturn(id, { id_phieu_nhap, ngay_tra, ly_do, items = [] }) {
  // First, reverse old stock changes
  const [oldItems] = await pool.query(`SELECT * FROM chi_tiet_phieu_tra WHERE id_phieu_tra = ?`, [id]);
  for (const oldItem of oldItems) {
    await productService.updateStock(oldItem.id_hang_hoa, Number(oldItem.so_luong_tra));
  }

  // Update return main info
  await pool.query(
    `UPDATE phieu_tra_hang SET id_phieu_nhap = ?, ngay_tra = ?, ly_do = ? WHERE id = ?`,
    [id_phieu_nhap, ngay_tra, ly_do, id]
  );

  // Delete old details
  await pool.query(`DELETE FROM chi_tiet_phieu_tra WHERE id_phieu_tra = ?`, [id]);

  // Insert new details and apply new stock changes
  for (const item of items) {
    await pool.query(
      `INSERT INTO chi_tiet_phieu_tra (id_phieu_tra, id_hang_hoa, so_luong_tra, gia_nhap)
       VALUES (?, ?, ?, ?)`,
      [id, item.id_hang_hoa, item.so_luong_tra, item.gia_nhap]
    );

    await productService.updateStock(item.id_hang_hoa, -Number(item.so_luong_tra));
  }
}

// Delete return
async function deleteReturn(id) {
  // Reverse stock changes
  const [items] = await pool.query(`SELECT * FROM chi_tiet_phieu_tra WHERE id_phieu_tra = ?`, [id]);
  for (const item of items) {
    await productService.updateStock(item.id_hang_hoa, Number(item.so_luong_tra));
  }

  // Delete return sheet
  await pool.query(`DELETE FROM phieu_tra_hang WHERE id = ?`, [id]);
}

module.exports = {
  createReturn,
  getAllReturns,
  getReturnById,
  updateReturn,
  deleteReturn,
};
