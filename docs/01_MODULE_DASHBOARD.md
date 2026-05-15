# MODULE 0 — DASHBOARD / TỔNG QUAN HỆ THỐNG

---

## 0.1 Mô tả chức năng

Dashboard là màn hình chào đón sau khi đăng nhập thành công. Nó cung cấp cái nhìn toàn cảnh về tình hình hoạt động trong ngày: doanh thu, đơn hàng, cảnh báo tồn kho và trạng thái kho — giúp quản lý và nhân viên nắm bắt nhanh mà không cần vào từng module.

**Đường dẫn:** Sidebar → **Tổng quan** (mục đầu tiên, luôn active sau login)

---

## 0.2 Giao diện chi tiết

### 0.2.1 Header

| Thành phần | Vị trí | Nội dung |
|---|---|---|
| Logo + Tên hệ thống | Trên cùng trái sidebar | "KB — KhangBaby / HỆ THỐNG QUẢN LÝ" |
| Breadcrumb | Trên cùng vùng nội dung | "Hệ thống Quản lý KhangBaby / Tổng quan" |
| Chuông thông báo 🔔 | Góc trên phải | Badge số đỏ (VD: 3) — số thông báo chưa đọc |
| Avatar + Tên người dùng | Góc trên phải | "AD — Admin" (hoặc tên nhân viên đăng nhập) |
| Tag chi nhánh | Cạnh tên người dùng | "Cơ sở Chũ, Bắc Ninh" |

---

### 0.2.2 Tiêu đề trang

```
Tổng quan hệ thống
Xin chào, Quản lý KhangBaby Chũ!
```

- Lời chào thay đổi theo tên và vai trò của người đăng nhập.

---

### 0.2.3 Nhóm KPI Cards (4 thẻ hàng ngang)

Đây là 4 chỉ số quan trọng nhất, hiển thị ngay đầu trang:

| # | Tên thẻ | Icon | Màu icon | Dữ liệu hiển thị | Ghi chú |
|---|---|---|---|---|---|
| 1 | **Doanh thu ngày** | 💲 | Xanh dương | Tổng tiền VND trong ngày hiện tại | VD: 1.845.000đ |
| 2 | **Đơn Online mới** | 🛒 | Tím | Số đơn online chưa xử lý | VD: 2 |
| 3 | **Sản phẩm sắp hết** | 📦 | Đỏ cam | Số SKU có tồn kho ≤ ngưỡng tối thiểu | VD: 2 |
| 4 | **Hết hạn/Sắp hết hạn** | ⚠️ | Cam | Số sản phẩm hết hạn hoặc sắp hết hạn (≤ 30 ngày) | VD: 2 |

**Hành vi:**
- Thẻ 2, 3, 4 là cảnh báo — click vào chuyển thẳng đến màn hình tương ứng.
- Thẻ số 3 và 4 hiển thị badge màu đỏ/cam khi có giá trị > 0.

---

### 0.2.4 Bảng Đơn hàng gần đây

**Vị trí:** Nửa trái phần dưới dashboard

| Thành phần | Mô tả |
|---|---|
| Tiêu đề | "📈 Đơn hàng gần đây" |
| Link "Xem tất cả" | Chuyển đến Module Bán tại quầy hoặc Đơn hàng Online |
| Mỗi dòng đơn | Tên khách hàng, Mã HD, Ngày giờ, Tổng tiền, Badge kênh |

**Cột dữ liệu mỗi dòng:**

| Trường | Ví dụ | Ghi chú |
|---|---|---|
| Tên khách hàng | Nguyễn Văn A | Khách lẻ hiển thị tên tạm |
| Mã hóa đơn | HD001 | Link đến chi tiết hóa đơn |
| Ngày giờ | 2024-05-20 10:30 | |
| Tổng tiền | 1.040.000đ | Màu cam đậm |
| Kênh bán | `Offline` / `Online` | Badge màu: Offline = xám, Online = xanh |

