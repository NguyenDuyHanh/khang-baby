const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '12345678',
  database: 'khang_baby'
});

async function run() {
  try {
    const hash = await bcrypt.hash('123456', 10);
    const result = await pool.query(
      `UPDATE nhan_vien SET password = $1 WHERE email = 'admin@khangbaby.com'`,
      [hash]
    );
    if (result.rowCount === 0) {
      console.log("Admin user not found. Inserting new user...");
      await pool.query(
        `INSERT INTO nhan_vien (email, password, ho_ten, so_dien_thoai, vai_tro, trang_thai)
         VALUES ('admin@khangbaby.com', $1, 'Quản trị viên Khang Baby', '0912345678', 'MANAGER', 'HOAT_DONG')`,
        [hash]
      );
    }
    console.log("Admin user updated with password '123456'.");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
