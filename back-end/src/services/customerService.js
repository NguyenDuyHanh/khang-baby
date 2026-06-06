const pool = require('../db');

// Upsert a customer record when an order/invoice is created
async function upsertCustomer({ ho_ten, so_dien_thoai, dia_chi, email, chi_tieu_moi }) {
  if (!so_dien_thoai) return null; // We need a phone number to identify

  // Check if customer exists
  const [rows] = await pool.query(
    `SELECT id, tong_don_hang, tong_chi_tieu FROM khach_hang WHERE so_dien_thoai = ?`,
    [so_dien_thoai]
  );

  if (rows.length > 0) {
    // Update existing customer
    const customer = rows[0];
    const tong_don_hang = Number(customer.tong_don_hang) + 1;
    const tong_chi_tieu = Number(customer.tong_chi_tieu) + Number(chi_tieu_moi);

    await pool.query(
      `UPDATE khach_hang 
       SET tong_don_hang = ?, tong_chi_tieu = ?, ho_ten = ?, dia_chi = COALESCE(dia_chi, ?) 
       WHERE so_dien_thoai = ?`,
      [tong_don_hang, tong_chi_tieu, ho_ten || 'Khách lẻ', dia_chi, so_dien_thoai]
    );
    return customer.id;
  } else {
    // Insert new customer
    const [result] = await pool.query(
      `INSERT INTO khach_hang (ho_ten, so_dien_thoai, email, dia_chi, tong_don_hang, tong_chi_tieu)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ho_ten || 'Khách lẻ', so_dien_thoai, email || null, dia_chi || null, 1, chi_tieu_moi]
    );
    return result.insertId;
  }
}

// Get all customers (with pagination and search)
async function getAllCustomers(filters = {}) {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const offset = (page - 1) * limit;

  let countQuery = `SELECT COUNT(*) as count FROM khach_hang WHERE 1=1`;
  let dataQuery = `SELECT * FROM khach_hang WHERE 1=1`;
  const countParams = [];
  const dataParams = [];

  if (filters.search) {
    countQuery += ` AND (ho_ten LIKE ? OR so_dien_thoai LIKE ?)`;
    dataQuery += ` AND (ho_ten LIKE ? OR so_dien_thoai LIKE ?)`;
    countParams.push(`%${filters.search}%`, `%${filters.search}%`);
    dataParams.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const [countRows] = await pool.query(countQuery, countParams);
  const totalItems = Number(countRows[0].count);

  dataQuery += ` ORDER BY ngay_tao DESC LIMIT ? OFFSET ?`;
  dataParams.push(limit, offset);

  const [rows] = await pool.query(dataQuery, dataParams);
  return { rows, totalItems, page, limit };
}

module.exports = {
  upsertCustomer,
  getAllCustomers
};
