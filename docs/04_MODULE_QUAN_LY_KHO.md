# MODULE 4 — QUẢN LÝ KHO

---

## 4.1 Mô tả chức năng

Module quản lý toàn bộ hoạt động kho của KhangBaby: danh mục hàng hóa, nhập hàng từ nhà cung cấp, theo dõi tồn kho thực tế, cảnh báo sắp hết hàng và quản lý hạn sử dụng theo nguyên tắc FIFO (First In – First Out). Đây là module giải quyết trực tiếp vấn đề chênh lệch tồn kho và thiếu cảnh báo tự động.

**Đường dẫn:** Sidebar → **Quản lý kho**

**Người dùng chính:** Thủ kho (WAREHOUSE), Quản lý cửa hàng (MANAGER)

---

## 4.2 Các màn hình giao diện

### 4.2.1 Màn hình Danh sách Hàng hóa (Sản phẩm)

**Thành phần giao diện:**

| Thành phần | Mô tả |
|---|---|
| Thanh tìm kiếm | Tìm theo mã SP hoặc tên sản phẩm |
| Bộ lọc Danh mục | Dropdown: Tất cả / Sữa / Tã bỉm / Đồ sơ sinh / Chăm sóc / Phụ kiện |
| Bộ lọc Nhà cung cấp | Dropdown danh sách NCC |
| Bộ lọc Trạng thái | Tất cả / Còn hàng / Sắp hết / Hết hàng |
| Nút "Thêm sản phẩm" | Mở form thêm hàng hóa mới |
| Xuất file Excel | Xuất danh sách hàng hóa |

**Các cột trong bảng:**

| Cột | Mô tả | Ví dụ |
|---|---|---|
| STT | Số thứ tự | 1 |
| Mã SP | Mã định danh sản phẩm | SP1S |
| Tên sản phẩm | Tên đầy đủ | Sữa Nan Optipro 3 |
| Danh mục | Nhóm sản phẩm | Sữa |
| Nhà cung cấp | Tên NCC | Nestle VN |
| Giá nhập | Giá nhập kho | 450.000đ |
| Giá bán | Giá bán lẻ | 620.000đ |
| Tồn kho | Số lượng thực tế | 48 |
| Tồn tối thiểu | Ngưỡng cảnh báo | 10 |
| Hạn sử dụng | Ngày hết hạn gần nhất | 30/06/2025 |
| Trạng thái | Còn hàng / Sắp hết / Hết hàng | Badge màu |
| Hành động | ✏️ Sửa · 🗑️ Xóa | Icons |

**Badge trạng thái tồn kho:**
- `Còn hàng` (tồn > tồn tối thiểu × 2) → Xanh lá
- `Sắp hết` (tồn tối thiểu < tồn ≤ tồn tối thiểu × 2) → Cam
- `Hết hàng` (tồn = 0 hoặc ≤ tồn tối thiểu) → Đỏ ⚠️

---

### 4.2.2 Form Thêm / Sửa Hàng hóa

**Các trường dữ liệu:**

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| Mã SP | Text | ✅ | Tự sinh hoặc nhập tay, không trùng |
| Tên sản phẩm | Text | ✅ | |
| Danh mục | Dropdown | ✅ | Chọn từ danh sách Loại |
| Nhà cung cấp | Dropdown | ✅ | |
| Đơn vị tính | Dropdown | ✅ | Hộp / Gói / Chiếc / Thùng / Lon |
| Giá nhập | Number | ✅ | VND |
| Giá bán | Number | ✅ | VND |
| Tồn kho tối thiểu | Number | ✅ | Ngưỡng kích hoạt cảnh báo |
| Hạn sử dụng (batch) | Date | ⚠️ | Bắt buộc với nhóm thực phẩm (sữa, thực phẩm bé) |
| Ngày nhập batch | Date | ✅ | Hỗ trợ FIFO |
| Mô tả | Textarea | ❌ | |

---

### 4.2.3 Màn hình Danh sách Hàng tồn kho (Tồn kho thực tế)

**Đường dẫn:** Quản lý kho → Hàng tồn kho

Màn hình tập trung hiển thị **tình trạng tồn kho** và cảnh báo, tách biệt với danh mục sản phẩm.

**Các cột trong bảng:**

