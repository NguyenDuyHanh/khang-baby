import jwt from "jsonwebtoken";
import { query } from "../db.js";
import { HttpError } from "../utils/http.js";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET env var");
  return secret;
}

export function signAccessToken({ userId, role }, { remember } = {}) {
  const expiresInSeconds = remember ? 30 * 24 * 60 * 60 : 8 * 60 * 60;
  const token = jwt.sign({ role }, getJwtSecret(), {
    subject: userId,
    expiresIn: expiresInSeconds,
  });
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  return { token, expiresAt };
}

export async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const m = auth.match(/^Bearer\s+(?<token>.+)$/i);
    const token = m?.groups?.token;
    if (!token) throw new HttpError(401, "Missing Authorization token");

    let payload;
    try {
      payload = jwt.verify(token, getJwtSecret());
    } catch {
      throw new HttpError(401, "Invalid token");
    }

    const userId = payload?.sub;
    if (!userId) throw new HttpError(401, "Invalid token");

    const rows = await query(
      `SELECT id, name, email, username, phone, role, active, created_at AS createdAt
       FROM users
       WHERE id = ?`,
      [userId]
    );
    const user = rows[0];
    if (!user) throw new HttpError(401, "User not found");
    if (!user.active) throw new HttpError(403, "User is locked");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(allow = []) {
  return (req, res, next) => {
    if (!req.user) return next(new HttpError(401, "Unauthorized"));
    if (allow.length && !allow.includes(req.user.role)) {
      return next(new HttpError(403, "Forbidden"));
    }
    next();
  };
}
