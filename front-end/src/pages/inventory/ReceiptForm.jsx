import { useId, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrencyVND } from "@/lib/format";

const demoReceiptById = {
  PN1: {
    id: "PN1",
    date: "2024-05-20",
    supplier: "Nestle VN",
    staff: "NV01",
    paymentId: "PTT01",
    items: [{ sku: "SP1S", name: "Sữa Nan Optipro 3", price: 450000, qty: 100, mfg: "2024-12-01", exp: "2025-06-30" }],
  },
};

export default function ReceiptForm({ readOnly = false }) {
  const params = useParams();
  const key = params.id ?? "new";
  return <ReceiptFormInner key={key} readOnly={readOnly} paramsId={params.id} />;
}

function ReceiptFormInner({ readOnly = false, paramsId }) {
  const navigate = useNavigate();
  const isNew = paramsId === undefined;
  const draftId = useId();
  const draftSuffix = draftId.replaceAll(":", "");
  const defaultDate = "2024-05-20";

  const initial = useMemo(() => {
    if (isNew) {
      return {
        id: `PN-${draftSuffix}`,
        date: defaultDate,
        supplier: "Nestle VN",
        staff: "NV01",
        paymentId: "",
        items: [{ sku: "", name: "", price: 0, qty: 1, mfg: "", exp: "" }],
      };
    }
    const found = demoReceiptById[paramsId];
    return {
      id: found?.id || paramsId,
      date: found?.date || defaultDate,
      supplier: found?.supplier || "",
      staff: found?.staff || "NV01",
      paymentId: found?.paymentId || "",
      items: found?.items || [{ sku: "", name: "", price: 0, qty: 1, mfg: "", exp: "" }],
    };
  }, [defaultDate, draftSuffix, isNew, paramsId]);

  const [form, setForm] = useState(initial);

  const totals = useMemo(() => {
    const total = form.items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
    return { total };
  }, [form.items]);

  const setField = (key) => (e) => {
    if (readOnly) return;
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const setItemField = (idx, key) => (e) => {
    if (readOnly) return;
    const value = key === "qty" || key === "price" ? Number(e.target.value) : e.target.value;
    setForm((prev) => {
      const next = [...prev.items];
      next[idx] = { ...next[idx], [key]: value };
      return { ...prev, items: next };
    });
  };

  const addRow = () => {
    if (readOnly) return;
    setForm((prev) => ({ ...prev, items: [...prev.items, { sku: "", name: "", price: 0, qty: 1, mfg: "", exp: "" }] }));
  };

  const removeRow = (idx) => {
    if (readOnly) return;
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{readOnly ? "Chi tiết phiếu nhập" : isNew ? "Thêm phiếu nhập" : "Sửa phiếu nhập"}</h3>
        <Button variant="outline" asChild>
          <Link to="/inventory/receipts">Quay lại</Link>
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Thông tin phiếu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mã HDN</label>
              <input className="h-10 w-full rounded-md border border-input bg-muted/30 px-3 text-sm" value={form.id} readOnly />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ngày nhập</label>
              <input
                type="date"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.date}
                onChange={setField("date")}
                disabled={readOnly}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nhà cung cấp</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.supplier}
                onChange={setField("supplier")}
                disabled={readOnly}
              >
                <option value="Nestle VN">Nestle VN</option>
                <option value="Unicharm">Unicharm</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nhân viên nhập</label>
              <input className="h-10 w-full rounded-md border border-input bg-muted/30 px-3 text-sm" value={form.staff} readOnly />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mã HDTT</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.paymentId}
                onChange={setField("paymentId")}
                placeholder="(tùy chọn)"
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Chi tiết sản phẩm nhập</h4>
              {!readOnly ? (
                <Button variant="outline" size="sm" type="button" onClick={addRow}>
                  Thêm dòng
                </Button>
              ) : null}
            </div>

            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Mã SP</th>
                    <th className="px-4 py-3 text-left font-medium">Tên sản phẩm</th>
                    <th className="px-4 py-3 text-right font-medium">Giá nhập</th>
                    <th className="px-4 py-3 text-right font-medium">Số lượng</th>
                    <th className="px-4 py-3 text-left font-medium">NSX</th>
                    <th className="px-4 py-3 text-left font-medium">HSD</th>
                    <th className="px-4 py-3 text-right font-medium">Thành tiền</th>
                    <th className="px-4 py-3 text-right font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((it, idx) => {
                    const line = (Number(it.price) || 0) * (Number(it.qty) || 0);
                    return (
                      <tr key={idx} className="border-t border-border/60">
                        <td className="px-4 py-3">
                          <input
                            className="h-9 w-[120px] rounded-md border border-input bg-background px-2 text-sm"
                            value={it.sku}
                            onChange={setItemField(idx, "sku")}
                            disabled={readOnly}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            className="h-9 w-full min-w-[220px] rounded-md border border-input bg-background px-2 text-sm"
                            value={it.name}
                            onChange={setItemField(idx, "name")}
                            disabled={readOnly}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            className="h-9 w-[140px] rounded-md border border-input bg-background px-2 text-sm text-right"
                            value={it.price}
                            onChange={setItemField(idx, "price")}
                            disabled={readOnly}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            min={1}
                            className="h-9 w-[90px] rounded-md border border-input bg-background px-2 text-sm text-right"
                            value={it.qty}
                            onChange={setItemField(idx, "qty")}
                            disabled={readOnly}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input type="date" className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={it.mfg} onChange={setItemField(idx, "mfg")} disabled={readOnly} />
                        </td>
                        <td className="px-4 py-3">
                          <input type="date" className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={it.exp} onChange={setItemField(idx, "exp")} disabled={readOnly} />
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{formatCurrencyVND(line)}</td>
                        <td className="px-4 py-3 text-right">
                          {!readOnly ? (
                            <Button variant="outline" size="sm" type="button" onClick={() => removeRow(idx)}>
                              Xóa
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="rounded-lg border border-border/60 p-4 w-full max-w-[360px]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tổng tiền</span>
                <span className="font-bold text-primary">{formatCurrencyVND(totals.total)}</span>
              </div>
            </div>
          </div>

          {!readOnly ? (
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => navigate("/inventory/receipts")}>Thoát</Button>
              <Button type="submit" onClick={() => navigate("/inventory/receipts")}>Lưu</Button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" asChild>
                <Link to={`/inventory/receipts/${paramsId}/edit`}>Sửa</Link>
              </Button>
              <Button type="button" onClick={() => {}}>Xuất file</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
