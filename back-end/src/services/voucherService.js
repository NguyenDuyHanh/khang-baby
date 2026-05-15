const pool = require('../db');

// Create voucher
async function createVoucher({ ma_voucher, gia_tri_giam, phan_tram_giam, so_lan_su_dung_toi_da, gia_toi_thieu, han_su_dung_tu, han_su_dung_den, danh_muc_ap_dung }) {
  const [result] = await pool.query(
    `INSERT INTO voucher (ma_voucher, gia_tri_giam, phan_tram_giam, so_lan_su_dung_toi_da, gia_toi_thieu, han_su_dung_tu, han_su_dung_den, danh_muc_ap_dung)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [ma_voucher, gia_tri_giam, phan_tram_giam, so_lan_su_dung_toi_da, gia_toi_thieu, han_su_dung_tu, han_su_dung_den, danh_muc_ap_dung]
  );
  return result.insertId;
}

// Get all vouchers
async function getAllVouchers(filters = {}) {
  let query = `SELECT * FROM voucher WHERE 1=1`;
  const params = [];

  if (filters.trang_thai) {
    query += ` AND trang_thai = ?`;
    params.push(filters.trang_thai);
  }

  if (filters.search) {
    query += ` AND ma_voucher LIKE ?`;
    params.push(`%${filters.search}%`);
  }

  query += ` ORDER BY ngay_tao DESC`;

  const [rows] = await pool.query(query, params);
  return rows;
}

// Get voucher by code
async function getVoucherByCode(ma_voucher) {
  const [rows] = await pool.query(
    `SELECT * FROM voucher WHERE ma_voucher = ? AND trang_thai = 'HOAT_DONG'`,
    [ma_voucher]
  );
  return rows[0];
}

// Validate voucher
async function validateVoucher(ma_voucher, totalAmount) {
  const voucher = await getVoucherByCode(ma_voucher);

  if (!voucher) {
    return { valid: false, message: 'Voucher không tồn tại' };
  }

  // Check expiry
  const today = new Date().toISOString().split('T')[0];
  if (today < voucher.han_su_dung_tu || today > voucher.han_su_dung_den) {
    return { valid: false, message: 'Voucher đã hết hạn' };
  }

  // Check minimum amount
  if (totalAmount < voucher.gia_toi_thieu) {
    return { valid: false, message: `Đơn hàng phải tối thiểu ${voucher.gia_toi_thieu}đ` };
  }

  // Check usage limit
  if (voucher.so_lan_su_dung_toi_da && voucher.so_lan_su_dung >= voucher.so_lan_su_dung_toi_da) {
    return { valid: false, message: 'Voucher đã hết lượt sử dụng' };
  }

  // Calculate discount
  let discount = 0;
  if (voucher.gia_tri_giam) {
    discount = voucher.gia_tri_giam;
  } else if (voucher.phan_tram_giam) {
    discount = Math.floor((totalAmount * voucher.phan_tram_giam) / 100);
  }

  return { valid: true, discount, voucher };
}

// Increment voucher usage
async function incrementVoucherUsage(ma_voucher) {
  await pool.query(
    `UPDATE voucher SET so_lan_su_dung = so_lan_su_dung + 1 WHERE ma_voucher = ?`,
    [ma_voucher]
  );
}

// Update voucher
async function updateVoucher(id, updateData) {
  const fields = Object.keys(updateData).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updateData);
  
  await pool.query(
    `UPDATE voucher SET ${fields} WHERE id = ?`,
    [...values, id]
  );
}

// Delete voucher
async function deleteVoucher(id) {
  await pool.query(
    `UPDATE voucher SET trang_thai = 'KHONG_HOAT_DONG' WHERE id = ?`,
    [id]
  );
}

module.exports = {
  createVoucher,
  getAllVouchers,
  getVoucherByCode,
  validateVoucher,
  incrementVoucherUsage,
  updateVoucher,
  deleteVoucher,
};
