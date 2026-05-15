# MODULE 3 — BÁN TẠI QUẦY (POS)

---

## 3.1 Mô tả chức năng

Module xử lý toàn bộ quy trình bán hàng trực tiếp tại cửa hàng: tạo hóa đơn, chọn sản phẩm, áp dụng khuyến mãi/voucher, xác nhận thanh toán và tự động trừ tồn kho. Đây là module được nhân viên bán hàng sử dụng thường xuyên nhất trong ca làm việc.

**Đường dẫn:** Sidebar → **Bán tại quầy**

**Người dùng chính:** Nhân viên bán hàng (SALES), Quản lý cửa hàng (MANAGER)

---

## 3.2 Các màn hình giao diện

### 3.2.1 Màn hình Danh sách Hóa đơn

**Thành phần giao diện:**

| Thành phần | Mô tả |
|---|---|
| Tab lọc trạng thái | Tất cả · Đã thanh toán · Chưa thanh toán · Chờ xác nhận · Đã hủy |
| Thanh tìm kiếm | Tìm theo mã hóa đơn |
| Bộ lọc | Ngày bán / Mã KH / Mã NV |
| Nút "Tạo hóa đơn" | Mở form tạo hóa đơn mới (màu xanh lá, góc dưới phải) |
| Xuất file Excel | Xuất danh sách hóa đơn |
| Bảng danh sách | Toàn bộ hóa đơn bán, phân trang |

**Các cột trong bảng:**

| Cột | Mô tả | Ví dụ |
|---|---|---|
| Checkbox | Chọn nhiều để thao tác hàng loạt | |
| Mã HĐB | Mã hóa đơn bán | HD001 |
| Ngày bán | Ngày giờ tạo hóa đơn | 16/05/2024 |
| Khách hàng | Tên khách (lẻ = "Khách lẻ") | Nguyễn Văn A |
| Tổng SP | Tổng số lượng sản phẩm | 3 |
| Tổng tiền | Tổng giá trị hóa đơn | 3.550.000đ |
| Trạng thái | Đã thanh toán / Chưa / Chờ / Đã hủy | Badge màu |
| Hành động | ✏️ Sửa · 🗑️ Hủy | Icons |

**Badge trạng thái màu:**
- `Đã thanh toán` → Xanh lá
- `Chưa thanh toán` → Đỏ / Cam
- `Chờ xác nhận` → Xám
- `Đã hủy` → Đỏ đậm, gạch ngang

---

### 3.2.2 Form Tạo / Chi tiết Hóa đơn bán

**Thông tin header hóa đơn:**

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| Mã HĐB | Text (tự sinh) | ✅ | Hệ thống tự tạo, dạng HDB + số thứ tự |
| Ngày bán | DateTime | ✅ | Mặc định ngày giờ hiện tại |
| Nhân viên bán | Text (tự điền) | ✅ | Lấy từ tài khoản đang đăng nhập |
| Khách hàng | Dropdown / Text | ❌ | Chọn từ danh sách hoặc nhập tên KH lẻ |
| Mã voucher | Text | ❌ | Áp dụng mã giảm giá |

**Bảng chi tiết sản phẩm trong hóa đơn:**

| Cột | Mô tả |
|---|---|
| Mã SP | Mã sản phẩm (tìm kiếm hoặc quét mã vạch) |
| Tên SP | Tên sản phẩm (tự điền khi chọn mã) |
| Giá bán | Giá bán đơn vị (tự điền theo danh mục) |
| Số lượng | Nhập tay hoặc tăng/giảm bằng nút +/– |
| Thành tiền | Giá bán × Số lượng (tự tính) |
| Hành động | ✏️ Sửa số lượng · 🗑️ Xóa dòng |

**Footer hóa đơn:**

| Trường | Mô tả |
|---|---|
| Tổng tiền hàng | SUM(thành tiền các dòng) |
| Giảm giá (voucher) | Giá trị giảm sau khi áp mã |
| Tổng cần thanh toán | Tổng tiền – Giảm giá |
| Phương thức thanh toán | Tiền mặt / Chuyển khoản / Quẹt thẻ |

**Hành động:**
- **Lưu nháp** → Lưu hóa đơn, trạng thái "Chưa thanh toán"
- **Xác nhận thanh toán** → Cập nhật trạng thái "Đã thanh toán", trừ tồn kho
- **Thoát** → Hủy bỏ, không lưu

---

### 3.2.3 Màn hình Chi tiết Hóa đơn (xem lại)

Giống form tạo nhưng ở chế độ **chỉ đọc**. Hiển thị đầy đủ:
- Thông tin hóa đơn (mã, ngày, NV, KH)
- Bảng sản phẩm đã mua
- Tổng tiền, giảm giá, thành tiền
- Nút **In hóa đơn** → Xuất PDF / in nhiệt

---

## 3.3 Quy trình nghiệp vụ

### Quy trình Bán hàng tại quầy

