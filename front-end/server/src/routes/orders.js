import express from "express";

import { asyncHandler, HttpError } from "../utils/http.js";
import { query, withTx } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(["MANAGER", "ONLINE_SALES"]));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT id, date, customer, phone, address, total, channel, status, staff_id AS staff
       FROM orders
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
      `SELECT id, customer, phone, address, note, channel, voucher, shipper, ship_fee AS shipFee,
              eta AS eta, tracking, payment_method AS paymentMethod
       FROM orders WHERE id = ?`,
      [id]
    );
    const order = rows[0];
    if (!order) throw new HttpError(404, "Not found");
    const items = await query(
      `SELECT sku, name, price, qty FROM order_items WHERE order_id = ? ORDER BY id ASC`,
      [id]
    );
    res.json({ ok: true, order: { ...order, items } });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      id,
      customer,
      phone,
      address,
      note,
      channel,
      voucher,
      items,
      shipper,
      shipFee,
      eta,
      tracking,
      paymentMethod,
      status,
    } = req.body || {};

    if (!id) throw new HttpError(400, "Missing id");
    if (!customer || !phone || !address) throw new HttpError(400, "Missing customer/phone/address");
    if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, "Missing items");

    const totalMerch = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
    const total = totalMerch + (Number(shipFee) || 0);
    const st = status || "ChoXuLy";

    await withTx(async (connection) => {
      const [exists] = await connection.query("SELECT id FROM orders WHERE id = ? LIMIT 1", [id]);
      if (exists.length) throw new HttpError(409, "Order id already exists");

      await connection.query(
        `INSERT INTO orders (id, date, customer, phone, address, note, channel, voucher, shipper, ship_fee, eta, tracking,
                            payment_method, status, staff_id, total)
         VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          String(id).trim(),
          String(customer).trim(),
          String(phone).trim(),
          String(address).trim(),
          String(note || "").trim(),
          String(channel || "Facebook").trim(),
          String(voucher || "").trim(),
          String(shipper || "").trim(),
          Number(shipFee) || 0,
          eta || null,
          String(tracking || "").trim(),
          String(paymentMethod || "COD").trim(),
          st,
          req.user.id,
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
          `INSERT INTO order_items (order_id, sku, name, price, qty)
           VALUES (?, ?, ?, ?, ?)`,
          [String(id).trim(), sku, name, price, qty]
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
    const {
      customer,
      phone,
      address,
      note,
      channel,
      voucher,
      items,
      shipper,
      shipFee,
      eta,
      tracking,
      paymentMethod,
      status,
    } = req.body || {};

    if (!customer || !phone || !address) throw new HttpError(400, "Missing customer/phone/address");
    if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, "Missing items");

    const totalMerch = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
    const total = totalMerch + (Number(shipFee) || 0);

    await withTx(async (connection) => {
      const [rows] = await connection.query("SELECT id FROM orders WHERE id = ? LIMIT 1", [id]);
      if (!rows.length) throw new HttpError(404, "Not found");

      await connection.query(
        `UPDATE orders
         SET customer = ?, phone = ?, address = ?, note = ?, channel = ?, voucher = ?, shipper = ?, ship_fee = ?, eta = ?,
             tracking = ?, payment_method = ?, status = ?, total = ?
         WHERE id = ?`,
        [
          String(customer).trim(),
          String(phone).trim(),
          String(address).trim(),
          String(note || "").trim(),
          String(channel || "Facebook").trim(),
          String(voucher || "").trim(),
          String(shipper || "").trim(),
          Number(shipFee) || 0,
          eta || null,
          String(tracking || "").trim(),
          String(paymentMethod || "COD").trim(),
          String(status || "ChoXuLy").trim(),
          total,
          id,
        ]
      );

      await connection.query("DELETE FROM order_items WHERE order_id = ?", [id]);
      for (const it of items) {
        const sku = String(it.sku || "").trim();
        const name = String(it.name || "").trim();
        const price = Number(it.price || 0);
        const qty = Number(it.qty || 0);
        if (!sku || qty <= 0) throw new HttpError(400, "Invalid item");
        await connection.query(
          `INSERT INTO order_items (order_id, sku, name, price, qty)
           VALUES (?, ?, ?, ?, ?)`,
          [id, sku, name, price, qty]
        );
      }
    });

    res.json({ ok: true });
  })
);

export default router;
