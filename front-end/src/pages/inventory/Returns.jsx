import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, X, Calendar, CheckSquare, Square, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatCurrencyVND, formatDateVN } from "@/lib/format";
import { exportToExcel } from "@/lib/export";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function Returns() {
  const { token, user } = useAuth();
  
  // List state
  const [returnsList, setReturnsList] = useState([]);
  const [receiptsList, setReceiptsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal view state
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Form modal state (Add / Edit)
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

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form fields
  const [maPth, setMaPth] = useState("");
  const [idPhieuNhap, setIdPhieuNhap] = useState("");
  const [ngayTra, setNgayTra] = useState(new Date().toISOString().split("T")[0]);
  const [lyDo, setLyDo] = useState("");
  
  // Dynamic receipt items state
  const [receiptItems, setReceiptItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({}); // { [productId]: { selected: boolean, qty: number, price: number } }

  // Load returns with pagination, and fetch all receipts list for choice
  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/returns?page=${page}&limit=10&search=${query}`, { token });
      if (res.ok) {
        setReturnsList(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalItems(res.pagination.totalItems || 0);
        }
      }
    } catch (err) {
      console.error("Error loading returns:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceiptsListOnly = async () => {
    try {
      const recRes = await apiRequest("/receipts?limit=1000", { token }); // load all receipts for selector dropdown
      if (recRes.ok) {
        setReceiptsList(recRes.data || []);
      }
    } catch (err) {
      console.error("Error loading receipts list:", err);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [token, page, query]);

  useEffect(() => {
    if (token) {
      fetchReceiptsListOnly();
    }
  }, [token]);

  // Load items of chosen receipt
  useEffect(() => {
    if (!idPhieuNhap) {
      setReceiptItems([]);
      setSelectedItems({});
      return;
    }

    const fetchReceiptItems = async () => {
      try {
        const res = await apiRequest(`/receipts/${idPhieuNhap}`, { token });
        if (res.ok && res.data) {
          const items = res.data.items || [];
          setReceiptItems(items);
          
          // Reset selected items
          const nextSelected = {};
          items.forEach(item => {
            nextSelected[item.id_hang_hoa] = {
              selected: false,
              qty: 1,
              maxQty: item.so_luong || 1,
              price: Number(item.gia_nhap) || 0,
              name: item.ten_sp || ""
            };
          });
          setSelectedItems(nextSelected);
        }
      } catch (err) {
        toast.error("Lỗi khi tải sản phẩm của phiếu nhập: " + err.message);
      }
    };

    fetchReceiptItems();
  }, [idPhieuNhap, token]);

  const handleDelete = (id) => {
    const returnItem = returnsList.find(r => r.id === id);
    const code = returnItem ? returnItem.ma_pth : `PT${id}`;

    triggerConfirm({
      title: "Xóa phiếu trả hàng",
      message: `Bạn có chắc chắn muốn xóa phiếu trả hàng "${code}"? Số lượng tồn kho sản phẩm tương ứng sẽ được tự động cộng trả lại vào kho!`,
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/returns/${id}`, {
            method: "DELETE",
            token
          });
          if (res.ok) {
            toast.success("Đã xóa phiếu trả hàng thành công!");
            fetchReturns();
          } else {
            toast.error("Không thể xóa phiếu trả hàng: " + res.message);
          }
        } catch (err) {
          toast.error("Lỗi khi xóa phiếu trả hàng: " + err.message);
        }
      }
    });
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setMaPth("");
    setIdPhieuNhap("");
    setNgayTra(new Date().toISOString().split("T")[0]);
    setLyDo("");
    setReceiptItems([]);
    setSelectedItems({});
    setFormModalOpen(true);
  };

  const handleOpenEdit = async (ret) => {
    try {
      const res = await apiRequest(`/returns/${ret.id}`, { token });
      if (res.ok && res.data) {
        const d = res.data;
        setIsEditing(true);
        setEditingId(d.id);
        setMaPth(d.ma_pth);
        setIdPhieuNhap(d.id_phieu_nhap);
        setNgayTra(d.ngay_tra ? d.ngay_tra.split("T")[0] : "");
        setLyDo(d.ly_do || "");

        // Load receipt details first, then select checked items
        const recRes = await apiRequest(`/receipts/${d.id_phieu_nhap}`, { token });
        if (recRes.ok && recRes.data) {
          const allItems = recRes.data.items || [];
          setReceiptItems(allItems);

          const nextSelected = {};
          allItems.forEach(item => {
            const returnedItem = (d.items || []).find(it => it.id_hang_hoa === item.id_hang_hoa);
            nextSelected[item.id_hang_hoa] = {
              selected: !!returnedItem,
              qty: returnedItem ? returnedItem.so_luong_tra : 1,
              maxQty: item.so_luong || 1,
              price: Number(item.gia_nhap) || 0,
              name: item.ten_sp || ""
            };
          });
          setSelectedItems(nextSelected);
        }

        setFormModalOpen(true);
      }
    } catch (err) {
      toast.error("Lỗi khi tải thông tin chỉnh sửa: " + err.message);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await apiRequest(`/returns/${id}`, { token });
      if (res.ok) {
        setSelectedReturn(res.data);
        setViewModalOpen(true);
      } else {
        toast.error("Lỗi khi tải chi tiết phiếu trả hàng: " + res.message);
      }
    } catch (err) {
      toast.error("Lỗi khi tải chi tiết phiếu trả hàng: " + err.message);
    }
  };

  const handleToggleSelectItem = (idHangHoa) => {
    setSelectedItems(prev => ({
      ...prev,
      [idHangHoa]: {
        ...prev[idHangHoa],
        selected: !prev[idHangHoa].selected
      }
    }));
  };

  const handleChangeQty = (idHangHoa, val) => {
    const nextVal = Number(val);
    setSelectedItems(prev => ({
      ...prev,
      [idHangHoa]: {
        ...prev[idHangHoa],
        qty: nextVal
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idPhieuNhap) {
      toast.warning("Vui lòng chọn Mã phiếu nhập!");
      return;
    }

    const payloadItems = [];
    Object.keys(selectedItems).forEach(key => {
      const item = selectedItems[key];
      if (item.selected) {
        payloadItems.push({
          id_hang_hoa: Number(key),
          so_luong_tra: Number(item.qty),
          gia_nhap: Number(item.price)
        });
      }
    });

    if (payloadItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất 1 sản phẩm cần trả hàng!");
      return;
    }

    // Validate quantities
    const invalidQty = payloadItems.find(it => it.so_luong_tra <= 0);
    if (invalidQty) {
      toast.warning("Số lượng trả hàng phải lớn hơn 0!");
      return;
    }

    try {
      const url = isEditing ? `/returns/${editingId}` : "/returns";
      const method = isEditing ? "PUT" : "POST";
      
      const payload = {
        ma_pth: maPth || null,
        id_phieu_nhap: Number(idPhieuNhap),
        ngay_tra: ngayTra,
        ly_do: lyDo,
        items: payloadItems
      };

      const res = await apiRequest(url, {
        method,
        body: payload,
        token
      });

      if (res.ok) {
        toast.success(isEditing ? "Cập nhật phiếu trả hàng thành công!" : "Thêm mới phiếu trả hàng thành công!");
        setFormModalOpen(false);
        fetchReturns();
      } else {
        toast.error("Lỗi khi lưu phiếu trả hàng: " + res.message);
      }
    } catch (err) {
      toast.error("Lỗi khi lưu phiếu trả hàng: " + err.message);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-bold text-slate-800">Phiếu Trả Hàng (Phân trang 10/trang)</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                className="gap-2 border-primary text-primary hover:bg-primary/5" 
                onClick={() => exportToExcel(
                  returnsList, 
                  "Danh_sach_phieu_tra_hang.xlsx", 
                  {
                    ma_pth: "Mã phiếu trả",
                    ma_nhap: "Mã phiếu nhập",
                    ngay_tra: "Ngày trả",
                    nhan_vien_ten: "Nhân viên lập",
                    ly_do: "Lý do hoàn",
                    tong_tien_hoan: "Tổng tiền hoàn (đ)"
                  }
                )}
              >
                <Plus size={16} className="rotate-45" />
                Xuất file Excel
              </Button>
              <Button onClick={handleOpenAdd} className="gap-2 bg-primary hover:bg-primary/95 text-white">
                <Plus size={16} />
                Tạo phiếu trả
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search bar */}
          <div className="max-w-md space-y-1">
            <label className="text-xs font-semibold text-slate-600">Tìm kiếm</label>
            <input
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Tìm theo mã phiếu trả, mã phiếu nhập, nhân viên..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
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
                      <th className="px-4 py-3 text-left font-semibold">Mã Phiếu Trả</th>
                      <th className="px-4 py-3 text-left font-semibold">Mã Phiếu Nhập</th>
                      <th className="px-4 py-3 text-left font-semibold">Nhân viên thực hiện</th>
                      <th className="px-4 py-3 text-left font-semibold">Ngày trả</th>
                      <th className="px-4 py-3 text-left font-semibold">Lý do trả</th>
                      <th className="px-4 py-3 text-right font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {returnsList.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-primary">
                          <button onClick={() => handleViewDetails(r.id)} className="hover:underline text-left">
                            {r.ma_pth}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">{r.ma_pnh}</td>
                        <td className="px-4 py-3 text-slate-600">{r.ten_nhan_vien}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDateVN(r.ngay_tra)}</td>
                        <td className="px-4 py-3 text-slate-600 max-w-[240px] truncate" title={r.ly_do}>{r.ly_do || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleViewDetails(r.id)} title="Xem chi tiết">
                              <Eye size={16} />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleOpenEdit(r)} title="Chỉnh sửa">
                              <Pencil size={16} />
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(r.id)} title="Xóa">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {returnsList.length === 0 ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-slate-400" colSpan={6}>
                          Không có phiếu trả hàng nào ở trang này.
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
                    Hiển thị {(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} trong tổng số {totalItems} phiếu trả hàng
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

      {/* POPUP VIEW DETAIL */}
      {viewModalOpen && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Chi tiết Phiếu Trả Hàng</h3>
                <p className="text-xs text-slate-500 mt-0.5">Mã phiếu: {selectedReturn.ma_pth}</p>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-b pb-4">
                <div>
                  <span className="text-slate-400 block text-xs">Mã Trả Hàng</span>
                  <span className="font-bold text-slate-800">{selectedReturn.ma_pth}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Mã Phiếu Nhập</span>
                  <span className="font-medium text-slate-800">{selectedReturn.ma_pnh}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Nhân viên thực hiện</span>
                  <span className="font-medium text-slate-800">{selectedReturn.ten_nhan_vien}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Ngày trả hàng</span>
                  <span className="font-medium text-slate-800">{formatDateVN(selectedReturn.ngay_tra)}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-xs font-semibold block mb-1">Lý do hoàn trả</span>
                <p className="text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-700">{selectedReturn.ly_do || "Không ghi rõ lý do"}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-700">Danh sách sản phẩm hoàn trả</h4>
                <div className="overflow-x-auto rounded-lg border border-slate-100">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/70 text-slate-600">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">Mã sản phẩm</th>
                        <th className="px-4 py-2 text-left font-semibold">Tên sản phẩm</th>
                        <th className="px-4 py-2 text-right font-semibold">Giá nhập hàng</th>
                        <th className="px-4 py-2 text-right font-semibold">Số lượng trả</th>
                        <th className="px-4 py-2 text-right font-semibold">Thành tiền trả</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedReturn.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30">
                          <td className="px-4 py-3 font-semibold text-slate-800">{item.id_hang_hoa}</td>
                          <td className="px-4 py-3 text-slate-700">{item.ten_sp || "Sản phẩm không tồn tại"}</td>
                          <td className="px-4 py-3 text-right text-slate-800">{formatCurrencyVND(item.gia_nhap)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-700">{item.so_luong_tra}</td>
                          <td className="px-4 py-3 text-right font-bold text-primary">{formatCurrencyVND(Number(item.gia_nhap) * Number(item.so_luong_tra))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP FORM (ADD / EDIT) */}
      {formModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{isEditing ? "Chỉnh sửa Phiếu Trả Hàng" : "Tạo Phiếu Trả Hàng Mới"}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Vui lòng điền đầy đủ các thông tin hoàn trả</p>
              </div>
              <button type="button" onClick={() => setFormModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Mã phiếu trả (Tự động sinh nếu để trống)</label>
                  <input
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none"
                    placeholder="Ví dụ: PTH001"
                    value={maPth}
                    onChange={(e) => setMaPth(e.target.value)}
                    disabled={isEditing}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Chọn Mã Phiếu Nhập để hoàn trả *</label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none"
                    value={idPhieuNhap}
                    onChange={(e) => setIdPhieuNhap(e.target.value)}
                    required
                    disabled={isEditing}
                  >
                    <option value="">-- Chọn Phiếu Nhập Hàng --</option>
                    {receiptsList.map(r => (
                      <option key={r.id} value={r.id}>{r.ma_pnh} - {r.ten_ncc}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Ngày hoàn trả</label>
                  <input
                    type="date"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none"
                    value={ngayTra}
                    onChange={(e) => setNgayTra(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Nhân viên thực hiện</label>
                  <input
                    className="h-10 w-full rounded-md border border-input bg-slate-50 text-slate-500 px-3 text-sm outline-none"
                    value={user?.name || "Hệ thống"}
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Lý do trả hàng *</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none min-h-[60px]"
                  placeholder="Nhập lý do trả hàng chi tiết..."
                  value={lyDo}
                  onChange={(e) => setLyDo(e.target.value)}
                  required
                />
              </div>

              {/* Product Listing to Tick */}
              {idPhieuNhap && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                    <Info size={16} className="text-primary" />
                    <span>Danh sách sản phẩm có trong phiếu nhập hàng:</span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-100">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50/70 text-slate-600">
                        <tr>
                          <th className="px-4 py-2.5 text-center font-semibold w-12">Chọn</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Tên sản phẩm</th>
                          <th className="px-4 py-2.5 text-right font-semibold">Số lượng nhập</th>
                          <th className="px-4 py-2.5 text-right font-semibold">Số lượng trả</th>
                          <th className="px-4 py-2.5 text-right font-semibold">Đơn giá</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {receiptItems.map(item => {
                          const state = selectedItems[item.id_hang_hoa] || { selected: false, qty: 1, maxQty: 1, price: 0, name: "" };
                          return (
                            <tr key={item.id_hang_hoa} className={`hover:bg-slate-50/30 transition-colors ${state.selected ? 'bg-primary/5' : ''}`}>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSelectItem(item.id_hang_hoa)}
                                  className="text-primary focus:outline-none inline-block align-middle"
                                >
                                  {state.selected ? (
                                    <CheckSquare size={20} className="fill-primary text-white" />
                                  ) : (
                                    <Square size={20} className="text-slate-300" />
                                  )}
                                </button>
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-800">{state.name}</td>
                              <td className="px-4 py-3 text-right text-slate-500 font-medium">{state.maxQty}</td>
                              <td className="px-4 py-3 text-right">
                                <input
                                  type="number"
                                  min={1}
                                  max={state.maxQty}
                                  value={state.qty}
                                  onChange={(e) => handleChangeQty(item.id_hang_hoa, e.target.value)}
                                  disabled={!state.selected}
                                  className="h-8 w-20 rounded border border-input text-center text-sm bg-white font-bold outline-none"
                                />
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-slate-700">{formatCurrencyVND(state.price)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setFormModalOpen(false)}>Thoát</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/95 text-white">Lưu phiếu trả</Button>
            </div>
          </form>
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
