import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyVND, formatDateVN } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { exportToExcel } from "@/lib/export";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const tabs = [
  { key: "ALL", label: "Tất cả" },
  { key: "DA_THANH_TOAN", label: "Đã thanh toán" },
  { key: "CHO_XAC_NHAN", label: "Chờ xác nhận" },
  { key: "DA_HUY", label: "Đã hủy" },
];

const statusBadge = (status) => {
  switch (status) {
    case "DA_THANH_TOAN":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Đã thanh toán</Badge>;
    case "CHO_XAC_NHAN":
      return <Badge variant="secondary" className="border-none bg-amber-100 text-amber-800">Chờ xác nhận</Badge>;
    case "DA_HUY":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Đã hủy</Badge>;
    default:
      return <Badge variant="outline">—</Badge>;
  }
};

export default function Invoices() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("ALL");
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Real API state
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const tabParam = activeTab === "ALL" ? "" : activeTab;
      const res = await apiRequest(
        `/invoices?page=${page}&limit=10&search=${query}&trang_thai=${tabParam}`,
        { token }
      );
      if (res.ok) {
        setInvoices(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalItems(res.pagination.totalItems || 0);
        }
      }
    } catch (err) {
      console.error("Error loading invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [token, page, query, activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const handleDelete = (id) => {
    const inv = invoices.find(i => i.id === id);
    const code = inv ? inv.ma_hd : `HD${id}`;

    triggerConfirm({
      title: "Hủy hóa đơn bán hàng",
      message: `Bạn có chắc chắn muốn hủy hóa đơn "${code}"? Số lượng tồn kho các sản phẩm trong hóa đơn này sẽ được tự động cộng trả lại vào kho!`,
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/invoices/${id}`, {
            method: "DELETE",
            token
          });
          if (res.ok) {
            toast.success("Đã hủy hóa đơn thành công!");
            fetchInvoices();
          } else {
            toast.error("Không thể hủy hóa đơn: " + res.message);
          }
        } catch (err) {
          toast.error("Lỗi khi hủy hóa đơn: " + err.message);
        }
      }
    });
  };

  // Local filter for date if selected
  const rows = invoices.filter(inv => {
    if (!dateFilter) return true;
    return inv.ngay_ban.startsWith(dateFilter);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800">Hóa đơn bán hàng</h2>
          <p className="text-sm text-muted-foreground mt-1">Danh sách hóa đơn bán tại quầy</p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2 border-primary text-primary hover:bg-primary/5" 
          onClick={() => exportToExcel(
            invoices, 
            "Danh_sach_hoa_don_POS.xlsx", 
            {
              ma_hdb: "Mã hóa đơn",
              ngay_ban: "Ngày bán",
              ten_khach_hang: "Tên khách hàng",
              ten_nhan_vien: "Nhân viên bán",
              tong_tien_hang: "Tổng tiền hàng (đ)",
              ma_voucher: "Mã voucher",
              trang_thai: "Trạng thái",
              phuong_thuc_thanh_toan: "Phương thức thanh toán"
            }
          )}
        >
          <FileDown size={16} />
          Xuất file Excel
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-800">Bộ lọc hóa đơn (Động)</CardTitle>
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
                className={activeTab === t.key ? "bg-primary text-white hover:bg-primary/95" : ""}
              >
                {t.label}
              </Button>
            ))}
          </div>

          {/* Search Inputs */}
          <div className="grid gap-3 grid-cols-1 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Tìm theo mã hoặc tên khách</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Tìm mã hóa đơn, tên khách..."
                value={query}
                onChange={handleQueryChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Lọc ngày bán</label>
              <input
                type="date"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 flex items-end">
              {dateFilter && (
                <Button variant="ghost" size="sm" onClick={() => setDateFilter("")}>
                  Xóa lọc ngày
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8 text-slate-500">Đang tải hóa đơn...</div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Mã HĐB</th>
                      <th className="px-4 py-3 text-left font-semibold">Ngày bán</th>
                      <th className="px-4 py-3 text-left font-semibold">Khách hàng</th>
                      <th className="px-4 py-3 text-left font-semibold">Nhân viên tạo</th>
                      <th className="px-4 py-3 text-right font-semibold">Tổng tiền</th>
                      <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                      <th className="px-4 py-3 text-right font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-primary">
                          <Link to={`/pos/${inv.id}`} className="hover:underline">
                            {inv.ma_hdb}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDateVN(inv.ngay_ban)}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">{inv.ten_khach_hang || "Khách lẻ"}</td>
                        <td className="px-4 py-3 text-slate-600">{inv.ten_nhan_vien || "Hệ thống"}</td>
                        <td className="px-4 py-3 text-right font-extrabold text-primary">{formatCurrencyVND(inv.tong_can_thanh_toan)}</td>
                        <td className="px-4 py-3">{statusBadge(inv.trang_thai)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" asChild title="Chi tiết">
                              <Link to={`/pos/${inv.id}`} aria-label="Chi tiết">
                                <Pencil size={16} />
                              </Link>
                            </Button>
                            {inv.trang_thai !== "DA_HUY" && (
                              <Button
                                variant="outline"
                                size="icon"
                                aria-label="Hủy hóa đơn"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(inv.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {rows.length === 0 ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-slate-400" colSpan={7}>
                          Không có hóa đơn phù hợp ở trang này.
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
                    Hiển thị {(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} trong tổng số {totalItems} hóa đơn
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

      <Button
        asChild
        className="fixed bottom-6 right-6 shadow-lg bg-primary hover:bg-primary/95 text-white"
        aria-label="Tạo hóa đơn"
      >
        <Link to="/pos/new">
          <Plus className="mr-2" size={16} />
          Tạo hóa đơn
        </Link>
      </Button>

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
