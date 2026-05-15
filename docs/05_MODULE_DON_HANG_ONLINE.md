# MODULE 5 — ĐƠN HÀNG ONLINE

---

## 5.1 Mô tả chức năng

Module xử lý toàn bộ đơn hàng phát sinh từ kênh online (Facebook, website KhangBaby). Giải quyết trực tiếp vấn đề **không đồng bộ dữ liệu** giữa bán online và bán tại quầy — tồn kho được trừ ngay khi xác nhận đơn, bất kể kênh nào.

**Đường dẫn:** Sidebar → **Đơn hàng Online**

**Người dùng chính:** Nhân viên Sale Online (ONLINE_SALES), Quản lý cửa hàng (MANAGER)

---

## 5.2 Các màn hình giao diện

### 5.2.1 Màn hình Danh sách Đơn hàng Online

**Thành phần giao diện:**

| Thành phần | Mô tả |
|---|---|
| Tab lọc trạng thái | Tất cả · Chờ xử lý · Đang giao · Đã hoàn thành · Đã hủy |
| Thanh tìm kiếm | Tìm theo mã đơn hàng hoặc tên khách |
| Bộ lọc | Ngày đặt · Kênh (Facebook / Website) · NV xử lý |
| Badge thông báo đơn mới | Hiển thị số đơn Chờ xử lý (đồng bộ với Dashboard card) |
| Nút "Tạo đơn thủ công" | Tạo đơn online nhập tay (cho đơn Facebook nhắn tin) |
| Xuất file Excel | Xuất danh sách đơn hàng |

**Các cột trong bảng:**

| Cột | Mô tả | Ví dụ |
|---|---|---|
| Mã đơn | Mã đơn hàng online | HD002 |
| Ngày đặt | Ngày giờ khách đặt | 2024-05-20 11:15 |
| Tên khách | Tên người đặt | Trần Thị B |
| SĐT | Số điện thoại liên hệ | 0987 654 321 |
| Địa chỉ giao | Địa chỉ nhận hàng | 123 Trần Phú, Bắc Ninh |
| Tổng tiền | Giá trị đơn hàng | 285.000đ |
| Kênh | Nguồn đơn | Badge: Facebook / Website |
| Trạng thái | Trạng thái xử lý | Badge màu |
| NV xử lý | Nhân viên phụ trách | NV Sale Online A |
| Hành động | Xem · Xử lý · Hủy | Icons + nút |

**Badge kênh:**
- `Facebook` → Xanh dương
- `Website` → Tím
- `Zalo` → Xanh lá (dự phòng tương lai)

**Badge trạng thái:**
- `Chờ xử lý` → Vàng (cần hành động)
- `Đang giao` → Xanh dương
- `Đã hoàn thành` → Xanh lá
- `Đã hủy` → Đỏ, gạch ngang

---

### 5.2.2 Form Tạo / Xem Chi tiết Đơn hàng Online

**Thông tin khách hàng:**

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| Tên khách hàng | Text | ✅ | |
| Số điện thoại | Text | ✅ | |
| Địa chỉ giao hàng | Text | ✅ | |
| Ghi chú đơn hàng | Textarea | ❌ | Yêu cầu đặc biệt của khách |
| Kênh đặt hàng | Dropdown | ✅ | Facebook / Website / Zalo |
| Mã voucher | Text | ❌ | Áp dụng mã giảm giá |

**Bảng chi tiết sản phẩm:**

| Cột | Mô tả |
|---|---|
| Mã SP | Tìm theo mã hoặc tên |
| Tên SP | Tự điền khi chọn |
| Giá bán | Giá tại thời điểm đặt |
| Số lượng | Nhập tay |
| Thành tiền | Tự tính |
| Hành động | ✏️ · 🗑️ |

**Thông tin giao hàng:**

| Trường | Kiểu | Ghi chú |
|---|---|---|
| Đơn vị vận chuyển | Dropdown | Giao hàng nhanh / GHTK / NCC nội bộ |
| Phí giao hàng | Number | VND |
| Ngày giao dự kiến | Date | |
| Mã vận đơn | Text | Điền sau khi bàn giao bưu tá |

**Footer đơn hàng:**

| Trường | Mô tả |
|---|---|
| Tổng tiền hàng | SUM sản phẩm |
| Phí vận chuyển | |
| Giảm giá | Từ voucher |
| Tổng thanh toán | Tổng sau giảm + phí ship |
| Phương thức TT | COD / Chuyển khoản trước |

**Hành động:**
- **Xác nhận đơn** → Trạng thái "Đang giao", trừ tồn kho
- **Hủy đơn** → Trạng thái "Đã hủy", hoàn tồn kho nếu đã trừ
- **In phiếu giao hàng** → Xuất PDF phiếu giao kèm địa chỉ và sản phẩm

