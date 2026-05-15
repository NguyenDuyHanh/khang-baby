import express from "express";

import { asyncHandler, HttpError } from "../utils/http.js";
import { query, withTx } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { deductStockFIFO } from "../services/fifo.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(["MANAGER", "SALES"]));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT id, date, customer, total_items AS totalItems, total, status
       FROM invoices
       ORDER BY date DESC`
    );
    res.json({ ok: true, items: rows });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const rows = await query(
      `SELECT id, date, staff_id AS staff, customer, voucher, payment_method AS paymentMethod, status
       FROM invoices WHERE id = ?`,
      [id]
    );
    const invoice = rows[0];
    if (!invoice) throw new HttpError(404, "Not found");
    const items = await query(
      `SELECT sku, name, price, qty
       FROM invoice_items WHERE invoice_id = ? ORDER BY id ASC`,
      [id]
    );
    res.json({ ok: true, invoice: { ...invoice, items } });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { id, date, customer, voucher, paymentMethod, status, items } = req.body || {};
    if (!date) throw new HttpError(400, "Missing date");
    if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, "Missing items");

    const totalItems = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
    const total = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
    const st = status || "UNPAID";

    await withTx(async (connection) => {
      const [exists] = await connection.query("SELECT id FROM invoices WHERE id = ? LIMIT 1", [id]);
      if (exists.length) throw new HttpError(409, "Invoice id already exists");

      await connection.query(
        `INSERT INTO invoices (id, date, staff_id, customer, voucher, payment_method, status, total_items, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          String(id).trim(),
          date,
          req.user.id,
          String(customer || "").trim() || "Khách lẻ",
          String(voucher || "").trim(),
          String(paymentMethod || "").trim(),
          st,
          totalItems,
          total,
        ]
      );

      for (const it of items) {
        const sku = String(it.sku || "").trim();
        const name = String(it.name || "").trim();
        const price = Number(it.price || 0);
        const qty = Number(it.qty || 0);
        if (!sku || qty <= 0) throw new HttpError(400, "Invalid item");
        await connection.query(
          `INSERT INTO invoice_items (invoice_id, sku, name, price, qty)
           VALUES (?, ?, ?, ?, ?)`,
          [String(id).trim(), sku, name, price, qty]
        );
      }

      if (st === "PAID") {
        await deductStockFIFO(connection, items);
      }
    });

    res.json({ ok: true, id });
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { date, customer, voucher, paymentMethod, status, items } = req.body || {};
    if (!date) throw new HttpError(400, "Missing date");
    if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, "Missing items");

    const rows = await query("SELECT status FROM invoices WHERE id = ?", [id]);
    if (!rows.length) throw new HttpError(404, "Not found");
    if (rows[0].status === "PAID") throw new HttpError(409, "Paid invoice cannot be edited.");

    const totalItems = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
    const total = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
    const st = status || rows[0].status;

    await withTx(async (connection) => {
      await connection.query(
        `UPDATE invoices
         SET date = ?, customer = ?, voucher = ?, payment_method = ?, status = ?, total_items = ?, total = ?
         WHERE id = ?`,
        [
          date,
          String(customer || "").trim() || "Khách lẻ",
          String(voucher || "").trim(),
          String(paymentMethod || "").trim(),
          st,
          totalItems,
          total,
          id,
        ]
      );

      await connection.query("DELETE FROM invoice_items WHERE invoice_id = ?", [id]);
      for (const it of items) {
        const sku = String(it.sku || "").trim();
        const name = String(it.name || "").trim();
        const price = Number(it.price || 0);
        const qty = Number(it.qty || 0);
        if (!sku || qty <= 0) throw new HttpError(400, "Invalid item");
        await connection.query(
          `INSERT INTO invoice_items (invoice_id, sku, name, price, qty)
           VALUES (?, ?, ?, ?, ?)`,
          [id, sku, name, price, qty]
        );
      }

      if (st === "PAID") {
        await deductStockFIFO(connection, items);
      }
    });

    res.json({ ok: true });
  })
);

export default router;
