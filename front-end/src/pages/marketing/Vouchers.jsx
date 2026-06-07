import { useState, useEffect } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrencyVND } from "@/lib/format";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Search, Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Vouchers() {
  const { token } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [form, setForm] = useState({
    ma_voucher: "",
    gia_tri_giam: "",
    phan_tram_giam: "",
    so_lan_su_dung_toi_da: "",
    gia_toi_thieu: "",
    han_su_dung_tu: "",
    han_su_dung_den: "",
    trang_thai: "HOAT_DONG"
  });

  const fetchVouchers = async (query = "") => {
    try {
      setLoading(true);
      const res = await apiRequest(`/vouchers?search=${encodeURIComponent(query)}`, { token });
      if (res.ok) {
        setVouchers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers(search);
  }, [search]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setForm({
        ma_voucher: item.ma_voucher,
        gia_tri_giam: item.gia_tri_giam || "",
        phan_tram_giam: item.phan_tram_giam || "",
        so_lan_su_dung_toi_da: item.so_lan_su_dung_toi_da || "",
        gia_toi_thieu: item.gia_toi_thieu || "",
        han_su_dung_tu: item.han_su_dung_tu ? item.han_su_dung_tu.split('T')[0] : "",
        han_su_dung_den: item.han_su_dung_den ? item.han_su_dung_den.split('T')[0] : "",
        trang_thai: item.trang_thai
      });
    } else {
      setEditItem(null);
      setForm({
        ma_voucher: "", gia_tri_giam: "", phan_tram_giam: "",
        so_lan_su_dung_toi_da: "", gia_toi_thieu: "",
        han_su_dung_tu: "", han_su_dung_den: "", trang_thai: "HOAT_DONG"
      });
    }
    setShowModal(true);
  };

  const setField = (key) => (e) => {
    const value = key === 'trang_thai' ? (e.target.checked ? 'HOAT_DONG' : 'KHONG_HOAT_DONG') : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ma_voucher: form.ma_voucher,
        gia_tri_giam: form.gia_tri_giam || null,
        phan_tram_giam: form.phan_tram_giam || null,
        so_lan_su_dung_toi_da: form.so_lan_su_dung_toi_da || null,
        gia_toi_thieu: form.gia_toi_thieu || 0,
        han_su_dung_tu: form.han_su_dung_tu,
        han_su_dung_den: form.han_su_dung_den,
        trang_thai: form.trang_thai
      };

      const url = editItem ? `/vouchers/${editItem.id}` : "/vouchers";
      const method = editItem ? "PUT" : "POST";

      const res = await apiRequest(url, { method, body: payload, token });
      if (res.ok) {
        toast.success(editItem ? "Cập nhật thành công!" : "Tạo voucher thành công!");
        setShowModal(false);
        fetchVouchers(search);
      } else {
        toast.error(res.message || "Lỗi khi lưu!");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa (ẩn) phiếu giảm giá này?")) return;
    try {
      const res = await apiRequest(`/vouchers/${id}`, { method: "DELETE", token });
      if (res.ok) {
        toast.success("Xóa thành công!");
        fetchVouchers(search);
      } else {
        toast.error(res.message || "Lỗi khi xóa!");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Phiếu Giảm Giá</h1>
          <p className="text-muted-foreground mt-1">Quản lý các chương trình khuyến mãi và mã voucher</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/95 text-white gap-2">
          <Plus size={16} /> Thêm Phiếu Mới
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Danh sách Voucher</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm mã voucher..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-semibold text-slate-600">Mã Voucher</TableHead>
                <TableHead className="font-semibold text-slate-600">Mức Giảm</TableHead>
                <TableHead className="font-semibold text-slate-600">Thời gian</TableHead>
                <TableHead className="text-center font-semibold text-slate-600">Lượt dùng</TableHead>
                <TableHead className="text-center font-semibold text-slate-600">Trạng thái</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">Đang tải...</TableCell>
                </TableRow>
              ) : vouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Tag className="h-10 w-10 text-slate-300 mb-2" />
                      <p>Chưa có phiếu giảm giá nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                vouchers.map((v) => (
                  <TableRow key={v.id} className="hover:bg-slate-50">
                    <TableCell className="font-semibold text-primary uppercase">{v.ma_voucher}</TableCell>
                    <TableCell>
                      {v.gia_tri_giam ? formatCurrencyVND(v.gia_tri_giam) : `${v.phan_tram_giam}%`}
                      <div className="text-xs text-muted-foreground mt-1">Đơn tối thiểu: {formatCurrencyVND(v.gia_toi_thieu)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">Từ: {new Date(v.han_su_dung_tu).toLocaleDateString('vi-VN')}</div>
                      <div className="text-sm">Đến: {new Date(v.han_su_dung_den).toLocaleDateString('vi-VN')}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      {v.so_lan_su_dung} / {v.so_lan_su_dung_toi_da || "∞"}
                    </TableCell>
                    <TableCell className="text-center">
                      {v.trang_thai === 'HOAT_DONG' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Đang hoạt động</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">Đã tắt</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(v)}>
                          <Pencil size={14} className="mr-1" /> Sửa
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(v.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Custom Modal for Voucher Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">{editItem ? "Sửa Phiếu Giảm Giá" : "Thêm Phiếu Mới"}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <form id="voucherForm" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600">Mã Voucher *</label>
                  <input required className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.ma_voucher} onChange={setField('ma_voucher')} placeholder="VD: KHUYENMAI20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Giảm số tiền (VNĐ)</label>
                    <input type="number" className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.gia_tri_giam} onChange={setField('gia_tri_giam')} placeholder="VD: 50000" disabled={!!form.phan_tram_giam} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Hoặc giảm theo %</label>
                    <input type="number" className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.phan_tram_giam} onChange={setField('phan_tram_giam')} placeholder="VD: 10" disabled={!!form.gia_tri_giam} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Đơn tối thiểu (VNĐ) *</label>
                    <input type="number" required className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.gia_toi_thieu} onChange={setField('gia_toi_thieu')} placeholder="VD: 200000" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Số lượt tối đa</label>
                    <input type="number" className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.so_lan_su_dung_toi_da} onChange={setField('so_lan_su_dung_toi_da')} placeholder="Để trống = vô hạn" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Từ ngày *</label>
                    <input type="date" required className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.han_su_dung_tu} onChange={setField('han_su_dung_tu')} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Đến ngày *</label>
                    <input type="date" required className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.han_su_dung_den} onChange={setField('han_su_dung_den')} />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input id="trang_thai" type="checkbox" checked={form.trang_thai === 'HOAT_DONG'} onChange={setField('trang_thai')} className="h-4 w-4 accent-primary" />
                  <label htmlFor="trang_thai" className="text-sm text-slate-600 font-semibold select-none">Hiển thị / Hoạt động</label>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
              <Button type="submit" form="voucherForm" className="bg-primary text-white hover:bg-primary/90">Lưu Voucher</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
