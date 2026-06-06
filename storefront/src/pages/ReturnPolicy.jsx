import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ReturnPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] mb-8 transition-colors">
        <ArrowLeft size={16} /> Quay lại trang chủ
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-black text-gray-900 mb-8 text-center uppercase tracking-tight">
          Chính sách đổi trả hàng
        </h1>
        
        <div className="prose prose-pink max-w-none space-y-6 text-gray-600">
          <p className="text-lg leading-relaxed">
            Nhằm mang lại trải nghiệm mua sắm tốt nhất và đảm bảo quyền lợi cho khách hàng, 
            <strong> Khang Baby</strong> xin gửi đến quý khách hàng chính sách đổi trả sản phẩm chi tiết như sau:
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-[var(--color-primary)] rounded-full inline-block"></span>
            1. Điều kiện đổi trả
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sản phẩm mua tại hệ thống cửa hàng hoặc website chính thức của Khang Baby.</li>
            <li>Thời gian đổi trả: Trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng (căn cứ theo biên lai hoặc thông tin giao hàng).</li>
            <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng, chưa giặt ủi, không bị dơ bẩn hoặc hư hỏng bởi các tác nhân bên ngoài.</li>
            <li>Sản phẩm phải kèm theo hóa đơn mua hàng (hoặc thông tin số điện thoại người mua).</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-[var(--color-primary)] rounded-full inline-block"></span>
            2. Các trường hợp được đổi trả
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Lỗi từ phía cửa hàng/nhà sản xuất:</strong> Sản phẩm bị lỗi kỹ thuật, giao sai mẫu mã, sai màu sắc hoặc thiếu số lượng so với đơn đặt hàng. (Đổi trả hoàn toàn miễn phí).</li>
            <li><strong>Lý do từ phía khách hàng:</strong> Khách hàng muốn đổi size, đổi màu sắc hoặc đổi sang sản phẩm khác. (Khách hàng vui lòng chịu phí vận chuyển 2 chiều).</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-[var(--color-primary)] rounded-full inline-block"></span>
            3. Sản phẩm KHÔNG áp dụng đổi trả
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sản phẩm đồ lót, đồ bơi trẻ em, tất/vớ.</li>
            <li>Sản phẩm là sữa, thực phẩm chức năng, đồ ăn dặm (vì lý do an toàn vệ sinh thực phẩm).</li>
            <li>Hàng khuyến mãi, hàng giảm giá thanh lý (trừ trường hợp lỗi do nhà sản xuất).</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-[var(--color-primary)] rounded-full inline-block"></span>
            4. Quy trình xử lý đổi trả
          </h2>
          <div className="bg-pink-50 p-6 rounded-xl border border-pink-100">
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Bước 1:</strong> Liên hệ với Hotline: <strong>0898892626</strong> hoặc nhắn tin qua Fanpage Khang Baby để thông báo về yêu cầu đổi trả.</li>
              <li><strong>Bước 2:</strong> Gửi hình ảnh/video chứng minh tình trạng sản phẩm (nếu hàng lỗi).</li>
              <li><strong>Bước 3:</strong> Đóng gói sản phẩm cẩn thận và gửi về địa chỉ cửa hàng hoặc chờ shipper đến lấy hàng đổi.</li>
              <li><strong>Bước 4:</strong> Khang Baby kiểm tra tình trạng hàng trả về và tiến hành gửi hàng mới hoặc hoàn tiền cho quý khách trong vòng 3-5 ngày làm việc.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
