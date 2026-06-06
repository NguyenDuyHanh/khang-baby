import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from '@/lib/api';
import { formatCurrencyVND, formatDateVN } from '@/lib/format';

export default function Overview() {
  const { token, user, roleLabel } = useAuth();
  const role = user?.role;

  // Live dashboard states
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [expiringCount, setExpiringCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      
      // 1. Fetch Today Revenue
      const revRes = await apiRequest("/invoices/revenue/today", { token });
      if (revRes.ok) setTodayRevenue(revRes.data || 0);

      // 2. Fetch Pending Online Orders Count
      const pendRes = await apiRequest("/orders/stats/pending", { token });
      if (pendRes.ok) setPendingOrders(pendRes.data || 0);

      // 3. Fetch Low Stock Count
      const lowStockRes = await apiRequest("/products/alerts/near-minimum", { token });
      if (lowStockRes.ok) setLowStockCount(lowStockRes.data?.length || 0);

      // 4. Fetch Expiring Products Count
      const expRes = await apiRequest("/products/alerts/expiring?days=30", { token });
      if (expRes.ok) setExpiringCount(expRes.data?.length || 0);

      // 5. Fetch Total Products Count
      const prodRes = await apiRequest("/products?limit=1", { token });
      if (prodRes.ok && prodRes.pagination) {
        setTotalProducts(prodRes.pagination.totalItems || 0);
      }

      // 6. Fetch Recent Orders (Offline POS and Online) and combine them
      let offlineRecent = [];
      let onlineRecent = [];

      const offRes = await apiRequest("/invoices/recent?limit=5", { token });
      if (offRes.ok) offlineRecent = offRes.data || [];

      const onRes = await apiRequest("/orders/recent?limit=5", { token });
      if (onRes.ok) onlineRecent = onRes.data || [];

      // Map offline invoices
      const mappedOffline = offlineRecent.map(inv => ({
        id: inv.ma_hdb,
        customer: inv.ten_khach_hang || "Khách lẻ",
        date: inv.ngay_ban,
        amount: inv.tong_can_thanh_toan,
        source: "Tại quầy",
        isOnline: false,
      }));

      // Map online orders
      const mappedOnline = onlineRecent.map(ord => ({
        id: ord.ma_don,
        customer: ord.ten_khach_hang,
        date: ord.ngay_dat,
        amount: ord.tong_thanh_toan,
        source: ord.kenh_dat_hang || "Online",
        isOnline: true,
      }));

      // Combine and sort by date descending
      const combined = [...mappedOffline, ...mappedOnline]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      setRecentActivities(combined);
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const greet = (() => {
    if (!user) return "Xin chào!";
    if (role === "MANAGER") return `Xin chào, ${roleLabel(role)} ${user.ho_ten}!`;
    return `Xin chào, ${user.ho_ten}!`;
  })();

  const stats = [
    {
      title: "Doanh thu POS hôm nay",
      value: formatCurrencyVND(todayRevenue),
      icon: DollarSign,
      color: "bg-emerald-500",
      allow: ["MANAGER", "SALES"],
    },
    {
      title: "Đơn Online chờ xử lý",
      value: pendingOrders,
      icon: ShoppingCart,
      color: "bg-purple-500",
      to: "/online",
      allow: ["MANAGER", "ONLINE_SALES"],
    },
    {
      title: "Sản phẩm sắp hết kho",
      value: lowStockCount,
      icon: Package,
      color: "bg-red-500",
      to: "/inventory/stock",
      allow: ["MANAGER", "WAREHOUSE"],
    },
    {
      title: "Hàng sắp hết hạn (30 ngày)",
      value: expiringCount,
      icon: AlertTriangle,
      color: "bg-orange-500",
      to: "/inventory/stock",
      allow: ["MANAGER", "WAREHOUSE"],
    }
  ];

  const visibleStats = stats.filter((s) => !s.allow?.length || (role && s.allow.includes(role)));

  if (loading) {
    return <div className="text-center py-16 text-slate-500">Đang tải số liệu tổng quan hệ thống...</div>;
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800">Tổng quan hệ thống</h2>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">{greet}</p>
        </div>
        <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20 py-1.5 px-3.5 font-bold">
          Cơ sở Baby Khang
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {visibleStats.map((stat, idx) => (
          <Card
            key={idx}
            className={cn(
              "border-none shadow-sm hover:shadow-md transition-all duration-200",
              stat.to && "cursor-pointer hover:-translate-y-0.5"
            )}
          >
            <CardContent className="p-4 lg:p-6 flex items-center space-x-4">
              {stat.to ? (
                <Link to={stat.to} className="flex items-center space-x-4 w-full">
                  <div className={`${stat.color} p-2.5 lg:p-3 rounded-xl text-white shadow-lg shadow-slate-200`}>
                    <stat.icon size={20} className="lg:w-6 lg:h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm font-semibold text-slate-500">{stat.title}</p>
                    <div className="flex items-end justify-between gap-3 mt-1">
                      <h3 className="text-xl lg:text-2xl font-extrabold text-slate-800">{stat.value}</h3>
                      <ArrowUpRight className="text-muted-foreground" size={18} />
                    </div>
                  </div>
                </Link>
              ) : (
                <>
                  <div className={`${stat.color} p-2.5 lg:p-3 rounded-xl text-white shadow-lg shadow-slate-200`}>
                    <stat.icon size={20} className="lg:w-6 lg:h-6" />
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm font-semibold text-slate-500">{stat.title}</p>
                    <h3 className="text-xl lg:text-2xl font-extrabold text-slate-800 mt-1">{stat.value}</h3>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Recent Transactions list */}
        <Card className={cn("lg:col-span-4 border-none shadow-sm", role === "WAREHOUSE" ? "lg:col-span-7" : "") }>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base lg:text-lg font-bold flex items-center text-slate-800">
                <TrendingUp className="mr-2 text-primary" size={18} />
                Đơn hàng mới giao dịch
              </CardTitle>
            </div>
            {role === "MANAGER" || role === "SALES" ? (
              <Link to="/pos" className="text-xs lg:text-sm font-bold text-primary hover:underline">
                Xem tất cả bán tại quầy
              </Link>
            ) : role === "ONLINE_SALES" ? (
              <Link to="/online" className="text-xs lg:text-sm font-bold text-primary hover:underline">
                Xem tất cả đơn online
              </Link>
            ) : null}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 lg:p-4 rounded-xl border border-border/50 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">{order.customer}</p>
                    <p className="text-[10px] lg:text-xs text-slate-500 font-semibold">{order.id} • {formatDateVN(order.date)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <p className="text-sm font-extrabold text-primary">{formatCurrencyVND(order.amount)}</p>
                    <Badge variant="secondary" className={cn(
                      "text-[10px] px-2 py-0.5 border-none font-bold",
                      order.isOnline ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      {order.source}
                    </Badge>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="text-center py-8 text-slate-400">Không có giao dịch nào gần đây.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Warehouse Quick status */}
        {role === "MANAGER" || role === "WAREHOUSE" ? (
          <Card className="lg:col-span-3 border-none shadow-sm bg-primary text-white overflow-hidden relative min-h-50">
            <CardHeader>
              <CardTitle className="text-base lg:text-lg font-bold">Trạng thái kho hàng (Động)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-1 gap-4 z-10 relative">
              <div className="p-3 lg:p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <p className="text-[10px] lg:text-sm opacity-90 font-medium">Tổng số loại hàng hóa</p>
                <h4 className="text-2xl lg:text-3xl font-extrabold mt-1">{totalProducts}</h4>
              </div>
              <Link to="/inventory/stock" className="p-3 lg:p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-200">
                <p className="text-[10px] lg:text-sm opacity-90 font-medium">Hàng sắp hết trong kho</p>
                <div className="flex items-end justify-between mt-1">
                  <h4 className="text-2xl lg:text-3xl font-extrabold text-pink-100">{lowStockCount}</h4>
                  <ArrowUpRight className="opacity-95" size={20} />
                </div>
              </Link>
              <div className="absolute -bottom-6 -right-6 opacity-10 pointer-events-none z-0">
                <Package size={140} />
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
