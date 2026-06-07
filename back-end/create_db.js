const { Pool } = require('pg');

async function setupDb() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '12345678',
    database: 'postgres'
  });

  try {
    const res = await pool.query(`SELECT 1 FROM pg_database WHERE datname='khang_baby'`);
    if (res.rowCount === 0) {
      console.log('Creating database khang_baby...');
      await pool.query('CREATE DATABASE khang_baby');
      console.log('Database created.');
    } else {
      console.log('Database khang_baby already exists.');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
setupDb();
