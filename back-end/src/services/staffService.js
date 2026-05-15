const pool = require('../db');
const { hashPassword, comparePassword, createToken } = require('../utils/helpers');

// Register new staff
async function registerStaff(email, password, ho_ten, so_dien_thoai, vai_tro) {
  const hashedPassword = await hashPassword(password);

  const [result] = await pool.query(
    `INSERT INTO nhan_vien (email, password, ho_ten, so_dien_thoai, vai_tro) 
     VALUES (?, ?, ?, ?, ?)`,
    [email, hashedPassword, ho_ten, so_dien_thoai, vai_tro]
  );

  return result.insertId;
}

// Login staff
async function loginStaff(email, password) {
  const [rows] = await pool.query(
    `SELECT * FROM nhan_vien WHERE email = ? AND trang_thai = 'HOAT_DONG'`,
    [email]
  );

  if (rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const staff = rows[0];
  const isPasswordValid = await comparePassword(password, staff.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = createToken({
    id: staff.id,
    email: staff.email,
    ho_ten: staff.ho_ten,
    vai_tro: staff.vai_tro,
  });

  return { token, staff: { id: staff.id, email: staff.email, ho_ten: staff.ho_ten, vai_tro: staff.vai_tro } };
}

// Get all staff
async function getAllStaff() {
  const [rows] = await pool.query(`
    SELECT id, email, ho_ten, so_dien_thoai, vai_tro, trang_thai, ngay_tao
    FROM nhan_vien
    ORDER BY ngay_tao DESC
  `);
  return rows;
}

// Get staff by ID
async function getStaffById(id) {
  const [rows] = await pool.query(
    `SELECT * FROM nhan_vien WHERE id = ?`,
    [id]
  );
  return rows[0];
}

// Update staff
async function updateStaff(id, { ho_ten, so_dien_thoai, vai_tro, trang_thai }) {
  await pool.query(
    `UPDATE nhan_vien SET ho_ten = ?, so_dien_thoai = ?, vai_tro = ?, trang_thai = ? WHERE id = ?`,
    [ho_ten, so_dien_thoai, vai_tro, trang_thai, id]
  );
}

// Change password
async function changePassword(id, newPassword) {
  const hashedPassword = await hashPassword(newPassword);
  await pool.query(
    `UPDATE nhan_vien SET password = ? WHERE id = ?`,
    [hashedPassword, id]
  );
}

// Delete/Deactivate staff
async function deleteStaff(id) {
  await pool.query(
    `UPDATE nhan_vien SET trang_thai = 'KHOA' WHERE id = ?`,
    [id]
  );
}

module.exports = {
  registerStaff,
  loginStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  changePassword,
  deleteStaff,
};
