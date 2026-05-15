import { useMemo, useState } from "react";
import { FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyVND, formatDateVN } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

const reportTabs = [
  { key: "orders", label: "Đơn hàng" },
  { key: "revenue", label: "Doanh thu" },
  { key: "inventory", label: "Tồn kho" },
  { key: "staff", label: "Nhân viên" },
];

const orderDailySeed = [
  { date: "2024-05-10", orders: 23, paid: 12, unpaid: 11 },
  { date: "2024-05-11", orders: 12, paid: 11, unpaid: 1 },
  { date: "2024-05-12", orders: 10, paid: 10, unpaid: 0 },
  { date: "2024-05-13", orders: 7, paid: 4, unpaid: 3 },
  { date: "2024-05-14", orders: 13, paid: 12, unpaid: 1 },
  { date: "2024-05-15", orders: 12, paid: 8, unpaid: 4 },
  { date: "2024-05-16", orders: 8, paid: 6, unpaid: 2 },
];

export default function Reports() {
  const { user } = useAuth();
  const role = user?.role;
  const isManager = role === "MANAGER";

  const [active, setActive] = useState("orders");
  const [timeRange, setTimeRange] = useState("7d");

  const tabs = useMemo(() => {
    if (isManager) return reportTabs;
    // MARKETING: doanh thu + đơn hàng (theo mô tả module báo cáo)
    return reportTabs.filter((t) => t.key === "orders" || t.key === "revenue");
  }, [isManager]);

  const effectiveActive = tabs.some((t) => t.key === active)
    ? active
    : (tabs[0]?.key || "orders");

  const orderSummary = useMemo(() => {
    const total = orderDailySeed.reduce((sum, r) => sum + r.orders, 0);
    const paid = orderDailySeed.reduce((sum, r) => sum + r.paid, 0);
    const canceled = 10; // demo
    return { total, paid, canceled };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Báo cáo</h2>
          <p className="text-sm text-muted-foreground mt-1">Tổng hợp số liệu và thống kê</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="today">Hôm nay</option>
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
          <Button variant="outline" className="gap-2" onClick={() => {}}>
            <FileDown />
            Xuất file Excel
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button
            key={t.key}
            type="button"
            variant={effectiveActive === t.key ? "default" : "outline"}
            size="sm"
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {effectiveActive === "orders" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Báo cáo đơn hàng</h3>
              <p className="text-sm text-muted-foreground">
                {timeRange === "7d" ? "10/05/2024 – 16/05/2024 — 7 ngày qua" : "Khoảng thời gian đã chọn"}
              </p>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              {timeRange === "today" ? "Hôm nay" : timeRange === "30d" ? "30 ngày" : timeRange === "custom" ? "Tùy chỉnh" : "7 ngày"}
            </Badge>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground">Tổng số đơn hàng</p>
                <div className="text-2xl font-bold">{orderSummary.total}</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground">Đơn hàng đã hoàn thành</p>
                <div className="text-2xl font-bold text-blue-700">{orderSummary.paid}</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground">Đơn hàng đã hủy</p>
                <div className="text-2xl font-bold text-destructive">{orderSummary.canceled}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Chi tiết theo ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Ngày đặt</th>
                      <th className="px-4 py-3 text-right font-medium">Đơn hàng</th>
                      <th className="px-4 py-3 text-right font-medium">Đã thanh toán</th>
                      <th className="px-4 py-3 text-right font-medium">Chưa thanh toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDailySeed.map((r) => (
                      <tr key={r.date} className="border-t border-border/60 hover:bg-slate-50/50">
                        <td className="px-4 py-3">{formatDateVN(r.date)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{r.orders}</td>
                        <td className="px-4 py-3 text-right text-blue-700 font-semibold">{r.paid}</td>
                        <td className="px-4 py-3 text-right text-destructive font-semibold">{r.unpaid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {effectiveActive === "revenue" ? (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Biểu đồ doanh thu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-65 rounded-lg border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground">
                (Biểu đồ đường doanh thu sẽ tích hợp sau)
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tổng doanh thu</span>
                <span className="font-bold text-primary">{formatCurrencyVND(1845000)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Offline</span>
                <span className="font-semibold">{formatCurrencyVND(1500000)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Online</span>
                <span className="font-semibold">{formatCurrencyVND(345000)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Số đơn thành công</span>
                <span className="font-semibold">20</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Giá trị đơn TB</span>
                <span className="font-semibold">{formatCurrencyVND(92250)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {effectiveActive === "inventory" ? (
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Báo cáo tồn kho</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border/60 p-4">
              <p className="text-xs font-medium text-muted-foreground">Tổng mặt hàng đang quản lý</p>
              <div className="text-2xl font-bold">1.240</div>
            </div>
            <div className="rounded-lg border border-border/60 p-4">
              <p className="text-xs font-medium text-muted-foreground">Tổng giá trị tồn kho</p>
              <div className="text-2xl font-bold">{formatCurrencyVND(124000000)}</div>
            </div>
            <div className="rounded-lg border border-border/60 p-4">
              <p className="text-xs font-medium text-muted-foreground">Sản phẩm sắp hết</p>
              <div className="text-2xl font-bold text-orange-700">12</div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {effectiveActive === "staff" ? (
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Báo cáo nhân viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-border/60 p-4">
                <p className="text-xs font-medium text-muted-foreground">Doanh số theo NV</p>
                <div className="text-sm text-muted-foreground mt-1">(Sẽ hiển thị bảng xếp hạng)</div>
              </div>
              <div className="rounded-lg border border-border/60 p-4">
                <p className="text-xs font-medium text-muted-foreground">Số đơn xử lý</p>
                <div className="text-sm text-muted-foreground mt-1">(Sẽ hiển thị thống kê)</div>
              </div>
              <div className="rounded-lg border border-border/60 p-4">
                <p className="text-xs font-medium text-muted-foreground">Hiệu suất online</p>
                <div className="text-sm text-muted-foreground mt-1">(Sẽ hiển thị tỷ lệ hoàn thành)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
