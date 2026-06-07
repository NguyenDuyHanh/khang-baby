import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Users,
  LogOut,
  FileText,
  Contact,
  ChevronDown,
  ChevronRight,
  Tag
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  {
    id: 'overview',
    label: 'Tổng quan',
    icon: LayoutDashboard,
    path: '/',
    allow: ['MANAGER', 'WAREHOUSE', 'SALES', 'ONLINE_SALES', 'MARKETING']
  },
  {
    id: 'products',
    label: 'Sản phẩm',
    icon: Package,
    allow: ['MANAGER', 'WAREHOUSE', 'SALES', 'ONLINE_SALES'],
    children: [
      { id: 'products-list', label: 'Danh sách sản phẩm', path: '/inventory/products' },
      { id: 'products-cat', label: 'Loại', path: '/inventory/categories' },
      { id: 'products-stock', label: 'Tồn kho', path: '/inventory/stock' }
    ]
  },
  {
    id: 'receipts-group',
    label: 'Danh sách phiếu',
    icon: FileText,
    allow: ['MANAGER', 'WAREHOUSE'],
    children: [
      { id: 'receipts-import', label: 'Phiếu nhập hàng', path: '/inventory/receipts' },
      { id: 'receipts-return', label: 'Phiếu trả hàng', path: '/inventory/returns' },
      { id: 'receipts-missing', label: 'Phản hồi hàng thiếu', path: '/inventory/feedback' }
    ]
  },
  {
    id: 'orders-group',
    label: 'Đơn hàng',
    icon: ShoppingCart,
    allow: ['MANAGER', 'SALES', 'ONLINE_SALES'],
    children: [
      { id: 'orders-online', label: 'Đơn hàng', path: '/online', allow: ['MANAGER', 'ONLINE_SALES'] },
      { id: 'orders-pos', label: 'Hoá đơn', path: '/pos', allow: ['MANAGER', 'SALES'] }
    ]
  },
  {
    id: 'reports',
    label: 'Báo cáo',
    icon: BarChart3,
    path: '/reports',
    allow: ['MANAGER', 'MARKETING']
  },
  {
    id: 'vouchers',
    label: 'Phiếu giảm giá',
    icon: Tag,
    path: '/marketing/vouchers',
    allow: ['MANAGER', 'MARKETING']
  },
  {
    id: 'customers',
    label: 'Khách hàng',
    icon: Contact,
    path: '/customers',
    allow: ['MANAGER', 'SALES', 'ONLINE_SALES']
  },
  {
    id: 'staff',
    label: 'Nhân viên',
    icon: Users,
    path: '/staff',
    allow: ['MANAGER']
  },
];

const canSee = (role, item) => {
  if (!role) return false;
  if (!item.allow?.length) return true;
  return item.allow.includes(role);
};

const SidebarContent = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, roleLabel } = useAuth();

  // Track open state for dropdown menus
  const [openMenus, setOpenMenus] = useState({});

  // Auto-expand menu group when a child path is active
  useEffect(() => {
    const currentPath = location.pathname;
    const initialOpenState = {};

    menuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => currentPath.startsWith(child.path));
        if (hasActiveChild) {
          initialOpenState[item.id] = true;
        }
      }
    });

    setOpenMenus((prev) => ({ ...prev, ...initialOpenState }));
  }, [location.pathname]);

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  // Filter items based on user role, and also filter their child items
  const filteredItems = menuItems
    .filter((i) => canSee(user?.role, i))
    .map((i) => {
      if (i.children) {
        return {
          ...i,
          children: i.children.filter((child) => !child.allow?.length || (user?.role && child.allow.includes(user.role)))
        };
      }
      return i;
    })
    .filter((i) => !i.children || i.children.length > 0);

  return (
    <div className={cn("flex flex-col h-full py-6 select-none", className)}>
      <div className="flex items-center px-6 mb-8">
        <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg mr-3 border border-white/30 text-white">
          KB
        </div>
        <div className="flex flex-col text-white">
          <h1 className="text-xl font-bold tracking-tight leading-none">KhangBaby</h1>
          <span className="text-[10px] opacity-80 font-medium tracking-wider mt-1">HỆ THỐNG QUẢN LÝ</span>
          {user ? (
            <span className="text-[10px] opacity-80 mt-1">
              {user.name} · {roleLabel(user.role)}
            </span>
          ) : null}
        </div>
      </div>

      <nav className="flex-grow overflow-y-auto px-3">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isDropdown = !!item.children;
            const isOpen = !!openMenus[item.id];

            if (isDropdown) {
              return (
                <li key={item.id} className="w-full">
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 text-white/80 rounded-lg transition-all duration-200 font-medium text-[15px] hover:bg-black/10 hover:text-white outline-none",
                      isOpen && "text-white bg-black/5"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon size={20} className="mr-3 opacity-80" />
                      <span>{item.label}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown size={16} className="opacity-80 transition-transform duration-200" />
                    ) : (
                      <ChevronRight size={16} className="opacity-80 transition-transform duration-200" />
                    )}
                  </button>

                  {/* Dropdown Items list */}
                  {isOpen && (
                    <ul className="pl-6 mt-1 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      {item.children.map((child) => {
                        const isChildActive = location.pathname.startsWith(child.path) &&
                          (child.id !== 'products-list' || location.pathname === '/inventory/products');

                        return (
                          <li key={child.id}>
                            <NavLink
                              to={child.path}
                              className={({ isActive }) => cn(
                                "w-full flex items-center px-4 py-2.5 text-white/70 rounded-lg transition-all duration-200 text-[14px] hover:bg-black/5 hover:text-white",
                                (isActive || isChildActive) && "bg-black/15 text-white font-semibold shadow-inner"
                              )}
                            >
                              <span>{child.label}</span>
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => cn(
                    "w-full flex items-center px-4 py-3 text-white/80 rounded-lg transition-all duration-200 font-medium text-[15px] hover:bg-black/10 hover:text-white",
                    isActive && "bg-black/15 text-white shadow-inner"
                  )}
                >
                  <item.icon size={20} className="mr-3 opacity-80" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 border-t border-white/10 pt-4 mt-auto">
        <button
          className="w-full flex items-center px-4 py-3 text-white/80 rounded-lg transition-all duration-200 hover:bg-black/10"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
        >
          <LogOut size={20} className="mr-3" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

const Sidebar = () => {
  return (
    <aside className="hidden lg:flex w-65 bg-primary h-screen sticky top-0 flex-col transition-all duration-300">
      <SidebarContent />
    </aside>
  );
};

export { Sidebar, SidebarContent };
export default Sidebar;
