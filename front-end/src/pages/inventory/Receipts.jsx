import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FileDown, Pencil, Trash2, Eye, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatCurrencyVND, formatDateVN } from "@/lib/format";
import { exportToExcel } from "@/lib/export";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const tabs = [
  { key: "ALL", label: "Tất cả phiếu nhập" },
  { key: "DA_THANH_TOAN_HET", label: "Đã thanh toán hết" },
  { key: "CHUA_THANH_TOAN_HET", label: "Chưa thanh toán hết" },
];

const statusBadge = (status) => {
  if (status === "DA_THANH_TOAN_HET") return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Đã thanh toán hết</Badge>;
  return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Chưa thanh toán hết</Badge>;
};

export default function Receipts() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("ALL");
  const [query, setQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

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

  // Load receipts from backend with pagination
  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(
        `/receipts?page=${page}&limit=10&search=${query}&trang_thai_thanh_toan=${activeTab === "ALL" ? "" : activeTab}`,
        { token }
      );
      if (res.ok) {
        setReceipts(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalItems(res.pagination.totalItems || 0);
        }
      }
    } catch (err) {
      console.error("Error fetching receipts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [token, page, query, activeTab]);

  // Reset to first page on search or tab change
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  // Handle Delete
  const handleDelete = (id) => {
    const receipt = receipts.find(r => r.id === id);
    const code = receipt ? receipt.ma_nhap : `PN${id}`;

    triggerConfirm({
      title: "Xóa phiếu nhập hàng",
      message: `Bạn có chắc chắn muốn xóa phiếu nhập "${code}"? Hành động này sẽ hoàn tác số lượng tồn kho sản phẩm tương ứng!`,
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/receipts/${id}`, {
            method: "DELETE",
            token,
          });
          if (res.ok) {
            toast.success("Đã xóa phiếu nhập hàng thành công!");
            fetchReceipts();
          } else {
            toast.error("Không thể xóa phiếu nhập: " + res.message);
          }
        } catch (err) {
          toast.error("Lỗi khi xóa phiếu nhập: " + err.message);
        }
      }
    });
  };

  // Open Detail view
  const handleViewDetails = async (id) => {
    try {
      const res = await apiRequest(`/receipts/${id}`, { token });
      if (res.ok) {
        setSelectedReceipt(res.data);
        setDetailModalOpen(true);
      } else {
        toast.error("Lỗi khi tải chi tiết phiếu nhập: " + res.message);
      }
    } catch (err) {
      toast.error("Lỗi khi tải chi tiết phiếu nhập: " + err.message);
    }
  };

  // Local filter for date
  const rows = useMemo(() => {
    return receipts.filter((r) => {
      const dateOk = !filterDate ? true : 
        new Date(r.ngay_nhap).toISOString().split('T')[0] === filterDate;
      return dateOk;
    });
  }, [filterDate, receipts]);

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-bold text-slate-800">Phiếu nhập hàng (Phân trang)</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                className="gap-2 border-primary text-primary hover:bg-primary/5" 
                onClick={() => exportToExcel(
                  receipts, 
                  "Danh_sach_phieu_nhap.xlsx", 
                  {
                    ma_nhap: "Mã phiếu nhập",
                    ngay_nhap: "Ngày nhập",
                    nha_cung_cap_ten: "Nhà cung cấp",
                    nhan_vien_ten: "Nhân viên lập",
                    tong_tien_nhap: "Tổng tiền nhập (đ)",
                    trang_thai_thanh_toan: "Trạng thái thanh toán"
                  }
                )}
              >
                <FileDown size={16} />
                Xuất file Excel
              </Button>
              <Button asChild className="gap-2 bg-primary hover:bg-primary/95 text-white">
                <Link to="/inventory/receipts/new">
                  <Plus size={16} />
                  Thêm phiếu
                </Link>
              </Button>
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
                className={activeTab === t.key ? "bg-primary text-white hover:bg-primary/90" : ""}
              >
                {t.label}
              </Button>
            ))}
          </div>

          {/* Filters */}
          <div className="grid gap-3 grid-cols-1 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Tìm kiếm</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Tìm theo mã PN, nhà cung cấp, nhân viên..."
                value={query}
                onChange={handleQueryChange}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Lọc ngày nhập (Tại trang này)</label>
              <input 
                type="date" 
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 flex items-end">
              {filterDate && (
                <Button variant="ghost" size="sm" onClick={() => setFilterDate("")}>
                  Xóa lọc ngày
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8 text-slate-500">Đang tải dữ liệu...</div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Mã Nhập</th>
                      <th className="px-4 py-3 text-left font-semibold">Ngày nhập</th>
                      <th className="px-4 py-3 text-left font-semibold">Nhà cung cấp</th>
                      <th className="px-4 py-3 text-left font-semibold">Nhân viên</th>
                      <th className="px-4 py-3 text-right font-semibold">SL đặt</th>
                      <th className="px-4 py-3 text-right font-semibold">SL nhận</th>
                      <th className="px-4 py-3 text-right font-semibold">Tổng tiền</th>
                      <th className="px-4 py-3 text-left font-semibold">Trạng thái TT</th>
                      <th className="px-4 py-3 text-right font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {rows.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          <button 
                            onClick={() => handleViewDetails(r.id)} 
                            className="hover:underline text-left text-primary font-bold"
                          >
                            {r.ma_pnh}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDateVN(r.ngay_nhap)}</td>
                        <td className="px-4 py-3 text-slate-700">{r.ten_ncc}</td>
                        <td className="px-4 py-3 text-slate-700">{r.ten_nhan_vien}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{r.so_luong_dat}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{r.so_luong_thuc_nhan}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrencyVND(r.tong_tien)}</td>
                        <td className="px-4 py-3">{statusBadge(r.trang_thai_thanh_toan)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleViewDetails(r.id)} title="Xem chi tiết">
                              <Eye size={16} />
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <Link to={`/inventory/receipts/${r.id}/edit`} aria-label="Sửa">
                                <Pencil size={16} />
                              </Link>
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(r.id)} aria-label="Xóa">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-slate-400" colSpan={9}>
                          Không có phiếu nhập nào ở trang này.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {/* Pagination UI Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 flex-wrap gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Hiển thị {(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} trong tổng số {totalItems} phiếu nhập
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

      {/* POPUP DETAIL MODAL */}
      {detailModalOpen && selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Chi tiết Phiếu Nhập</h3>
                <p className="text-xs text-slate-500 mt-0.5">Mã phiếu: {selectedReceipt.ma_pnh}</p>
              </div>
              <button 
                onClick={() => setDetailModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">Mã Nhập</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.ma_pnh}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Ngày nhập</span>
                  <span className="font-medium text-slate-800">{formatDateVN(selectedReceipt.ngay_nhap)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Nhà cung cấp</span>
                  <span className="font-medium text-slate-800">{selectedReceipt.ten_ncc}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Nhân viên tạo</span>
                  <span className="font-medium text-slate-800">{selectedReceipt.ten_nhan_vien}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-700">Danh sách sản phẩm nhập</h4>
                <div className="overflow-x-auto rounded-lg border border-slate-100">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/70 text-slate-600">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-semibold">Mã SP</th>
                        <th className="px-4 py-2.5 text-left font-semibold">Tên sản phẩm</th>
                        <th className="px-4 py-2.5 text-center font-semibold">NSX</th>
                        <th className="px-4 py-2.5 text-center font-semibold">HSD</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Giá nhập</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Số lượng nhập</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedReceipt.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30">
                          <td className="px-4 py-3 font-semibold text-slate-800">{item.id_hang_hoa}</td>
                          <td className="px-4 py-3 text-slate-700">{item.ten_sp || "Sản phẩm không xác định"}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{item.ngay_san_xuat ? formatDateVN(item.ngay_san_xuat) : "—"}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{item.han_su_dung ? formatDateVN(item.han_su_dung) : "—"}</td>
                          <td className="px-4 py-3 text-right text-slate-800">{formatCurrencyVND(item.gia_nhap)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-700">{item.so_luong}</td>
                          <td className="px-4 py-3 text-right font-bold text-primary">{formatCurrencyVND(item.thanh_tien)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex justify-end pt-2">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 w-full max-w-sm flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Tổng cộng tiền nhập</span>
                  <span className="text-lg font-extrabold text-primary">{formatCurrencyVND(selectedReceipt.tong_tien)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>Đóng</Button>
              <Button asChild className="bg-primary hover:bg-primary/95 text-white">
                <Link to={`/inventory/receipts/${selectedReceipt.id}/edit`}>Chỉnh sửa phiếu</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
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
