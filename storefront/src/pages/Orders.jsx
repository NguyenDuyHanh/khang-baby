import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Package, ArrowLeft, CheckCircle, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

export default function Orders() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [complaintReason, setComplaintReason] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/public/orders/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setOrders(data.data);
      } else {
        toast.error("Không thể tải danh sách đơn hàng");
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [user, token, navigate]);

  const handleFeedback = async (orderId, status, reason = "") => {
    try {
      const res = await fetch(`http://localhost:4000/api/public/orders/${orderId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status, reason })
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(data.message || "Cập nhật thành công!");
        setShowComplaintModal(false);
        setComplaintReason("");
        fetchOrders();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/public/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(data.message || "Đã hủy đơn hàng thành công!");
        fetchOrders();
      } else {
        toast.error(data.message || "Không thể hủy đơn hàng");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'CHO_XU_LY': { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
      'DA_XAC_NHAN': { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
      'DANG_DONG_GOI': { label: 'Đang đóng gói', color: 'bg-indigo-100 text-indigo-800' },
      'DANG_GIAO': { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
      'DA_HOAN_THANH': { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
      'DA_HUY': { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
      'KHACH_DA_NHAN': { label: 'Thành công', color: 'bg-teal-100 text-teal-800' },
      'KHIEU_NAI': { label: 'Khiếu nại', color: 'bg-red-100 text-red-800' },
    };
    const s = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.color}`}>{s.label}</span>;
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center">Đang tải...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl relative">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] mb-6 transition-colors">
        <ArrowLeft size={16} /> Quay lại trang chủ
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <span className="w-2 h-8 bg-[var(--color-primary)] rounded-full inline-block"></span>
        Đơn hàng của tôi
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h2>
          <p className="text-gray-500 mb-6">Bạn chưa thực hiện bất kỳ đơn hàng nào trên hệ thống.</p>
          <Link to="/" className="inline-block bg-[var(--color-primary)] text-white font-bold py-3 px-8 rounded-full hover:bg-pink-600 transition-colors">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-50 text-[var(--color-primary)] rounded-xl flex items-center justify-center shrink-0 mt-1">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{order.ma_don}</h3>
                  <p className="text-sm text-gray-500 mt-1">Đặt ngày: {formatDate(order.ngay_dat)}</p>
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="text-gray-500">Người nhận: </span> {order.ten_khach_hang} ({order.so_dien_thoai})
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="text-gray-500">Địa chỉ: </span> {order.dia_chi_giao}
                  </div>
                  {order.ly_do_khieu_nai && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-800 flex gap-2">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold block mb-1">Đã khiếu nại:</span>
                        {order.ly_do_khieu_nai}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 h-full gap-4">
                <div className="text-right">
                  <div className="text-xl font-black text-[var(--color-price)] mb-2">
                    {formatPrice(order.tong_thanh_toan)}
                  </div>
                  {getStatusBadge(order.trang_thai)}
                </div>
                
                {order.trang_thai === 'CHO_XU_LY' && (
                  <div className="flex flex-col gap-2 mt-4 md:mt-0 w-full md:w-auto">
                    <button 
                      onClick={() => handleCancelOrder(order.id)}
                      className="flex items-center justify-center gap-2 bg-white border border-red-300 hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      <X size={16} /> Hủy đơn hàng
                    </button>
                  </div>
                )}
                
                {order.trang_thai === 'DA_HOAN_THANH' && (
                  <div className="flex flex-col gap-2 mt-4 md:mt-0 w-full md:w-auto">
                    <button 
                      onClick={() => handleFeedback(order.id, 'KHACH_DA_NHAN')}
                      className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      <CheckCircle size={16} /> Đã nhận được hàng
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setComplaintReason("");
                        setShowComplaintModal(true);
                      }}
                      className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      <AlertTriangle size={16} /> Chưa nhận được hàng
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                Phản hồi đơn hàng
              </h3>
              <button 
                onClick={() => setShowComplaintModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Vui lòng mô tả rõ lý do bạn chưa nhận được hàng (ví dụ: Shipper không gọi điện, sai địa chỉ, đã thanh toán nhưng chưa nhận...)
              </p>
              <textarea 
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent min-h-[120px] resize-none"
                placeholder="Nhập lý do khiếu nại..."
                value={complaintReason}
                onChange={(e) => setComplaintReason(e.target.value)}
              />
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button 
                onClick={() => setShowComplaintModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => handleFeedback(selectedOrderId, 'KHIEU_NAI', complaintReason)}
                disabled={!complaintReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Gửi khiếu nại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
