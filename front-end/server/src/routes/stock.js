import express from "express";

import { asyncHandler } from "../utils/http.js";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT
         p.sku,
         p.name,
         p.import_price AS importPrice,
         p.sale_price AS salePrice,
         COALESCE(SUM(b.qty_remaining), 0) AS stock,
         MIN(b.received_date) AS firstBatchDate,
         MIN(b.exp_date) AS nearestExpiry
       FROM products p
       LEFT JOIN batches b
         ON b.product_sku = p.sku AND b.qty_remaining > 0
       GROUP BY p.sku
       ORDER BY p.created_at DESC`
    );
    res.json({ ok: true, items: rows });
  })
);

export default router;