| Cột | Mô tả |
|---|---|
| STT | Số thứ tự |
| Mã SP | Mã sản phẩm |
| Tên sản phẩm | Tên đầy đủ |
| Giá nhập | Giá nhập kho hiện tại |
| Giá bán | Giá bán hiện tại |
| Tồn kho | Số lượng thực tế |
| Ngày nhập (batch đầu tiên) | Ngày nhập lô hàng cũ nhất còn tồn |
| Hạn sử dụng (gần nhất) | HSD của batch sắp hết hạn nhất |
| Trạng thái | Còn hàng / Sắp hết / Hết hạn |
| Hành động | ✏️ Sửa · 🗑️ Xóa |

---

### 4.2.4 Màn hình Phiếu Nhập hàng (DS Phiếu → Phiếu nhập hàng)

**Thành phần giao diện:**

| Thành phần | Mô tả |
|---|---|
| Tab lọc | Tất cả phiếu nhập · Đã thanh toán hết · Chưa thanh toán hết |
| Tìm kiếm | Tìm theo mã HDN (phiếu nhập), mã HDD (đơn đặt) |
| Bộ lọc | Mã NV · Mã XM (nhà cung cấp) · Ngày nhập |
| Nút "Thêm phiếu" | Tạo phiếu nhập mới (góc dưới phải) |
| Xuất file Excel | Xuất danh sách |

**Các cột trong bảng:**

| Cột | Mô tả | Ví dụ |
|---|---|---|
| Mã HDN | Mã phiếu nhập hàng | PN1 |
| Mã HDD | Mã phiếu đặt hàng liên kết | PD1 |
| Mã HDTT | Mã phiếu thanh toán | PTT01 |
| Số lượng đặt | Số lượng theo đơn đặt | 100 |
| Số lượng thực nhận | Số lượng thực tế nhận | 100 |
| Còn thiếu | Số lượng còn chênh | 0 (xanh) / 10 (đỏ) |
| Trạng thái TT | Đã thanh toán hết / Chưa thanh toán hết | |
| Hành động | ✏️ Sửa · 🗑️ Xóa | |

---

### 4.2.5 Form Chi tiết Phiếu nhập hàng

**Thông tin header:**

| Trường | Kiểu | Bắt buộc |
|---|---|---|
| Mã HDN | Text (tự sinh) | ✅ |
| Mã HDTT | Text (liên kết phiếu TT) | ❌ |
| Ngày nhập | Date | ✅ |
| Nhà cung cấp | Dropdown | ✅ |
| Nhân viên nhập | Text (tự điền) | ✅ |

**Bảng chi tiết sản phẩm nhập:**

| Cột | Mô tả |
|---|---|
| Mã SP | Mã sản phẩm |
| Tên sản phẩm | Tên (tự điền khi chọn mã) |
| Giá nhập | Giá nhập lô này |
| Số lượng | Số lượng nhập |
| Ngày sản xuất | Để tính HSD và FIFO |
| Hạn sử dụng | Bắt buộc với thực phẩm |
| Thành tiền | Giá nhập × Số lượng (tự tính) |
| Hành động | ✏️ · 🗑️ |

**Footer:**
- **Tổng tiền** (tự tính)
- Nút **Lưu** / **Thoát**

---

## 4.3 Quy trình nghiệp vụ

### Quy trình Nhập hàng

```
Thủ kho nhận hàng từ NCC
           ↓
Tạo Phiếu nhập hàng mới
           ↓
Chọn NCC + nhập từng sản phẩm
(mã SP, số lượng, giá nhập, HSD)
           ↓
Lưu phiếu nhập
           ↓
Hệ thống tự động:
  ├─ Tăng tồn kho (từng SP)
  ├─ Ghi batch mới (ngày nhập + HSD) → FIFO
  └─ Kiểm tra ngưỡng cảnh báo
           ↓
Cập nhật Dashboard (thẻ "Sản phẩm sắp hết")
```

### Nguyên tắc FIFO

```
Khi bán hàng, hệ thống xuất batch cũ nhất trước:

Batch A: nhập 01/03/2025, HSD 01/09/2025, còn 20
Batch B: nhập 15/04/2025, HSD 01/11/2025, còn 50

→ Khi bán 25 sản phẩm:
   Xuất hết Batch A (20) + lấy 5 từ Batch B
```

### Quy trình Cảnh báo tự động

