import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const roleOptions = [
  { value: "MANAGER", label: "Quản lý cửa hàng" },
  { value: "WAREHOUSE", label: "Thủ kho" },
  { value: "SALES", label: "Nhân viên sales" },
  { value: "ONLINE_SALES", label: "Nhân viên sale online" },
  { value: "MARKETING", label: "Nhân viên marketing" },
];

export default function Register() {
  const navigate = useNavigate();
  const { user, register } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "SALES",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await register(form);
    if (!res.ok) {
      setError(res.message || "Đăng ký không thành công.");
      return;
    }

    setSuccess("Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.");
    setTimeout(() => navigate("/login", { replace: true }), 600);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-160 border-none shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Đăng ký tài khoản nhân viên
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Hệ thống Quản lý KhangBaby
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Địa chỉ email</label>
                <input
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  placeholder="vd: nva@khangbaby.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mật khẩu</label>
                <input
                  type="password"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  placeholder="Tối thiểu 8 ký tự"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tên</label>
                <input
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="vd: Nguyễn Văn A"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Số điện thoại</label>
                <input
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.phone}
                  onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="vd: 0912 345 678"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phân quyền</label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.role}
                  onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
                >
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {success}
              </div>
            ) : null}

            <Button type="submit" className="w-full">
              Tạo tài khoản
            </Button>

            <div className="text-sm text-muted-foreground text-center">
              Đã có tài khoản?{" "}
              <Link className="text-primary font-medium hover:underline" to="/login">
                Đăng nhập
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
