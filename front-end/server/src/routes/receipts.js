import express from "express";

import { asyncHandler, HttpError } from "../utils/http.js";
import { query, withTx } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { nextId } from "../utils/ids.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(["MANAGER", "WAREHOUSE"]));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT id, order_id AS orderId, payment_id AS paymentId, qty_ordered AS qtyOrdered,
              qty_received AS qtyReceived, missing, status
       FROM receipts
       ORDER BY created_at DESC`
    );
    res.json({ ok: true, items: rows });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const rows = await query(
      `SELECT id, date, supplier, staff_id AS staff, payment_id AS paymentId, order_id AS orderId
       FROM receipts WHERE id = ?`,
      [id]
    );
    const receipt = rows[0];
    if (!receipt) throw new HttpError(404, "Not found");

    const items = await query(
      `SELECT sku, name, price, qty, mfg_date AS mfg, exp_date AS exp
       FROM receipt_items WHERE receipt_id = ? ORDER BY id ASC`,
      [id]
    );
    res.json({ ok: true, receipt: { ...receipt, items } });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { id: providedId, date, supplier, paymentId, orderId, qtyOrdered, items } = req.body || {};
    if (!date || !supplier) throw new HttpError(400, "Missing date/supplier");
    if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, "Missing items");

    const id = providedId ? String(providedId).trim() : await nextId("PN", "receipts", "id", 1);
    const qtyReceived = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
    const qtyOrderedNum = qtyOrdered === undefined || qtyOrdered === null || qtyOrdered === "" ? null : Number(qtyOrdered);
    const missing = qtyOrderedNum === null ? 0 : Math.max(0, qtyOrderedNum - qtyReceived);
    const status = missing === 0 ? "PAID" : "UNPAID";

    await withTx(async (connection) => {
      const [exists] = await connection.query("SELECT id FROM receipts WHERE id = ? LIMIT 1", [id]);
      if (exists.length) throw new HttpError(409, "Receipt id already exists");

      await connection.query(
        `INSERT INTO receipts (id, date, supplier, staff_id, payment_id, order_id, qty_ordered, qty_received, missing, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          date,
          String(supplier).trim(),
          req.user.id,
          String(paymentId || "").trim(),
          String(orderId || "").trim(),
          qtyOrderedNum,
          qtyReceived,
          missing,
          status,
        ]
      );

      for (const it of items) {
        const sku = String(it.sku || "").trim();
        const name = String(it.name || "").trim();
        const price = Number(it.price || 0);
        const qty = Number(it.qty || 0);
        const mfg = it.mfg ? String(it.mfg) : null;
        const exp = it.exp ? String(it.exp) : null;
        if (!sku || !qty) throw new HttpError(400, "Invalid item");

        await connection.query(
          `INSERT INTO receipt_items (receipt_id, sku, name, price, qty, mfg_date, exp_date)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, sku, name, price, qty, mfg, exp]
        );

        await connection.query(
          `INSERT INTO batches (product_sku, receipt_id, received_date, mfg_date, exp_date, qty_in, qty_remaining, import_price)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [sku, id, date, mfg, exp, qty, qty, price]
        );

        // upsert product if missing (keeps demo UX forgiving)
        await connection.query(
          `INSERT INTO products (sku, name, category, supplier, import_price, sale_price, min_stock)
           VALUES (?, ?, '', ?, ?, 0, 0)
           ON DUPLICATE KEY UPDATE name = COALESCE(NULLIF(VALUES(name), ''), name), supplier = COALESCE(NULLIF(VALUES(supplier), ''), supplier)`,
          [sku, name || sku, String(supplier).trim(), price]
        );
      }
    });

    res.json({ ok: true, id });
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { date, supplier, paymentId, orderId, qtyOrdered, items } = req.body || {};
    if (!date || !supplier) throw new HttpError(400, "Missing date/supplier");
    if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, "Missing items");

    // safety: do not allow editing a receipt if any batch has been consumed
    const batchRows = await query(
      "SELECT id, qty_in AS qtyIn, qty_remaining AS qtyRemaining FROM batches WHERE receipt_id = ?",
      [id]
    );
    const consumed = batchRows.some((b) => Number(b.qtyRemaining) !== Number(b.qtyIn));
    if (consumed) throw new HttpError(409, "Receipt has consumed stock; cannot edit safely.");

    const qtyReceived = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
    const qtyOrderedNum = qtyOrdered === undefined || qtyOrdered === null || qtyOrdered === "" ? null : Number(qtyOrdered);
    const missing = qtyOrderedNum === null ? 0 : Math.max(0, qtyOrderedNum - qtyReceived);
    const status = missing === 0 ? "PAID" : "UNPAID";

    await withTx(async (connection) => {
      const [rows] = await connection.query("SELECT id FROM receipts WHERE id = ? LIMIT 1", [id]);
      if (!rows.length) throw new HttpError(404, "Not found");

      await connection.query(
        `UPDATE receipts SET date = ?, supplier = ?, payment_id = ?, order_id = ?, qty_ordered = ?, qty_received = ?, missing = ?, status = ?
         WHERE id = ?`,
        [
          date,
          String(supplier).trim(),
          String(paymentId || "").trim(),
          String(orderId || "").trim(),
          qtyOrderedNum,
          qtyReceived,
          missing,
          status,
          id,
        ]
      );

      await connection.query("DELETE FROM receipt_items WHERE receipt_id = ?", [id]);
      await connection.query("DELETE FROM batches WHERE receipt_id = ?", [id]);

      for (const it of items) {
        const sku = String(it.sku || "").trim();
        const name = String(it.name || "").trim();
        const price = Number(it.price || 0);
        const qty = Number(it.qty || 0);
        const mfg = it.mfg ? String(it.mfg) : null;
        const exp = it.exp ? String(it.exp) : null;
        if (!sku || !qty) throw new HttpError(400, "Invalid item");

        await connection.query(
          `INSERT INTO receipt_items (receipt_id, sku, name, price, qty, mfg_date, exp_date)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, sku, name, price, qty, mfg, exp]
        );

        await connection.query(
          `INSERT INTO batches (product_sku, receipt_id, received_date, mfg_date, exp_date, qty_in, qty_remaining, import_price)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [sku, id, date, mfg, exp, qty, qty, price]
        );

        await connection.query(
          `INSERT INTO products (sku, name, category, supplier, import_price, sale_price, min_stock)
           VALUES (?, ?, '', ?, ?, 0, 0)
           ON DUPLICATE KEY UPDATE name = COALESCE(NULLIF(VALUES(name), ''), name), supplier = COALESCE(NULLIF(VALUES(supplier), ''), supplier)`,
          [sku, name || sku, String(supplier).trim(), price]
        );
      }
    });

    res.json({ ok: true });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const batchRows = await query(
      "SELECT id, qty_in AS qtyIn, qty_remaining AS qtyRemaining FROM batches WHERE receipt_id = ?",
      [id]
    );
    const consumed = batchRows.some((b) => Number(b.qtyRemaining) !== Number(b.qtyIn));
    if (consumed) throw new HttpError(409, "Receipt has consumed stock; cannot delete safely.");

    await withTx(async (connection) => {
      await connection.query("DELETE FROM receipt_items WHERE receipt_id = ?", [id]);
      await connection.query("DELETE FROM batches WHERE receipt_id = ?", [id]);
      await connection.query("DELETE FROM receipts WHERE id = ?", [id]);
    });
    res.json({ ok: true });
  })
);

export default router;
