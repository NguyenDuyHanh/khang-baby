import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const staffSeed = [
  {
    id: "NV01",
    name: "Nguyễn Văn A",
    email: "nva@khangbaby.com",
    phone: "0912 345 678",
    role: "WAREHOUSE",
    createdAt: "2024-01-01",
    active: true,
  },
  {
    id: "NV02",
    name: "Trần Thị B",
    email: "ttb@khangbaby.com",
    phone: "0987 654 321",
    role: "ONLINE_SALES",
    createdAt: "2024-03-12",
    active: true,
  },
  {
    id: "NV03",
    name: "Lê Văn C",
    email: "lvc@khangbaby.com",
    phone: "0900 111 222",
    role: "SALES",
    createdAt: "2024-04-20",
    active: false,
  },
];

const roleLabel = {
  MANAGER: "Quản lý",
  WAREHOUSE: "Thủ kho",
  SALES: "Sales",
  ONLINE_SALES: "Online",
  MARKETING: "Marketing",
};

export default function StaffList() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("ALL");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return staffSeed.filter((s) => {
      const roleOk = role === "ALL" ? true : s.role === role;
      const queryOk = !q
        ? true
        : s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      return roleOk && queryOk;
    });
  }, [query, role]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Nhân viên</h2>
          <p className="text-sm text-muted-foreground mt-1">Quản lý tài khoản và phân quyền</p>
        </div>
        <Button asChild>
          <Link to="/staff/new">
            <Plus className="mr-2" />
            Thêm nhân viên
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Danh sách nhân viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 grid-cols-1 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Tìm theo tên hoặc mã NV"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Vai trò</label>
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

          <div className="overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Mã NV</th>
                  <th className="text-left font-medium px-4 py-3">Họ và tên</th>
                  <th className="text-left font-medium px-4 py-3">Email</th>
                  <th className="text-left font-medium px-4 py-3">Số điện thoại</th>
                  <th className="text-left font-medium px-4 py-3">Vai trò</th>
                  <th className="text-left font-medium px-4 py-3">Trạng thái</th>
                  <th className="text-right font-medium px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-t border-border/60 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold">{s.id}</td>
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                    <td className="px-4 py-3">{s.phone}</td>
                    <td className="px-4 py-3">{roleLabel[s.role] || s.role}</td>
                    <td className="px-4 py-3">
                      {s.active ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Hoạt động</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Đã khóa</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link to={`/staff/${s.id}/edit`} aria-label="Sửa">
                            <Pencil />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" aria-label="Khóa" onClick={() => {}}>
                          <Lock />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                      Không có nhân viên phù hợp.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
