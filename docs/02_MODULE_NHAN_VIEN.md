# MODULE 2 — NHÂN VIÊN & PHÂN QUYỀN

---

## 2.1 Mô tả chức năng

Module quản lý toàn bộ vòng đời tài khoản nhân viên: đăng nhập vào hệ thống, thêm/sửa/xóa hồ sơ nhân viên và cấp quyền truy cập theo vai trò. Chỉ tài khoản **Quản lý cửa hàng** mới có quyền truy cập module này.

**Đường dẫn:** Sidebar → **Nhân viên**

---

## 2.2 Các màn hình giao diện

### 2.2.1 Màn hình Đăng nhập

**Đường dẫn:** `/login` — màn hình đầu tiên khi chưa xác thực

**Các trường dữ liệu:**

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| Email hoặc tên đăng nhập | Text | ✅ | |
| Mật khẩu | Password | ✅ | Ẩn ký tự |
| Ghi nhớ mật khẩu | Checkbox | ❌ | Duy trì session 30 ngày |
| Quên mật khẩu? | Link | — | Gửi link reset qua email |

**Hành động:**
- **Đăng nhập** → Xác thực, tạo session, chuyển về Dashboard.
- Sai thông tin: hiển thị thông báo lỗi inline, không xóa trường.
- Sai liên tiếp 5 lần: tạm khóa tài khoản 15 phút.

---

### 2.2.2 Màn hình Danh sách Nhân viên

**Đường dẫn:** Sidebar → Nhân viên

**Thành phần giao diện:**

| Thành phần | Mô tả |
|---|---|
| Thanh tìm kiếm | Tìm theo tên hoặc mã NV |
| Bộ lọc Vai trò | Dropdown: Tất cả / Quản lý / Thủ kho / Sales / Online / Marketing |
| Nút "Thêm nhân viên" | Mở form thêm mới (chỉ Quản lý mới thấy) |
| Bảng danh sách | Hiển thị toàn bộ nhân viên |
| Icon ✏️ Sửa | Chỉnh sửa thông tin nhân viên |
| Icon 🗑️ Xóa / Khóa | Vô hiệu hóa tài khoản |

**Các cột trong bảng:**

| Cột | Mô tả | Ví dụ |
|---|---|---|
| Mã NV | Định danh nhân viên | NV01 |
| Họ và tên | Tên đầy đủ | Nguyễn Văn A |
| Email | Email đăng nhập | nva@khangbaby.com |
| Số điện thoại | Liên hệ nội bộ | 0912 345 678 |
| Vai trò | Vai trò trong hệ thống | Thủ kho |
| Ngày tạo | Ngày tạo tài khoản | 01/01/2024 |
| Trạng thái | Hoạt động / Đã khóa | Badge xanh / đỏ |
| Hành động | Sửa / Khóa | Icons |

---

### 2.2.3 Form Thêm / Sửa Nhân viên

**Các trường dữ liệu:**

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| Họ và tên | Text | ✅ | |
| Email | Email | ✅ | Dùng làm tên đăng nhập, không trùng |
| Mật khẩu | Password | ✅ (khi thêm) | Tối thiểu 8 ký tự, có chữ hoa + số |
| Xác nhận mật khẩu | Password | ✅ (khi thêm) | |
| Số điện thoại | Text | ✅ | |
| Vai trò / Phân quyền | Radio hoặc Dropdown | ✅ | Chọn 1 trong 5 vai trò |
| Trạng thái | Toggle | ✅ | Hoạt động / Khóa |

**Các vai trò khả dụng:**

| Mã vai trò | Tên hiển thị | Mô tả tóm tắt |
|---|---|---|
| `MANAGER` | Quản lý cửa hàng | Toàn quyền hệ thống |
| `WAREHOUSE` | Thủ kho | Quản lý kho, nhập hàng |
| `SALES` | Nhân viên bán hàng | Bán tại quầy, hóa đơn |
| `ONLINE_SALES` | Nhân viên sale online | Xử lý đơn hàng online |
| `MARKETING` | Nhân viên marketing | Xem báo cáo, sản phẩm |

**Hành động:**
- **Lưu** → Xác nhận, lưu DB, hiện toast "Lưu thành công".
- **Hủy** → Đóng form, không lưu thay đổi.

