const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '12345678',
  database: 'khang_baby'
});

async function checkImages() {
  try {
    const { rows: products } = await pool.query('SELECT id, hinh_anh FROM hang_hoa ORDER BY id ASC LIMIT 50');
    console.log(products);
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkImages();
