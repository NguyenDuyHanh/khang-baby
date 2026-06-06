import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER"
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
       return toast.error("Mật khẩu phải có ít nhất 6 ký tự");
    }
    
    setLoading(true);
    const res = await register(formData.name, formData.email, formData.phone, formData.password, formData.role);
    setLoading(false);
    
    if (res.ok) {
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } else {
      toast.error(res.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Đăng ký tài khoản</h1>
        <p className="text-center text-gray-500 mb-8">Tạo tài khoản để trải nghiệm mua sắm tốt nhất</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
            <input 
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input 
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email" 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
            <input 
              required
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              type="tel" 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              placeholder="0912345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu *</label>
            <input 
              required
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại tài khoản *</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            >
              <option value="CUSTOMER">Khách hàng</option>
              <option value="MANAGER">Admin (Quản trị hệ thống)</option>
            </select>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-xl hover:bg-pink-600 transition-colors mt-4"
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản? <Link to="/login" className="text-[var(--color-primary)] font-bold hover:underline">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
