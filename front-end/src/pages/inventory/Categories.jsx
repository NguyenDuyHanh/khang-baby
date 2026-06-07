import { useState, useEffect } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Search, Tags, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatCurrencyVND } from "@/lib/format";

export default function Categories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Xem chi tiết
  const [viewItem, setViewItem] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [form, setForm] = useState({
    ten_danh_muc: "",
    mo_ta: "",
    trang_thai: "HOAT_DONG"
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/products/categories/list?all=true`, { token });
      if (res.ok) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setForm({
        ten_danh_muc: item.ten_danh_muc,
        mo_ta: item.mo_ta || "",
        trang_thai: item.trang_thai
      });
    } else {
      setEditItem(null);
      setForm({
        ten_danh_muc: "", mo_ta: "", trang_thai: "HOAT_DONG"
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
        ten_danh_muc: form.ten_danh_muc,
        mo_ta: form.mo_ta,
        trang_thai: form.trang_thai
      };

      const url = editItem ? `/products/categories/${editItem.id}` : "/products/categories";
      const method = editItem ? "PUT" : "POST";

      const res = await apiRequest(url, { method, body: payload, token });
      if (res.ok) {
        toast.success(editItem ? "Cập nhật thành công!" : "Tạo mới thành công!");
        setShowModal(false);
        fetchCategories();
      } else {
        toast.error(res.message || "Lỗi khi lưu!");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn ẩn loại sản phẩm này? Các sản phẩm thuộc loại này sẽ bị ảnh hưởng nếu loại không hoạt động.")) return;
    try {
      const res = await apiRequest(`/products/categories/${id}`, { method: "DELETE", token });
      if (res.ok) {
        toast.success("Đã ẩn thành công!");
        fetchCategories();
      } else {
        toast.error(res.message || "Lỗi khi xóa!");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleViewDetails = async (item) => {
    setViewItem(item);
    setLoadingProducts(true);
    try {
      const res = await apiRequest(`/products?danh_muc=${item.id}&limit=100`, { token });
      if (res.ok) {
        setCategoryProducts(res.data || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này? Sản phẩm sẽ bị ngừng kinh doanh và không hiển thị trên website nữa.")) return;
    try {
      const res = await apiRequest(`/products/${id}`, { method: "DELETE", token });
      if (res.ok) {
        toast.success("Xóa sản phẩm thành công!");
        setCategoryProducts(prev => prev.filter(p => p.id !== id));
      } else {
        toast.error(res.message || "Lỗi khi xóa sản phẩm!");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Lọc theo search
  const filteredCategories = categories.filter(c => 
    c.ten_danh_muc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Loại Sản Phẩm</h1>
          <p className="text-muted-foreground mt-1">Quản lý các danh mục phân loại sản phẩm</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/95 text-white gap-2">
          <Plus size={16} /> Thêm Loại Mới
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Danh sách Loại</CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm tên loại..."
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
                <TableHead className="font-semibold text-slate-600">ID</TableHead>
                <TableHead className="font-semibold text-slate-600">Tên Loại</TableHead>
                <TableHead className="font-semibold text-slate-600">Mô tả</TableHead>
                <TableHead className="text-center font-semibold text-slate-600">Trạng thái</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">Đang tải...</TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Tags className="h-10 w-10 text-slate-300 mb-2" />
                      <p>Không tìm thấy loại sản phẩm nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((c) => (
                  <TableRow key={c.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-500">{c.id}</TableCell>
                    <TableCell className="font-semibold text-slate-800">{c.ten_danh_muc}</TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-xs truncate" title={c.mo_ta}>{c.mo_ta || "-"}</TableCell>
                    <TableCell className="text-center">
                      {c.trang_thai === 'HOAT_DONG' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Hoạt động</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">Đã ẩn</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(c)}>
                          <Eye size={14} className="mr-1" /> Xem
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(c)}>
                          <Pencil size={14} className="mr-1" /> Sửa
                        </Button>
                        {c.trang_thai === 'HOAT_DONG' && (
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(c.id)}>
                            <Trash2 size={14} /> Ẩn
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Custom Modal for Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">{editItem ? "Sửa Loại Sản Phẩm" : "Thêm Loại Mới"}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <div className="p-6">
              <form id="categoryForm" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600">Tên Loại *</label>
                  <input required className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" value={form.ten_danh_muc} onChange={setField('ten_danh_muc')} placeholder="VD: Sữa Bột, Bỉm..." />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">Mô tả</label>
                  <textarea className="mt-1 w-full rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" rows={3} value={form.mo_ta} onChange={setField('mo_ta')} placeholder="Mô tả về loại sản phẩm này..." />
                </div>
                {editItem && (
                  <div className="flex items-center gap-2 pt-2">
                    <input id="trang_thai" type="checkbox" checked={form.trang_thai === 'HOAT_DONG'} onChange={setField('trang_thai')} className="h-4 w-4 accent-primary" />
                    <label htmlFor="trang_thai" className="text-sm text-slate-600 font-semibold select-none">Đang hoạt động</label>
                  </div>
                )}
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
              <Button type="submit" form="categoryForm" className="bg-primary text-white hover:bg-primary/90">Lưu thông tin</Button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                Sản phẩm thuộc: {viewItem.ten_danh_muc}
              </h3>
              <button type="button" onClick={() => setViewItem(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <div className="p-0 max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-semibold text-slate-600">Mã SP</TableHead>
                    <TableHead className="font-semibold text-slate-600">Tên sản phẩm</TableHead>
                    <TableHead className="text-right font-semibold text-slate-600">Giá bán</TableHead>
                    <TableHead className="text-right font-semibold text-slate-600">Tồn kho</TableHead>
                    <TableHead className="text-right font-semibold text-slate-600">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingProducts ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-500">Đang tải danh sách sản phẩm...</TableCell>
                    </TableRow>
                  ) : categoryProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                        Chưa có sản phẩm nào thuộc loại này.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categoryProducts.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.ma_sp}</TableCell>
                        <TableCell>{p.ten_sp}</TableCell>
                        <TableCell className="text-right font-medium text-[var(--color-price)]">{formatCurrencyVND(p.gia_ban)}</TableCell>
                        <TableCell className="text-right">{p.ton_kho}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteProduct(p.id)}>
                            <Trash2 size={14} className="mr-1"/> Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button type="button" onClick={() => setViewItem(null)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
