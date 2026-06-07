import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { formatDateVN } from "@/lib/format";

export default function Categories() {
  const { token, user } = useAuth();
  const canEdit = user?.role === "MANAGER" || user?.role === "WAREHOUSE";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ten_danh_muc: '', mo_ta: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/products/categories/list", { token });
      if (res.ok) setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCategories();
  }, [token]);

  const handleOpenModal = () => {
    setFormData({ ten_danh_muc: '', mo_ta: '' });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await apiRequest('/products/categories', {
        method: 'POST',
        body: formData,
        token
      });
      if (res?.ok) {
        setIsModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      setErrorMsg(err.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) return;
    try {
      const res = await apiRequest(`/products/categories/${id}`, {
        method: 'DELETE',
        token
      });
      if (res?.ok) {
        fetchCategories();
      }
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra khi xóa danh mục");
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-800">Quản lý Danh mục (Loại)</CardTitle>
          {canEdit && (
            <Button className="gap-2 bg-primary hover:bg-primary/95 text-white" onClick={handleOpenModal}>
              <Plus size={16} />
              Thêm danh mục
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Tên danh mục</th>
                  <th className="px-4 py-3 text-left font-semibold">Mô tả</th>
                  <th className="px-4 py-3 text-left font-semibold">Ngày tạo</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-500">{c.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{c.ten_danh_muc}</td>
                    <td className="px-4 py-3 text-slate-600">{c.mo_ta || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{c.ngay_tao ? formatDateVN(c.ngay_tao) : "—"}</td>
                    <td className="px-4 py-3">
                      {c.trang_thai === 'HOAT_DONG' ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Hoạt động</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Ngừng KD</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {canEdit && (
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 w-8" onClick={() => handleDelete(c.id, c.ten_danh_muc)} title="Xóa danh mục">
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-400" colSpan={6}>
                      Chưa có danh mục nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Thêm danh mục mới</h2>
              {errorMsg && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-md">{errorMsg}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên danh mục *</label>
                  <input required className="w-full border rounded-md px-3 py-2 text-sm" value={formData.ten_danh_muc} onChange={e => setFormData({...formData, ten_danh_muc: e.target.value})} placeholder="VD: Sữa bột" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mô tả</label>
                  <textarea className="w-full border rounded-md px-3 py-2 text-sm" rows={3} value={formData.mo_ta} onChange={e => setFormData({...formData, mo_ta: e.target.value})} placeholder="Mô tả danh mục..."></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4 mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : "Lưu danh mục"}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
