import { query } from "../db.js";

export async function nextId(prefix, tableName, columnName, pad = 3) {
  const rows = await query(
    `SELECT ${columnName} AS id FROM ${tableName} WHERE ${columnName} LIKE ? ORDER BY ${columnName} DESC LIMIT 1`,
    [`${prefix}%`]
  );
  const last = rows?.[0]?.id;
  const lastNum = Number(String(last || "").replace(/\D/g, "")) || 0;
  const nextNum = lastNum + 1;
  return `${prefix}${String(nextNum).padStart(pad, "0")}`;
}
