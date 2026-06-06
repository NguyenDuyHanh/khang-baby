import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrencyVND } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { Barcode, Search } from "lucide-react";

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
    customerPhone: "",
    voucher: "",
    paymentMethod: "TIEN_MAT",
    items: [], // Start with an empty list for convenient barcode scanning
  });

  const [voucherStatus, setVoucherStatus] = useState({
    code: "",
    valid: false,
    discount: 0,
    details: null,
    message: ""
  });

  // Barcode / Search states & ref
  const barcodeInputRef = useRef(null);
  const [barcodeQuery, setBarcodeQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Play "tít" sound via Web Audio API when scanning successfully
  const playBeepSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.warn("Web Audio API not supported or blocked by browser:", e);
    }
  };

  // Focus scanning input on load
  useEffect(() => {
    if (!loading && !readOnly) {
      const timer = setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, readOnly]);

  // Handle global F4 shortcut to focus barcode scanner
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F4") {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        barcodeInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update search suggestions as user types
  useEffect(() => {
    if (!barcodeQuery.trim()) {
      setSearchResults([]);
      setHighlightedIndex(-1);
      return;
    }

    const query = barcodeQuery.toLowerCase().trim();
    const filtered = dbProducts.filter(p => 
      p.ma_sp.toLowerCase().includes(query) || 
      p.ten_sp.toLowerCase().includes(query)
    ).slice(0, 8);

    setSearchResults(filtered);
    setHighlightedIndex(filtered.length > 0 ? 0 : -1);
  }, [barcodeQuery, dbProducts]);

  const addOrIncrementProduct = (product) => {
    if (product.ton_kho <= 0) {
      toast.warning(`Sản phẩm "${product.ten_sp}" đã hết hàng trong kho!`);
      return false;
    }

    let success = false;
    setForm((prev) => {
      const existingIdx = prev.items.findIndex(it => String(it.id_hang_hoa) === String(product.id));
      const next = [...prev.items];

      if (existingIdx > -1) {
        const currentQty = next[existingIdx].qty;
        if (currentQty >= product.ton_kho) {
          toast.warning(`Không thể thêm! Vượt quá số lượng tồn kho (tồn: ${product.ton_kho}).`);
          success = false;
          return prev;
        }
        next[existingIdx] = {
          ...next[existingIdx],
          qty: currentQty + 1,
        };
        success = true;
      } else {
        next.push({
          id_hang_hoa: String(product.id),
          price: product.gia_ban || 0,
          qty: 1,
          ton_kho: product.ton_kho || 0,
        });
        success = true;
      }
      return { ...prev, items: next };
    });

    if (success) {
      playBeepSound();
      toast.success(`Đã thêm: ${product.ten_sp}`);
    }
    return success;
  };

  const handleBarcodeKeyDown = (e) => {
    if (readOnly) return;

    if (e.key === "Enter") {
      e.preventDefault();
      const query = barcodeQuery.trim();
      if (!query) return;

      // 1. Try exact barcode match (ma_sp)
      const exactMatch = dbProducts.find(p => p.ma_sp.toLowerCase() === query.toLowerCase());
      if (exactMatch) {
        const added = addOrIncrementProduct(exactMatch);
        if (added) setBarcodeQuery("");
        return;
      }

      // 2. If highlighted suggestion, select it
      if (searchResults.length > 0 && highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
        const selected = searchResults[highlightedIndex];
        const added = addOrIncrementProduct(selected);
        if (added) setBarcodeQuery("");
        return;
      }

      // 3. Fallback: single result
      if (searchResults.length === 1) {
        const added = addOrIncrementProduct(searchResults[0]);
        if (added) setBarcodeQuery("");
        return;
      }

      toast.error(`Không tìm thấy sản phẩm nào có mã hoặc tên khớp với "${query}"`);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (searchResults.length > 0) {
        setHighlightedIndex((prev) => (prev + 1) % searchResults.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (searchResults.length > 0) {
        setHighlightedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
      }
    } else if (e.key === "Escape") {
      setSearchResults([]);
      setHighlightedIndex(-1);
    }
  };

  const handleSearchResultClick = (product) => {
    const added = addOrIncrementProduct(product);
    if (added) {
      setBarcodeQuery("");
      barcodeInputRef.current?.focus();
    }
  };

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
            if (inv.ma_voucher) {
              setVoucherStatus({
                code: inv.ma_voucher,
                valid: true,
                discount: Number(inv.tien_giam || 0),
                details: {
                  ma_voucher: inv.ma_voucher,
                  gia_tri_giam: Number(inv.tien_giam || 0)
                },
                message: `Đã áp dụng voucher: ${inv.ma_voucher} (Giảm ${formatCurrencyVND(inv.tien_giam)})`
              });
            }
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

  // Apply voucher handler
  const handleApplyVoucher = async () => {
    const code = form.voucher?.trim();
    if (!code) {
      setVoucherStatus({ code: "", valid: false, discount: 0, details: null, message: "" });
      return;
    }

    try {
      const totalMerch = form.items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
      const res = await apiRequest(`/vouchers/validate?code=${code}&amount=${totalMerch}`, { token });
      
      if (res.ok) {
        setVoucherStatus({
          code,
          valid: true,
          discount: Number(res.discount),
          details: res.voucher,
          message: `Áp dụng thành công: Giảm ${formatCurrencyVND(res.discount)}`
        });
        toast.success(`Đã áp dụng voucher: ${code}`);
      } else {
        setVoucherStatus({
          code,
          valid: false,
          discount: 0,
          details: null,
          message: res.message || "Mã giảm giá không hợp lệ."
        });
        toast.error(res.message || "Áp dụng mã giảm giá thất bại.");
      }
    } catch (err) {
      console.error("Voucher validation error:", err);
      setVoucherStatus({
        code,
        valid: false,
        discount: 0,
        details: null,
        message: "Không thể kiểm tra voucher."
      });
      toast.error("Không thể kết nối đến máy chủ.");
    }
  };

  // Totals calculations with reactive voucher discount validation
  const totals = useMemo(() => {
    const totalMerch = form.items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
    
    let discount = 0;
    let localMsg = voucherStatus.message;
    let localValid = voucherStatus.valid;

    if (voucherStatus.valid && voucherStatus.details) {
      const v = voucherStatus.details;
      if (v.gia_toi_thieu && totalMerch < Number(v.gia_toi_thieu)) {
        discount = 0;
        localMsg = `Chưa đạt điều kiện: Đơn hàng tối thiểu phải từ ${formatCurrencyVND(v.gia_toi_thieu)}`;
        localValid = false;
      } else {
        if (v.gia_tri_giam) {
          discount = Number(v.gia_tri_giam);
        } else if (v.phan_tram_giam) {
          discount = Math.floor((totalMerch * Number(v.phan_tram_giam)) / 100);
        }
        localMsg = `Áp dụng thành công: Giảm ${formatCurrencyVND(discount)}`;
        localValid = true;
      }
    }
    
    const totalPay = Math.max(0, totalMerch - discount);
    return { totalMerch, discount, totalPay, localMsg, localValid };
  }, [form.items, voucherStatus]);

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
    if (form.items.length === 0) {
      setError("Vui lòng thêm ít nhất một sản phẩm vào hóa đơn.");
      return;
    }
    const invalidItem = form.items.find(it => !it.id_hang_hoa || it.qty <= 0);
    if (invalidItem) {
      setError("Vui lòng chọn sản phẩm và nhập số lượng hợp lệ cho từng dòng.");
      return;
    }

    try {
      // 1. Create Invoice (Status: CHO_XAC_NHAN)
      const payload = {
        ten_khach_hang: form.customer || "Khách lẻ",
        so_dien_thoai: form.customerPhone || "",
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
              <label className="text-xs font-semibold text-slate-600">Số điện thoại khách hàng</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.customerPhone}
                onChange={setField("customerPhone")}
                placeholder="0912345678"
                disabled={readOnly}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Mã voucher giảm giá</label>
              <div className="flex gap-2">
                <input
                  className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.voucher}
                  onChange={(e) => {
                    setField("voucher")(e);
                    if (voucherStatus.code && e.target.value !== voucherStatus.code) {
                      setVoucherStatus({ code: "", valid: false, discount: 0, details: null, message: "" });
                    }
                  }}
                  placeholder="Nhập voucher (nếu có)"
                  disabled={readOnly}
                />
                {!readOnly && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleApplyVoucher}
                    disabled={!form.voucher?.trim()}
                  >
                    Áp dụng
                  </Button>
                )}
              </div>
              {totals.localMsg && (
                <p className={`text-xs mt-1 font-semibold ${totals.localValid ? "text-green-600" : "text-destructive"}`}>
                  {totals.localMsg}
                </p>
              )}
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
          <div className="space-y-3 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-700">Mặt hàng xuất bán POS</h3>
              {!readOnly && (
                <Button variant="outline" size="sm" type="button" onClick={addRow} className="gap-1 text-slate-600 hover:text-slate-800">
                  Thêm dòng thủ công
                </Button>
              )}
            </div>

            {/* Premium Barcode Search Input */}
            {!readOnly && (
              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all duration-200">
                  <div className="flex items-center pl-3 pr-1 text-slate-400">
                    <Barcode className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    className="flex-1 h-9 border-none bg-transparent outline-none text-sm placeholder:text-slate-400 text-slate-800"
                    placeholder="Quét mã vạch hoặc nhập mã/tên sản phẩm [F4]..."
                    value={barcodeQuery}
                    onChange={(e) => setBarcodeQuery(e.target.value)}
                    onKeyDown={handleBarcodeKeyDown}
                  />
                  {barcodeQuery && (
                    <button
                      type="button"
                      onClick={() => setBarcodeQuery("")}
                      className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 mr-1 text-lg font-bold w-6 h-6 flex items-center justify-center"
                    >
                      &times;
                    </button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    className="bg-primary text-white h-8 px-3 rounded-md hover:bg-primary/95 text-xs font-semibold flex items-center gap-1 shrink-0"
                    onClick={() => {
                      const query = barcodeQuery.trim();
                      if (query) {
                        const exactMatch = dbProducts.find(p => p.ma_sp.toLowerCase() === query.toLowerCase());
                        if (exactMatch) {
                          addOrIncrementProduct(exactMatch);
                          setBarcodeQuery("");
                        } else if (searchResults.length > 0) {
                          addOrIncrementProduct(searchResults[0]);
                          setBarcodeQuery("");
                        } else {
                          toast.error(`Không tìm thấy sản phẩm nào khớp với "${query}"`);
                        }
                      }
                    }}
                  >
                    Thêm
                  </Button>
                </div>

                {/* Autocomplete suggestions */}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 rounded-lg border border-slate-150 bg-white shadow-xl z-50 divide-y divide-slate-50 max-h-72 overflow-y-auto animate-in slide-in-from-top-1 duration-100">
                    {searchResults.map((p, idx) => {
                      const isHighlighted = idx === highlightedIndex;
                      return (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between px-4 py-2 cursor-pointer transition-colors ${
                            isHighlighted ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-700"
                          }`}
                          onClick={() => handleSearchResultClick(p)}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-slate-800">
                              {p.ten_sp}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Mã: <strong className="text-slate-600 font-medium">{p.ma_sp}</strong> | Kho: <strong className="text-slate-600 font-medium">{p.ton_kho}</strong>
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-sm text-slate-850">
                              {formatCurrencyVND(p.gia_ban)}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              DVT: {p.don_vi_tinh}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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
                  {form.items.length === 0 ? (
                    <tr>
                      <td colSpan={readOnly ? 4 : 5} className="py-12 text-center text-slate-400 bg-slate-50/20">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Barcode className="h-12 w-12 text-slate-300 animate-pulse" />
                          <p className="font-bold text-sm text-slate-600">Chưa có sản phẩm nào trong hóa đơn</p>
                          {!readOnly && (
                            <p className="text-xs text-slate-400">
                              Đặt con trỏ vào ô tìm kiếm, quét mã vạch sản phẩm hoặc nhấn phím nóng <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 border border-slate-200 rounded shadow-sm text-slate-500 font-bold">F4</kbd> để tìm nhanh!
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    form.items.map((it, idx) => {
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
                              className="h-9 w-[90px] rounded-md border border-input bg-background px-2 text-sm text-right outline-none font-medium"
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
                                className="text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive"
                              >
                                Xóa
                              </Button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
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
              {totals.discount > 0 && (
                <div className="flex items-center justify-between text-sm text-green-600 font-semibold">
                  <span>Chiết khấu giảm giá</span>
                  <span>-{formatCurrencyVND(totals.discount)}</span>
                </div>
              )}
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