**Số dòng hiển thị:** 5–10 đơn gần nhất (sắp xếp theo thời gian giảm dần).

---

### 0.2.5 Panel Trạng thái kho hàng

**Vị trí:** Nửa phải phần dưới dashboard  
**Màu nền:** Cam đỏ (brand color KhangBaby)

| Chỉ số | Nhãn | Ví dụ | Mô tả |
|---|---|---|---|
| Tổng số mặt hàng | "Tổng số mặt hàng" | 1.240 | Tổng SKU đang quản lý |
| Cần nhập thêm | "Cần nhập thêm" | 12 | Số SKU dưới ngưỡng tồn tối thiểu |

**Hành vi:** Click "Cần nhập thêm" → chuyển đến màn hình Tồn kho lọc sẵn danh sách cần nhập.

---

## 0.3 Quy tắc nghiệp vụ

### Tính toán KPI

| KPI | Công thức |
|---|---|
| Doanh thu ngày | SUM(tổng tiền hóa đơn đã thanh toán) trong ngày hiện tại |
| Đơn Online mới | COUNT(đơn hàng online có trạng thái "Chờ xử lý") |
| Sản phẩm sắp hết | COUNT(sản phẩm có tồn_kho ≤ ton_kho_toi_thieu) |
| Hết hạn / Sắp hết hạn | COUNT(sản phẩm có han_su_dung ≤ ngày hiện tại + 30 ngày) |
| Cần nhập thêm | COUNT(SKU có tồn thực tế < tồn tối thiểu) |

### Cập nhật dữ liệu

- Dashboard tự động refresh mỗi **5 phút** hoặc khi người dùng tải lại trang.
- Số thông báo 🔔 cập nhật realtime khi có đơn online mới hoặc cảnh báo tồn kho.

### Hiển thị theo vai trò

| Vai trò | Thẻ KPI hiển thị |
|---|---|
| Quản lý cửa hàng | Tất cả 4 thẻ + đơn gần đây + trạng thái kho |
| Thủ kho | Sản phẩm sắp hết + Hết hạn + Trạng thái kho |
| NV Sales | Doanh thu ngày + Đơn gần đây (offline) |
| NV Sale Online | Đơn Online mới + Đơn gần đây (online) |

---

## 0.4 Cấu trúc dữ liệu liên quan

| Nguồn dữ liệu | Bảng DB | Trường sử dụng |
|---|---|---|
| Doanh thu ngày | `HoaDon` | SUM(TongTien) WHERE NgayBan = TODAY AND TrangThai = 'Đã thanh toán' |
| Đơn Online mới | `DonHangOnline` | COUNT WHERE TrangThai = 'Chờ xử lý' |
| Sản phẩm sắp hết | `HangHoa` | WHERE TonKho <= TonKhoToiThieu |
| Hết hạn / Sắp hết hạn | `HangHoa` | WHERE HanSuDung <= TODAY + 30 |
| Đơn hàng gần đây | `HoaDon` JOIN `DonHangOnline` | ORDER BY NgayTao DESC LIMIT 10 |
| Tổng mặt hàng | `HangHoa` | COUNT(*) WHERE TrangThai != 'Ngừng KD' |
| Cần nhập thêm | `HangHoa` | COUNT WHERE TonKho < TonKhoToiThieu |

---

## 0.5 Yêu cầu kỹ thuật

- Các KPI card dùng màu nhất quán: xanh dương (doanh thu), tím (đơn online), đỏ cam (sắp hết), cam (hết hạn).
- Panel kho màu nền cam đỏ (#C0392B hoặc tương đương brand KhangBaby).
- Responsive: trên mobile, 4 card hiển thị thành 2×2 grid, bảng đơn hàng cuộn dọc.
- Số tiền định dạng: phân cách hàng nghìn bằng dấu `.`, đơn vị `đ` (VD: 1.845.000đ).
