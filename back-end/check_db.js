require('dotenv').config();
const pool = require('./src/db');

async function checkTables() {
  try {
    const res = await pool.pgPool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log("Tables in database:", res.rows.map(r => r.table_name));
    
    // Check if table 'loai' exists
    const hasLoai = res.rows.some(r => r.table_name === 'loai');
    if (hasLoai) {
       const loaiData = await pool.pgPool.query('SELECT * FROM loai');
       console.log("Data in loai table:", loaiData.rows);
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkTables();
