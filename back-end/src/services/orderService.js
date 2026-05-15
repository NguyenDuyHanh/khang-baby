const pool = require('../db');
const productService = require('./productService');

// Create online order
async function createOrder({ ma_don, ngay_dat, ten_khach_hang, so_dien_thoai, dia_chi_giao, ghi_chu_don, kenh_dat_hang, id_nhan_vien, ma_voucher, don_vi_van_chuyen, phi_giao_hang, ngay_giao_du_kien, tong_tien_hang, tien_giam, tong_thanh_toan, phuong_thuc_thanh_toan }) {
  const [result] = await pool.query(
    `INSERT INTO don_hang_online (ma_don, ngay_dat, ten_khach_hang, so_dien_thoai, dia_chi_giao, ghi_chu_don, kenh_dat_hang, id_nhan_vien, ma_voucher, don_vi_van_chuyen, phi_giao_hang, ngay_giao_du_kien, tong_tien_hang, tien_giam, tong_thanh_toan, phuong_thuc_thanh_toan)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [ma_don, ngay_dat, ten_khach_hang, so_dien_thoai, dia_chi_giao, ghi_chu_don, kenh_dat_hang, id_nhan_vien, ma_voucher, don_vi_van_chuyen, phi_giao_hang, ngay_giao_du_kien, tong_tien_hang, tien_giam, tong_thanh_toan, phuong_thuc_thanh_toan]
  );
  return result.insertId;
}

// Add order item
async function addOrderItem(id_don_hang, id_hang_hoa, gia_ban, so_luong, thanh_tien) {
  const [result] = await pool.query(
    `INSERT INTO chi_tiet_don_hang_online (id_don_hang, id_hang_hoa, gia_ban, so_luong, thanh_tien)
     VALUES (?, ?, ?, ?, ?)`,
    [id_don_hang, id_hang_hoa, gia_ban, so_luong, thanh_tien]
  );
  return result.insertId;
}

// Get all orders
async function getAllOrders(filters = {}) {
  let query = `
    SELECT o.*, nv.ho_ten as ten_nhan_vien
    FROM don_hang_online o
    LEFT JOIN nhan_vien nv ON o.id_nhan_vien = nv.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.trang_thai) {
    query += ` AND o.trang_thai = ?`;
    params.push(filters.trang_thai);
  }

  if (filters.search) {
    query += ` AND (o.ma_don LIKE ? OR o.ten_khach_hang LIKE ?)`;
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.kenh_dat_hang) {
    query += ` AND o.kenh_dat_hang = ?`;
    params.push(filters.kenh_dat_hang);
  }

  if (filters.ngay_bat_dau && filters.ngay_ket_thuc) {
    query += ` AND DATE(o.ngay_dat) BETWEEN ? AND ?`;
    params.push(filters.ngay_bat_dau, filters.ngay_ket_thuc);
  }

  query += ` ORDER BY o.ngay_dat DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
}

// Get order by ID
async function getOrderById(id) {
  const [orders] = await pool.query(
    `SELECT * FROM don_hang_online WHERE id = ?`,
    [id]
  );

  if (!orders[0]) return null;

  const order = orders[0];

  const [items] = await pool.query(
    `SELECT ct.*, h.ten_sp
     FROM chi_tiet_don_hang_online ct
     LEFT JOIN hang_hoa h ON ct.id_hang_hoa = h.id
     WHERE ct.id_don_hang = ?`,
    [id]
  );

  order.items = items;
  return order;
}

// Update order
async function updateOrder(id, updateData) {
  const fields = Object.keys(updateData).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updateData);
  
  await pool.query(
    `UPDATE don_hang_online SET ${fields} WHERE id = ?`,
    [...values, id]
  );
}

// Confirm order (update status and deduct stock)
async function confirmOrder(id) {
  // Get order items
  const [items] = await pool.query(
    `SELECT * FROM chi_tiet_don_hang_online WHERE id_don_hang = ?`,
    [id]
  );

  // Deduct stock for each item
  for (const item of items) {
    await productService.updateStock(item.id_hang_hoa, -item.so_luong);
  }

  // Update order status
  await pool.query(
    `UPDATE don_hang_online SET trang_thai = 'DA_XAC_NHAN' WHERE id = ?`,
    [id]
  );
}

// Cancel order (reverse stock if already confirmed)
async function cancelOrder(id) {
  const [orders] = await pool.query(
    `SELECT trang_thai FROM don_hang_online WHERE id = ?`,
    [id]
  );

  if (orders[0].trang_thai === 'DA_XAC_NHAN' || orders[0].trang_thai === 'DANG_DONG_GOI' || orders[0].trang_thai === 'DANG_GIAO') {
    // Get order items to reverse stock
    const [items] = await pool.query(
      `SELECT * FROM chi_tiet_don_hang_online WHERE id_don_hang = ?`,
      [id]
    );

    // Reverse stock for each item
    for (const item of items) {
      await productService.updateStock(item.id_hang_hoa, item.so_luong);
    }
  }

  // Update order status
  await pool.query(
    `UPDATE don_hang_online SET trang_thai = 'DA_HUY' WHERE id = ?`,
    [id]
  );
}

// Complete order
async function completeOrder(id) {
  await pool.query(
    `UPDATE don_hang_online SET trang_thai = 'DA_HOAN_THANH' WHERE id = ?`,
    [id]
  );
}

// Generate order ID
async function generateOrderId() {
  const [rows] = await pool.query(`
    SELECT COUNT(*) as count FROM don_hang_online WHERE DATE(ngay_dat) = CURDATE()
  `);
  const count = rows[0].count + 1;
  const today = new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7);
  return `HD${today}${String(count).padStart(4, '0')}`;
}

// Get pending orders count
async function getPendingOrdersCount() {
  const [rows] = await pool.query(`
    SELECT COUNT(*) as count FROM don_hang_online WHERE trang_thai = 'CHO_XU_LY'
  `);
  return rows[0].count;
}

// Get recent orders
async function getRecentOrders(limit = 10) {
  const [rows] = await pool.query(`
    SELECT o.*, nv.ho_ten as ten_nhan_vien
    FROM don_hang_online o
    LEFT JOIN nhan_vien nv ON o.id_nhan_vien = nv.id
    ORDER BY o.ngay_dat DESC
    LIMIT ?
  `, [limit]);
  return rows;
}

module.exports = {
  createOrder,
  addOrderItem,
  getAllOrders,
  getOrderById,
  updateOrder,
  confirmOrder,
  cancelOrder,
  completeOrder,
  generateOrderId,
  getPendingOrdersCount,
  getRecentOrders,
};
