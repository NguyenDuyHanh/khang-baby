import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const subnav = [
  { to: "/inventory/products", label: "Hàng hóa" },
  { to: "/inventory/stock", label: "Hàng tồn kho" },
  { to: "/inventory/receipts", label: "Phiếu nhập", allow: ["MANAGER", "WAREHOUSE"] },
];

export default function InventoryLayout() {
  const { user } = useAuth();
  const role = user?.role;
  const items = subnav.filter((i) => (!i.allow?.length ? true : role && i.allow.includes(role)));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Quản lý kho</h2>
          <p className="text-sm text-muted-foreground mt-1">Danh mục, tồn kho và nhập hàng</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "h-9 inline-flex items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent",
                  isActive && "bg-primary text-primary-foreground border-primary"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  );
}
