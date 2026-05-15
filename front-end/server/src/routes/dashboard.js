import express from "express";

import { asyncHandler } from "../utils/http.js";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const today = new Date();
    const yyyy = today.getUTCFullYear();
    const mm = String(today.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(today.getUTCDate()).padStart(2, "0");
    const start = `${yyyy}-${mm}-${dd} 00:00:00`;
    const end = `${yyyy}-${mm}-${dd} 23:59:59`;

    const revenueRows = await query(
      `SELECT COALESCE(SUM(total), 0) AS revenue
       FROM invoices
       WHERE status = 'PAID' AND date BETWEEN ? AND ?`,
      [start, end]
    );

    const newOnlineRows = await query(
      `SELECT COUNT(*) AS cnt FROM orders WHERE status = 'ChoXuLy'`,
      []
    );

    const lowStockRows = await query(
      `SELECT COUNT(*) AS cnt
       FROM (
         SELECT p.sku, COALESCE(SUM(b.qty_remaining), 0) AS stock, p.min_stock AS minStock
         FROM products p
         LEFT JOIN batches b ON b.product_sku = p.sku AND b.qty_remaining > 0
         GROUP BY p.sku
       ) x
       WHERE x.stock <= x.minStock AND x.minStock > 0`,
      []
    );

    const expRows = await query(
      `SELECT COUNT(*) AS cnt
       FROM (
         SELECT p.sku, MIN(b.exp_date) AS expiry
         FROM products p
         LEFT JOIN batches b ON b.product_sku = p.sku AND b.qty_remaining > 0 AND b.exp_date IS NOT NULL
         GROUP BY p.sku
       ) x
       WHERE x.expiry IS NOT NULL AND x.expiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`,
      []
    );

    const recentOffline = await query(
      `SELECT id, customer, DATE_FORMAT(date, '%Y-%m-%d %H:%i') AS date, total
       FROM invoices
       ORDER BY date DESC
       LIMIT 5`
    );
    const recentOnline = await query(
      `SELECT id, customer, DATE_FORMAT(date, '%Y-%m-%d %H:%i') AS date, total
       FROM orders
       ORDER BY date DESC
       LIMIT 5`
    );
    const recent = [
      ...recentOffline.map((r) => ({ ...r, source: "Offline" })),
      ...recentOnline.map((r) => ({ ...r, source: "Online" })),
    ]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        customer: r.customer,
        date: r.date,
        amount: r.total,
        source: r.source,
      }));

    res.json({
      ok: true,
      stats: {
        revenue: Number(revenueRows?.[0]?.revenue || 0),
        newOnline: Number(newOnlineRows?.[0]?.cnt || 0),
        lowStock: Number(lowStockRows?.[0]?.cnt || 0),
        expiringSoon: Number(expRows?.[0]?.cnt || 0),
      },
      recent,
    });
  })
);

export default router;
