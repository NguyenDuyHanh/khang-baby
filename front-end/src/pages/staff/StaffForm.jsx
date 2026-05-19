import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const roleOptions = [
  { value: "MANAGER", label: "Quản lý cửa hàng" },
  { value: "WAREHOUSE", label: "Thủ kho" },
  { value: "SALES", label: "Nhân viên bán hàng" },
  { value: "ONLINE_SALES", label: "Nhân viên sale online" },
  { value: "MARKETING", label: "Nhân viên marketing" },
];

export default function StaffForm() {
  const navigate = useNavigate();
  const params = useParams();
  const { token } = useAuth();
  const isEdit = Boolean(params.id);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "SALES",
    active: true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  // Load existing staff data if in edit mode
  useEffect(() => {
    if (!isEdit || !token) return;

    const fetchStaffDetail = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/staff/${params.id}`, { token });
        if (res.ok && res.data) {
          const s = res.data;
          setForm({
            fullName: s.ho_ten || "",
            email: s.email || "",
            password: "",
            confirmPassword: "",
            phone: s.so_dien_thoai || "",
            role: s.vai_tro || "SALES",
            active: s.trang_thai === "HOAT_DONG",
          });
        }
      } catch (err) {
        setError("Lỗi khi tải thông tin nhân viên: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDetail();
  }, [isEdit, params.id, token]);

  const setField = (key) => (e) => {
    const value = key === "active" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.role) {
      setError("Vui lòng điền đầy đủ Họ tên, Email, SĐT và Vai trò.");
      return;
    }

    if (!isEdit) {
      if (!form.password || form.password.length < 6) {
        setError("Mật khẩu tối thiểu 6 ký tự.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Xác nhận mật khẩu không khớp.");
        return;
      }
    }

    try {
      const url = isEdit ? `/staff/${params.id}` : "/staff";
      const method = isEdit ? "PUT" : "POST";
      
      // Map frontend fields to backend names
      const payload = {
        ho_ten: form.fullName,
        email: form.email,
        so_dien_thoai: form.phone,
        vai_tro: form.role,
        trang_thai: form.active ? "HOAT_DONG" : "KHOA",
      };

      if (!isEdit) {
        payload.password = form.password;
      }

      const res = await apiRequest(url, {
        method,
        body: payload,
        token
      });

      if (res.ok) {
        toast.success(isEdit ? "Cập nhật nhân viên thành công!" : "Tạo nhân viên mới thành công!");
        navigate("/staff");
      } else {
        toast.error(res.message || "Có lỗi xảy ra khi lưu nhân viên.");
        setError(res.message || "Có lỗi xảy ra khi lưu nhân viên.");
      }
    } catch (err) {
      setError("Lỗi kết nối: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Đang tải thông tin nhân viên...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800">
            {isEdit ? "Sửa nhân viên" : "Thêm nhân viên mới"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Thông tin tài khoản và phân quyền hệ thống</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/staff">Quay lại</Link>
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-700">Thông tin chi tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-600">Họ và tên *</label>
                <input
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.fullName}
                  onChange={setField("fullName")}
                  placeholder="Nhập họ tên"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-600">Email *</label>
                <input
                  type="email"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.email}
                  onChange={setField("email")}
                  placeholder="vd: nva@khangbaby.com"
                  required
                  disabled={isEdit}
                />
              </div>

              {!isEdit ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-600">Mật khẩu *</label>
                    <input
                      type="password"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={form.password}
                      onChange={setField("password")}
                      placeholder="Tối thiểu 6 ký tự"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-600">Xác nhận mật khẩu *</label>
                    <input
                      type="password"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={form.confirmPassword}
                      onChange={setField("confirmPassword")}
                      placeholder="Nhập lại mật khẩu"
                      required
                    />
                  </div>
                </>
              ) : null}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-600">Số điện thoại *</label>
                <input
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.phone}
                  onChange={setField("phone")}
                  placeholder="vd: 0912345678"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-600">Vai trò / Phân quyền *</label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.role}
                  onChange={setField("role")}
                  required
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={form.active}
                  onChange={setField("active")}
                  className="h-4 w-4 accent-primary"
                />
                <label htmlFor="active" className="text-sm text-slate-600 font-semibold select-none">
                  Cho phép hoạt động
                </label>
              </div>
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive font-semibold">
                {error}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button variant="outline" type="button" asChild>
                <Link to="/staff">Hủy</Link>
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/95 text-white">Lưu nhân viên</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