```
Sau mỗi giao dịch nhập/xuất:
           ↓
  Hệ thống kiểm tra:
  1. TonKho <= TonKhoToiThieu?
     → Đánh dấu "Sắp hết", cập nhật Dashboard
  2. HanSuDung <= Hôm nay + 30 ngày?
     → Đánh dấu "Sắp hết hạn", thông báo 🔔
  3. HanSuDung < Hôm nay?
     → Đánh dấu "Hết hạn", cảnh báo khẩn
```

---

## 4.4 Cấu trúc dữ liệu

### Bảng `HangHoa` (Danh mục sản phẩm)

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| MaSP | VARCHAR(10) | PK | Mã sản phẩm |
| TenSP | NVARCHAR(200) | NOT NULL | |
| MaLoai | VARCHAR(10) | FK → LoaiSP | Danh mục |
| MaNCC | VARCHAR(10) | FK → NhaCungCap | |
| DonViTinh | NVARCHAR(20) | | Hộp / Gói / Chiếc |
| GiaNhap | DECIMAL(15,0) | | Giá nhập mới nhất |
| GiaBan | DECIMAL(15,0) | NOT NULL | |
| TonKho | INT | DEFAULT 0 | Tồn kho hiện tại (cập nhật tự động) |
| TonKhoToiThieu | INT | DEFAULT 0 | Ngưỡng cảnh báo |
| TrangThai | ENUM | DEFAULT 'ConHang' | ConHang / SapHet / HetHang / NgungKD |

### Bảng `LoBatch` (Lô nhập – hỗ trợ FIFO)

| Cột | Kiểu | Mô tả |
|---|---|---|
| MaBatch | INT | PK tự tăng |
| MaSP | VARCHAR(10) | FK → HangHoa |
| MaHDN | VARCHAR(10) | FK → PhieuNhapHang |
| NgayNhap | DATE | Ngày nhập lô |
| HanSuDung | DATE | NULL nếu SP không có HSD |
| SoLuongNhap | INT | |
| SoLuongCon | INT | Tồn còn lại trong lô |
| GiaNhap | DECIMAL(15,0) | Giá nhập lô này |

### Bảng `PhieuNhapHang`

| Cột | Kiểu | Mô tả |
|---|---|---|
| MaHDN | VARCHAR(10) | PK |
| NgayNhap | DATE | |
| MaNCC | VARCHAR(10) | FK → NhaCungCap |
| MaNV | VARCHAR(10) | FK → NhanVien |
| TongTien | DECIMAL(15,0) | |
| TrangThaiTT | ENUM | DaThanhToanHet / ChuaThanhToanHet |

### Bảng `ChiTietPhieuNhap`

| Cột | Kiểu | Mô tả |
|---|---|---|
| ID | INT | PK tự tăng |
| MaHDN | VARCHAR(10) | FK → PhieuNhapHang |
| MaSP | VARCHAR(10) | FK → HangHoa |
| GiaNhap | DECIMAL(15,0) | |
| SoLuong | INT | |
| HanSuDung | DATE | |
| NgaySanXuat | DATE | |
| ThanhTien | DECIMAL(15,0) | |

### Bảng `LoaiSP`

| Cột | Kiểu | Mô tả |
|---|---|---|
| MaLoai | VARCHAR(10) | PK |
| TenLoai | NVARCHAR(100) | Sữa / Tã bỉm / Đồ sơ sinh / Chăm sóc / Phụ kiện |
| SoSanPham | INT | Đếm SP thuộc loại (tính toán) |

### Bảng `NhaCungCap`

| Cột | Kiểu | Mô tả |
|---|---|---|
| MaNCC | VARCHAR(10) | PK |
| TenNCC | NVARCHAR(100) | |
| SoDienThoai | VARCHAR(15) | |
| DiaChi | NVARCHAR(200) | |

---

## 4.5 Yêu cầu kỹ thuật

- Tồn kho trong bảng `HangHoa` cập nhật **tự động** sau mỗi giao dịch nhập/xuất (trigger hoặc service layer).
- Xuất kho theo **FIFO**: luôn lấy batch có `NgayNhap` sớm nhất trước.
- Cảnh báo hạn sử dụng chạy **hàng ngày** (cronjob lúc 7:00 sáng), đẩy thông báo lên Dashboard.
- Khi tồn kho = 0, hệ thống tự đổi trạng thái sản phẩm sang `HetHang`, ngăn thêm vào hóa đơn.
- Xuất file Excel danh sách tồn kho: có cột màu đỏ cho sản phẩm sắp hết/hết hạn.