---

### 5.2.3 Luồng Xử lý Đơn hàng (Kanban / Timeline)

Mỗi đơn hàng đi qua các bước sau, có thể hiển thị dạng timeline trong chi tiết đơn:

```
[Chờ xử lý] → [Đã xác nhận] → [Đang đóng gói] → [Đang giao] → [Đã hoàn thành]
                                                                        ↑
                                            [Đã hủy] ←─────────────────┘
                                         (ở bất kỳ bước nào)
```

---

## 5.3 Quy trình nghiệp vụ

### Quy trình Xử lý Đơn hàng Online

```
Khách đặt hàng (Facebook / Website)
             ↓
Đơn vào hệ thống → Trạng thái "Chờ xử lý"
Dashboard cập nhật badge "Đơn Online mới"
🔔 Thông báo cho NV Sale Online
             ↓
NV Sale Online mở đơn, kiểm tra thông tin
             ↓
   [Tồn kho đủ không?]
   /                 \
  Đủ               Không đủ
   ↓                   ↓
Xác nhận đơn       Liên hệ khách
Trừ tồn kho       (giải thích, đề xuất thay thế)
   ↓               Hoặc hủy đơn
Đóng gói, bàn
giao vận chuyển
   ↓
Cập nhật mã vận đơn
Trạng thái → "Đang giao"
   ↓
Giao hàng thành công
(xác nhận từ bưu tá hoặc NV)
   ↓
Trạng thái → "Đã hoàn thành"
Ghi nhận doanh thu
```

### Đồng bộ tồn kho Online – Offline

```
Kho hàng (Tồn kho thực tế)
         ↑           ↑
         │           │
   [Bán tại quầy]  [Đơn Online]
   Trừ ngay khi    Trừ ngay khi
   thanh toán      xác nhận đơn
         │           │
         └─────┬─────┘
               ↓
    Tồn kho cập nhật real-time
    → Không bao giờ báo còn hàng khi thực tế hết
```

---

## 5.4 Cấu trúc dữ liệu

### Bảng `DonHangOnline`

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| MaDHO | VARCHAR(10) | PK | Mã đơn hàng online (HD + số) |
| NgayDat | DATETIME | NOT NULL | Thời điểm đặt hàng |
| TenKhach | NVARCHAR(100) | NOT NULL | |
| SoDienThoai | VARCHAR(15) | NOT NULL | |
| DiaChiGiao | NVARCHAR(200) | NOT NULL | |
| Kenh | ENUM | NOT NULL | Facebook / Website / Zalo |
| GhiChu | NVARCHAR(500) | NULL | Yêu cầu đặc biệt |
| MaVoucher | VARCHAR(20) | FK → Voucher, NULL | |
| MaNV | VARCHAR(10) | FK → NhanVien | NV xử lý đơn |
| TongTienHang | DECIMAL(15,0) | NOT NULL | |
| PhiVanChuyen | DECIMAL(15,0) | DEFAULT 0 | |
| GiamGia | DECIMAL(15,0) | DEFAULT 0 | |
| TongThanhToan | DECIMAL(15,0) | NOT NULL | |
| PhuongThucTT | ENUM | | COD / ChuyenKhoan |
| DonViVanChuyen | NVARCHAR(100) | NULL | |
| MaVanDon | VARCHAR(50) | NULL | Điền sau khi bàn giao |
| TrangThai | ENUM | NOT NULL | ChoXuLy / DaXacNhan / DangGiao / HoanThanh / HuyDon |

### Bảng `ChiTietDonHangOnline`

| Cột | Kiểu | Mô tả |
|---|---|---|
| ID | INT | PK tự tăng |
| MaDHO | VARCHAR(10) | FK → DonHangOnline |
| MaSP | VARCHAR(10) | FK → HangHoa |
| GiaBan | DECIMAL(15,0) | Giá tại thời điểm đặt |
| SoLuong | INT | |
| ThanhTien | DECIMAL(15,0) | |

---

## 5.5 Yêu cầu kỹ thuật

- Khi xác nhận đơn online, hệ thống **kiểm tra tồn kho trước** — nếu không đủ thì không cho xác nhận, hiện cảnh báo rõ ràng.
- Tồn kho trừ ngay tại thời điểm **xác nhận**, không phải khi giao hàng xong — tránh trường hợp bán trùng hàng online–offline.
- Nếu hủy đơn sau khi đã xác nhận (đã trừ kho): hệ thống **hoàn lại tồn kho** tự động.
- Dashboard card "Đơn Online mới" chỉ đếm đơn ở trạng thái `ChoXuLy`.
- Thông báo 🔔 đẩy realtime khi có đơn mới vào hệ thống.
