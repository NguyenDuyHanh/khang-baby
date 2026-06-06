export default function Footer() {
  return (
    <footer id="footer" className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-black text-white mb-6 tracking-tight">KHANG BABY</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Shop Khang Baby thành lập năm 2014, với hệ thống cửa hàng cung cấp hơn 10.000 sản phẩm Bỉm, Sữa, Đồ sơ sinh chất lượng từ các thương hiệu hàng đầu.
            </p>
            <div className="text-sm text-gray-400">
              <p>Hotline: 0898892626</p>
              <p>Email: contact@khangbaby.com</p>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">VỀ CHÚNG TÔI</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Giới thiệu Khang Baby</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Hệ thống cửa hàng</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Liên hệ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">CHÍNH SÁCH</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Chính sách thanh toán</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Chính sách giao hàng</a></li>
              <li><a href="#" className="hover:text-[var(--color-primary)] transition-colors">Chính sách đổi trả</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">ĐĂNG KÝ NHẬN TIN</h4>
            <p className="text-sm mb-4">Nhận thông tin khuyến mãi sớm nhất</p>
            <form className="flex">
              <input type="email" placeholder="Email của bạn" className="bg-gray-800 text-white px-4 py-2 w-full outline-none focus:ring-1 focus:ring-[var(--color-primary)]" />
              <button className="bg-[var(--color-primary)] text-white px-4 py-2 font-medium hover:bg-pink-600 transition-colors">Gửi</button>
            </form>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} KHANG BABY. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
