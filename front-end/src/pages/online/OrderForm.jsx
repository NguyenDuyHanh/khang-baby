import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyVND } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const paymentMethods = [
  { value: "COD", label: "Ship COD (Thu hộ)" },
  { value: "CHUYEN_KHOAN", label: "Chuyển khoản trước" },
];

const statusBadge = (status) => {
  switch (status) {
    case "CHO_XU_LY":
      return <Badge className="bg-yellow-100 text-yellow-800 border-none font-bold">Chờ xử lý</Badge>;
    case "DA_XAC_NHAN":
      return <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold">Đã xác nhận (Đã trừ kho)</Badge>;
    case "DANG_GIAO":
      return <Badge className="bg-blue-100 text-blue-700 border-none font-bold">Đang giao</Badge>;
    case "DA_HOAN_THANH":
      return <Badge className="bg-green-100 text-green-700 border-none font-bold">Đã hoàn thành</Badge>;
    case "KHACH_DA_NHAN":
      return <Badge className="bg-teal-100 text-teal-700 border-none font-bold">Thành công</Badge>;
    case "KHIEU_NAI":
      return <Badge className="bg-red-100 text-red-700 border-none font-bold">Khiếu nại</Badge>;
    case "DA_HUY":
      return <Badge className="bg-red-100 text-red-700 border-none font-bold">Đã hủy</Badge>;
    default:
      return <Badge variant="outline">—</Badge>;
  }
};

export default function OrderForm({ readOnly = false }) {
  const params = useParams();
  const key = params.id ?? "new";
  return <OrderFormInner key={key} readOnly={readOnly} paramsId={params.id} />;
}