```
NV mở màn hình "Bán tại quầy"
            ↓
    Nhấn "Tạo hóa đơn"
            ↓
  Tìm kiếm sản phẩm (mã hoặc quét barcode)
            ↓
  Thêm sản phẩm vào hóa đơn
  (hệ thống kiểm tra tồn kho)
            ↓
      [Còn hàng?]
      /          \
    Có            Không
     ↓              ↓
  Thêm vào HĐ    Báo hết hàng
  (nhập số lượng)  (không cho thêm)
            ↓
  Nhập mã voucher (tùy chọn)
            ↓
  Hệ thống kiểm tra điều kiện voucher
  (hạn dùng, giá trị đơn tối thiểu, loại SP)
            ↓
  Xác nhận tổng tiền
            ↓
  Chọn phương thức thanh toán
            ↓
  Nhấn "Xác nhận thanh toán"
            ↓
  ┌─ Cập nhật HĐ → Đã thanh toán
  ├─ Trừ tồn kho tự động (từng SP)
  ├─ Kiểm tra ngưỡng tồn tối thiểu
  │   → Nếu vi phạm: gửi cảnh báo lên Dashboard
  └─ Ghi nhật ký giao dịch
            ↓
  Hiển thị hóa đơn + tùy chọn in
```

### Quy trình Kiểm tra Voucher

```
NV nhập mã voucher
        ↓
Hệ thống truy vấn bảng Voucher
        ↓
  Kiểm tra lần lượt:
  1. Mã tồn tại?
  2. Còn trong thời hạn?
  3. Chưa vượt số lần sử dụng?
  4. Giá trị đơn hàng đạt tối thiểu?
  5. Áp dụng cho loại SP trong hóa đơn?
        ↓
  [Tất cả điều kiện đúng?]
  /                      \
Đúng                    Sai
  ↓                       ↓
Áp dụng giảm giá      Báo lỗi cụ thể
Hiện số tiền giảm     (không đủ điều kiện nào)
```

---

## 3.4 Cấu trúc dữ liệu

### Bảng `HoaDonBan`

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| MaHDB | VARCHAR(10) | PK | Mã hóa đơn bán (HDB001…) |
| NgayBan | DATETIME | NOT NULL | Ngày giờ tạo hóa đơn |
| MaNV | VARCHAR(10) | FK → NhanVien | NV lập hóa đơn |
| MaKH | VARCHAR(10) | FK → KhachHang, NULL | NULL nếu khách lẻ |
| TenKhachLe | NVARCHAR(100) | NULL | Tên khách nếu không có tài khoản |
| MaVoucher | VARCHAR(20) | FK → Voucher, NULL | |
| TongTienHang | DECIMAL(15,0) | NOT NULL | Trước giảm giá |
| GiamGia | DECIMAL(15,0) | DEFAULT 0 | Giá trị giảm từ voucher |
| TongThanhToan | DECIMAL(15,0) | NOT NULL | Tổng sau giảm |
| PhuongThucTT | ENUM | NOT NULL | TienMat / ChuyenKhoan / QuetThe |
| TrangThai | ENUM | NOT NULL | ChưaTT / ĐãTT / ChờXN / ĐãHủy |
| Kenh | ENUM | DEFAULT 'Offline' | Offline / Online |

### Bảng `ChiTietHoaDon`

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| ID | INT | PK tự tăng | |
| MaHDB | VARCHAR(10) | FK → HoaDonBan | |
| MaSP | VARCHAR(10) | FK → HangHoa | |
| GiaBan | DECIMAL(15,0) | NOT NULL | Giá tại thời điểm bán |
| SoLuong | INT | NOT NULL | |
| ThanhTien | DECIMAL(15,0) | NOT NULL | GiaBan × SoLuong |

### Bảng `Voucher`

| Cột | Kiểu | Mô tả |
|---|---|---|
| MaVoucher | VARCHAR(20) | PK |
| TenChuongTrinh | NVARCHAR(100) | Tên khuyến mãi |
| LoaiGiam | ENUM | PhanTram / SoTienCo_Dinh |
| GiaTriGiam | DECIMAL(10,2) | % hoặc số tiền |
| GiaTriDonToiThieu | DECIMAL(15,0) | Giá trị đơn tối thiểu để áp dụng |
| NgayBatDau | DATE | |
| NgayKetThuc | DATE | |
| SoLanSuDungToiDa | INT | NULL = không giới hạn |
| SoLanDaSuDung | INT | DEFAULT 0 |
| TrangThai | ENUM | HoatDong / HetHan / TamDung |

---

## 3.5 Yêu cầu kỹ thuật

- Hỗ trợ tìm kiếm sản phẩm bằng **mã vạch** (tích hợp máy quét barcode USB).
- Trừ tồn kho phải dùng **transaction** (không để trừ thiếu khi nhiều NV cùng bán).
- In hóa đơn nhiệt: khổ 80mm, hỗ trợ máy in Epson TM-T82 / tương đương.
- Lỗi voucher phải thông báo **nguyên nhân cụ thể** (hết hạn, chưa đủ giá trị, v.v.), không chỉ "Mã không hợp lệ".
