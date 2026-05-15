import express from "express";
import bcrypt from "bcryptjs";

import { asyncHandler, HttpError } from "../utils/http.js";
import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { nextId } from "../utils/ids.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(["MANAGER"]));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT id, name, email, phone, role, created_at AS createdAt, active
       FROM users
       ORDER BY created_at DESC`
    );
    res.json({ ok: true, items: rows.map((r) => ({ ...r, active: Boolean(r.active) })) });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT id, name, email, username, phone, role, active
       FROM users
       WHERE id = ?`,
      [req.params.id]
    );
    const user = rows[0];
    if (!user) throw new HttpError(404, "Not found");
    res.json({ ok: true, user: { ...user, active: Boolean(user.active) } });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, username, phone, role, password, active } = req.body || {};
    if (!name || !email || !role || !password) throw new HttpError(400, "Missing fields");
    if (String(password).length < 8) throw new HttpError(400, "Mật khẩu tối thiểu 8 ký tự.");

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username || normalizedEmail).trim().toLowerCase();

    const exists = await query(
      "SELECT id FROM users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1",
      [normalizedEmail, normalizedUsername]
    );
    if (exists.length) throw new HttpError(409, "Email hoặc tên đăng nhập đã tồn tại.");

    const id = await nextId("NV", "users", "id", 2);
    const passwordHash = await bcrypt.hash(String(password), 10);
    await query(
      `INSERT INTO users (id, name, email, username, phone, role, password_hash, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, String(name).trim(), normalizedEmail, normalizedUsername, String(phone || "").trim(), role, passwordHash, active === false ? 0 : 1]
    );

    res.json({ ok: true, user: { id, name: String(name).trim(), email: normalizedEmail, phone: String(phone || "").trim(), role, active: active === false ? false : true } });
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { name, email, username, phone, role, password, active } = req.body || {};
    const id = req.params.id;

    const rows = await query("SELECT id FROM users WHERE id = ?", [id]);
    if (!rows.length) throw new HttpError(404, "Not found");

    const normalizedEmail = email ? String(email).trim().toLowerCase() : null;
    const normalizedUsername = username ? String(username).trim().toLowerCase() : null;

    if (normalizedEmail || normalizedUsername) {
      const exists = await query(
        "SELECT id FROM users WHERE id != ? AND (LOWER(email) = ? OR LOWER(username) = ?) LIMIT 1",
        [id, normalizedEmail || "", normalizedUsername || ""]
      );
      if (exists.length) throw new HttpError(409, "Email hoặc tên đăng nhập đã tồn tại.");
    }

    const fields = [];
    const values = [];
    if (name !== undefined) {
      fields.push("name = ?");
      values.push(String(name).trim());
    }
    if (normalizedEmail !== null) {
      fields.push("email = ?");
      values.push(normalizedEmail);
    }
    if (normalizedUsername !== null) {
      fields.push("username = ?");
      values.push(normalizedUsername);
    }
    if (phone !== undefined) {
      fields.push("phone = ?");
      values.push(String(phone || "").trim());
    }
    if (role !== undefined) {
      fields.push("role = ?");
      values.push(role);
    }
    if (active !== undefined) {
      fields.push("active = ?");
      values.push(active ? 1 : 0);
    }
    if (password) {
      if (String(password).length < 8) throw new HttpError(400, "Mật khẩu tối thiểu 8 ký tự.");
      const passwordHash = await bcrypt.hash(String(password), 10);
      fields.push("password_hash = ?");
      values.push(passwordHash);
    }

    if (!fields.length) return res.json({ ok: true });

    values.push(id);
    await query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
    res.json({ ok: true });
  })
);

export default router;