function OrderFormInner({ readOnly = false, paramsId }) {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const isNew = paramsId === undefined;

  // DB States
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderStatus, setOrderStatus] = useState("CHO_XU_LY");

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "danger"
  });

  const triggerConfirm = ({ title, message, onConfirm, variant = "danger" }) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      },
      variant
    });
  };

  const [form, setForm] = useState({
    ma_don: "Hệ thống tự sinh",
    customer: "",
    phone: "",
    address: "",
    note: "",
    channel: "Website",
    voucher: "",
    items: [{ id_hang_hoa: "", price: 0, qty: 1, ton_kho: 999 }],
    shipper: "Giao hàng nhanh",
    shipFee: 0,
    eta: "",
    tracking: "",
    paymentMethod: "COD",
    reason: "",
  });

  useEffect(() => {
    if (!token) return;

    const loadDependencies = async () => {
      try {
        setLoading(true);
        // Load active products list for line selection
        const prodRes = await apiRequest("/products?limit=100", { token });
        if (prodRes.ok) {
          setDbProducts(prodRes.data || []);
        }

        // If viewing existing order, fetch order details from backend
        if (!isNew) {
          const ordRes = await apiRequest(`/orders/${paramsId}`, { token });
          if (ordRes.ok && ordRes.data) {
            const ord = ordRes.data;
            setOrderStatus(ord.trang_thai);
            setForm({
              ma_don: ord.ma_don,
              customer: ord.ten_khach_hang || "",
              phone: ord.so_dien_thoai || "",
              address: ord.dia_chi_giao || "",
              note: ord.ghi_chu_don || "",
              channel: ord.kenh_dat_hang || "Website",
              voucher: ord.ma_voucher || "",
              items: (ord.items || []).map(item => ({
                id_hang_hoa: item.id_hang_hoa,
                price: item.gia_ban,
                qty: item.so_luong,
                ton_kho: 999
              })),
              shipper: ord.don_vi_van_chuyen || "Giao hàng nhanh",
              shipFee: ord.phi_giao_hang || 0,
              eta: ord.ngay_giao_du_kien ? ord.ngay_giao_du_kien.slice(0, 10) : "",
              tracking: ord.ma_van_don || "",
              paymentMethod: ord.phuong_thuc_thanh_toan || "COD",
              reason: ord.ly_do_khieu_nai || "",
            });
          }
        }
      } catch (err) {
        console.error("Error loading order context:", err);
        setError("Không thể tải thông tin đơn hàng: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDependencies();
  }, [token, isNew, paramsId]);

  const totals = useMemo(() => {
    const totalMerch = form.items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
    const discount = 0; // Managed by backend calculations
    const shipFee = Number(form.shipFee) || 0;
    const totalPay = Math.max(0, totalMerch - discount + shipFee);
    return { totalMerch, shipFee, discount, totalPay };
  }, [form.items, form.shipFee]);

  const setField = (key) => (e) => {
    if (readOnly) return;
    const value = key === "shipFee" ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
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

  // Create new order
  const handleCreateOrder = async () => {
    setError("");
    const invalid = form.items.find(it => !it.id_hang_hoa || it.qty <= 0);
    if (invalid) {
      setError("Vui lòng cấu hình sản phẩm và số lượng mua hợp lệ cho từng dòng.");
      return;
    }

    try {
      const payload = {
        ten_khach_hang: form.customer,
        so_dien_thoai: form.phone,
        dia_chi_giao: form.address,
        ghi_chu_don: form.note,
        kenh_dat_hang: form.channel,
        ma_voucher: form.voucher || null,
        phi_giao_hang: form.shipFee,
        don_vi_van_chuyen: form.shipper,
        ngay_giao_du_kien: form.eta || null,
        phuong_thuc_thanh_toan: form.paymentMethod,
        items: form.items.map(it => ({
          id_hang_hoa: Number(it.id_hang_hoa),
          gia_ban: it.price,
          so_luong: it.qty,
        }))
      };

      const res = await apiRequest("/orders", {
        method: "POST",
        body: payload,
        token
      });

      if (res.ok) {
        toast.success("Đã tạo đơn hàng thành công! Trạng thái: CHỜ XỬ LÝ.");
        navigate("/online");
      } else {
        toast.error(res.message || "Không thể tạo đơn hàng.");
        setError(res.message || "Không thể tạo đơn hàng.");
      }
    } catch (err) {
      toast.error("Lỗi máy chủ: " + err.message);
      setError("Lỗi máy chủ kết nối: " + err.message);
    }
  };

  // Order state actions
  const handleConfirm = () => {
    triggerConfirm({
      title: "Duyệt đơn hàng",
      message: "Bạn có chắc muốn duyệt đơn hàng này? Số lượng tồn kho sản phẩm tương ứng sẽ được tự động trừ bớt.",
      variant: "primary",
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/orders/${paramsId}/confirm`, { method: "POST", token });
          if (res.ok) {
            toast.success("Đã duyệt đơn hàng thành công!");
            navigate("/online");
          } else {
            toast.error("Lỗi duyệt đơn: " + res.message);
          }
        } catch (err) {
          toast.error("Lỗi: " + err.message);
        }
      }
    });
  };

  const handleCancel = () => {
    triggerConfirm({
      title: "Hủy đơn hàng",
      message: `Bạn có chắc chắn muốn hủy đơn hàng "${form.ma_don}"?`,
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/orders/${paramsId}/cancel`, { method: "POST", token });
          if (res.ok) {
            toast.success("Đã hủy đơn hàng thành công!");
            navigate("/online");
          } else {
            toast.error("Lỗi hủy đơn: " + res.message);
          }
        } catch (err) {
          toast.error("Lỗi: " + err.message);
        }
      }
    });
  };

  const handleComplete = () => {
    triggerConfirm({
      title: "Hoàn thành đơn hàng",
      message: "Bạn có chắc chắn muốn đánh dấu hoàn thành giao đơn hàng này?",
      variant: "primary",
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/orders/${paramsId}/complete`, { method: "POST", token });
          if (res.ok) {
            toast.success("Đã hoàn thành đơn hàng!");
            navigate("/online");
          } else {
            toast.error("Lỗi hoàn thành đơn: " + res.message);
          }
        } catch (err) {
          toast.error("Lỗi: " + err.message);
        }
      }
    });
  };

  const handleCloseComplaint = () => {
    triggerConfirm({
      title: "Đóng khiếu nại (Giao thành công)",
      message: "Xác nhận khách đã nhận được hàng và đóng khiếu nại này?",
      variant: "primary",
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/orders/${paramsId}/close-complaint`, { method: "POST", token });
          if (res.ok) {
            toast.success("Đã đóng khiếu nại thành công!");
            navigate("/online");
          } else {
            toast.error("Lỗi: " + res.message);
          }
        } catch (err) {
          toast.error("Lỗi: " + err.message);
        }
      }
    });
  };

  const handleRetryDelivery = () => {
    triggerConfirm({
      title: "Tiếp tục giao hàng",
      message: "Chuyển đơn hàng lại trạng thái Đang giao?",
      variant: "primary",
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/orders/${paramsId}/retry-delivery`, { method: "POST", token });
          if (res.ok) {
            toast.success("Đã cập nhật trạng thái giao hàng!");
            navigate("/online");
          } else {
            toast.error("Lỗi: " + res.message);
          }
        } catch (err) {
          toast.error("Lỗi: " + err.message);
        }
      }
    });
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500">Đang tải thông tin biểu mẫu đơn hàng...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800">
            {readOnly ? "Chi tiết đơn hàng" : isNew ? "Tạo đơn hàng mới" : "Chỉnh sửa đơn hàng"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Quản lý giao vận và xuất kho</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/online">Quay lại</Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive font-semibold">
          {error}
        </div>
      )}

      {orderStatus === "KHIEU_NAI" && form.reason && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-3">
          <div className="font-bold shrink-0 mt-0.5">Khách khiếu nại:</div>
          <div>{form.reason}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-700">Thông tin khách hàng đặt</CardTitle>
            {!isNew && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Trạng thái:</span>
                {statusBadge(orderStatus)}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Tên khách hàng</label>
                <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2" value={form.customer} onChange={setField("customer")} disabled={readOnly} placeholder="Nhập họ tên người nhận" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Số điện thoại</label>
                <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2" value={form.phone} onChange={setField("phone")} disabled={readOnly} placeholder="SĐT liên lạc giao hàng" />
              </div>
              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Địa chỉ giao hàng</label>
                <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2" value={form.address} onChange={setField("address")} disabled={readOnly} placeholder="Số nhà, đường phố, phường xã, quận huyện..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Kênh đặt hàng</label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2" value={form.channel} onChange={setField("channel")} disabled={readOnly}>
                  <option value="Website">Website</option>
                  <option value="TRỰC TIẾP">Trực tiếp</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Mã voucher giảm giá</label>
                <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2" value={form.voucher} onChange={setField("voucher")} disabled={readOnly} placeholder="Mã giảm giá (nếu có)" />
              </div>
              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Ghi chú đơn hàng</label>
                <textarea className="min-h-[84px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2" value={form.note} onChange={setField("note")} disabled={readOnly} placeholder="Yêu cầu đặt biệt hoặc ghi chú cho shipper..." />
              </div>
            </div>

            {/* Product items table */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700">Mặt hàng mua hàng</h3>
                {!readOnly && (
                  <Button variant="outline" size="sm" type="button" onClick={addRow}>
                    Thêm dòng sản phẩm
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Chọn sản phẩm</th>
                      <th className="px-4 py-3 text-right font-semibold">Đơn giá bán</th>
                      <th className="px-4 py-3 text-right font-semibold">Số lượng đặt</th>
                      <th className="px-4 py-3 text-right font-semibold">Thành tiền</th>
                      {!readOnly && <th className="px-4 py-3 text-right font-semibold">Hành động</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {form.items.map((it, idx) => {
                      const line = (Number(it.price) || 0) * (Number(it.qty) || 0);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/20">
                          <td className="px-4 py-3 min-w-[240px]">
                            <select
                              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none"
                              value={it.id_hang_hoa}
                              onChange={(e) => handleProductSelect(idx, e.target.value)}
                              disabled={readOnly}
                            >
                              <option value="">-- Chọn mặt hàng --</option>
                              {dbProducts.map(p => (
                                <option key={p.id} value={p.id}>
                                  [{p.ma_sp}] {p.ten_sp} (Kho: {p.ton_kho})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input type="number" className="h-9 w-[120px] rounded-md border border-input bg-slate-50 px-2 text-sm text-right text-slate-500 font-bold" value={it.price} readOnly />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input type="number" min={1} className="h-9 w-[80px] rounded-md border border-input bg-background px-2 text-sm text-right outline-none" value={it.qty} onChange={setItemField(idx, "qty")} disabled={readOnly} />
                          </td>
                          <td className="px-4 py-3 text-right font-extrabold text-slate-800">{formatCurrencyVND(line)}</td>
                          {!readOnly && (
                            <td className="px-4 py-3 text-right">
                              <Button variant="outline" size="sm" type="button" onClick={() => removeRow(idx)} className="text-destructive hover:bg-destructive/10">
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
          </CardContent>
        </Card>

        {/* Deliveries & Summary sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-700">Chi tiết giao vận</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Đơn vị vận chuyển</label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none" value={form.shipper} onChange={setField("shipper")} disabled={readOnly}>
                  <option value="Giao hàng nhanh">Giao hàng nhanh</option>
                  <option value="GHTK">GHTK</option>
                  <option value="Viettel Post">Viettel Post</option>
                  <option value="NCC nội bộ">NCC nội bộ</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Phí giao hàng (VND)</label>
                <input type="number" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none" value={form.shipFee} onChange={setField("shipFee")} disabled={readOnly} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Ngày giao dự kiến</label>
                <input type="date" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none" value={form.eta} onChange={setField("eta")} disabled={readOnly} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Mã vận đơn tracking</label>
                <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none" value={form.tracking} onChange={setField("tracking")} disabled={readOnly} placeholder="Mã vận đơn đối tác (nếu có)" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-700">Tổng kết thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-semibold">Tiền hàng tạm tính</span>
                <span className="font-bold text-slate-700">{formatCurrencyVND(totals.totalMerch)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-semibold">Phí giao hàng</span>
                <span className="font-semibold text-slate-700">{formatCurrencyVND(totals.shipFee)}</span>
              </div>
              <div className="flex items-center justify-between text-sm border-t pt-2 mt-2">
                <span className="text-slate-500 font-bold">Tổng thanh toán</span>
                <span className="font-extrabold text-primary text-lg">{formatCurrencyVND(totals.totalPay)}</span>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Phương thức thanh toán</label>
                  <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none" value={form.paymentMethod} onChange={setField("paymentMethod")} disabled={readOnly}>
                    {paymentMethods.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {!readOnly ? (
                  <div className="flex flex-col gap-2 pt-2">
                    <Button type="button" onClick={handleCreateOrder} className="bg-primary hover:bg-primary/95 text-white w-full">
                      Tạo & Lưu đơn hàng
                    </Button>
                    <Button variant="outline" type="button" onClick={() => navigate("/online")} className="w-full">
                      Thoát
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    {orderStatus === "CHO_XU_LY" && (
                      <Button type="button" onClick={handleConfirm} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                        Duyệt đơn & Trừ kho
                      </Button>
                    )}
                    {orderStatus === "DA_XAC_NHAN" && (
                      <Button type="button" onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                        Hoàn thành giao đơn
                      </Button>
                    )}
                    
                    {/* Các nút xử lý Khiếu nại */}
                    {orderStatus === "KHIEU_NAI" && (
                      <>
                        <Button type="button" onClick={handleCloseComplaint} className="bg-teal-600 hover:bg-teal-700 text-white w-full">
                          Xác nhận đã giao
                        </Button>
                        <Button type="button" onClick={handleRetryDelivery} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                          Yêu cầu giao lại
                        </Button>
                      </>
                    )}

                    {orderStatus !== "DA_HUY" && orderStatus !== "DA_HOAN_THANH" && orderStatus !== "KHACH_DA_NHAN" && (
                      <Button type="button" onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white w-full">
                        Hủy đơn hàng
                      </Button>
                    )}
                    <Button variant="outline" type="button" onClick={() => window.print()} className="w-full">
                      In nhãn giao hàng
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
