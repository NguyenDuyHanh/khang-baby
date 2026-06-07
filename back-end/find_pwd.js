const { Pool } = require('pg');

const passwords = ['', 'postgres', 'admin', 'root', '123456', '12345678', 'password'];

async function tryPasswords() {
  for (const p of passwords) {
    console.log(`Trying password: '${p}'...`);
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: p,
      database: 'khang_baby'
    });
    
    try {
      const res = await pool.query('SELECT 1');
      console.log(`SUCCESS! Password is: '${p}'`);
      await pool.end();
      return;
    } catch (e) {
      console.log(`Failed for '${p}': ${e.message}`);
    } finally {
      try { await pool.end(); } catch (e) {}
    }
  }
  console.log('All common passwords failed.');
}

tryPasswords();
