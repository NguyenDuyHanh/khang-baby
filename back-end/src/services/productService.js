const pool = require('../db');

// Create product
async function createProduct({ ma_sp, ten_sp, id_danh_muc, id_nha_cung_cap, don_vi_tinh, gia_nhap, gia_ban, ton_kho_toi_thieu, han_su_dung, ngay_nhap_batch, hinh_anh }) {
  const [result] = await pool.query(
    `INSERT INTO hang_hoa (ma_sp, ten_sp, id_danh_muc, id_nha_cung_cap, don_vi_tinh, gia_nhap, gia_ban, ton_kho_toi_thieu, han_su_dung, ngay_nhap_batch, hinh_anh) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [ma_sp, ten_sp, id_danh_muc, id_nha_cung_cap, don_vi_tinh, gia_nhap, gia_ban, ton_kho_toi_thieu, han_su_dung, ngay_nhap_batch, hinh_anh || null]
  );
  return result.insertId;
}

// Get all products (with pagination)
async function getAllProducts(filters = {}) {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const offset = (page - 1) * limit;

  let countQuery = `
    SELECT COUNT(*) as count
    FROM hang_hoa h
    LEFT JOIN danh_muc d ON h.id_danh_muc = d.id
    LEFT JOIN nha_cung_cap n ON h.id_nha_cung_cap = n.id
    WHERE 1=1
  `;

  let dataQuery = `
    SELECT h.*, d.ten_danh_muc, n.ten_ncc
    FROM hang_hoa h
    LEFT JOIN danh_muc d ON h.id_danh_muc = d.id
    LEFT JOIN nha_cung_cap n ON h.id_nha_cung_cap = n.id
    WHERE 1=1
  `;
  const countParams = [];
  const dataParams = [];

  if (filters.danh_muc) {
    countQuery += ` AND h.id_danh_muc = ?`;
    dataQuery += ` AND h.id_danh_muc = ?`;
    countParams.push(filters.danh_muc);
    dataParams.push(filters.danh_muc);
  }

  if (filters.nha_cung_cap) {
    countQuery += ` AND h.id_nha_cung_cap = ?`;
    dataQuery += ` AND h.id_nha_cung_cap = ?`;
    countParams.push(filters.nha_cung_cap);
    dataParams.push(filters.nha_cung_cap);
  }

  if (filters.search) {
    countQuery += ` AND (h.ma_sp LIKE ? OR h.ten_sp LIKE ?)`;
    dataQuery += ` AND (h.ma_sp LIKE ? OR h.ten_sp LIKE ?)`;
    countParams.push(`%${filters.search}%`, `%${filters.search}%`);
    dataParams.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.trang_thai) {
    countQuery += ` AND h.trang_thai = ?`;
    dataQuery += ` AND h.trang_thai = ?`;
    countParams.push(filters.trang_thai);
    dataParams.push(filters.trang_thai);
  }

  if (filters.ton_kho_trang_thai) {
    if (filters.ton_kho_trang_thai === 'OUT') {
      countQuery += ` AND h.ton_kho <= 0`;
      dataQuery += ` AND h.ton_kho <= 0`;
    } else if (filters.ton_kho_trang_thai === 'LOW') {
      countQuery += ` AND h.ton_kho > 0 AND h.ton_kho <= h.ton_kho_toi_thieu`;
      dataQuery += ` AND h.ton_kho > 0 AND h.ton_kho <= h.ton_kho_toi_thieu`;
    } else if (filters.ton_kho_trang_thai === 'EXPIRING') {
      countQuery += ` AND h.han_su_dung IS NOT NULL AND h.han_su_dung <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`;
      dataQuery += ` AND h.han_su_dung IS NOT NULL AND h.han_su_dung <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`;
    }
  }

  const [countRows] = await pool.query(countQuery, countParams);
  const totalItems = Number(countRows[0].count);

  dataQuery += ` ORDER BY h.ngay_tao DESC LIMIT ? OFFSET ?`;
  dataParams.push(limit, offset);

  const [rows] = await pool.query(dataQuery, dataParams);
  return { rows, totalItems, page, limit };
}

// Get product by ID
async function getProductById(id) {
  const [rows] = await pool.query(
    `SELECT h.*, d.ten_danh_muc, n.ten_ncc
     FROM hang_hoa h
     LEFT JOIN danh_muc d ON h.id_danh_muc = d.id
     LEFT JOIN nha_cung_cap n ON h.id_nha_cung_cap = n.id
     WHERE h.id = ?`,
    [id]
  );
  return rows[0];
}

// Update product
async function updateProduct(id, updateData) {
  const fields = Object.keys(updateData).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updateData);
  
  await pool.query(
    `UPDATE hang_hoa SET ${fields} WHERE id = ?`,
    [...values, id]
  );
}

// Update stock
async function updateStock(id, soLuong) {
  await pool.query(
    `UPDATE hang_hoa SET ton_kho = ton_kho + ? WHERE id = ?`,
    [soLuong, id]
  );
}

// Delete product
async function deleteProduct(id) {
  await pool.query(
    `UPDATE hang_hoa SET trang_thai = 'NGUNG_KD' WHERE id = ?`,
    [id]
  );
}

// Get products near minimum stock
async function getProductsNearMinimumStock() {
  const [rows] = await pool.query(`
    SELECT h.*, d.ten_danh_muc, n.ten_ncc
    FROM hang_hoa h
    LEFT JOIN danh_muc d ON h.id_danh_muc = d.id
    LEFT JOIN nha_cung_cap n ON h.id_nha_cung_cap = n.id
    WHERE h.ton_kho <= h.ton_kho_toi_thieu AND h.trang_thai = 'HOAT_DONG'
    ORDER BY h.ton_kho ASC
  `);
  return rows;
}

// Get products near/past expiry
async function getProductsNearExpiry(days = 30) {
  const [rows] = await pool.query(`
    SELECT h.*, d.ten_danh_muc, n.ten_ncc
    FROM hang_hoa h
    LEFT JOIN danh_muc d ON h.id_danh_muc = d.id
    LEFT JOIN nha_cung_cap n ON h.id_nha_cung_cap = n.id
    WHERE h.han_su_dung IS NOT NULL 
      AND h.han_su_dung <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
      AND h.trang_thai = 'HOAT_DONG'
    ORDER BY h.han_su_dung ASC
  `, [days]);
  return rows;
}

// Get categories
async function getCategories(includeInactive = false) {
  let query = `SELECT * FROM danh_muc`;
  if (!includeInactive) {
    query += ` WHERE trang_thai = 'HOAT_DONG'`;
  }
  const [rows] = await pool.query(query);
  return rows;
}

// Create category
async function createCategory(ten_danh_muc, mo_ta = '') {
  const [result] = await pool.query(
    `INSERT INTO danh_muc (ten_danh_muc, mo_ta) VALUES (?, ?)`,
    [ten_danh_muc, mo_ta]
  );
  return result.insertId;
}

// Update category
async function updateCategory(id, { ten_danh_muc, mo_ta, trang_thai }) {
  await pool.query(
    `UPDATE danh_muc SET ten_danh_muc = ?, mo_ta = ?, trang_thai = ? WHERE id = ?`,
    [ten_danh_muc, mo_ta, trang_thai, id]
  );
}

// Delete category
async function deleteCategory(id) {
  await pool.query(
    `UPDATE danh_muc SET trang_thai = 'KHONG_HOAT_DONG' WHERE id = ?`,
    [id]
  );
}

// Get suppliers
async function getSuppliers() {
  const [rows] = await pool.query(`
    SELECT * FROM nha_cung_cap WHERE trang_thai = 'HOAT_DONG'
  `);
  return rows;
}

// Create supplier
async function createSupplier({ ten_ncc, email, so_dien_thoai, dia_chi }) {
  const [result] = await pool.query(
    `INSERT INTO nha_cung_cap (ten_ncc, email, so_dien_thoai, dia_chi) VALUES (?, ?, ?, ?)`,
    [ten_ncc, email, so_dien_thoai, dia_chi]
  );
  return result.insertId;
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateStock,
  deleteProduct,
  getProductsNearMinimumStock,
  getProductsNearExpiry,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSuppliers,
  createSupplier,
};
