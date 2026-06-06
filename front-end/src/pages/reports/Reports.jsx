import { useEffect, useState, useMemo } from "react";
import { FileDown, Users, TrendingUp, BarChart2, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyVND, formatDateVN } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { exportToExcel } from "@/lib/export";

const reportTabs = [
  { key: "orders", label: "Đơn hàng", icon: BarChart2 },
  { key: "revenue", label: "Doanh thu", icon: TrendingUp },
  { key: "inventory", label: "Tồn kho", icon: Package },
  { key: "staff", label: "Nhân viên", icon: Users },
];

export default function Reports() {
  const { token, user } = useAuth();
  const role = user?.role;
  const isManager = role === "MANAGER";

  const [active, setActive] = useState("orders");
  const [timeRange, setTimeRange] = useState("7d");
  
  // Custom date selection
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Live report states
  const [orderReportData, setOrderReportData] = useState([]);
  const [revenueReportData, setRevenueReportData] = useState(null);
  const [inventoryReportData, setInventoryReportData] = useState(null);
  const [staffReportData, setStaffReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Compute startDate & endDate based on range
  const { startDate, endDate } = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (timeRange === "today") {
      return { startDate: todayStr, endDate: todayStr };
    }
    if (timeRange === "7d") {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { startDate: start.toISOString().slice(0, 10), endDate: todayStr };
    }
    if (timeRange === "30d") {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { startDate: start.toISOString().slice(0, 10), endDate: todayStr };
    }
    // Custom date range
    return {
      startDate: customStart || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      endDate: customEnd || todayStr
    };
  }, [timeRange, customStart, customEnd]);

  const tabs = useMemo(() => {
    if (isManager) return reportTabs;
    // Non-manager can only see Orders & Revenue
    return reportTabs.filter((t) => t.key === "orders" || t.key === "revenue");
  }, [isManager]);

  const effectiveActive = tabs.some((t) => t.key === active)
    ? active
    : (tabs[0]?.key || "orders");

  // Fetch report when filters change
  const fetchReport = async () => {
    if (!token) return;
    try {
      setLoading(true);
      if (effectiveActive === "orders") {
        const res = await apiRequest(`/reports/orders?startDate=${startDate}&endDate=${endDate}`, { token });
        if (res.ok) setOrderReportData(res.data || []);
      } else if (effectiveActive === "revenue") {
        const res = await apiRequest(`/reports/revenue?startDate=${startDate}&endDate=${endDate}`, { token });
        if (res.ok) setRevenueReportData(res.data || null);
      } else if (effectiveActive === "inventory") {
        const res = await apiRequest("/reports/inventory", { token });
        if (res.ok) setInventoryReportData(res.data || null);
      } else if (effectiveActive === "staff") {
        const res = await apiRequest(`/reports/staff?startDate=${startDate}&endDate=${endDate}`, { token });
        if (res.ok) setStaffReportData(res.data || []);
      }
    } catch (err) {
      console.error("Error loading report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [token, effectiveActive, startDate, endDate]);

  const orderSummary = useMemo(() => {
    let total = 0;
    let paid = 0;
    let pending = 0;
    orderReportData.forEach((day) => {
      total += Number(day.tong_don) || 0;
      paid += Number(day.da_thanh_toan) || 0;
      pending += Number(day.chua_thanh_toan) || 0;
    });
    return { total, paid, pending };
  }, [orderReportData]);

  const handleExportExcel = () => {
    if (effectiveActive === "orders") {
      exportToExcel(
        orderReportData,
        `Bao_cao_don_hang_${startDate}_${endDate}.xlsx`,
        {
          ngay: "Ngày phát sinh",
          tong_don: "Tổng số đơn",
          da_thanh_toan: "Đơn hoàn thành",
          chua_thanh_toan: "Đơn chờ xử lý"
        }
      );
    } else if (effectiveActive === "revenue") {
      if (!revenueReportData?.dailyRevenue) return alert("Không có dữ liệu doanh thu!");
      exportToExcel(
        revenueReportData.dailyRevenue,
        `Bao_cao_doanh_thu_${startDate}_${endDate}.xlsx`,
        {
          ngay: "Ngày bán",
          tong_doanh_thu: "Doanh thu POS (đ)"
        }
      );
    } else if (effectiveActive === "inventory") {
      if (!inventoryReportData) return alert("Không có dữ liệu tồn kho!");
      const formatted = [{
        "Tổng số mặt hàng": inventoryReportData.totalItems,
        "Tổng giá trị kho (đ)": inventoryReportData.totalInventoryValue,
        "Sắp hết hàng / Cần nhập": inventoryReportData.runningLow,
        "Đã hết hàng tồn": inventoryReportData.outOfStock,
        "Sắp hết hạn sử dụng": inventoryReportData.expiringInMonth,
        "Đã quá hạn sử dụng": inventoryReportData.alreadyExpired
      }];
      exportToExcel(formatted, `Bao_cao_tong_quan_kho_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else if (effectiveActive === "staff") {
      exportToExcel(
        staffReportData,
        `Bao_cao_doanh_so_nhan_vien_${startDate}_${endDate}.xlsx`,
        {
          id: "Mã nhân viên",
          ho_ten: "Tên nhân viên",
          tong_don: "Tổng hóa đơn lập",
          don_hoan_thanh: "Đơn hoàn thành",
          tong_doanh_so: "Doanh số POS đóng góp (đ)"
        }
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800">Báo cáo tổng hợp</h2>
          <p className="text-sm text-muted-foreground mt-1">Số liệu thực tế kết nối từ cơ sở dữ liệu PostgreSQL</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring font-semibold text-slate-700"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="today">Hôm nay</option>
            <option value="7d">7 ngày gần nhất</option>
            <option value="30d">30 ngày gần nhất</option>
            <option value="custom">Tùy chọn khoảng ngày</option>
          </select>

          {timeRange === "custom" && (
            <div className="flex items-center gap-1">
              <input
                type="date"
                className="h-10 rounded-md border border-input bg-background px-2 text-xs outline-none"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span className="text-xs font-bold text-slate-400">đến</span>
              <input
                type="date"
                className="h-10 rounded-md border border-input bg-background px-2 text-xs outline-none"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          )}

          <Button 
            variant="outline" 
            className="gap-2 border-primary text-primary hover:bg-primary/5" 
            onClick={handleExportExcel}
          >
            <FileDown size={16} />
            Xuất file Excel
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <Button
              key={t.key}
              type="button"
              variant={effectiveActive === t.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActive(t.key)}
              className={`gap-1.5 font-bold ${effectiveActive === t.key ? "bg-primary hover:bg-primary/95 text-white shadow-sm" : ""}`}
            >
              <Icon size={14} />
              {t.label}
            </Button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Đang tạo biểu mẫu báo cáo dữ liệu...</div>
      ) : (
        <div className="space-y-6">
          {/* ORDERS REPORT */}
          {effectiveActive === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Thống kê đơn hàng</h3>
                  <p className="text-xs text-slate-500">Thời gian: {formatDateVN(startDate)} đến {formatDateVN(endDate)}</p>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold">
                  {timeRange === "today" ? "Hôm nay" : timeRange === "30d" ? "30 ngày" : timeRange === "custom" ? "Tùy chọn" : "7 ngày"}
                </Badge>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <Card className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-slate-500">Tổng số đơn hàng</p>
                    <div className="text-2xl font-extrabold text-slate-800 mt-1">{orderSummary.total}</div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-slate-500">Đơn hàng hoàn thành</p>
                    <div className="text-2xl font-extrabold text-emerald-600 mt-1">{orderSummary.paid}</div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-slate-500">Đơn chưa thanh toán / Chờ xử lý</p>
                    <div className="text-2xl font-extrabold text-amber-600 mt-1">{orderSummary.pending}</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-slate-800">Chi tiết phát sinh đơn theo ngày</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-lg border border-border/60">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Ngày ghi nhận</th>
                          <th className="px-4 py-3 text-right font-semibold">Đơn hàng phát sinh</th>
                          <th className="px-4 py-3 text-right font-semibold">Đã hoàn thành</th>
                          <th className="px-4 py-3 text-right font-semibold">Chưa hoàn thành</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orderReportData.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-700">{formatDateVN(r.ngay)}</td>
                            <td className="px-4 py-3 text-right font-extrabold text-slate-800">{r.tong_don}</td>
                            <td className="px-4 py-3 text-right text-emerald-600 font-extrabold">{r.da_thanh_toan}</td>
                            <td className="px-4 py-3 text-right text-amber-600 font-bold">{r.chua_thanh_toan}</td>
                          </tr>
                        ))}
                        {orderReportData.length === 0 && (
                          <tr>
                            <td className="px-4 py-8 text-center text-slate-400" colSpan={4}>Không tìm thấy số liệu đơn hàng nào.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* REVENUE REPORT */}
          {effectiveActive === "revenue" && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              <Card className="lg:col-span-2 border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-slate-800">Biểu đồ tổng doanh thu tích lũy ngày</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="overflow-y-auto max-h-60 rounded-lg border border-border/60">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">Ngày bán</th>
                            <th className="px-4 py-3 text-right font-semibold">Doanh thu POS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {revenueReportData?.dailyRevenue?.map((d, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-semibold text-slate-700">{formatDateVN(d.ngay)}</td>
                              <td className="px-4 py-3 text-right font-extrabold text-primary">{formatCurrencyVND(d.tong_doanh_thu)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-slate-800">Tóm tắt số liệu doanh thu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm border-b pb-2">
                    <span className="text-slate-500 font-semibold">Tổng doanh thu kết hợp</span>
                    <span className="font-extrabold text-primary text-base">{formatCurrencyVND(revenueReportData?.totalRevenue || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-b pb-2">
                    <span className="text-slate-500 font-semibold">Bán lẻ tại quầy (POS)</span>
                    <span className="font-bold text-emerald-600">{formatCurrencyVND(revenueReportData?.offlineRevenue || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-b pb-2">
                    <span className="text-slate-500 font-semibold">Chốt đơn online</span>
                    <span className="font-bold text-purple-600">{formatCurrencyVND(revenueReportData?.onlineRevenue || 0)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* INVENTORY REPORT */}
          {effectiveActive === "inventory" && inventoryReportData && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-800">Thống kê kho hàng & Tồn kho thực tế</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/60 p-4 hover:shadow-sm transition-all">
                    <p className="text-xs font-semibold text-slate-500">Mặt hàng đang quản lý</p>
                    <div className="text-2xl font-extrabold text-slate-800 mt-1">{inventoryReportData.totalItems}</div>
                  </div>
                  <div className="rounded-xl border border-border/60 p-4 hover:shadow-sm transition-all">
                    <p className="text-xs font-semibold text-slate-500">Giá trị ước tính kho hàng</p>
                    <div className="text-2xl font-extrabold text-primary mt-1">{formatCurrencyVND(inventoryReportData.totalInventoryValue)}</div>
                  </div>
                  <div className="rounded-xl border border-border/60 p-4 hover:shadow-sm transition-all">
                    <p className="text-xs font-semibold text-slate-500">Hàng sắp hết / Cần nhập thêm</p>
                    <div className="text-2xl font-extrabold text-orange-600 mt-1">{inventoryReportData.runningLow}</div>
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <div className="rounded-xl border border-red-100 bg-red-50/20 p-4">
                    <p className="text-xs font-semibold text-red-600">Đã hết hàng tồn</p>
                    <div className="text-xl font-extrabold text-red-700 mt-1">{inventoryReportData.outOfStock}</div>
                  </div>
                  <div className="rounded-xl border border-orange-100 bg-orange-50/20 p-4">
                    <p className="text-xs font-semibold text-orange-600">Sắp hết hạn sử dụng (30 ngày)</p>
                    <div className="text-xl font-extrabold text-orange-700 mt-1">{inventoryReportData.expiringInMonth}</div>
                  </div>
                  <div className="rounded-xl border border-red-200 bg-red-100/10 p-4">
                    <p className="text-xs font-semibold text-red-700">Đã quá hạn sử dụng</p>
                    <div className="text-xl font-extrabold text-red-800 mt-1">{inventoryReportData.alreadyExpired}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STAFF PERFORMANCE REPORT */}
          {effectiveActive === "staff" && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-800">Thống kê doanh số theo nhân viên</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Mã NV</th>
                        <th className="px-4 py-3 text-left font-semibold">Tên nhân viên</th>
                        <th className="px-4 py-3 text-right font-semibold">Số hóa đơn lập</th>
                        <th className="px-4 py-3 text-right font-semibold">Số đơn hoàn thành</th>
                        <th className="px-4 py-3 text-right font-semibold">Doanh số POS đóng góp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staffReportData.map((s, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-600">NV{s.id}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">{s.ho_ten}</td>
                          <td className="px-4 py-3 text-right font-semibold">{s.tong_don}</td>
                          <td className="px-4 py-3 text-right text-emerald-600 font-semibold">{s.don_hoan_thanh}</td>
                          <td className="px-4 py-3 text-right font-extrabold text-primary">{formatCurrencyVND(s.tong_doanh_so || 0)}</td>
                        </tr>
                      ))}
                      {staffReportData.length === 0 && (
                        <tr>
                          <td className="px-4 py-8 text-center text-slate-400" colSpan={5}>Không có dữ liệu đóng góp của nhân viên nào.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
