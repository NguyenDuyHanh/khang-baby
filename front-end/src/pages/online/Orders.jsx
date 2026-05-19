import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FileDown, Eye, XCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyVND, formatDateTimeVN } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { exportToExcel } from "@/lib/export";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const tabs = [
  { key: "ALL", label: "Tất cả" },
  { key: "CHO_XU_LY", label: "Chờ xử lý" },
  { key: "DA_XAC_NHAN", label: "Đã xác nhận" },
  { key: "DANG_GIAO", label: "Đang giao" },
  { key: "DA_HOAN_THANH", label: "Đã hoàn thành" },
  { key: "DA_HUY", label: "Đã hủy" },
];

const channelBadge = (channel) => {
  const norm = (channel || "").toUpperCase();
  if (norm === "FACEBOOK") {
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Facebook</Badge>;
  }
  if (norm === "WEBSITE") {
    return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">Website</Badge>;
  }
  return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">{channel || "Website"}</Badge>;
};

const statusBadge = (status) => {
  switch (status) {
    case "CHO_XU_LY":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">Chờ xử lý</Badge>;
    case "DA_XAC_NHAN":
      return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none">Đã xác nhận</Badge>;
    case "DANG_GIAO":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Đang giao</Badge>;
    case "DA_HOAN_THANH":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Đã hoàn thành</Badge>;
    case "DA_HUY":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Đã hủy</Badge>;
    default:
      return <Badge variant="outline">—</Badge>;
  }
};

