import { HttpError } from "../utils/http.js";

export async function deductStockFIFO(connection, items) {
  for (const it of items) {
    const sku = String(it.sku || "").trim();
    const qtyNeed = Number(it.qty || 0);
    if (!sku || qtyNeed <= 0) continue;

    let remaining = qtyNeed;
    const [batches] = await connection.query(
      `SELECT id, qty_remaining AS qtyRemaining
       FROM batches
       WHERE product_sku = ? AND qty_remaining > 0
       ORDER BY received_date ASC, id ASC`,
      [sku]
    );

    for (const b of batches) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, Number(b.qtyRemaining || 0));
      remaining -= take;
      await connection.query(
        "UPDATE batches SET qty_remaining = qty_remaining - ? WHERE id = ?",
        [take, b.id]
      );
    }

    if (remaining > 0) {
      throw new HttpError(409, `Không đủ tồn kho cho SKU ${sku}.`);
    }
  }
}
