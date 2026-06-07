const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '12345678',
  database: 'khang_baby'
});

async function fixOrder() {
  try {
    // Update the creation date of the original 20 products so they show up first
    await pool.query(`UPDATE hang_hoa SET ngay_tao = CURRENT_TIMESTAMP WHERE hinh_anh LIKE '/uploads/%'`);
    console.log('Successfully updated the timestamp of original products so they appear first!');
  } catch (error) {
    console.error('Update error:', error);
  } finally {
    await pool.end();
  }
}

fixOrder();
