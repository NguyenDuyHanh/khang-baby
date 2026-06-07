const mysql = require('mysql2/promise');

const rawHost = process.env.DB_HOST || 'localhost';
const hostWithoutPath = rawHost.includes('/') ? rawHost.split('/')[0] : rawHost;
const normalizedHost = hostWithoutPath.includes(':') ? hostWithoutPath.split(':')[0] : hostWithoutPath;
const parsedPort = Number(process.env.DB_PORT || (hostWithoutPath.includes(':') ? hostWithoutPath.split(':')[1] : 3306));

const pool = mysql.createPool({
  host: normalizedHost,
<<<<<<< Updated upstream
  port: Number.isNaN(parsedPort) ? 3306 : parsedPort,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
=======
  port: Number.isNaN(parsedPort) ? 5432 : parsedPort,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD !== undefined && process.env.DB_PASSWORD !== null ? String(process.env.DB_PASSWORD) : '12345678',
>>>>>>> Stashed changes
  database: process.env.DB_NAME || 'khang_baby',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
