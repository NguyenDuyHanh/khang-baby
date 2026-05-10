import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import { Sidebar, SidebarContent } from './layout/Sidebar'
import Overview from './pages/Overview'
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

// Placeholder components
const PlaceholderPage = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p>Chức năng này đang được phát triển...</p>
  </div>
);

const pageTitles = {
  '/': 'Tổng quan',
  '/pos': 'Bán tại quầy',
  '/inventory': 'Quản lý kho',
  '/online': 'Đơn hàng Online',
  '/reports': 'Báo cáo',
  '/staff': 'Nhân viên',
};

function App() {
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] || 'Tổng quan';

  return (
    <div className="flex min-h-screen w-full bg-background font-sans antialiased">
      {/* Desktop Sidebar */}
      <Sidebar />

      <main className="flex-1 overflow-y-auto w-full">
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {/* Mobile Nav Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-primary border-none w-[280px]">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="flex items-center text-xs lg:text-sm font-medium text-muted-foreground truncate max-w-[150px] lg:max-w-none">
              <span className="hidden sm:inline">Hệ thống Quản lý KhangBaby / </span>
              <span className="text-foreground ml-1">{currentTitle}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative">
              <span className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">3</span>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2 border-l pl-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                AD
              </div>
              <span className="text-sm font-semibold hidden sm:inline">Admin</span>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/pos" element={<PlaceholderPage title="Bán tại quầy" />} />
            <Route path="/inventory" element={<PlaceholderPage title="Quản lý kho" />} />
            <Route path="/online" element={<PlaceholderPage title="Đơn hàng Online" />} />
            <Route path="/reports" element={<PlaceholderPage title="Báo cáo" />} />
            <Route path="/staff" element={<PlaceholderPage title="Nhân viên" />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
