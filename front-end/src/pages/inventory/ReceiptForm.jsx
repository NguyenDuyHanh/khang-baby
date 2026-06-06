import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { formatCurrencyVND } from "@/lib/format";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

export default function ReceiptForm() {
  const params = useParams();
  const key = params.id ?? "new";
  return <ReceiptFormInner key={key} paramsId={params.id} />;
}

function ReceiptFormInner({ paramsId }) {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const isNew = paramsId === undefined;

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    id_nha_cung_cap: "",
    paymentId: "",
    items: [{ id_hang_hoa: "", gia_nhap: 0, so_luong: 1, ngay_san_xuat: "", han_su_dung: "" }],
  });

  // Load suppliers and products
  useEffect(() => {
    const loadDependencies = async () => {
      try {
        setLoading(true);
        // Get suppliers
        const supRes = await apiRequest("/products/suppliers/list", { token });
        if (supRes.ok) {
          setSuppliers(supRes.data || []);
          if (supRes.data?.length > 0 && isNew) {
            setForm(f => ({ ...f, id_nha_cung_cap: supRes.data[0].id }));
          }
        }

        // Get products
        const prodRes = await apiRequest("/products", { token });
        if (prodRes.ok) {
          setProducts(prodRes.data || []);
        }

        // If editing, load receipt data
        if (!isNew) {
          const receiptRes = await apiRequest(`/receipts/${paramsId}`, { token });
          if (receiptRes.ok) {
            const r = receiptRes.data;
            setForm({
              id_nha_cung_cap: r.id_nha_cung_cap || "",
              paymentId: r.ma_voucher || "",
              items: (r.items || []).map(it => ({
                id_hang_hoa: it.id_hang_hoa || "",
                gia_nhap: Number(it.gia_nhap) || 0,
                so_luong: Number(it.so_luong) || 0,
                ngay_san_xuat: it.ngay_san_xuat ? it.ngay_san_xuat.split('T')[0] : "",
                han_su_dung: it.han_su_dung ? it.han_su_dung.split('T')[0] : "",
              })),
            });
          }
        }
      } catch (err) {
        console.error("Error loading dependencies:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDependencies();
  }, [token, paramsId, isNew]);

  const totals = useMemo(() => {
    const total = form.items.reduce((sum, it) => sum + (Number(it.gia_nhap) || 0) * (Number(it.so_luong) || 0), 0);
    return { total };
  }, [form.items]);

  const setField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const setItemField = (idx, key) => (e) => {
    const value = key === "so_luong" || key === "gia_nhap" ? Number(e.target.value) : e.target.value;
    
    setForm((prev) => {
      const next = [...prev.items];
      const updatedItem = { ...next[idx], [key]: value };

      // If user selected a product, automatically auto-fill its gia_nhap from products database
      if (key === "id_hang_hoa") {
        const prod = products.find(p => String(p.id) === String(value));
        if (prod) {
          updatedItem.gia_nhap = Number(prod.gia_nhap) || 0;
        }
      }

      next[idx] = updatedItem;
      return { ...prev, items: next };
    });
  };

  const addRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { id_hang_hoa: products[0]?.id || "", gia_nhap: products[0]?.gia_nhap || 0, so_luong: 1, ngay_san_xuat: "", han_su_dung: "" }]
    }));
  };

  const removeRow = (idx) => {
    if (form.items.length <= 1) return;
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_nha_cung_cap) {
      toast.warning("Vui lòng chọn nhà cung cấp!");
      return;
    }

    const invalidItem = form.items.find(it => !it.id_hang_hoa || Number(it.so_luong) <= 0);
    if (invalidItem) {
      toast.warning("Vui lòng nhập đầy đủ thông tin sản phẩm và số lượng lớn hơn 0!");
      return;
    }

    try {
      const url = isNew ? "/receipts" : `/receipts/${paramsId}`;
      const method = isNew ? "POST" : "PUT";
      
      const payload = {
        id_nha_cung_cap: Number(form.id_nha_cung_cap),
        items: form.items.map(it => ({
          id_hang_hoa: Number(it.id_hang_hoa),
          gia_nhap: Number(it.gia_nhap),
          so_luong: Number(it.so_luong),
          ngay_san_xuat: it.ngay_san_xuat || null,
          han_su_dung: it.han_su_dung || null
        }))
      };

      const res = await apiRequest(url, {
        method,
        body: payload,
        token
      });

      if (res.ok) {
        toast.success(isNew ? "Thêm phiếu nhập hàng thành công!" : "Cập nhật phiếu nhập thành công!");
        navigate("/inventory/receipts");
      } else {
        toast.error("Lỗi khi lưu phiếu nhập: " + res.message);
      }
    } catch (err) {
      toast.error("Lỗi khi lưu phiếu nhập: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Đang tải dependencies...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/inventory/receipts">
              <ArrowLeft size={16} />
            </Link>
          </Button>
          <h3 className="text-lg font-bold text-slate-800">{isNew ? "Thêm mới Phiếu Nhập Hàng" : "Sửa Phiếu Nhập Hàng"}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" type="button" onClick={() => navigate("/inventory/receipts")}>
            Hủy bỏ
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/95 text-white">
            Lưu phiếu nhập
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-700">Thông tin phiếu nhập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600">Nhà cung cấp</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.id_nha_cung_cap}
                onChange={setField("id_nha_cung_cap")}
                required
              >
                <option value="">-- Chọn Nhà Cung Cấp --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.ten_ncc}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600">Nhân viên tạo phiếu</label>
              <input 
                className="h-10 w-full rounded-md border border-input bg-slate-50/70 text-slate-500 px-3 text-sm" 
                value={user?.ho_ten || "Hệ thống"} 
                readOnly 
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-slate-700">Chi tiết danh mục sản phẩm nhập</h4>
              <Button variant="outline" size="sm" type="button" onClick={addRow} className="gap-1 border-primary text-primary hover:bg-primary/5">
                <Plus size={14} />
                Thêm sản phẩm
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Sản phẩm</th>
                    <th className="px-4 py-3 text-right font-semibold">Giá nhập (VNĐ)</th>
                    <th className="px-4 py-3 text-right font-semibold">Số lượng</th>
                    <th className="px-4 py-3 text-center font-semibold">Ngày sản xuất (NSX)</th>
                    <th className="px-4 py-3 text-center font-semibold">Hạn sử dụng (HSD)</th>
                    <th className="px-4 py-3 text-right font-semibold">Thành tiền</th>
                    <th className="px-4 py-3 text-center font-semibold">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {form.items.map((it, idx) => {
                    const line = (Number(it.gia_nhap) || 0) * (Number(it.so_luong) || 0);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/20">
                        <td className="px-4 py-3 min-w-[280px]">
                          <select
                            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none"
                            value={it.id_hang_hoa}
                            onChange={setItemField(idx, "id_hang_hoa")}
                            required
                          >
                            <option value="">-- Chọn sản phẩm nhập --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.ten_sp} ({p.ma_sp})</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            className="h-9 w-[130px] rounded-md border border-input bg-background px-2 text-sm text-right outline-none"
                            value={it.gia_nhap}
                            onChange={setItemField(idx, "gia_nhap")}
                            min={0}
                            required
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            min={1}
                            className="h-9 w-[90px] rounded-md border border-input bg-background px-2 text-sm text-right outline-none"
                            value={it.so_luong}
                            onChange={setItemField(idx, "so_luong")}
                            required
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="date" 
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm mx-auto block outline-none" 
                            value={it.ngay_san_xuat} 
                            onChange={setItemField(idx, "ngay_san_xuat")} 
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="date" 
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm mx-auto block outline-none" 
                            value={it.han_su_dung} 
                            onChange={setItemField(idx, "han_su_dung")} 
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrencyVND(line)}</td>
                        <td className="px-4 py-3 text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            type="button" 
                            onClick={() => removeRow(idx)}
                            disabled={form.items.length <= 1}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grand total */}
          <div className="flex items-center justify-end pt-4">
            <div className="rounded-lg border bg-slate-50/50 p-4 w-full max-w-[360px] flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Tổng tiền nhập hàng</span>
              <span className="font-extrabold text-lg text-primary">{formatCurrencyVND(totals.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
