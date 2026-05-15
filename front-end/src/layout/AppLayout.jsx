import { Outlet, useLocation } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import { Sidebar, SidebarContent } from "@/layout/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const getSectionTitle = (pathname) => {
  if (pathname === "/") return "Tổng quan";
  if (pathname.startsWith("/pos")) return "Bán tại quầy";
  if (pathname.startsWith("/inventory")) return "Quản lý kho";
  if (pathname.startsWith("/online")) return "Đơn hàng Online";
  if (pathname.startsWith("/reports")) return "Báo cáo";
  if (pathname.startsWith("/staff")) return "Nhân viên";
  return "Tổng quan";
};

export default function AppLayout() {
  const location = useLocation();
  const currentTitle = getSectionTitle(location.pathname);
  const { user, roleLabel } = useAuth();

  const initials = (user?.name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "--";

  return (
    <div className="flex min-h-screen w-full bg-background font-sans antialiased">
      <Sidebar />

      <main className="flex-1 overflow-y-auto w-full">
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-primary border-none w-70">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="flex items-center text-xs lg:text-sm font-medium text-muted-foreground truncate max-w-37.5 lg:max-w-none">
              <span className="hidden sm:inline">Hệ thống Quản lý KhangBaby / </span>
              <span className="text-foreground ml-1">{currentTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative">
              <span className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                3
              </span>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Thông báo">
                <Bell size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2 border-l pl-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-sm font-semibold">{user?.name || ""}</span>
                <span className="text-[11px] text-muted-foreground">{roleLabel(user?.role)}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-400 mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
