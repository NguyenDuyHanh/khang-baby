import { ArrowLeft, MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Real implementation would call an API here
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] mb-8 transition-colors">
        <ArrowLeft size={16} /> Quay lại trang chủ
      </Link>
      
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">
          Liên hệ với Khang Baby
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của quý khách. 
          Vui lòng điền vào biểu mẫu bên dưới hoặc liên hệ trực tiếp qua thông tin được cung cấp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Contact Information */}
        <div className="space-y-8 bg-pink-50/50 p-8 rounded-3xl border border-pink-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin liên hệ</h2>
          
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[var(--color-primary)] shadow-sm shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Địa chỉ cửa hàng</h3>
              <p className="text-gray-600 mt-1 leading-relaxed">
                123 Đường Nguyễn Trãi, Phường Bến Thành,<br/>
                Quận 1, TP. Hồ Chí Minh
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[var(--color-primary)] shadow-sm shrink-0">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Số điện thoại</h3>
              <p className="text-gray-600 mt-1">Hotline: <a href="tel:0898892626" className="font-bold text-[var(--color-primary)] hover:underline">0898892626</a></p>
              <p className="text-gray-500 text-sm mt-1">Hỗ trợ Zalo/Viber</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[var(--color-primary)] shadow-sm shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Email</h3>
              <p className="text-gray-600 mt-1"><a href="mailto:contact@khangbaby.com" className="hover:text-[var(--color-primary)]">contact@khangbaby.com</a></p>
              <p className="text-gray-500 text-sm mt-1">Phản hồi trong vòng 24h</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[var(--color-primary)] shadow-sm shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Giờ hoạt động</h3>
              <p className="text-gray-600 mt-1">Thứ 2 - Chủ Nhật: 08:00 - 22:00</p>
              <p className="text-gray-500 text-sm mt-1">Kể cả ngày lễ</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi tin nhắn cho chúng tôi</h2>
          
          {submitted ? (
            <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={24} />
              </div>
              <h3 className="text-xl font-bold text-green-700 mb-2">Gửi thành công!</h3>
              <p className="text-green-600">Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi lại sớm nhất có thể.</p>
              <button 
                onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", phone: "", message: "" }); }}
                className="mt-6 text-[var(--color-primary)] font-medium hover:underline"
              >
                Gửi tin nhắn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                    placeholder="Số điện thoại liên hệ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                    placeholder="Email của bạn"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung lời nhắn *</label>
                <textarea 
                  required
                  rows="4"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all resize-y"
                  placeholder="Bạn cần chúng tôi hỗ trợ vấn đề gì?"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-[var(--color-primary)] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors"
              >
                Gửi tin nhắn <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
