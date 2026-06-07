import { useId, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrencyVND } from "@/lib/format";

const demoOrderById = {
  HD002: {
    id: "HD002",
    customer: "Trần Thị B",
    phone: "0987 654 321",
    address: "123 Trần Phú, Bắc Ninh",
    note: "",
    channel: "Website",
    voucher: "",
    items: [{ sku: "SP2B", name: "Tã bỉm size M", price: 290000, qty: 1 }],
    shipper: "Giao hàng nhanh",
    shipFee: 0,
    eta: "2024-05-22",
    tracking: "",
    paymentMethod: "COD",
  },
};

export default function OrderForm({ readOnly = false }) {
  const params = useParams();
  const key = params.id ?? "new";
  return <OrderFormInner key={key} readOnly={readOnly} paramsId={params.id} />;
}

function OrderFormInner({ readOnly = false, paramsId }) {
  const navigate = useNavigate();
  const isNew = paramsId === undefined;
  const draftId = useId();
  const draftSuffix = draftId.replaceAll(":", "");

  const initial = useMemo(() => {
    if (isNew) {
      return {
        id: `HD-${draftSuffix}`,
        customer: "",
        phone: "",
        address: "",
        note: "",
        channel: "Facebook",
        voucher: "",
        items: [{ sku: "", name: "", price: 0, qty: 1 }],
        shipper: "Giao hàng nhanh",
        shipFee: 0,
        eta: "",
        tracking: "",
        paymentMethod: "COD",
      };
    }
    const found = demoOrderById[paramsId];
    return {
      id: found?.id || paramsId,
      customer: found?.customer || "",
      phone: found?.phone || "",
      address: found?.address || "",
      note: found?.note || "",
      channel: found?.channel || "Facebook",
      voucher: found?.voucher || "",
      items: found?.items || [{ sku: "", name: "", price: 0, qty: 1 }],
      shipper: found?.shipper || "Giao hàng nhanh",
      shipFee: found?.shipFee || 0,
      eta: found?.eta || "",
      tracking: found?.tracking || "",
      paymentMethod: found?.paymentMethod || "COD",
    };
  }, [draftSuffix, isNew, paramsId]);

  const [form, setForm] = useState(initial);

  const totals = useMemo(() => {
    const totalMerch = form.items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
    const discount = 0;
    const shipFee = Number(form.shipFee) || 0;
    const totalPay = Math.max(0, totalMerch - discount + shipFee);
    return { totalMerch, shipFee, discount, totalPay };
  }, [form.items, form.shipFee]);

  const setField = (key) => (e) => {
    if (readOnly) return;
    const value = key === "shipFee" ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
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

<<<<<<< Updated upstream
  const onConfirm = () => navigate("/online", { replace: true });
  const onCancel = () => navigate("/online", { replace: true });
=======
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

  const handleDeliver = () => {
    triggerConfirm({
      title: "Giao hàng",
      message: "Bạn có chắc chắn chuyển đơn hàng sang trạng thái đang giao?",
      variant: "primary",
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/orders/${paramsId}/deliver`, { method: "POST", token });
          if (res.ok) {
            toast.success("Đã chuyển trạng thái đang giao!");
            navigate("/online");
          } else {
            toast.error("Lỗi giao đơn: " + res.message);
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
>>>>>>> Stashed changes

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {readOnly ? "Chi tiết đơn hàng" : isNew ? "Tạo đơn thủ công" : "Chỉnh sửa đơn hàng"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Thông tin khách hàng, sản phẩm và giao hàng</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/online">Quay lại</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tên khách hàng</label>
                <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.customer} onChange={setField("customer")} disabled={readOnly} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Số điện thoại</label>
                <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.phone} onChange={setField("phone")} disabled={readOnly} />
              </div>
              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-sm font-medium">Địa chỉ giao hàng</label>
                <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.address} onChange={setField("address")} disabled={readOnly} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Kênh đặt hàng</label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.channel} onChange={setField("channel")} disabled={readOnly}>
                  <option value="Facebook">Facebook</option>
                  <option value="Website">Website</option>
                  <option value="Zalo">Zalo</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mã voucher</label>
                <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.voucher} onChange={setField("voucher")} disabled={readOnly} />
              </div>
              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-sm font-medium">Ghi chú đơn hàng</label>
                <textarea className="min-h-[84px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.note} onChange={setField("note")} disabled={readOnly} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Sản phẩm</h3>
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
                            <input className="h-9 w-[120px] rounded-md border border-input bg-background px-2 text-sm" value={it.sku} onChange={setItemField(idx, "sku")} disabled={readOnly} />
                          </td>
                          <td className="px-4 py-3">
                            <input className="h-9 w-full min-w-[220px] rounded-md border border-input bg-background px-2 text-sm" value={it.name} onChange={setItemField(idx, "name")} disabled={readOnly} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input type="number" className="h-9 w-[140px] rounded-md border border-input bg-background px-2 text-sm text-right" value={it.price} onChange={setItemField(idx, "price")} disabled={readOnly} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input type="number" min={1} className="h-9 w-[90px] rounded-md border border-input bg-background px-2 text-sm text-right" value={it.qty} onChange={setItemField(idx, "qty")} disabled={readOnly} />
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
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Đơn vị vận chuyển</label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.shipper} onChange={setField("shipper")} disabled={readOnly}>
                  <option value="Giao hàng nhanh">Giao hàng nhanh</option>
                  <option value="GHTK">GHTK</option>
                  <option value="NCC nội bộ">NCC nội bộ</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phí giao hàng</label>
                <input type="number" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.shipFee} onChange={setField("shipFee")} disabled={readOnly} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Ngày giao dự kiến</label>
                <input type="date" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.eta} onChange={setField("eta")} disabled={readOnly} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mã vận đơn</label>
                <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.tracking} onChange={setField("tracking")} disabled={readOnly} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tổng kết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tổng tiền hàng</span>
                <span className="font-semibold">{formatCurrencyVND(totals.totalMerch)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span className="font-semibold">{formatCurrencyVND(totals.shipFee)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Giảm giá</span>
                <span className="font-semibold">{formatCurrencyVND(totals.discount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tổng thanh toán</span>
                <span className="font-bold text-primary">{formatCurrencyVND(totals.totalPay)}</span>
              </div>

              <div className="pt-3 space-y-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Phương thức TT</label>
                  <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.paymentMethod} onChange={setField("paymentMethod")} disabled={readOnly}>
                    <option value="COD">COD</option>
                    <option value="ChuyenKhoan">Chuyển khoản trước</option>
                  </select>
                </div>

                {!readOnly ? (
                  <div className="flex flex-col gap-2">
                    <Button type="button" onClick={onConfirm}>
                      Xác nhận đơn
                    </Button>
                    <Button variant="outline" type="button" onClick={onCancel}>
                      Hủy
                    </Button>
                  </div>
                ) : (
<<<<<<< Updated upstream
                  <div className="flex flex-col gap-2">
                    <Button type="button" onClick={() => {}}>
                      In phiếu giao hàng
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/online/${paramsId}/edit`}>Sửa</Link>
=======
                  <div className="flex flex-col gap-2 pt-2">
                    {orderStatus === "CHO_XU_LY" && (
                      <Button type="button" onClick={handleConfirm} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                        Duyệt đơn & Trừ kho
                      </Button>
                    )}
                    {orderStatus === "DA_XAC_NHAN" && (
                      <Button type="button" onClick={handleDeliver} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                        Giao hàng
                      </Button>
                    )}
                    {orderStatus === "DANG_GIAO" && (
                      <Button type="button" onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                        Giao hàng thành công
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
>>>>>>> Stashed changes
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
