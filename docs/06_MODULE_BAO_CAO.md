# MODULE 6 — BÁO CÁO & THỐNG KÊ

---

## 6.1 Mô tả chức năng

Module cung cấp các báo cáo tổng hợp phục vụ việc ra quyết định của Quản lý cửa hàng và theo dõi hiệu quả hoạt động. Tất cả báo cáo đều hỗ trợ lọc theo khoảng thời gian và xuất file Excel.

**Đường dẫn:** Sidebar → **Báo cáo**

**Người dùng chính:** Quản lý cửa hàng (MANAGER), Nhân viên Marketing (MARKETING)

---

## 6.2 Các loại báo cáo

### 6.2.1 Báo cáo Đơn hàng (Hình 21 – UI tham khảo)

**Thành phần giao diện:**

| Thành phần | Mô tả |
|---|---|
| Tiêu đề | "Báo cáo đơn hàng" |
| Bộ lọc thời gian | Dropdown: Hôm nay / 7 ngày qua / 30 ngày qua / Tùy chỉnh |
| Hiển thị khoảng thời gian | VD: "10/05/2024 – 16/05/2024 — 7 ngày qua" |

**Thẻ KPI tóm tắt:**

| Thẻ | Mô tả | Màu |
|---|---|---|
| Tổng số đơn hàng | Tổng đơn trong kỳ (online + offline) | Đen |
| Đơn hàng đã hoàn thành | Số đơn trạng thái Đã thanh toán / Hoàn thành | Xanh dương |
| Đơn hàng đã hủy | Số đơn trạng thái Đã hủy | Đỏ |

**Bảng chi tiết theo ngày:**

| Cột | Mô tả |
|---|---|
| Ngày đặt | Ngày trong kỳ báo cáo |
| Đơn hàng | Tổng số đơn ngày đó |
| Đã thanh toán | Số đơn đã hoàn tất thanh toán |
| Chưa thanh toán | Số đơn chưa thanh toán |

---

### 6.2.2 Báo cáo Doanh thu

**Thành phần giao diện:**

| Thành phần | Mô tả |
|---|---|
| Bộ lọc thời gian | Hôm nay / Tuần này / Tháng này / Quý này / Tùy chỉnh |
| Bộ lọc kênh | Tất cả / Offline / Online |
| Biểu đồ đường | Doanh thu theo ngày/tuần trong kỳ |

**Các chỉ số hiển thị:**

| Chỉ số | Mô tả |
|---|---|
| Tổng doanh thu | SUM tổng thanh toán hóa đơn đã hoàn tất |
| Doanh thu offline | Từ hóa đơn bán tại quầy |
| Doanh thu online | Từ đơn hàng online đã hoàn thành |
| Số đơn thành công | Tổng đơn đã hoàn tất |
| Giá trị đơn trung bình | Tổng doanh thu ÷ Số đơn |
| Sản phẩm bán chạy nhất | Top 5 sản phẩm theo số lượng bán |
| Doanh thu theo danh mục | Sữa / Tã bỉm / Đồ sơ sinh / Chăm sóc / Phụ kiện |

---

### 6.2.3 Báo cáo Tồn kho

**Các chỉ số hiển thị:**

| Chỉ số | Mô tả |
|---|---|
| Tổng mặt hàng đang quản lý | Số SKU khác Ngừng kinh doanh |
| Tổng giá trị tồn kho | SUM(TonKho × GiaNhap) |
| Sản phẩm sắp hết | SKU có tồn ≤ tồn tối thiểu |
| Sản phẩm hết hàng | SKU có tồn = 0 |
| Sản phẩm sắp hết hạn | SKU có HSD ≤ hôm nay + 30 ngày |
| Sản phẩm đã hết hạn | SKU có HSD < hôm nay |

**Bảng danh sách cần hành động:**
- Danh sách sản phẩm cần nhập thêm (tồn < tối thiểu), kèm gợi ý số lượng cần nhập.
- Danh sách sản phẩm sắp/đã hết hạn, kèm số lượng tồn và nhà cung cấp.

---

### 6.2.4 Báo cáo Nhân viên

**Chỉ dành cho MANAGER:**

| Chỉ số | Mô tả |
|---|---|
| Doanh số theo NV | Tổng tiền hóa đơn do NV đó lập |
| Số đơn xử lý | Tổng đơn offline + online đã xử lý |
| Hiệu suất online | Tỷ lệ đơn online hoàn thành / tổng đơn nhận |
| NV bán chạy nhất trong kỳ | Xếp hạng theo doanh số |

---

## 6.3 Tính năng chung các báo cáo

### Bộ lọc thời gian

| Tùy chọn | Khoảng thời gian |
|---|---|
| Hôm nay | 00:00 – 23:59 ngày hiện tại |
| 7 ngày qua | Từ hôm nay – 6 ngày về trước |
| 30 ngày qua | Từ hôm nay – 29 ngày về trước |
| Tháng này | Ngày 1 đến hôm nay của tháng hiện tại |
| Quý này | Quý hiện tại |
| Tùy chỉnh | Date picker: chọn ngày bắt đầu – kết thúc |

### Xuất dữ liệu

| Định dạng | Nội dung |
|---|---|
| **Excel (.xlsx)** | Toàn bộ dữ liệu bảng theo kỳ, có định dạng màu highlight |
| **In trực tiếp** | Giao diện in tối ưu (ẩn sidebar, header) |

---

## 6.4 Quy tắc nghiệp vụ

| Quy tắc | Mô tả |
|---|---|
| Doanh thu tính theo | Hóa đơn có TrangThai = `ĐãThanhToán` hoặc đơn online = `HoanThanh` |
| Đơn hủy | Không tính vào doanh thu, nhưng vẫn hiển thị trong báo cáo đơn hàng |
| Tồn kho báo cáo | Lấy từ bảng `HangHoa.TonKho` tại thời điểm truy vấn (real-time) |
| Phân quyền báo cáo | MANAGER: xem tất cả · MARKETING: xem doanh thu + sản phẩm · SALES/WAREHOUSE: xem phần liên quan vai trò |
| Số liệu lịch sử | Lưu trữ tối thiểu 24 tháng để phục vụ so sánh theo kỳ |

---

## 6.5 Cấu trúc dữ liệu liên quan

Báo cáo không có bảng riêng — tổng hợp từ các bảng giao dịch:

| Nguồn | Bảng | Dùng cho báo cáo |
|---|---|---|
| Hóa đơn bán | `HoaDonBan`, `ChiTietHoaDon` | Doanh thu, Đơn hàng, Sản phẩm bán chạy |
| Đơn hàng online | `DonHangOnline`, `ChiTietDonHangOnline` | Doanh thu online, Đơn hàng online |
| Tồn kho | `HangHoa`, `LoBatch` | Báo cáo tồn kho, cảnh báo |
| Nhân viên | `NhanVien`, `HoaDonBan` | Báo cáo hiệu suất nhân viên |
| Phiếu nhập | `PhieuNhapHang`, `ChiTietPhieuNhap` | Báo cáo nhập hàng, chi phí NCC |

---

## 6.6 Yêu cầu kỹ thuật

- Các báo cáo doanh thu nên **cache kết quả** 5 phút để tránh query nặng liên tục.
- Biểu đồ dùng thư viện Chart.js hoặc tương đương, responsive trên mobile.
- File Excel xuất ra: tiêu đề cột in đậm, hàng cảnh báo (sắp hết, hết hạn) tô màu nền vàng/đỏ.
- Báo cáo phải hiển thị **tên người xuất** và **thời điểm xuất** ở footer file Excel.
