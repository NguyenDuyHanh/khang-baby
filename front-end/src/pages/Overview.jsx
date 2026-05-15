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

const stats = [
  {
    title: "Doanh thu ngày",
    value: "1.845.000đ",
    icon: DollarSign,
    color: "bg-blue-500",
    allow: ["MANAGER", "SALES"],
  },
  {
    title: "Đơn Online mới",
    value: "2",
    icon: ShoppingCart,
    color: "bg-purple-500",
    to: "/online",
    allow: ["MANAGER", "ONLINE_SALES"],
  },
  {
    title: "Sản phẩm sắp hết",
    value: "2",
    icon: Package,
    color: "bg-red-500",
    to: "/inventory/stock",
    allow: ["MANAGER", "WAREHOUSE"],
  },
  {
    title: "Hết hạn/Sắp hết hạn",
    value: "2",
    icon: AlertTriangle,
    color: "bg-orange-500",
    to: "/inventory/stock",
    allow: ["MANAGER", "WAREHOUSE"],
  }
];

const recentOrders = [
  {
    id: "HD001",
    customer: "Nguyễn Văn A",
    date: "2024-05-20 10:30",
    amount: "1.040.000đ",
    source: "Offline",
  },
  {
    id: "HD002",
    customer: "Trần Thị B",
    date: "2024-05-20 11:15",
    amount: "285.000đ",
    source: "Online",
  }
];

const Overview = () => {
  const { user, roleLabel } = useAuth();
  const role = user?.role;

  const visibleStats = stats.filter((s) => !s.allow?.length || (role && s.allow.includes(role)));

  const greet = (() => {
    if (!user) return "Xin chào!";
    if (role === "MANAGER") return `Xin chào, ${roleLabel(role)} ${user.name}!`;
    return `Xin chào, ${user.name}!`;
  })();

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Tổng quan hệ thống</h2>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">{greet}</p>
        </div>
        <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20 py-1 px-3">
          Cơ sở Chũ, Bắc Ninh
        </Badge>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {visibleStats.map((stat, idx) => (
          <Card
            key={idx}
            className={cn(
              "border-none shadow-sm hover:shadow-md transition-shadow",
              stat.to && "cursor-pointer"
            )}
          >
            <CardContent className="p-4 lg:p-6 flex items-center space-x-4">
              {stat.to ? (
                <Link to={stat.to} className="flex items-center space-x-4 w-full">
                  <div className={`${stat.color} p-2.5 lg:p-3 rounded-xl text-white shadow-lg shadow-slate-200`}>
                    <stat.icon size={20} className="lg:w-6 lg:h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className="flex items-end justify-between gap-3">
                      <h3 className="text-xl lg:text-2xl font-bold">{stat.value}</h3>
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
                    <p className="text-xs lg:text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-xl lg:text-2xl font-bold">{stat.value}</h3>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className={cn("lg:col-span-4 border-none shadow-sm", role === "WAREHOUSE" ? "lg:col-span-7" : "") }>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base lg:text-lg font-semibold flex items-center">
                <TrendingUp className="mr-2 text-primary" size={18} />
                Đơn hàng gần đây
              </CardTitle>
            </div>
            {role === "MANAGER" || role === "SALES" ? (
              <Link to="/pos" className="text-xs lg:text-sm font-medium text-primary hover:underline">
                Xem tất cả
              </Link>
            ) : role === "ONLINE_SALES" ? (
              <Link to="/online" className="text-xs lg:text-sm font-medium text-primary hover:underline">
                Xem tất cả
              </Link>
            ) : null}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 lg:p-4 rounded-xl border border-border/50 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{order.customer}</p>
                    <p className="text-[10px] lg:text-xs text-muted-foreground">{order.id} • {order.date}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 lg:gap-2">
                    <p className="text-sm font-bold text-primary">{order.amount}</p>
                    <Badge variant="secondary" className={cn(
                      "text-[10px] px-1.5 py-0 border-none",
                      order.source === 'Online' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      {order.source}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {role === "MANAGER" || role === "WAREHOUSE" ? (
          <Card className="lg:col-span-3 border-none shadow-sm bg-primary text-white overflow-hidden relative min-h-50">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Trạng thái kho hàng</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 lg:grid-cols-1 gap-4">
             <div className="p-3 lg:p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <p className="text-[10px] lg:text-sm opacity-80">Tổng số mặt hàng</p>
                <h4 className="text-2xl lg:text-3xl font-bold">1.240</h4>
             </div>
             <Link to="/inventory/stock" className="p-3 lg:p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors">
                <p className="text-[10px] lg:text-sm opacity-80">Cần nhập thêm</p>
                <div className="flex items-end justify-between">
                  <h4 className="text-2xl lg:text-3xl font-bold text-orange-200">12</h4>
                  <ArrowUpRight className="opacity-80" size={18} />
                </div>
             </Link>
             <div className="absolute -bottom-6 -right-6 opacity-10 hidden sm:block">
                <Package size={140} />
             </div>
          </CardContent>
        </Card>
        ) : null}
      </div>
    </div>
  );
};

export default Overview;
