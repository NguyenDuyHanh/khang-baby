import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Globe, 
  BarChart3, 
  Users, 
  LogOut 
} from 'lucide-react';
import { cn } from "@/lib/utils";

const menuItems = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard, path: '/' },
  { id: 'pos', label: 'Bán tại quầy', icon: ShoppingCart, path: '/pos' },
  { id: 'inventory', label: 'Quản lý kho', icon: Package, path: '/inventory' },
  { id: 'online', label: 'Đơn hàng Online', icon: Globe, path: '/online' },
  { id: 'reports', label: 'Báo cáo', icon: BarChart3, path: '/reports' },
  { id: 'staff', label: 'Nhân viên', icon: Users, path: '/staff' },
];

const SidebarContent = ({ className }) => (
  <div className={cn("flex flex-col h-full py-6", className)}>
    <div className="flex items-center px-6 mb-10">
      <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg mr-3 border border-white/30">
        KB
      </div>
      <div className="flex flex-col text-white">
        <h1 className="text-xl font-bold tracking-tight leading-none">KhangBaby</h1>
        <span className="text-[10px] opacity-80 font-medium tracking-wider mt-1">HỆ THỐNG QUẢN LÝ</span>
      </div>
    </div>

    <nav className="flex-1">
      <ul className="px-3">
        {menuItems.map((item) => (
          <li key={item.id}>
            <NavLink 
              to={item.path}
              className={({ isActive }) => cn(
                "w-full flex items-center px-4 py-3 text-white/80 rounded-lg mb-1 transition-all duration-200 font-medium text-[15px] hover:bg-black/10 hover:text-white",
                isActive && "bg-black/15 text-white shadow-inner"
              )}
            >
              <item.icon size={20} className="mr-3 opacity-80" />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>

    <div className="px-3 border-t border-white/10 pt-5">
      <button className="w-full flex items-center px-4 py-3 text-white/80 rounded-lg transition-all duration-200 hover:bg-black/10">
        <LogOut size={20} className="mr-3" />
        <span>Đăng xuất</span>
      </button>
    </div>
  </div>
);

const Sidebar = () => {
  return (
    <aside className="hidden lg:flex w-[260px] bg-primary h-screen sticky top-0 flex-col transition-all duration-300">
      <SidebarContent />
    </aside>
  );
};

export { Sidebar, SidebarContent };
export default Sidebar;
