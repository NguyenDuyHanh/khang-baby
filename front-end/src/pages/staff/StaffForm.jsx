import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const roleOptions = [
  { value: "MANAGER", label: "Quản lý cửa hàng" },
  { value: "WAREHOUSE", label: "Thủ kho" },
  { value: "SALES", label: "Nhân viên bán hàng" },
  { value: "ONLINE_SALES", label: "Nhân viên sale online" },
  { value: "MARKETING", label: "Nhân viên marketing" },
];

const demoStaffById = {
  NV01: {
    id: "NV01",
    fullName: "Nguyễn Văn A",
    email: "nva@khangbaby.com",
    phone: "0912 345 678",
    role: "WAREHOUSE",
    active: true,
  },
  NV02: {
    id: "NV02",
    fullName: "Trần Thị B",
    email: "ttb@khangbaby.com",
    phone: "0987 654 321",
    role: "ONLINE_SALES",
    active: true,
  },
};

export default function StaffForm() {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = Boolean(params.id);

  const initial = useMemo(() => {
    if (!isEdit) {
      return {
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "SALES",
        active: true,
      };
    }
    const found = demoStaffById[params.id];
    return {
      fullName: found?.fullName || "",
      email: found?.email || "",
      password: "",
      confirmPassword: "",
      phone: found?.phone || "",
      role: found?.role || "SALES",
      active: found?.active ?? true,
    };
  }, [isEdit, params.id]);

  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  const setField = (key) => (e) => {
    const value = key === "active" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.role) {
      setError("Vui lòng điền đầy đủ Họ tên, Email, SĐT và Vai trò.");
      return;
    }

    if (!isEdit) {
      if (!form.password || form.password.length < 8) {
        setError("Mật khẩu tối thiểu 8 ký tự.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Xác nhận mật khẩu không khớp.");
        return;
      }
    }

    navigate("/staff", { replace: true });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {isEdit ? "Sửa nhân viên" : "Thêm nhân viên"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Thông tin tài khoản và phân quyền</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/staff">Quay lại</Link>
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Thông tin nhân viên</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Họ và tên</label>
                <input
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.fullName}
                  onChange={setField("fullName")}
                  placeholder="Nhập họ tên"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.email}
                  onChange={setField("email")}
                  placeholder="vd: nva@khangbaby.com"
                />
              </div>

              {!isEdit ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Mật khẩu</label>
                    <input
                      type="password"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={form.password}
                      onChange={setField("password")}
                      placeholder="Tối thiểu 8 ký tự"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={form.confirmPassword}
                      onChange={setField("confirmPassword")}
                      placeholder="Nhập lại mật khẩu"
                    />
                  </div>
                </>
              ) : null}

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Số điện thoại</label>
                <input
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.phone}
                  onChange={setField("phone")}
                  placeholder="vd: 0912 345 678"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Vai trò / Phân quyền</label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.role}
                  onChange={setField("role")}
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
                <label htmlFor="active" className="text-sm text-muted-foreground select-none">
                  Hoạt động
                </label>
              </div>
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" type="button" asChild>
                <Link to="/staff">Hủy</Link>
              </Button>
              <Button type="submit">Lưu</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
