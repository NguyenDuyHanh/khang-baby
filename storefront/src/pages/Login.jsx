import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    
    if (res.ok) {
      toast.success("Đăng nhập thành công!");
      navigate("/");
    } else {
      toast.error(res.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Đăng nhập</h1>
        <p className="text-center text-gray-500 mb-8">Vui lòng đăng nhập để mua hàng</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              placeholder="Nhập email của bạn"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-white font-bold py-3 rounded-xl hover:bg-pink-600 transition-colors mt-4"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản? <Link to="/register" className="text-[var(--color-primary)] font-bold hover:underline">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
