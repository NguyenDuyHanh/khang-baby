import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="w-24 h-24 bg-pink-50 text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-8">Bạn chưa thêm bất kỳ sản phẩm nào vào giỏ hàng.</p>
        <Link to="/" className="inline-block bg-[var(--color-primary)] text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-colors">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <span className="w-2 h-8 bg-[var(--color-primary)] rounded-full inline-block"></span>
        Giỏ hàng của bạn
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                  <th className="p-4 font-medium">Sản phẩm</th>
                  <th className="p-4 font-medium hidden md:table-cell">Đơn giá</th>
                  <th className="p-4 font-medium">Số lượng</th>
                  <th className="p-4 font-medium text-right">Thành tiền</th>
                  <th className="p-4 font-medium text-center">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        {item.hinh_anh ? (
                          <img src={`http://localhost:4000${item.hinh_anh}`} alt={item.ten_sp} className="w-16 h-16 object-cover rounded shrink-0 border" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-[var(--color-primary)] font-bold shrink-0">
                            {item.ten_sp.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-gray-800 line-clamp-2">{item.ten_sp}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-medium hidden md:table-cell">
                      {formatPrice(item.gia_ban)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center border border-gray-200 rounded-lg w-fit bg-white">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[var(--color-primary)] transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <input 
                          type="text" 
                          className="w-12 text-center font-medium text-sm focus:outline-none border-none bg-transparent" 
                          value={item.quantity} 
                          onChange={(e) => updateQuantity(item.id, e.target.value)}
                          onBlur={(e) => {
                            if (item.quantity === '' || Number(item.quantity) < 1) {
                              updateQuantity(item.id, 1);
                            }
                          }}
                        />
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[var(--color-primary)] transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-[var(--color-price)]">
                      {formatPrice(item.gia_ban * item.quantity)}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Tổng đơn hàng</h3>
            
            <div className="space-y-4 mb-6 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span className="font-medium text-gray-900">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="font-medium text-gray-900">Tính khi thanh toán</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4 mb-8 flex justify-between items-center">
              <span className="font-bold text-gray-900">Tổng cộng:</span>
              <span className="text-2xl font-black text-[var(--color-price)]">{formatPrice(cartTotal)}</span>
            </div>
            
            <Link 
              to="/checkout" 
              className="w-full bg-[var(--color-primary)] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors"
            >
              Thanh toán ngay <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
