import bcrypt from "bcryptjs";
import { query } from "../db.js";

async function tableExists(name) {
  const rows = await query(
    `SELECT COUNT(*) AS cnt
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [name]
  );
  return Number(rows?.[0]?.cnt || 0) > 0;
}

export async function ensureDbReady() {
  const ok = await tableExists("users");
  if (!ok) {
    // eslint-disable-next-line no-console
    console.warn(
      "[api] DB schema missing. Create tables using server/sql/schema.sql before starting the API."
    );
    return;
  }

  const users = await query("SELECT id FROM users LIMIT 1");
  if (users.length) return;

  const passwordHash = await bcrypt.hash("admin123", 10);
  await query(
    `INSERT INTO users (id, name, email, username, phone, role, password_hash, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    ["NV00", "Admin", "admin@khangbaby.com", "admin", "", "MANAGER", passwordHash]
  );

  // eslint-disable-next-line no-console
  console.log("[api] Seeded default admin: admin / admin123");
}
