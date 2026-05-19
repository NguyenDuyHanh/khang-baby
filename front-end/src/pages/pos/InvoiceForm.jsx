import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrencyVND } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

const paymentMethods = [
  { value: "TIEN_MAT", label: "Tiền mặt" },
  { value: "CHUYEN_KHOAN", label: "Chuyển khoản" },
  { value: "QUET_THE", label: "Quẹt thẻ" },
];

export default function InvoiceForm({ readOnly = false }) {
  const params = useParams();
  const key = params.id ?? "new";
  return <InvoiceFormInner key={key} readOnly={readOnly} paramsId={params.id} />;
}

function InvoiceFormInner({ readOnly = false, paramsId }) {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const isNew = paramsId === undefined;

  // Database lists
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    ma_hdb: "Hệ thống tự sinh",
    date: new Date().toISOString(),
    staffName: user?.ho_ten || "Hệ thống",
    customer: "",
    voucher: "",
    paymentMethod: "TIEN_MAT",
    items: [{ id_hang_hoa: "", price: 0, qty: 1, ton_kho: 999 }],
  });

  // Load products list from DB on mount for POS select dropdowns
  useEffect(() => {
    if (!token) return;
    
    const loadDependencies = async () => {
      try {
        setLoading(true);
        // Load products
        const prodRes = await apiRequest("/products?limit=100", { token });
        if (prodRes.ok) {
          setDbProducts(prodRes.data || []);
        }

        // If editing/viewing, load invoice detail
        if (!isNew) {
          const invRes = await apiRequest(`/invoices/${paramsId}`, { token });
          if (invRes.ok && invRes.data) {
            const inv = invRes.data;
            setForm({
              ma_hdb: inv.ma_hdb,
              date: inv.ngay_ban,
              staffName: inv.ten_nhan_vien || "Nhân viên",
              customer: inv.ten_khach_hang || "",
              voucher: inv.ma_voucher || "",
              paymentMethod: inv.phuong_thuc_thanh_toan || "TIEN_MAT",
              items: (inv.items || []).map(item => ({
                id_hang_hoa: item.id_hang_hoa,
                price: item.gia_ban,
                qty: item.so_luong,
                ton_kho: 999 // details load won't strictly enforce stock since it's already sold/saved
              }))
            });
          }
        }
      } catch (err) {
        console.error("Error initializing invoice form:", err);
        setError("Không thể kết nối đến cơ sở dữ liệu: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDependencies();
  }, [token, isNew, paramsId]);

  // Totals calculations
  const totals = useMemo(() => {
    const totalMerch = form.items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
    const discount = 0; // Backend handles voucher discount logic on submit
    const totalPay = Math.max(0, totalMerch - discount);
    return { totalMerch, discount, totalPay };
  }, [form.items]);

  const setField = (key) => (e) => {
    if (readOnly) return;
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleProductSelect = (idx, id_hang_hoa) => {
    if (readOnly) return;
    const selected = dbProducts.find(p => String(p.id) === String(id_hang_hoa));
    if (!selected) return;

    setForm((prev) => {
      const next = [...prev.items];
      next[idx] = {
        ...next[idx],
        id_hang_hoa,
        price: selected.gia_ban || 0,
        qty: 1,
        ton_kho: selected.ton_kho || 0,
      };
      return { ...prev, items: next };
    });
  };

  const setItemField = (idx, key) => (e) => {
    if (readOnly) return;
    const value = Number(e.target.value);
    setForm((prev) => {
      const next = [...prev.items];
      next[idx] = { ...next[idx], [key]: value };
      return { ...prev, items: next };
    });
  };

  const addRow = () => {
    if (readOnly) return;
    setForm((prev) => ({ ...prev, items: [...prev.items, { id_hang_hoa: "", price: 0, qty: 1, ton_kho: 999 }] }));
  };

  const removeRow = (idx) => {
    if (readOnly) return;
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  // Submit invoice logic
  const handleSave = async (confirmImmediately = false) => {
    setError("");
    const invalidItem = form.items.find(it => !it.id_hang_hoa || it.qty <= 0);
    if (invalidItem) {
      setError("Vui lòng chọn sản phẩm và nhập số lượng hợp lệ cho từng dòng.");
      return;
    }

    try {
      // 1. Create Invoice (Status: CHO_XAC_NHAN)
      const payload = {
        ten_khach_hang: form.customer || "Khách lẻ",
        ma_voucher: form.voucher || null,
        phuong_thuc_thanh_toan: form.paymentMethod,
        items: form.items.map(it => ({
          id_hang_hoa: Number(it.id_hang_hoa),
          gia_ban: it.price,
          so_luong: it.qty,
        }))
      };

      const res = await apiRequest("/invoices", {
        method: "POST",
        body: payload,
        token
      });

      if (!res.ok) {
        setError(res.message || "Lỗi khi lưu hóa đơn nháp.");
        return;
      }

      const invoiceId = res.id;

      // 2. If confirming immediately, call confirm-payment API to deduct stock and update status
      if (confirmImmediately && invoiceId) {
        const payRes = await apiRequest(`/invoices/${invoiceId}/confirm-payment`, {
          method: "POST",
          token
        });
        if (!payRes.ok) {
          toast.error("Lưu nháp thành công nhưng lỗi khi xác nhận thanh toán: " + payRes.message);
          setError("Lưu nháp thành công nhưng lỗi khi xác nhận thanh toán: " + payRes.message);
          return;
        }
      }

      toast.success(confirmImmediately ? "Xác nhận thanh toán & trừ kho thành công!" : "Lưu hóa đơn nháp thành công!");
      navigate("/pos");
    } catch (err) {
      toast.error("Lỗi: " + err.message);
      setError("Lỗi máy chủ kết nối: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500">Đang khởi tạo hóa đơn bán POS...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800">
            {readOnly ? "Chi tiết hóa đơn bán" : isNew ? "Tạo hóa đơn bán tại quầy (POS)" : "Chỉnh sửa hóa đơn bán"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Thông tin chi tiết thanh toán bán lẻ</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/pos">Quay lại</Link>
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-700">Thông tin hóa đơn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Mã hóa đơn bán</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-slate-50 px-3 text-sm text-slate-500 font-bold"
                value={form.ma_hdb}
                readOnly
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Ngày ghi nhận</label>
              <input
                type="datetime-local"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.date.slice(0, 16)}
                onChange={(e) => setField("date")({ target: { value: new Date(e.target.value).toISOString() } })}
                disabled={readOnly}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Nhân viên lập phiếu</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-slate-50 px-3 text-sm text-slate-500 font-medium"
                value={form.staffName}
                readOnly
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Tên khách hàng</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.customer}
                onChange={setField("customer")}
                placeholder="Khách lẻ"
                disabled={readOnly}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Mã voucher giảm giá</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.voucher}
                onChange={setField("voucher")}
                placeholder="Nhập voucher (nếu có)"
                disabled={readOnly}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Phương thức thanh toán</label>
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

          {/* Product Items Lines */}
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">Mặt hàng xuất bán POS</h3>
              {!readOnly && (
                <Button variant="outline" size="sm" type="button" onClick={addRow} className="gap-1">
                  Thêm mặt hàng
                </Button>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Chọn sản phẩm</th>
                    <th className="px-4 py-3 text-right font-semibold">Đơn giá bán</th>
                    <th className="px-4 py-3 text-right font-semibold">Số lượng xuất</th>
                    <th className="px-4 py-3 text-right font-semibold">Thành tiền</th>
                    {!readOnly && <th className="px-4 py-3 text-right font-semibold">Hành động</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {form.items.map((it, idx) => {
                    const lineTotal = (Number(it.price) || 0) * (Number(it.qty) || 0);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/20">
                        <td className="px-4 py-3 min-w-[280px]">
                          <select
                            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none"
                            value={it.id_hang_hoa}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                            disabled={readOnly}
                          >
                            <option value="">-- Chọn mặt hàng từ kho --</option>
                            {dbProducts.map(p => (
                              <option key={p.id} value={p.id}>
                                [{p.ma_sp}] {p.ten_sp} (Tồn kho: {p.ton_kho})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            className="h-9 w-[120px] rounded-md border border-input bg-slate-50 px-2 text-sm text-right text-slate-500 font-bold"
                            value={it.price}
                            readOnly
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            min={1}
                            max={it.ton_kho}
                            className="h-9 w-[90px] rounded-md border border-input bg-background px-2 text-sm text-right outline-none"
                            value={it.qty}
                            onChange={setItemField(idx, "qty")}
                            disabled={readOnly}
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold text-slate-800">
                          {formatCurrencyVND(lineTotal)}
                        </td>
                        {!readOnly && (
                          <td className="px-4 py-3 text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              type="button" 
                              onClick={() => removeRow(idx)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              Xóa
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subtotals & Submit Buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="lg:col-span-2" />
            <div className="rounded-xl border border-border/60 p-4 space-y-2 bg-slate-50/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-semibold">Cộng tiền hàng</span>
                <span className="font-extrabold text-slate-700">{formatCurrencyVND(totals.totalMerch)}</span>
              </div>
              <div className="flex items-center justify-between text-sm border-t pt-2 mt-2">
                <span className="text-slate-500 font-bold">Tổng cần thanh toán</span>
                <span className="font-extrabold text-primary text-lg">{formatCurrencyVND(totals.totalPay)}</span>
              </div>
            </div>
          </div>

          {!readOnly ? (
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => navigate("/pos")}>Thoát</Button>
              <Button variant="secondary" type="button" onClick={() => handleSave(false)} className="bg-slate-200 text-slate-800 hover:bg-slate-300">Lưu nháp đơn</Button>
              <Button type="button" onClick={() => handleSave(true)} className="bg-primary hover:bg-primary/95 text-white">Xác nhận thanh toán</Button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button type="button" onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-700 text-white">In hóa đơn</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