---

## 2.3 Quy trình nghiệp vụ

### Quy trình Đăng nhập

```
Nhân viên truy cập hệ thống
          ↓
   Nhập email + mật khẩu
          ↓
   Hệ thống xác thực
       /       \
   Đúng        Sai
     ↓           ↓
  Tạo session  Đếm số lần sai
  Lưu vai trò     ↓
     ↓        < 5 lần → Báo lỗi
  Chuyển      ≥ 5 lần → Khóa 15 phút
  Dashboard
  (theo quyền)
```

### Quy trình Thêm nhân viên

```
Quản lý vào màn hình Nhân viên
          ↓
   Nhấn "Thêm nhân viên"
          ↓
   Điền form + chọn vai trò
          ↓
  Hệ thống kiểm tra email
       /       \
  Trùng       Mới
    ↓            ↓
  Báo lỗi     Tạo tài khoản
              Gán vai trò
              Ghi log
              Thông báo thành công
```

---

## 2.4 Ma trận phân quyền chi tiết

| Chức năng | MANAGER | WAREHOUSE | SALES | ONLINE_SALES | MARKETING |
|---|:---:|:---:|:---:|:---:|:---:|
| Xem Dashboard đầy đủ | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Bán tại quầy | ✅ | ❌ | ✅ | ❌ | ❌ |
| Xem tồn kho | ✅ | ✅ | 👁 | 👁 | ❌ |
| Nhập hàng / Phiếu nhập | ✅ | ✅ | ❌ | ❌ | ❌ |
| Xử lý đơn Online | ✅ | ❌ | ❌ | ✅ | ❌ |
| Xem báo cáo đầy đủ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Thêm / Sửa sản phẩm | ✅ | ✅ | ❌ | ❌ | ❌ |
| Quản lý nhân viên | ✅ | ❌ | ❌ | ❌ | ❌ |

> ✅ Toàn quyền · ⚠️ Giới hạn theo vai trò · 👁 Chỉ xem · ❌ Không có quyền

---

## 2.5 Cấu trúc dữ liệu

### Bảng `NhanVien`

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| MaNV | VARCHAR(10) | PK, NOT NULL | Mã nhân viên (VD: NV01) |
| HoTen | NVARCHAR(100) | NOT NULL | Tên đầy đủ |
| Email | VARCHAR(100) | UNIQUE, NOT NULL | Email đăng nhập |
| MatKhau | VARCHAR(255) | NOT NULL | Mã hóa bcrypt |
| SoDienThoai | VARCHAR(15) | | |
| VaiTro | ENUM | NOT NULL | MANAGER / WAREHOUSE / SALES / ONLINE_SALES / MARKETING |
| NgayTao | DATETIME | DEFAULT NOW() | |
| TrangThai | TINYINT(1) | DEFAULT 1 | 1 = hoạt động, 0 = khóa |
| LanDangNhapSai | INT | DEFAULT 0 | Đếm lần đăng nhập sai |
| ThoiGianKhoa | DATETIME | NULL | Thời điểm hết khóa |

### Bảng `LichSuDangNhap`

| Cột | Kiểu | Mô tả |
|---|---|---|
| ID | INT | PK tự tăng |
| MaNV | VARCHAR(10) | FK → NhanVien |
| ThoiGian | DATETIME | Thời điểm đăng nhập |
| DiaChi_IP | VARCHAR(45) | IP thiết bị |
| KetQua | ENUM | 'Thành công' / 'Thất bại' |

---

## 2.6 Yêu cầu kỹ thuật & bảo mật

- Mật khẩu lưu DB phải mã hóa **bcrypt** (không lưu plaintext).
- Session hết hạn sau **8 giờ** không hoạt động.
- Token JWT hoặc session cookie: `HttpOnly`, `Secure`, `SameSite=Strict`.
- Ghi log mỗi lần đăng nhập (thành công/thất bại) gồm IP và timestamp.
- Chỉ **MANAGER** được tạo, sửa, khóa tài khoản nhân viên khác.
- Reset mật khẩu chỉ qua email xác thực (không tự đặt lại từ giao diện admin).
