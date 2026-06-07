const fs = require('fs');
const { Pool } = require('pg');

const envPath = '.env';
let envParams = {};
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v) envParams[k.trim()] = v.join('=').trim();
  });
}

const config = {
  host: envParams.DB_HOST || 'localhost',
  port: parseInt(envParams.DB_PORT) || 5432,
  user: envParams.DB_USER || 'postgres',
  database: envParams.DB_NAME || 'khang_baby'
};

if (envParams.DB_PASSWORD) {
  config.password = envParams.DB_PASSWORD;
}

const pool = new Pool(config);

async function run() {
  try {
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("Tables:", tables.rows.map(t => t.table_name));

    if (tables.rows.some(t => t.table_name === 'loai')) {
      const loai = await pool.query("SELECT * FROM loai");
      console.log("Loai Data:", loai.rows);
    }
    
    if (tables.rows.some(t => t.table_name === 'danh_muc')) {
      const dm = await pool.query("SELECT * FROM danh_muc");
      console.log("Danh Muc Data:", dm.rows);
    }
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