export default function Orders() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("ALL");
  const [query, setQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState("ALL");

  // Dynamic state
  const [orders, setOrders] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
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

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const tabParam = activeTab === "ALL" ? "" : activeTab;
      const chanParam = channelFilter === "ALL" ? "" : channelFilter;

      const res = await apiRequest(
        `/orders?page=${page}&limit=10&search=${query}&trang_thai=${tabParam}&kenh_dat_hang=${chanParam}`,
        { token }
      );
      if (res.ok) {
        setOrders(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalItems(res.pagination.totalItems || 0);
        }
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await apiRequest("/orders/stats/pending", { token });
      if (res.ok) {
        setPendingCount(res.data || 0);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPendingCount();
  }, [token, page, query, activeTab, channelFilter]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const handleCancel = (id) => {
    const order = orders.find(o => o.id === id);
    const code = order ? order.ma_don_hang : `ĐH${id}`;

    triggerConfirm({
      title: "Hủy đơn hàng online",
      message: `Bạn có chắc chắn muốn hủy đơn hàng "${code}"?`,
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/orders/${id}/cancel`, {
            method: "POST",
            token
          });
          if (res.ok) {
            toast.success("Đã hủy đơn hàng thành công!");
            fetchOrders();
            fetchPendingCount();
          } else {
            toast.error(res.message || "Không thể hủy đơn hàng.");
          }
        } catch (err) {
          toast.error("Lỗi khi hủy đơn hàng: " + err.message);
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800">Đơn hàng Online</h2>
          <p className="text-sm text-muted-foreground mt-1">Xử lý đơn từ các kênh Facebook, Website và Zalo</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2 border-primary text-primary hover:bg-primary/5"
            onClick={() => exportToExcel(
              orders,
              "Danh_sach_don_hang_online.xlsx",
              {
                ma_don: "Mã đơn hàng",
                ten_khach_hang: "Khách hàng",
                so_dien_thoai: "Số điện thoại",
                dia_chi_giao: "Địa chỉ giao hàng",
                kenh_dat_hang: "Kênh đặt",
                don_vi_van_chuyen: "Đơn vị giao vận",
                phi_giao_hang: "Phí giao hàng (đ)",
                trang_thai: "Trạng thái",
                phuong_thuc_thanh_toan: "Hình thức thanh toán"
              }
            )}
          >
            <FileDown size={16} />
            Xuất file Excel
          </Button>
          <Button asChild className="gap-2 bg-primary hover:bg-primary/95 text-white">
            <Link to="/online/new">
              <Plus size={16} />
              Tạo đơn thủ công
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-bold text-slate-800 font-bold">Danh sách đơn hàng (Động)</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500">Đơn chờ xử lý</span>
              <Badge className="bg-destructive text-destructive-foreground border-none font-bold">{pendingCount}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <Button
                key={t.key}
                type="button"
                variant={activeTab === t.key ? "default" : "outline"}
                size="sm"
                onClick={() => handleTabChange(t.key)}
                className={activeTab === t.key ? "bg-primary text-white hover:bg-primary/95 font-semibold" : ""}
              >
                {t.label}
              </Button>
            ))}
          </div>

          {/* Search Filters */}
          <div className="grid gap-3 grid-cols-1 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Tìm kiếm</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Tìm theo mã đơn hoặc tên khách"
                value={query}
                onChange={handleQueryChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Kênh đặt hàng</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={channelFilter}
                onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
              >
                <option value="ALL">Tất cả kênh</option>
                <option value="Facebook">Facebook</option>
                <option value="Website">Website</option>
              </select>
            </div>
            <div className="hidden lg:block" />
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8 text-slate-500">Đang tải đơn hàng...</div>
          ) : (
            <div className="space-y-4 overflow-x-auto">
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Mã đơn</th>
                      <th className="px-4 py-3 text-left font-semibold">Ngày đặt</th>
                      <th className="px-4 py-3 text-left font-semibold">Tên khách</th>
                      <th className="px-4 py-3 text-left font-semibold">Số điện thoại</th>
                      <th className="px-4 py-3 text-left font-semibold">Địa chỉ giao</th>
                      <th className="px-4 py-3 text-right font-semibold">Tổng thanh toán</th>
                      <th className="px-4 py-3 text-left font-semibold">Kênh</th>
                      <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                      <th className="px-4 py-3 text-left font-semibold">Nhân viên xử lý</th>
                      <th className="px-4 py-3 text-right font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-primary">
                          <Link to={`/online/${o.id}`} className="hover:underline">
                            {o.ma_don}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDateTimeVN(o.ngay_dat)}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{o.ten_khach_hang}</td>
                        <td className="px-4 py-3 text-slate-700">{o.so_dien_thoai}</td>
                        <td className="px-4 py-3 text-slate-600 min-w-[200px] truncate max-w-[280px]">{o.dia_chi_giao}</td>
                        <td className="px-4 py-3 text-right font-extrabold text-primary">{formatCurrencyVND(o.tong_thanh_toan)}</td>
                        <td className="px-4 py-3">{channelBadge(o.kenh_dat_hang)}</td>
                        <td className="px-4 py-3">{statusBadge(o.trang_thai)}</td>
                        <td className="px-4 py-3 text-slate-600 font-semibold">{o.ten_nhan_vien || "Chưa giao"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" asChild title="Chi tiết">
                              <Link to={`/online/${o.id}`} aria-label="Xem">
                                <Eye size={16} />
                              </Link>
                            </Button>
                            {o.trang_thai !== "DA_HUY" && o.trang_thai !== "DA_HOAN_THANH" && (
                              <Button
                                variant="outline"
                                size="icon"
                                aria-label="Hủy đơn"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleCancel(o.id)}
                              >
                                <XCircle size={16} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-slate-400" colSpan={10}>
                          Không có đơn hàng nào ở trang này.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 flex-wrap gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Hiển thị {(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} trong tổng số {totalItems} đơn hàng
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                      className="text-xs"
                    >
                      Trước
                    </Button>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pNum = i + 1;
                      return (
                        <Button
                          key={pNum}
                          variant={page === pNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pNum)}
                          className={`w-8 h-8 p-0 text-xs font-semibold ${page === pNum ? "bg-primary text-white hover:bg-primary/95" : ""}`}
                        >
                          {pNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                      className="text-xs"
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
