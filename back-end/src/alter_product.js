require('dotenv').config();
const pool = require('./db');

async function alterProductTable() {
  try {
    console.log('Adding hinh_anh column to hang_hoa table...');
    
    // Check if column already exists to prevent error
    const [rows] = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='hang_hoa' AND column_name='hinh_anh';
    `);

    if (rows.length === 0) {
      await pool.query(`
        ALTER TABLE hang_hoa
        ADD COLUMN hinh_anh VARCHAR(255);
      `);
      console.log('✅ Column hinh_anh added successfully.');
    } else {
      console.log('✅ Column hinh_anh already exists.');
    }
  } catch (error) {
    console.error('❌ Error altering table:', error);
  } finally {
    process.exit();
  }
}

alterProductTable();
