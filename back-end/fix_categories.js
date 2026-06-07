const pool = require('./src/db');
async function fix() {
  await pool.query(`UPDATE hang_hoa SET trang_thai = 'NGUNG_KD' WHERE id_danh_muc IN (SELECT id FROM danh_muc WHERE trang_thai = 'KHONG_HOAT_DONG')`);
  console.log("Fixed!");
  process.exit(0);
}
fix();
