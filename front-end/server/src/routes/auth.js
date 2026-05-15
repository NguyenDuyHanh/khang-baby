import express from "express";
import bcrypt from "bcryptjs";

import { asyncHandler, HttpError } from "../utils/http.js";
import { query } from "../db.js";
import { requireAuth, signAccessToken } from "../middleware/auth.js";
import { nextId } from "../utils/ids.js";

const router = express.Router();

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ ok: true, user: req.user });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { identity, password, remember } = req.body || {};
    const id = String(identity || "").trim().toLowerCase();
    if (!id || !password) throw new HttpError(400, "Missing identity or password");

    const rows = await query(
      `SELECT id, name, email, username, phone, role, active, password_hash AS passwordHash,
              failed_attempts AS failedAttempts, locked_until AS lockedUntil
       FROM users
       WHERE LOWER(email) = ? OR LOWER(username) = ?
       LIMIT 1`,
      [id, id]
    );

    const user = rows[0];
    if (!user) throw new HttpError(401, "Email/tên đăng nhập hoặc mật khẩu không đúng.");

    if (!user.active) throw new HttpError(403, "Tài khoản đã bị khóa.");

    if (user.lockedUntil && Date.now() < new Date(user.lockedUntil).getTime()) {
      const minutesLeft = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
      throw new HttpError(403, `Tài khoản tạm khóa. Thử lại sau ${minutesLeft} phút.`);
    }

    const ok = await bcrypt.compare(String(password), String(user.passwordHash));
    if (!ok) {
      const nextFails = Number(user.failedAttempts || 0) + 1;
      let lockedUntil = null;
      if (nextFails >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await query(
        "UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?",
        [nextFails, lockedUntil, user.id]
      );
      if (lockedUntil) {
        throw new HttpError(403, "Bạn đã nhập sai 5 lần. Tài khoản bị khóa 15 phút.");
      }
      throw new HttpError(401, "Email/tên đăng nhập hoặc mật khẩu không đúng.");
    }

    await query("UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?", [user.id]);

    const { token, expiresAt } = signAccessToken({ userId: user.id, role: user.role }, { remember });
    res.json({
      ok: true,
      token,
      expiresAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        role: user.role,
        active: Boolean(user.active),
      },
    });
  })
);

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, username, phone, role, password } = req.body || {};
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
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [id, String(name).trim(), normalizedEmail, normalizedUsername, String(phone || "").trim(), role, passwordHash]
    );

    res.json({
      ok: true,
      user: { id, name: String(name).trim(), email: normalizedEmail, username: normalizedUsername, phone: String(phone || "").trim(), role, active: true },
    });
  })
);

export default router;
