import mysql from "mysql2/promise";

let pool;

export function getPool() {
  if (pool) return pool;
  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASS || "";
  const database = process.env.DB_NAME || "khang_baby";

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    decimalNumbers: true,
    timezone: "Z",
  });
  return pool;
}

export async function query(sql, params) {
  const [rows] = await getPool().query(sql, params);
  return rows;
}

export async function withTx(fn) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await fn(connection);
    await connection.commit();
    return result;
  } catch (err) {
    try {
      await connection.rollback();
    } catch {
      // ignore
    }
    throw err;
  } finally {
    connection.release();
  }
}
