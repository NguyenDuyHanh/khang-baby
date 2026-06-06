import { ShoppingCart, Search, Menu, Phone, User, LogOut, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 shadow-sm">
      {/* Top Banner */}
      <div className="bg-[var(--color-primary)] text-white text-sm py-1.5 text-center font-medium">
        Đổi trả hàng trong 7 ngày - Giao hàng toàn quốc - Hotline: 0898892626
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-700">
              <Menu size={24} />
            </button>
            <Link to="/" className="flex items-center gap-2">
              {/* Fallback text logo if no image */}
              <span className="text-2xl font-black text-[var(--color-primary)] tracking-tight">KHANG BABY</span>
            </Link>
          </div>

          <div className="flex-grow max-w-2xl hidden md:block mx-8">
            <form onSubmit={handleSearch} className="relative flex items-center w-full h-11 rounded-full border border-gray-300 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:border-transparent transition-all">
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm, thương hiệu..." 
                className="w-full h-full px-5 bg-transparent outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="h-full px-6 bg-[var(--color-primary)] text-white flex items-center justify-center hover:bg-pink-600 transition-colors">
                <Search size={18} />
              </button>
            </form>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[var(--color-primary)]">
                <Phone size={20} />
              </div>
              <div className="text-sm">
                <p className="text-gray-500 font-medium">Hỗ trợ khách hàng</p>
                <a href="tel:0898892626" className="font-bold text-gray-900">0898892626</a>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[var(--color-primary)]">
                <User size={20} />
              </div>
              <div className="text-sm">
                {user ? (
                  <>
                    <p className="text-gray-900 font-bold max-w-[120px] truncate" title={user.ho_ten}>
                      Hi, {user.ho_ten.split(' ').pop()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Link to="/orders" className="text-xs font-medium text-gray-600 hover:text-[var(--color-primary)]">Đơn hàng của tôi</Link>
                      <span className="text-gray-300">|</span>
                      {user.vai_tro !== 'CUSTOMER' && (
                        <>
                          <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[var(--color-primary)] hover:underline flex items-center">
                            Store Management
                          </a>
                          <span className="text-gray-300">|</span>
                        </>
                      )}
                      <button onClick={logout} className="text-xs font-medium text-gray-500 hover:text-red-500 flex items-center gap-1">
                        Đăng xuất
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block text-gray-900 font-medium hover:text-[var(--color-primary)]">Tài khoản</Link>
                    <Link to="/login" className="text-gray-500 hover:text-[var(--color-primary)]">Đăng nhập</Link>
                  </>
                )}
              </div>
            </div>

            <Link to="/cart" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-pink-50 text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                <ShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white">
                  {cartCount}
                </span>
              </div>
              <span className="hidden xl:block font-medium text-gray-700">Giỏ hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Nav (Yellow bar like khangbaby.com) */}
      <div className="bg-[var(--color-topbar)] h-12 hidden md:block">
        <div className="container mx-auto px-4 h-full flex items-center gap-8 text-black font-semibold text-sm">
          <Link to="/" className="flex items-center gap-2 h-full bg-black/5 px-4 cursor-pointer hover:bg-black/10 transition-colors">
            <Menu size={20} />
            <span>TRANG CHỦ</span>
          </Link>
          <Link to="/return-policy" className="hover:text-[var(--color-primary)] transition-colors">CHÍNH SÁCH ĐỔI TRẢ</Link>
          <Link to="/contact" className="hover:text-[var(--color-primary)] transition-colors">LIÊN HỆ</Link>
          <Link to="/orders" className="hover:text-[var(--color-primary)] transition-colors">ĐƠN HÀNG CỦA TÔI</Link>
        </div>
      </div>
    </header>
  );
}
