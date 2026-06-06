import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Lock, Unlock, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { exportToExcel } from "@/lib/export";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const roleLabel = {
  MANAGER: "Quản lý",
  WAREHOUSE: "Thủ kho",
  SALES: "Sales",
  ONLINE_SALES: "Online",
  MARKETING: "Marketing",
};

export default function StaffList() {
  const { token, user } = useAuth();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("ALL");
  
  // Real data state
  const [staffs, setStaffs] = useState([]);
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

  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/staff", { token });
      if (res.ok) {
        setStaffs(res.data || []);
      }
    } catch (err) {
      console.error("Error loading staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, [token]);

  // Handle deactivate/lock
  const handleToggleActive = (id, currentStatus) => {
    const isLocked = currentStatus === "KHOA";
    const actionText = isLocked ? "mở khóa" : "khóa";
    const staffItem = staffs.find(s => s.id === id);
    if (!staffItem) return;

    triggerConfirm({
      title: isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản",
      message: `Bạn có chắc muốn ${actionText} tài khoản của nhân viên "${staffItem.ho_ten}"?`,
      variant: isLocked ? "primary" : "danger",
      onConfirm: async () => {
        try {
          const newStatus = isLocked ? "HOAT_DONG" : "KHOA";
          const res = await apiRequest(`/staff/${id}`, {
            method: "PUT",
            body: {
              ho_ten: staffItem.ho_ten,
              so_dien_thoai: staffItem.so_dien_thoai,
              vai_tro: staffItem.vai_tro,
              trang_thai: newStatus
            },
            token
          });

          if (res.ok) {
            toast.success(isLocked ? "Đã mở khóa tài khoản nhân viên thành công!" : "Đã khóa tài khoản nhân viên thành công!");
            fetchStaffs();
          } else {
            toast.error(res.message || "Không thể thực hiện tác vụ.");
          }
        } catch (err) {
          toast.error("Lỗi khi thay đổi trạng thái nhân viên: " + err.message);
        }
      }
    });
  };

  const rows = staffs.filter((s) => {
    const roleOk = role === "ALL" ? true : s.vai_tro === role;
    const q = query.trim().toLowerCase();
    const queryOk = !q
      ? true
      : (s.ho_ten || "").toLowerCase().includes(q) || 
        String(s.id).toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q);
    return roleOk && queryOk;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Nhân viên</h2>
          <p className="text-sm text-muted-foreground mt-1">Quản lý tài khoản và phân quyền hệ thống</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="gap-2 border-primary text-primary hover:bg-primary/5" 
            onClick={() => exportToExcel(
              rows, 
              "Danh_sach_nhan_vien.xlsx", 
              {
                ho_ten: "Họ và tên",
                so_dien_thoai: "Số điện thoại",
                email: "Email đăng nhập",
                vai_tro: "Phân quyền",
                trang_thai: "Trạng thái"
              }
            )}
          >
            <FileDown size={16} />
            Xuất file Excel
          </Button>
          {user?.vai_tro === "MANAGER" && (
            <Button asChild className="bg-primary hover:bg-primary/95 text-white">
              <Link to="/staff/new">
                <Plus className="mr-2" size={16} />
                Thêm nhân viên
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-800">Danh sách nhân viên (Động)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid gap-3 grid-cols-1 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Tìm kiếm</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Tìm theo tên, email hoặc mã NV"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Vai trò</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="ALL">Tất cả</option>
                <option value="MANAGER">Quản lý</option>
                <option value="WAREHOUSE">Thủ kho</option>
                <option value="SALES">Sales</option>
                <option value="ONLINE_SALES">Sale Online</option>
                <option value="MARKETING">Marketing</option>
              </select>
            </div>

            <div className="hidden lg:block" />
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8 text-slate-500">Đang tải danh sách nhân viên...</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-sm min-w-max">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">Mã NV</th>
                    <th className="text-left font-semibold px-4 py-3">Họ và tên</th>
                    <th className="text-left font-semibold px-4 py-3">Email</th>
                    <th className="text-left font-semibold px-4 py-3">Số điện thoại</th>
                    <th className="text-left font-semibold px-4 py-3">Vai trò</th>
                    <th className="text-left font-semibold px-4 py-3">Trạng thái</th>
                    {user?.role === "MANAGER" ? <th className="text-right font-semibold px-4 py-3">Hành động</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">NV{s.id}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{s.ho_ten}</td>
                      <td className="px-4 py-3 text-slate-600">{s.email}</td>
                      <td className="px-4 py-3 text-slate-700">{s.so_dien_thoai || "—"}</td>
                      <td className="px-4 py-3 text-slate-700">{roleLabel[s.vai_tro] || s.vai_tro}</td>
                      <td className="px-4 py-3">
                        {s.trang_thai === "HOAT_DONG" ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Hoạt động</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Đã khóa</Badge>
                        )}
                      </td>
                      {user?.role === "MANAGER" ? (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="icon" asChild title="Sửa">
                              <Link to={`/staff/${s.id}/edit`} aria-label="Sửa">
                                <Pencil size={16} />
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              title={s.trang_thai === "HOAT_DONG" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                              onClick={() => handleToggleActive(s.id, s.trang_thai)}
                              className={s.trang_thai === "HOAT_DONG" ? "text-destructive hover:bg-destructive/10" : "text-green-600 hover:bg-green-50"}
                            >
                              {s.trang_thai === "HOAT_DONG" ? <Lock size={16} /> : <Unlock size={16} />}
                            </Button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}

                  {rows.length === 0 ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-400" colSpan={7}>
                        Không có nhân viên phù hợp.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
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
