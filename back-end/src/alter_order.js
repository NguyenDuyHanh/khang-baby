require('dotenv').config();
const pool = require('./db');

async function main() {
  try {
    console.log('Altering don_hang_online...');
    
    try {
      await pool.query(`ALTER TABLE don_hang_online ADD COLUMN ly_do_khieu_nai TEXT;`);
      console.log('Added ly_do_khieu_nai column.');
    } catch (e) {
      console.log('Column ly_do_khieu_nai may already exist.');
    }

    await pool.query(`ALTER TABLE don_hang_online DROP CONSTRAINT IF EXISTS don_hang_online_trang_thai_check`);
    await pool.query(`ALTER TABLE don_hang_online ADD CONSTRAINT don_hang_online_trang_thai_check CHECK (trang_thai IN ('CHO_XU_LY', 'DA_XAC_NHAN', 'DANG_DONG_GOI', 'DANG_GIAO', 'DA_HOAN_THANH', 'DA_HUY', 'KHACH_DA_NHAN', 'KHIEU_NAI'))`);
    
    console.log('Success altering don_hang_online!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
