const { Pool } = require('pg');

const rawHost = process.env.DB_HOST || 'localhost';
const hostWithoutPath = rawHost.includes('/') ? rawHost.split('/')[0] : rawHost;
const normalizedHost = hostWithoutPath.includes(':') ? hostWithoutPath.split(':')[0] : hostWithoutPath;
const parsedPort = Number(process.env.DB_PORT || (hostWithoutPath.includes(':') ? hostWithoutPath.split(':')[1] : 5432));

const pgPool = new Pool({
  host: normalizedHost,
  port: Number.isNaN(parsedPort) ? 5432 : parsedPort,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD !== undefined && process.env.DB_PASSWORD !== null ? String(process.env.DB_PASSWORD) : '',
  database: process.env.DB_NAME || 'khang_baby',
  max: 10,
  idleTimeoutMillis: 30000,
});

function convertQuery(sql, params = []) {
  let pgSql = sql;
  let pgParams = [...params];

  // 1. Rewrite DATE_ADD(anchor, INTERVAL value DAY) -> (CAST(anchor AS TIMESTAMP) + CAST((value) || ' days' AS INTERVAL))
  pgSql = pgSql.replace(/DATE_ADD\(([^,]+),\s*INTERVAL\s+(\??|\d+)\s+DAY\)/gi, (match, anchor, value) => {
    return `(CAST(${anchor} AS TIMESTAMP) + CAST((${value}) || ' day' AS INTERVAL))`;
  });

  // 2. Convert `?` placeholder syntax to PostgreSQL `$1`, `$2`, etc.
  let index = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${index++}`);

  // 4. For INSERT queries, let's dynamically append RETURNING id,
  // so we can mimic result.insertId!
  const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
  if (isInsert && !/RETURNING/i.test(pgSql)) {
    pgSql += ' RETURNING id';
  }

  return { pgSql, pgParams, isInsert };
}

const pool = {
  async query(sql, params = []) {
    const { pgSql, pgParams, isInsert } = convertQuery(sql, params);
    
    // Execute query using pgPool
    const result = await pgPool.query(pgSql, pgParams);
    
    const rows = result.rows;

    // mysql2 returns [rows, fields]
    if (isInsert) {
      const insertId = rows[0]?.id || null;
      const mockResult = {
        insertId: insertId,
        affectedRows: result.rowCount,
        warningStatus: 0,
      };
      return [mockResult, result.fields];
    }

    return [rows, result.fields];
  },
  
  pgPool,
  
  async end() {
    return pgPool.end();
  }
};

module.exports = pool;
