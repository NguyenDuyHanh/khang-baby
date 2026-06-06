import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder, validateVoucher } from "../lib/api";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Ticket } from "lucide-react";

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [formData, setFormData] = useState({
    ten_khach_hang: (user && user.ho_ten) ? user.ho_ten : "",
    so_dien_thoai: (user && user.so_dien_thoai) ? user.so_dien_thoai : "",
    dia_chi_giao: "",
    ghi_chu_don: "",
    phuong_thuc_thanh_toan: "COD",
  });

  const [savedVouchers, setSavedVouchers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('savedVouchers')) || [];
    } catch {
      return [];
    }
  });
  const [selectedVoucherCode, setSelectedVoucherCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thanh toán");
      navigate("/login");
    }
  }, [user, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Đặt hàng thành công!</h2>
        <p className="text-gray-600 mb-2">Mã đơn hàng của bạn là: <strong className="text-gray-900">{orderId}</strong></p>
        <p className="text-gray-600 mb-8">Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận đơn hàng.</p>
        <Link to="/" className="inline-block bg-[var(--color-primary)] text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-colors">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  if (cart.length === 0 || !user) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyVoucher = async (code) => {
    if (!code) {
      setSelectedVoucherCode("");
      setDiscountAmount(0);
      return;
    }
    
    setValidating(true);
    try {
      const res = await validateVoucher(code, cartTotal, token);
      if (res.valid) {
        setSelectedVoucherCode(code);
        setDiscountAmount(res.discount);
        toast.success(`Áp dụng thành công mã giảm ${formatPrice(res.discount)}`);
      } else {
        toast.error(res.message || "Mã không hợp lệ");
        setSelectedVoucherCode("");
        setDiscountAmount(0);
      }
    } catch (err) {
      toast.error(err.message || "Lỗi khi kiểm tra mã giảm giá");
      setSelectedVoucherCode("");
      setDiscountAmount(0);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const items = cart.map(item => ({
        id_hang_hoa: item.id,
        gia_ban: item.gia_ban,
        so_luong: item.quantity
      }));

      const payload = {
        ...formData,
        phi_giao_hang: 30000,
        kenh_dat_hang: "WEBSITE",
        ma_voucher: selectedVoucherCode || null,
        items
      };

      const res = await createOrder(payload, token);
      if (res.ok) {
        setOrderId(res.ma_don);
        clearCart();
        setSuccess(true);
        window.scrollTo(0, 0);
      } else {
        toast.error(res.message || "Có lỗi xảy ra khi đặt hàng");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const phi_giao_hang = 30000;
  const tong_thanh_toan = Math.max(0, cartTotal - discountAmount) + phi_giao_hang;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link to="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] mb-6 transition-colors">
        <ArrowLeft size={16} /> Quay lại giỏ hàng
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <span className="w-2 h-8 bg-[var(--color-primary)] rounded-full inline-block"></span>
        Thanh toán
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin giao hàng</h2>
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                <input 
                  required
                  type="text" 
                  name="ten_khach_hang"
                  value={formData.ten_khach_hang}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                  placeholder="Nhập họ và tên người nhận"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                <input 
                  required
                  type="tel" 
                  name="so_dien_thoai"
                  value={formData.so_dien_thoai}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ nhận hàng *</label>
                <textarea 
                  required
                  name="dia_chi_giao"
                  value={formData.dia_chi_giao}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                  placeholder="Nhập địa chỉ nhận hàng chi tiết"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú đơn hàng (Tùy chọn)</label>
                <textarea 
                  name="ghi_chu_don"
                  value={formData.ghi_chu_don}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                  placeholder="Ghi chú thêm về đơn hàng"
                ></textarea>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:w-2/5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 sticky top-28">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Chi tiết đơn hàng ({cart.length} sản phẩm)</h3>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  {item.hinh_anh ? (
                    <div className="w-12 h-12 rounded-lg flex flex-shrink-0 relative">
                      <img src={`http://localhost:4000${item.hinh_anh}`} alt={item.ten_sp} className="w-full h-full object-cover rounded-lg border" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold z-10">
                        {item.quantity}
                      </span>
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex flex-shrink-0 items-center justify-center text-[var(--color-primary)] font-bold text-xs relative">
                      {item.ten_sp.substring(0, 2).toUpperCase()}
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold z-10">
                        {item.quantity}
                      </span>
                    </div>
                  )}
                  <div className="flex-grow">
                    <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{item.ten_sp}</h4>
                    <p className="text-gray-500 text-xs mt-1">{formatPrice(item.gia_ban)}</p>
                  </div>
                  <div className="text-right font-medium text-sm text-gray-900">
                    {formatPrice(item.gia_ban * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3 mb-6 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span className="font-medium text-gray-900">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="font-medium text-gray-900">{formatPrice(phi_giao_hang)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Giảm giá (Voucher):</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
            </div>

            {/* Voucher Section */}
            {savedVouchers.length > 0 && (
              <div className="border-t border-gray-100 pt-6 mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Ticket size={16} className="text-[var(--color-primary)]" /> Mã giảm giá của bạn
                </h4>
                <div className="space-y-2">
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-sm"
                    value={selectedVoucherCode}
                    onChange={(e) => handleApplyVoucher(e.target.value)}
                    disabled={validating}
                  >
                    <option value="">-- Chọn mã giảm giá --</option>
                    {savedVouchers.map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                  {validating && <p className="text-xs text-gray-500">Đang kiểm tra mã...</p>}
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-100 pt-4 mb-8 flex items-end justify-between">
              <span className="font-bold text-gray-900 text-lg">Tổng thanh toán:</span>
              <div className="text-right">
                 <span className="text-sm text-gray-500 block mb-1">Đã bao gồm VAT</span>
                 <span className="text-2xl font-black text-[var(--color-price)]">{formatPrice(tong_thanh_toan)}</span>
              </div>
            </div>
            
            <button 
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full bg-[var(--color-primary)] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors disabled:opacity-70"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Hoàn tất đặt hàng"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
