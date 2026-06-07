import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, X, Info, Printer, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatCurrencyVND, formatDateVN } from "@/lib/format";
import { exportToExcel } from "@/lib/export";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function Feedback() {
  const { token, user } = useAuth();
  
  // List state
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [receiptsList, setReceiptsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal view state
  const [selectedFeedback, setSelectedFeedback] = useState(null);
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
  const [maPhht, setMaPhht] = useState("");
  const [idPhieuNhap, setIdPhieuNhap] = useState("");
  
  // Dynamic receipt items state
  const [receiptItems, setReceiptItems] = useState([]);
  const [feedbackItems, setFeedbackItems] = useState({}); // { [productId]: { missingQty: number, missingPrice: number, name: string, active: boolean } }

  // Load feedbacks with pagination, and fetch all receipts list for choice
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/feedbacks?page=${page}&limit=10&search=${query}`, { token });
      if (res.ok) {
        setFeedbacksList(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalItems(res.pagination.totalItems || 0);
        }
      }
    } catch (err) {
      console.error("Error loading feedbacks:", err);
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
    fetchFeedbacks();
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
      setFeedbackItems({});
      return;
    }

    // Only load items dynamically if not currently mapping editing item details
    if (isEditing && receiptItems.length > 0) return;

    const fetchReceiptItems = async () => {
      try {
        const res = await apiRequest(`/receipts/${idPhieuNhap}`, { token });
        if (res.ok && res.data) {
          const items = res.data.items || [];
          setReceiptItems(items);
          
          const nextItems = {};
          items.forEach(item => {
            nextItems[item.id_hang_hoa] = {
              active: false,
              missingQty: 0,
              maxQty: item.so_luong || 1,
              missingPrice: Number(item.gia_nhap) || 0,
              name: item.ten_sp || ""
            };
          });
          setFeedbackItems(nextItems);
        }
      } catch (err) {
        toast.error("Lỗi khi tải sản phẩm của phiếu nhập: " + err.message);
      }
    };

    fetchReceiptItems();
  }, [idPhieuNhap, token, isEditing]);

  const handleDelete = (id) => {
    const feedback = feedbacksList.find(f => f.id === id);
    const code = feedback ? feedback.ma_phht : `PHHT${id}`;

    triggerConfirm({
      title: "Xóa phản hồi hàng thiếu",
      message: `Bạn có chắc chắn muốn xóa phiếu phản hồi "${code}"?`,
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/feedbacks/${id}`, {
            method: "DELETE",
            token
          });
          if (res.ok) {
            toast.success("Đã xóa phiếu phản hồi hàng thiếu thành công!");
            fetchFeedbacks();
          } else {
            toast.error("Không thể xóa phiếu phản hồi: " + res.message);
          }
        } catch (err) {
          toast.error("Lỗi khi xóa phiếu phản hồi: " + err.message);
        }
      }
    });
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setMaPhht("");
    setIdPhieuNhap("");
    setReceiptItems([]);
    setFeedbackItems({});
    setFormModalOpen(true);
  };

  const handleOpenEdit = async (fb) => {
    try {
      const res = await apiRequest(`/feedbacks/${fb.id}`, { token });
      if (res.ok && res.data) {
        const d = res.data;
        setIsEditing(true);
        setEditingId(d.id);
        setMaPhht(d.ma_phht);
        setIdPhieuNhap(d.id_phieu_nhap);

        // Fetch all receipt items
        const recRes = await apiRequest(`/receipts/${d.id_phieu_nhap}`, { token });
        if (recRes.ok && recRes.data) {
          const allItems = recRes.data.items || [];
          setReceiptItems(allItems);

          const nextItems = {};
          allItems.forEach(item => {
            const feedbackItem = (d.items || []).find(it => it.id_hang_hoa === item.id_hang_hoa);
            nextItems[item.id_hang_hoa] = {
              active: !!feedbackItem,
              missingQty: feedbackItem ? feedbackItem.so_luong_thieu_hut : 0,
              maxQty: item.so_luong || 1,
              missingPrice: feedbackItem ? Number(feedbackItem.gia_tri_thieu_hut) : Number(item.gia_nhap),
              name: item.ten_sp || ""
            };
          });
          setFeedbackItems(nextItems);
        }

        setFormModalOpen(true);
      }
    } catch (err) {
      toast.error("Lỗi khi tải thông tin chỉnh sửa: " + err.message);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await apiRequest(`/feedbacks/${id}`, { token });
      if (res.ok) {
        setSelectedFeedback(res.data);
        setViewModalOpen(true);
      } else {
        toast.error("Lỗi khi tải chi tiết phản hồi: " + res.message);
      }
    } catch (err) {
      toast.error("Lỗi khi tải chi tiết phản hồi: " + err.message);
    }
  };

  const handlePrintFeedback = (fb) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Không thể mở cửa sổ in. Vui lòng cho phép trình duyệt mở popup.");
      return;
    }
    const itemsHtml = (fb.items || []).map((item, idx) => `
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; color: #475569;">${idx + 1}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: 500; color: #1e293b;">${item.sku || item.id_hang_hoa}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; color: #334155;">${item.ten_sp || 'Sản phẩm không xác định'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-weight: bold; color: #1e293b;">${item.so_luong_thieu_hut}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; color: #475569;">${formatCurrencyVND(item.gia_tri_thieu_hut)}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-weight: bold; color: #e11d48;">${formatCurrencyVND(Number(item.gia_tri_thieu_hut) * Number(item.so_luong_thieu_hut))}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Phiếu Phản Hồi Hàng Thiếu - ${fb.ma_phht}</title>
          <meta charset="utf-8" />
          <style>
            @media print {
              body { margin: 15mm 20mm 15mm 20mm; }
              .no-print { display: none; }
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
              color: #1e293b; 
              margin: 40px; 
              line-height: 1.5;
            }
            .brand-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #334155;
              padding-bottom: 12px;
              margin-bottom: 24px;
            }
            .brand-title {
              font-size: 18px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .brand-subtitle {
              font-size: 12px;
              color: #64748b;
              margin-top: 2px;
            }
            .ticket-header { 
              text-align: center; 
              margin-bottom: 30px; 
            }
            .ticket-title { 
              font-size: 24px; 
              font-weight: 800; 
              text-transform: uppercase; 
              color: #0f172a; 
              margin: 0;
              letter-spacing: 1px;
            }
            .ticket-code { 
              margin-top: 6px; 
              font-size: 14px; 
              color: #475569; 
              font-weight: 500;
            }
            .meta-table {
              width: 100%;
              margin-bottom: 24px;
              font-size: 14px;
              border-collapse: collapse;
            }
            .meta-table td {
              padding: 6px 0;
              color: #334155;
            }
            .meta-label {
              font-weight: 600;
              color: #475569;
              width: 150px;
            }
            .meta-value {
              color: #0f172a;
            }
            .details-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 15px; 
              font-size: 13px;
            }
            .details-table th { 
              background-color: #f1f5f9; 
              color: #475569; 
              font-weight: 700; 
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 0.5px;
              border: 1px solid #cbd5e1;
              padding: 10px;
            }
            .summary-box { 
              margin-top: 20px; 
              float: right; 
              width: 350px; 
              border: 1px solid #fecdd3; 
              padding: 14px 18px; 
              background-color: #fff1f2; 
              border-radius: 8px; 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              box-sizing: border-box;
            }
            .summary-label { 
              font-size: 12px; 
              font-weight: 700; 
              color: #be123c; 
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .summary-value { 
              font-size: 18px; 
              font-weight: 800; 
              color: #e11d48; 
            }
            .signatures { 
              margin-top: 60px; 
              display: flex;
              justify-content: space-between;
              font-size: 14px; 
              font-weight: 600; 
              clear: both; 
            }
            .signature-col {
              text-align: center;
              width: 45%;
            }
            .signature-hint { 
              font-size: 12px; 
              color: #64748b; 
              font-weight: 400;
              margin-top: 3px;
              font-style: italic;
            }
            .signature-space { 
              height: 100px; 
            }
            .signature-name {
              font-weight: 700;
              color: #0f172a;
            }
          </style>
        </head>
        <body>
          <div class="brand-header">
            <div>
              <div class="brand-title">KHANG BABY SHOP</div>
              <div class="brand-subtitle">Hệ thống thời trang và đồ dùng mẹ & bé cao cấp</div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #64748b;">
              <div>Liên hệ: 0987.xxx.xxx</div>
              <div>Địa chỉ: Hà Nội, Việt Nam</div>
            </div>
          </div>

          <div class="ticket-header">
            <div class="ticket-title">PHIẾU PHẢN HỒI HÀNG THIẾU</div>
            <div class="ticket-code">Mã phiếu phản hồi: <strong style="color: #0f172a;">${fb.ma_phht}</strong></div>
          </div>

          <table class="meta-table">
            <tr>
              <td class="meta-label">Mã phiếu nhập:</td>
              <td class="meta-value" style="font-weight: 600;">${fb.ma_pnh || '—'}</td>
              <td class="meta-label" style="padding-left: 40px;">Ngày tạo phản hồi:</td>
              <td class="meta-value">${formatDateVN(fb.ngay_tao)}</td>
            </tr>
            <tr>
              <td class="meta-label">Nhà cung cấp:</td>
              <td class="meta-value" style="font-weight: 600; color: #0284c7;">${fb.ten_ncc || '—'}</td>
              <td class="meta-label" style="padding-left: 40px;">Nhân viên lập phiếu:</td>
              <td class="meta-value">${fb.ten_nhan_vien || '—'}</td>
            </tr>
          </table>
          
          <table class="details-table">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">STT</th>
                <th style="width: 110px; text-align: left;">Mã sản phẩm</th>
                <th style="text-align: left;">Tên sản phẩm</th>
                <th style="width: 100px; text-align: right;">SL thiếu hụt</th>
                <th style="width: 140px; text-align: right;">Đơn giá trị thiếu</th>
                <th style="width: 160px; text-align: right;">Thành tiền thiếu</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary-box">
            <span class="summary-label">Tổng cộng giá trị thiếu:</span>
            <span class="summary-value">${formatCurrencyVND(fb.tong_thieu_hut)}</span>
          </div>

          <div class="signatures">
            <div class="signature-col">
              <div>Người lập phiếu</div>
              <div class="signature-hint">(Ký, ghi rõ họ tên)</div>
              <div class="signature-space"></div>
              <div class="signature-name">${fb.ten_nhan_vien || '—'}</div>
            </div>
            <div class="signature-col">
              <div>Đại diện Nhà cung cấp</div>
              <div class="signature-hint">(Ký, đóng dấu xác nhận)</div>
              <div class="signature-space"></div>
              <div class="signature-name">................................................</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportFeedbackExcel = (fb) => {
    try {
      const rows = [
        ["PHIẾU PHẢN HỒI HÀNG THIẾU"],
        [""],
        ["Mã phiếu phản hồi:", fb.ma_phht, "", "Ngày tạo phản hồi:", formatDateVN(fb.ngay_tao)],
        ["Mã phiếu nhập:", fb.ma_pnh || "—", "", "Nhân viên tạo:", fb.ten_nhan_vien || "—"],
        ["Nhà cung cấp:", fb.ten_ncc || "—"],
        [""],
        ["DANH SÁCH SẢN PHẨM THIẾU HỤT"],
        ["STT", "Mã sản phẩm", "Tên sản phẩm", "Số lượng thiếu", "Đơn giá trị thiếu (đ)", "Thành tiền thiếu (đ)"]
      ];

      (fb.items || []).forEach((item, idx) => {
        rows.push([
          idx + 1,
          item.sku || item.id_hang_hoa,
          item.ten_sp || "Sản phẩm không xác định",
          item.so_luong_thieu_hut,
          item.gia_tri_thieu_hut,
          Number(item.gia_tri_thieu_hut) * Number(item.so_luong_thieu_hut)
        ]);
      });

      rows.push([]);
      rows.push(["", "", "", "", "Tổng cộng thiếu hụt:", fb.tong_thieu_hut]);

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      
      worksheet["!cols"] = [
        { wch: 6 },  
        { wch: 15 }, 
        { wch: 35 }, 
        { wch: 15 }, 
        { wch: 20 }, 
        { wch: 20 }  
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Phiếu phản hồi");
      
      XLSX.writeFile(workbook, `Phieu_Phan_Hoi_Thieu_${fb.ma_phht}.xlsx`);
      toast.success("Xuất file Excel phiếu phản hồi thành công!");
    } catch (err) {
      toast.error("Lỗi khi xuất file Excel: " + err.message);
      console.error(err);
    }
  };

  const handleToggleActiveItem = (idHangHoa) => {
    setFeedbackItems(prev => ({
      ...prev,
      [idHangHoa]: {
        ...prev[idHangHoa],
        active: !prev[idHangHoa].active,
        missingQty: prev[idHangHoa].active ? 0 : 1
      }
    }));
  };

  const handleItemFieldChange = (idHangHoa, key, val) => {
    const nextVal = Number(val);
    setFeedbackItems(prev => ({
      ...prev,
      [idHangHoa]: {
        ...prev[idHangHoa],
        [key]: nextVal
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
    Object.keys(feedbackItems).forEach(key => {
      const item = feedbackItems[key];
      if (item.active && item.missingQty > 0) {
        payloadItems.push({
          id_hang_hoa: Number(key),
          so_luong_thieu_hut: Number(item.missingQty),
          gia_tri_thieu_hut: Number(item.missingPrice)
        });
      }
    });

    if (payloadItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất 1 sản phẩm bị thiếu và điền số lượng!");
      return;
    }

    try {
      const url = isEditing ? `/feedbacks/${editingId}` : "/feedbacks";
      const method = isEditing ? "PUT" : "POST";
      
      const payload = {
        ma_phht: maPhht || null,
        id_phieu_nhap: Number(idPhieuNhap),
        items: payloadItems
      };

      const res = await apiRequest(url, {
        method,
        body: payload,
        token
      });

      if (res.ok) {
        toast.success(isEditing ? "Cập nhật phản hồi hàng thiếu thành công!" : "Tạo phản hồi hàng thiếu thành công!");
        setFormModalOpen(false);
        fetchFeedbacks();
      } else {
        toast.error("Lỗi khi lưu phản hồi: " + res.message);
      }
    } catch (err) {
      toast.error("Lỗi khi lưu phản hồi: " + err.message);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-bold text-slate-800">Phiếu Phản Hồi Hàng Thiếu (Phân trang 10/trang)</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                className="gap-2 border-primary text-primary hover:bg-primary/5" 
                onClick={() => exportToExcel(
                  feedbacksList, 
                  "Danh_sach_phan_hoi_hang_thieu.xlsx", 
                  {
                    ma_phht: "Mã phiếu phản hồi",
                    ma_nhap: "Mã phiếu nhập",
                    ngay_tao: "Ngày tạo",
                    nhan_vien_ten: "Nhân viên phản hồi",
                    tong_thieu_hut: "Tổng lượng thiếu hụt"
                  }
                )}
              >
                <Plus size={16} className="rotate-45" />
                Xuất file Excel
              </Button>
              <Button onClick={handleOpenAdd} className="gap-2 bg-primary hover:bg-primary/95 text-white">
                <Plus size={16} />
                Tạo phản hồi thiếu
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
              placeholder="Tìm theo mã phản hồi, mã phiếu nhập, nhân viên..."
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
                      <th className="px-4 py-3 text-left font-semibold">Mã Phản Hồi</th>
                      <th className="px-4 py-3 text-left font-semibold">Mã Phiếu Nhập</th>
                      <th className="px-4 py-3 text-left font-semibold">Nhà cung cấp</th>
                      <th className="px-4 py-3 text-left font-semibold">Nhân viên tạo</th>
                      <th className="px-4 py-3 text-left font-semibold">Ngày tạo</th>
                      <th className="px-4 py-3 text-right font-semibold">Tổng giá trị thiếu hụt</th>
                      <th className="px-4 py-3 text-right font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {feedbacksList.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-primary">
                          <button onClick={() => handleViewDetails(f.id)} className="hover:underline text-left">
                            {f.ma_phht}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">{f.ma_pnh}</td>
                        <td className="px-4 py-3 text-slate-700">{f.ten_ncc || "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{f.ten_nhan_vien}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDateVN(f.ngay_tao)}</td>
                        <td className="px-4 py-3 text-right font-bold text-destructive">{formatCurrencyVND(f.tong_thieu_hut)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleViewDetails(f.id)} title="Xem chi tiết">
                              <Eye size={16} />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleOpenEdit(f)} title="Chỉnh sửa">
                              <Pencil size={16} />
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(f.id)} title="Xóa">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {feedbacksList.length === 0 ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-slate-400" colSpan={7}>
                          Không có phiếu phản hồi hàng thiếu nào ở trang này.
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
                    Hiển thị {(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} trong tổng số {totalItems} phiếu phản hồi
                  </span>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
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
      {viewModalOpen && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Chi tiết Phiếu Phản Hồi Hàng Thiếu</h3>
                <p className="text-xs text-slate-500 mt-0.5">Mã phiếu: {selectedFeedback.ma_phht}</p>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm border-b pb-4">
                <div>
                  <span className="text-slate-400 block text-xs">Mã Phản Hồi</span>
                  <span className="font-bold text-primary">{selectedFeedback.ma_phht}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Mã Phiếu Nhập</span>
                  <span className="font-medium text-slate-800">{selectedFeedback.ma_pnh}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Nhà cung cấp</span>
                  <span className="font-bold text-slate-800 text-sky-700">{selectedFeedback.ten_ncc || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Nhân viên tạo</span>
                  <span className="font-medium text-slate-800">{selectedFeedback.ten_nhan_vien}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Ngày tạo phản hồi</span>
                  <span className="font-medium text-slate-800">{formatDateVN(selectedFeedback.ngay_tao)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-700">Danh sách sản phẩm thiếu hụt</h4>
                <div className="overflow-x-auto rounded-lg border border-slate-100">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/70 text-slate-600">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">Mã sản phẩm / SKU</th>
                        <th className="px-4 py-2 text-left font-semibold">Tên sản phẩm</th>
                        <th className="px-4 py-2 text-right font-semibold">Số lượng thiếu</th>
                        <th className="px-4 py-2 text-right font-semibold">Giá trị thiếu hụt</th>
                        <th className="px-4 py-2 text-right font-semibold">Thành tiền thiếu hụt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedFeedback.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30">
                          <td className="px-4 py-3 font-semibold text-slate-800">{item.sku || item.id_hang_hoa}</td>
                          <td className="px-4 py-3 text-slate-700">{item.ten_sp || "Sản phẩm không xác định"}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-700">{item.so_luong_thieu_hut}</td>
                          <td className="px-4 py-3 text-right text-slate-800">{formatCurrencyVND(item.gia_tri_thieu_hut)}</td>
                          <td className="px-4 py-3 text-right font-bold text-destructive">{formatCurrencyVND(Number(item.gia_tri_thieu_hut) * Number(item.so_luong_thieu_hut))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <div className="bg-red-50/50 rounded-lg p-4 border border-red-100 w-full max-w-sm flex justify-between items-center">
                  <span className="text-xs font-semibold text-red-500 uppercase">Tổng cộng thiếu hụt</span>
                  <span className="text-lg font-extrabold text-destructive">{formatCurrencyVND(selectedFeedback.tong_thieu_hut)}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  className="gap-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                  onClick={() => handleExportFeedbackExcel(selectedFeedback)}
                >
                  <FileDown size={16} />
                  Xuất Excel
                </Button>
                <Button 
                  type="button"
                  className="gap-2 bg-slate-800 hover:bg-slate-700 text-white"
                  onClick={() => handlePrintFeedback(selectedFeedback)}
                >
                  <Printer size={16} />
                  In phiếu (PDF)
                </Button>
              </div>
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
                <h3 className="font-bold text-lg text-slate-800">{isEditing ? "Chỉnh sửa Phiếu Phản Hồi" : "Tạo Phiếu Phản Hồi Mới"}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Khai báo thông tin các mặt hàng bị nhập thiếu</p>
              </div>
              <button type="button" onClick={() => setFormModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Mã phản hồi (Tự động sinh nếu để trống)</label>
                  <input
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none"
                    placeholder="Ví dụ: PHHT001"
                    value={maPhht}
                    onChange={(e) => setMaPhht(e.target.value)}
                    disabled={isEditing}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Chọn Mã Phiếu Nhập để phản hồi thiếu *</label>
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
              </div>

              {/* Product Listing to Edit/Enter details */}
              {idPhieuNhap && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                    <Info size={16} className="text-primary" />
                    <span>Chi tiết các mặt hàng khai báo thiếu hụt:</span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-100">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50/70 text-slate-600">
                        <tr>
                          <th className="px-4 py-2.5 text-center font-semibold w-12">Chọn</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Tên sản phẩm</th>
                          <th className="px-4 py-2.5 text-right font-semibold">SL đã nhập</th>
                          <th className="px-4 py-2.5 text-right font-semibold">Số lượng thiếu *</th>
                          <th className="px-4 py-2.5 text-right font-semibold">Đơn giá trị thiếu (VNĐ)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {receiptItems.map(item => {
                          const state = feedbackItems[item.id_hang_hoa] || { active: false, missingQty: 0, maxQty: 1, missingPrice: 0, name: "" };
                          return (
                            <tr key={item.id_hang_hoa} className={`hover:bg-slate-50/30 transition-colors ${state.active ? 'bg-red-50/30' : ''}`}>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={state.active}
                                  onChange={() => handleToggleActiveItem(item.id_hang_hoa)}
                                  className="h-4 w-4 rounded border-slate-300 text-primary accent-primary"
                                />
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-800">{state.name}</td>
                              <td className="px-4 py-3 text-right text-slate-500 font-medium">{state.maxQty}</td>
                              <td className="px-4 py-3 text-right">
                                <input
                                  type="number"
                                  min={0}
                                  max={state.maxQty}
                                  value={state.missingQty}
                                  onChange={(e) => handleItemFieldChange(item.id_hang_hoa, "missingQty", e.target.value)}
                                  disabled={!state.active}
                                  className="h-8 w-20 rounded border border-input text-center text-sm bg-white font-bold outline-none"
                                />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <input
                                  type="number"
                                  value={state.missingPrice}
                                  onChange={(e) => handleItemFieldChange(item.id_hang_hoa, "missingPrice", e.target.value)}
                                  disabled={!state.active}
                                  className="h-8 w-32 rounded border border-input text-right text-sm bg-white font-medium outline-none px-2"
                                />
                              </td>
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
              <Button type="submit" className="bg-primary hover:bg-primary/95 text-white">Lưu phản hồi</Button>
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
