import { useEffect, useState } from "react";
import { Plus, FileDown, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyVND, formatDateVN } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { exportToExcel } from "@/lib/export";

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
              <Button className="gap-2 bg-primary hover:bg-primary/95 text-white" onClick={() => {}}>
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
                            <Button variant="outline" size="icon" aria-label="Sửa" onClick={() => {}}>
                              <Pencil size={16} />
                            </Button>
                            <Button variant="outline" size="icon" aria-label="Xóa" className="text-destructive hover:bg-destructive/10" onClick={() => {}}>
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
    </Card>
  );
}
