import { useId, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrencyVND } from "@/lib/format";

const demoInvoiceById = {
  HDB001: {
    id: "HDB001",
    date: "2024-05-16T10:10:00",
    staff: "NV01",
    customer: "Khách lẻ",
    voucher: "",
    paymentMethod: "TienMat",
    status: "PAID",
    items: [
      { sku: "SP1S", name: "Áo nam cách tân", price: 900000, qty: 1 },
      { sku: "AD2", name: "Áo dài cổ gấm trắng", price: 900000, qty: 2 },
    ],
  },
};

const paymentMethods = [
  { value: "TienMat", label: "Tiền mặt" },
  { value: "ChuyenKhoan", label: "Chuyển khoản" },
  { value: "QuetThe", label: "Quẹt thẻ" },
];

export default function InvoiceForm({ readOnly = false }) {
  const params = useParams();
  const key = params.id ?? "new";
  return <InvoiceFormInner key={key} readOnly={readOnly} paramsId={params.id} />;
}

function InvoiceFormInner({ readOnly = false, paramsId }) {
  const navigate = useNavigate();
  const isNew = paramsId === undefined;
  const draftId = useId();
  const draftSuffix = draftId.replaceAll(":", "");
  const defaultISODate = "2024-05-16T10:10:00.000Z";

  const initial = useMemo(() => {
    if (isNew) {
      return {
        id: `HDB-${draftSuffix}`,
        date: defaultISODate,
        staff: "NV01",
        customer: "",
        voucher: "",
        paymentMethod: "TienMat",
        items: [{ sku: "", name: "", price: 0, qty: 1 }],
      };
    }
    const found = demoInvoiceById[paramsId];
    return {
      id: found?.id || paramsId,
      date: found?.date || defaultISODate,
      staff: found?.staff || "NV01",
      customer: found?.customer || "",
      voucher: found?.voucher || "",
      paymentMethod: found?.paymentMethod || "TienMat",
      items: found?.items || [{ sku: "", name: "", price: 0, qty: 1 }],
    };
  }, [defaultISODate, draftSuffix, isNew, paramsId]);

  const [form, setForm] = useState(initial);

  const totals = useMemo(() => {
    const totalMerch = form.items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
    const discount = 0;
    const totalPay = Math.max(0, totalMerch - discount);
    return { totalMerch, discount, totalPay };
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

      if (key === "qty") {
        const ton_kho = next[idx].ton_kho;
        if (value > ton_kho) {
          toast.warning(`Số lượng xuất (${value}) vượt quá tồn kho hiện tại (${ton_kho}).`);
        }
      }

      next[idx] = { ...next[idx], [key]: value };
      return { ...prev, items: next };
    });
  };

  const addRow = () => {
    if (readOnly) return;
    setForm((prev) => ({ ...prev, items: [...prev.items, { sku: "", name: "", price: 0, qty: 1 }] }));
  };

  const removeRow = (idx) => {
    if (readOnly) return;
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const onSaveDraft = () => {
    navigate("/pos", { replace: true });
  };

  const onConfirmPaid = () => {
    navigate("/pos", { replace: true });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {readOnly ? "Chi tiết hóa đơn" : isNew ? "Tạo hóa đơn" : "Chỉnh sửa hóa đơn"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Thông tin hóa đơn và sản phẩm</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/pos">Quay lại</Link>
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Thông tin hóa đơn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mã HĐB</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-muted/30 px-3 text-sm"
                value={form.id}
                readOnly
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ngày bán</label>
              <input
                type="datetime-local"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={new Date(form.date).toISOString().slice(0, 16)}
                onChange={(e) => setField("date")({ target: { value: new Date(e.target.value).toISOString() } })}
                disabled={readOnly}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nhân viên bán</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-muted/30 px-3 text-sm"
                value={form.staff}
                readOnly
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Khách hàng</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.customer}
                onChange={setField("customer")}
                placeholder="Chọn/nhập khách hàng (tùy chọn)"
                disabled={readOnly}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mã voucher</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.voucher}
                onChange={setField("voucher")}
                placeholder="Nhập mã giảm giá (tùy chọn)"
                disabled={readOnly}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phương thức thanh toán</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.paymentMethod}
                onChange={setField("paymentMethod")}
                disabled={readOnly}
              >
                {paymentMethods.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Chi tiết sản phẩm</h3>
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
                    <th className="px-4 py-3 text-left font-medium">Tên SP</th>
                    <th className="px-4 py-3 text-right font-medium">Giá bán</th>
                    <th className="px-4 py-3 text-right font-medium">Số lượng</th>
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
                            className="h-9 w-[120px] rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={it.sku}
                            onChange={setItemField(idx, "sku")}
                            placeholder="Mã"
                            disabled={readOnly}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            className="h-9 w-full min-w-[220px] rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={it.name}
                            onChange={setItemField(idx, "name")}
                            placeholder="Tên sản phẩm"
                            disabled={readOnly}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            className="h-9 w-[140px] rounded-md border border-input bg-background px-2 text-sm text-right outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={it.price}
                            onChange={setItemField(idx, "price")}
                            disabled={readOnly}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            min={1}
                            className="h-9 w-[90px] rounded-md border border-input bg-background px-2 text-sm text-right outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={it.qty}
                            onChange={setItemField(idx, "qty")}
                            disabled={readOnly}
                          />
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2" />
            <div className="rounded-lg border border-border/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tổng tiền hàng</span>
                <span className="font-semibold">{formatCurrencyVND(totals.totalMerch)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Giảm giá (voucher)</span>
                <span className="font-semibold">{formatCurrencyVND(totals.discount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tổng cần thanh toán</span>
                <span className="font-bold text-primary">{formatCurrencyVND(totals.totalPay)}</span>
              </div>
            </div>
          </div>

          {!readOnly ? (
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => navigate("/pos")}>Thoát</Button>
              <Button variant="secondary" type="button" onClick={onSaveDraft}>Lưu nháp</Button>
              <Button type="button" onClick={onConfirmPaid}>Xác nhận thanh toán</Button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" asChild>
                <Link to={`/pos/${paramsId}/edit`}>Sửa</Link>
              </Button>
              <Button type="button" onClick={() => {}}>In hóa đơn</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
