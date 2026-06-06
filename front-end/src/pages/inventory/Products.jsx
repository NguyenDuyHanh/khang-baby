import { useEffect, useState } from "react";
import { Plus, FileDown, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyVND, formatDateVN } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, apiUpload } from "@/lib/api";
import { exportToExcel } from "@/lib/export";
import ConfirmDialog from "@/components/ui/confirm-dialog";

function stockStatus(stock, minStock) {
  if (stock <= 0 || stock <= minStock) return "OUT";
  if (stock <= minStock * 2) return "LOW";
  return "OK";
}

function statusBadge(stock, minStock) {
  const status = stockStatus(stock, minStock);
  if (status === "OK") {
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Còn hàng</Badge>;
  }
  if (status === "LOW") {
    return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Sắp hết</Badge>;
  }
  return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Hết hàng</Badge>;
}

export default function Products() {
  const { token, user } = useAuth();
  const canEdit = user?.role === "MANAGER" || user?.role === "WAREHOUSE";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [supplier, setSupplier] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  // Dynamic state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    ma_sp: '', ten_sp: '', id_danh_muc: '', id_nha_cung_cap: '',
    don_vi_tinh: 'HOP', gia_nhap: 0, gia_ban: 0, ton_kho_toi_thieu: 10, han_su_dung: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleOpenModal = (product = null) => {
    if (product && product.id) {
      setEditId(product.id);
      setFormData({
        ma_sp: product.ma_sp || '', 
        ten_sp: product.ten_sp || '', 
        id_danh_muc: product.id_danh_muc || categories[0]?.id || '', 
        id_nha_cung_cap: product.id_nha_cung_cap || suppliers[0]?.id || '',
        don_vi_tinh: product.don_vi_tinh || 'HOP', 
        gia_nhap: product.gia_nhap || 0, 
        gia_ban: product.gia_ban || 0, 
        ton_kho_toi_thieu: product.ton_kho_toi_thieu || 10, 
        han_su_dung: product.han_su_dung ? new Date(product.han_su_dung).toISOString().split('T')[0] : ''
      });
    } else {
      setEditId(null);
      setFormData({
        ma_sp: '', ten_sp: '', id_danh_muc: categories[0]?.id || '', id_nha_cung_cap: suppliers[0]?.id || '',
        don_vi_tinh: 'HOP', gia_nhap: 0, gia_ban: 0, ton_kho_toi_thieu: 10, han_su_dung: ''
      });
    }
    setImageFile(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (imageFile) {
        data.append('hinh_anh', imageFile);
      }
      
      if (editId) {
        const res = await apiUpload('/products/' + editId, data, { method: 'PUT', token });
        if (res?.ok) {
          setIsModalOpen(false);
          fetchProducts(); // refresh
        }
      } else {
        const res = await apiUpload('/products', data, { token });
        if (res?.ok) {
          setIsModalOpen(false);
          fetchProducts(); // refresh
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExecute = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await apiRequest(`/products/${deleteId}`, { method: 'DELETE', token });
      if (res.ok) {
        setDeleteId(null);
        fetchProducts();
      }
    } catch (err) {
      alert("Lỗi khi xóa: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Load lists for selectors (Categories and Suppliers)
  useEffect(() => {
    if (!token) return;
    
    const fetchSelectors = async () => {
      try {
        const catRes = await apiRequest("/products/categories/list", { token });
        if (catRes.ok) setCategories(catRes.data || []);
        
        const supRes = await apiRequest("/products/suppliers/list", { token });
        if (supRes.ok) setSuppliers(supRes.data || []);
      } catch (err) {
        console.error("Error fetching selectors:", err);
      }
    };
    
    fetchSelectors();
  }, [token]);

  // Load products from backend with filters & pagination
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const catParam = category === "ALL" ? "" : category;
      const supParam = supplier === "ALL" ? "" : supplier;
      
      const res = await apiRequest(
        `/products?page=${page}&limit=10&search=${query}&danh_muc=${catParam}&nha_cung_cap=${supParam}`,
        { token }
      );
      if (res.ok) {
        setProducts(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalItems(res.pagination.totalItems || 0);
        }
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token, page, query, category, supplier]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handleSupplierChange = (e) => {
    setSupplier(e.target.value);
    setPage(1);
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-bold text-slate-800">Danh sách hàng hóa (Động)</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              className="gap-2 border-primary text-primary hover:bg-primary/5" 
              onClick={() => exportToExcel(
                products, 
                "Danh_sach_hang_hoa.xlsx", 
                {
                  ma_sp: "Mã sản phẩm",
                  ten_sp: "Tên sản phẩm",
                  danh_muc_ten: "Danh mục",
                  nha_cung_cap_ten: "Nhà cung cấp",
                  gia_nhap: "Giá nhập (đ)",
                  gia_ban: "Giá bán (đ)",
                  ton_kho: "Tồn kho",
                  ton_toi_thieu: "Tồn tối thiểu"
                }
              )}
            >
              <FileDown size={16} />
              Xuất file Excel
            </Button>
            {canEdit ? (
              <Button className="gap-2 bg-primary hover:bg-primary/95 text-white" onClick={() => handleOpenModal()}>
                <Plus size={16} />
                Thêm sản phẩm
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Tìm kiếm</label>
            <input
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Tìm theo mã SP hoặc tên"
              value={query}
              onChange={handleQueryChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Danh mục</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="ALL">Tất cả danh mục</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.ten_danh_muc}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Nhà cung cấp</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={supplier}
              onChange={handleSupplierChange}
            >
              <option value="ALL">Tất cả nhà cung cấp</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.ten_ncc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Table */}
        {loading ? (
          <div className="text-center py-8 text-slate-500">Đang tải dữ liệu sản phẩm...</div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-sm min-w-max">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold w-16">Ảnh</th>
                    <th className="px-4 py-3 text-left font-semibold">Mã SP</th>
                    <th className="px-4 py-3 text-left font-semibold">Tên sản phẩm</th>
                    <th className="px-4 py-3 text-left font-semibold">Danh mục</th>
                    <th className="px-4 py-3 text-left font-semibold">Nhà cung cấp</th>
                    <th className="px-4 py-3 text-right font-semibold">Giá nhập</th>
                    <th className="px-4 py-3 text-right font-semibold">Giá bán</th>
                    <th className="px-4 py-3 text-right font-semibold">Tồn kho</th>
                    <th className="px-4 py-3 text-right font-semibold">Tồn tối thiểu</th>
                    <th className="px-4 py-3 text-left font-semibold">Hạn sử dụng</th>
                    <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                    {canEdit ? <th className="px-4 py-3 text-right font-semibold">Hành động</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        {p.hinh_anh ? (
                          <img src={p.hinh_anh} alt={p.ten_sp} className="w-10 h-10 object-cover rounded-md border" />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 rounded-md border flex items-center justify-center text-xs text-slate-400">N/A</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">{p.ma_sp}</td>
                      <td className="px-4 py-3 font-medium text-slate-800 min-w-52">{p.ten_sp}</td>
                      <td className="px-4 py-3 text-slate-600">{p.ten_danh_muc || "Chưa phân loại"}</td>
                      <td className="px-4 py-3 text-slate-600">{p.ten_ncc || "Chưa rõ"}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-600">{formatCurrencyVND(p.gia_nhap)}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrencyVND(p.gia_ban)}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-primary">{p.ton_kho}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{p.ton_kho_toi_thieu}</td>
                      <td className="px-4 py-3 text-slate-600">{p.han_su_dung ? formatDateVN(p.han_su_dung) : "—"}</td>
                      <td className="px-4 py-3">{statusBadge(p.ton_kho, p.ton_kho_toi_thieu)}</td>
                      {canEdit ? (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" aria-label="Sửa" onClick={() => handleOpenModal(p)}>
                              <Pencil size={16} />
                            </Button>
                            <Button variant="outline" size="icon" aria-label="Xóa" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(p.id)}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                  {products.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-400" colSpan={canEdit ? 11 : 10}>
                        Không có sản phẩm nào ở trang này.
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
                  Hiển thị {(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} trong tổng số {totalItems} sản phẩm
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

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{editId ? "Sửa sản phẩm" : "Thêm mới sản phẩm"}</h2>
              {errorMsg && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-md">{errorMsg}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mã sản phẩm *</label>
                    <input required className="w-full border rounded-md px-3 py-2 text-sm" value={formData.ma_sp} onChange={e => setFormData({...formData, ma_sp: e.target.value})} placeholder="VD: SP001" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tên sản phẩm *</label>
                    <input required className="w-full border rounded-md px-3 py-2 text-sm" value={formData.ten_sp} onChange={e => setFormData({...formData, ten_sp: e.target.value})} placeholder="Nhập tên sản phẩm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Danh mục *</label>
                    <select required className="w-full border rounded-md px-3 py-2 text-sm" value={formData.id_danh_muc} onChange={e => setFormData({...formData, id_danh_muc: e.target.value})}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.ten_danh_muc}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nhà cung cấp *</label>
                    <select required className="w-full border rounded-md px-3 py-2 text-sm" value={formData.id_nha_cung_cap} onChange={e => setFormData({...formData, id_nha_cung_cap: e.target.value})}>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.ten_ncc}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Đơn vị tính</label>
                    <select className="w-full border rounded-md px-3 py-2 text-sm" value={formData.don_vi_tinh} onChange={e => setFormData({...formData, don_vi_tinh: e.target.value})}>
                      <option value="HOP">Hộp</option>
                      <option value="GOI">Gói</option>
                      <option value="CHIEC">Chiếc</option>
                      <option value="THUNG">Thùng</option>
                      <option value="LON">Lon</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Giá nhập *</label>
                    <input required type="number" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.gia_nhap} onChange={e => setFormData({...formData, gia_nhap: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Giá bán *</label>
                    <input required type="number" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.gia_ban} onChange={e => setFormData({...formData, gia_ban: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tồn kho tối thiểu</label>
                    <input type="number" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.ton_kho_toi_thieu} onChange={e => setFormData({...formData, ton_kho_toi_thieu: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hạn sử dụng</label>
                    <input type="date" className="w-full border rounded-md px-3 py-2 text-sm" value={formData.han_su_dung} onChange={e => setFormData({...formData, han_su_dung: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ảnh sản phẩm</label>
                    <input type="file" accept="image/*" className="w-full border rounded-md px-3 py-1.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" onChange={handleFileChange} />
                    {imageFile && (
                      <div className="mt-2">
                        <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-24 w-24 object-cover rounded-md border" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog 
        isOpen={!!deleteId}
        title="Xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        confirmText={isDeleting ? "Đang xóa..." : "Xóa"}
        onConfirm={handleDeleteExecute}
        onCancel={() => setDeleteId(null)}
      />
    </Card>
  );
}
