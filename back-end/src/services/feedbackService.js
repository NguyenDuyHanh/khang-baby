const pool = require('../db');

// Create feedback sheet
async function createFeedback({ ma_phht, id_nhan_vien, id_phieu_nhap, items = [] }) {
  // Generate code if not provided
  let code = ma_phht;
  if (!code) {
    const [rows] = await pool.query(`SELECT COUNT(*) as count FROM phieu_phan_hoi_hang_thieu`);
    const count = Number(rows[0].count) + 1;
    code = `PHHT${String(count).padStart(4, '0')}`;
  }

  // Calculate total missing value
  let totalMissing = 0;
  items.forEach(item => {
    totalMissing += Number(item.so_luong_thieu_hut || 0) * Number(item.gia_tri_thieu_hut || 0);
  });

  const [result] = await pool.query(
    `INSERT INTO phieu_phan_hoi_hang_thieu (ma_phht, id_nhan_vien, id_phieu_nhap, tong_thieu_hut)
     VALUES (?, ?, ?, ?)`,
    [code, id_nhan_vien, id_phieu_nhap, totalMissing]
  );

  const feedbackId = result.insertId;

  // Insert items
  for (const item of items) {
    await pool.query(
      `INSERT INTO chi_tiet_phieu_phan_hoi (id_phieu_phan_hoi, id_hang_hoa, so_luong_thieu_hut, gia_tri_thieu_hut)
       VALUES (?, ?, ?, ?)`,
      [feedbackId, item.id_hang_hoa, item.so_luong_thieu_hut, item.gia_tri_thieu_hut]
    );
  }

  return feedbackId;
}

// Get all feedbacks (with pagination)
async function getAllFeedbacks(filters = {}) {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const offset = (page - 1) * limit;

  let countQuery = `
    SELECT COUNT(*) as count
    FROM phieu_phan_hoi_hang_thieu f
    LEFT JOIN phieu_nhap_hang p ON f.id_phieu_nhap = p.id
    LEFT JOIN nha_cung_cap n ON p.id_nha_cung_cap = n.id
    WHERE 1=1
  `;

  let dataQuery = `
    SELECT f.*, nv.ho_ten as ten_nhan_vien, p.ma_pnh, n.ten_ncc
    FROM phieu_phan_hoi_hang_thieu f
    LEFT JOIN nhan_vien nv ON f.id_nhan_vien = nv.id
    LEFT JOIN phieu_nhap_hang p ON f.id_phieu_nhap = p.id
    LEFT JOIN nha_cung_cap n ON p.id_nha_cung_cap = n.id
    WHERE 1=1
  `;
  const countParams = [];
  const dataParams = [];

  if (filters.search) {
    countQuery += ` AND (f.ma_phht LIKE ? OR p.ma_pnh LIKE ? OR n.ten_ncc LIKE ?)`;
    dataQuery += ` AND (f.ma_phht LIKE ? OR p.ma_pnh LIKE ? OR n.ten_ncc LIKE ?)`;
    countParams.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    dataParams.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  const [countRows] = await pool.query(countQuery, countParams);
  const totalItems = Number(countRows[0].count);

  dataQuery += ` ORDER BY f.ngay_tao DESC LIMIT ? OFFSET ?`;
  dataParams.push(limit, offset);

  const [rows] = await pool.query(dataQuery, dataParams);
  return { rows, totalItems, page, limit };
}

// Get feedback by ID
async function getFeedbackById(id) {
  const [feedbacks] = await pool.query(
    `SELECT f.*, nv.ho_ten as ten_nhan_vien, p.ma_pnh, n.ten_ncc
     FROM phieu_phan_hoi_hang_thieu f
     LEFT JOIN nhan_vien nv ON f.id_nhan_vien = nv.id
     LEFT JOIN phieu_nhap_hang p ON f.id_phieu_nhap = p.id
     LEFT JOIN nha_cung_cap n ON p.id_nha_cung_cap = n.id
     WHERE f.id = ?`,
    [id]
  );

  if (!feedbacks[0]) return null;

  const feedback = feedbacks[0];

  const [items] = await pool.query(
    `SELECT ct.*, h.ten_sp, h.ma_sp AS sku
     FROM chi_tiet_phieu_phan_hoi ct
     LEFT JOIN hang_hoa h ON ct.id_hang_hoa = h.id
     WHERE ct.id_phieu_phan_hoi = ?`,
    [id]
  );

  feedback.items = items;
  return feedback;
}

// Update feedback
async function updateFeedback(id, { id_phieu_nhap, items = [] }) {
  let totalMissing = 0;
  items.forEach(item => {
    totalMissing += Number(item.so_luong_thieu_hut || 0) * Number(item.gia_tri_thieu_hut || 0);
  });

  await pool.query(
    `UPDATE phieu_phan_hoi_hang_thieu SET id_phieu_nhap = ?, tong_thieu_hut = ? WHERE id = ?`,
    [id_phieu_nhap, totalMissing, id]
  );

  // Re-sync items: delete and insert
  await pool.query(`DELETE FROM chi_tiet_phieu_phan_hoi WHERE id_phieu_phan_hoi = ?`, [id]);

  for (const item of items) {
    await pool.query(
      `INSERT INTO chi_tiet_phieu_phan_hoi (id_phieu_phan_hoi, id_hang_hoa, so_luong_thieu_hut, gia_tri_thieu_hut)
       VALUES (?, ?, ?, ?)`,
      [id, item.id_hang_hoa, item.so_luong_thieu_hut, item.gia_tri_thieu_hut]
    );
  }
}

// Delete feedback
async function deleteFeedback(id) {
  await pool.query(`DELETE FROM phieu_phan_hoi_hang_thieu WHERE id = ?`, [id]);
}

module.exports = {
  createFeedback,
  getAllFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
};
