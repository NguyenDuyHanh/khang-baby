import express from "express";

import { asyncHandler, HttpError } from "../utils/http.js";
import { query } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT
         p.sku,
         p.name,
         p.category,
         p.supplier,
         p.import_price AS importPrice,
         p.sale_price AS salePrice,
         COALESCE(SUM(b.qty_remaining), 0) AS stock,
         p.min_stock AS minStock,
         MIN(b.exp_date) AS expiry
       FROM products p
       LEFT JOIN batches b
         ON b.product_sku = p.sku AND b.qty_remaining > 0
       GROUP BY p.sku
       ORDER BY p.created_at DESC`
    );
    res.json({ ok: true, items: rows });
  })
);

router.post(
  "/",
  requireRole(["MANAGER", "WAREHOUSE"]),
  asyncHandler(async (req, res) => {
    const { sku, name, category, supplier, importPrice, salePrice, minStock } = req.body || {};
    if (!sku || !name) throw new HttpError(400, "Missing sku or name");

    const exists = await query("SELECT sku FROM products WHERE sku = ? LIMIT 1", [sku]);
    if (exists.length) throw new HttpError(409, "SKU already exists");

    await query(
      `INSERT INTO products (sku, name, category, supplier, import_price, sale_price, min_stock)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        String(sku).trim(),
        String(name).trim(),
        String(category || "").trim(),
        String(supplier || "").trim(),
        Number(importPrice || 0),
        Number(salePrice || 0),
        Number(minStock || 0),
      ]
    );
    res.json({ ok: true });
  })
);

router.put(
  "/:sku",
  requireRole(["MANAGER", "WAREHOUSE"]),
  asyncHandler(async (req, res) => {
    const sku = req.params.sku;
    const { name, category, supplier, importPrice, salePrice, minStock } = req.body || {};

    const rows = await query("SELECT sku FROM products WHERE sku = ? LIMIT 1", [sku]);
    if (!rows.length) throw new HttpError(404, "Not found");

    await query(
      `UPDATE products
       SET name = ?, category = ?, supplier = ?, import_price = ?, sale_price = ?, min_stock = ?
       WHERE sku = ?`,
      [
        String(name || "").trim(),
        String(category || "").trim(),
        String(supplier || "").trim(),
        Number(importPrice || 0),
        Number(salePrice || 0),
        Number(minStock || 0),
        sku,
      ]
    );
    res.json({ ok: true });
  })
);

router.delete(
  "/:sku",
  requireRole(["MANAGER", "WAREHOUSE"]),
  asyncHandler(async (req, res) => {
    const sku = req.params.sku;
    await query("DELETE FROM products WHERE sku = ?", [sku]);
    res.json({ ok: true });
  })
);

export default router;
