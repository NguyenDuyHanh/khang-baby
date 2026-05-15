# TỔNG QUAN CÁC MODULE CHỨC NĂNG
## Hệ thống Quản lý KhangBaby — Cơ sở Chũ, Bắc Ninh

> **Phiên bản tài liệu:** 1.0  
> **Cơ sở phân tích:** Tài liệu mô tả dự án + UI KhangBaby thực tế

---

## 1. Giới thiệu hệ thống

KhangBaby là chuỗi cửa hàng mẹ và bé thành lập năm 2014, vận hành song song kênh bán **trực tiếp tại quầy** và **bán hàng online** (Facebook, website). Hệ thống giải quyết 5 vấn đề cốt lõi:

| # | Vấn đề thực tế | Giải pháp |
|---|---|---|
| 1 | Chênh lệch tồn kho Sapo vs thực tế | Tự động cập nhật tồn sau mỗi giao dịch |
| 2 | Thiếu cảnh báo hàng sắp hết / hết hạn | KPI cards + cảnh báo realtime trên Dashboard |
| 3 | Không đồng bộ online – offline | Kho dùng chung, trừ tồn khi xác nhận bất kỳ kênh nào |
| 4 | Lỗi mã giảm giá (Voucher) website | Cơ chế kiểm tra điều kiện voucher đầy đủ, thông báo lỗi rõ ràng |
| 5 | Giao diện Sapo phức tạp | Sidebar trực quan, vai trò rõ ràng, thao tác đơn giản |

---

## 2. Menu điều hướng thực tế (Sidebar KhangBaby)

| Icon | Mục menu | Module | Vai trò truy cập |
|---|---|---|---|
| 🟧 | **Tổng quan** | Module 1 – Dashboard | Tất cả |
| 🛒 | **Bán tại quầy** | Module 3 – POS | MANAGER, SALES |
| 📦 | **Quản lý kho** | Module 4 – Kho | MANAGER, WAREHOUSE |
| 🌐 | **Đơn hàng Online** | Module 5 – Online | MANAGER, ONLINE_SALES |
| 📊 | **Báo cáo** | Module 6 – Report | MANAGER, MARKETING |
| 👤 | **Nhân viên** | Module 2 – HR | MANAGER |
| ↩️ | **Đăng xuất** | Auth | Tất cả |

---

## 3. Phân quyền theo vai trò

| Module | MANAGER | WAREHOUSE | SALES | ONLINE_SALES | MARKETING |
|---|:---:|:---:|:---:|:---:|:---:|
| Dashboard – Tổng quan | ✅ Full | ⚠️ Kho | ⚠️ Doanh số | ⚠️ Online | ⚠️ Xem |
| Bán tại quầy | ✅ | ❌ | ✅ | ❌ | ❌ |
| Quản lý kho | ✅ | ✅ | 👁 Xem | 👁 Xem | ❌ |
| Đơn hàng Online | ✅ | ❌ | ❌ | ✅ | ❌ |
| Báo cáo | ✅ Full | 👁 Kho | 👁 Doanh số | 👁 Online | ✅ |
| Nhân viên | ✅ | ❌ | ❌ | ❌ | ❌ |

> ✅ Toàn quyền · ⚠️ Giới hạn · 👁 Chỉ xem · ❌ Không có quyền

---

## 4. Danh sách file tài liệu module

| File | Tên module | Nội dung chính |
|---|---|---|
| `00_TONG_QUAN_MODULE.md` | **Tổng quan** | Cấu trúc, phân quyền, luồng dữ liệu |
| `01_MODULE_DASHBOARD.md` | **Dashboard** | KPI cards, cảnh báo, đơn gần đây, trạng thái kho |
| `02_MODULE_NHAN_VIEN.md` | **Nhân viên & Phân quyền** | Đăng nhập, CRUD nhân viên, vai trò |
| `03_MODULE_BAN_TAI_QUAY.md` | **Bán tại quầy (POS)** | Tạo hóa đơn, voucher, thanh toán, in hóa đơn |
| `04_MODULE_QUAN_LY_KHO.md` | **Quản lý kho** | Danh mục SP, nhập hàng, FIFO, cảnh báo HSD |
| `05_MODULE_DON_HANG_ONLINE.md` | **Đơn hàng Online** | Tiếp nhận, xác nhận, giao hàng, đồng bộ kho |
| `06_MODULE_BAO_CAO.md` | **Báo cáo & Thống kê** | Doanh thu, đơn hàng, tồn kho, xuất Excel |

---

## 5. Luồng dữ liệu tổng thể

```
        [Nhập hàng từ NCC]
               ↓
     [Phiếu nhập → Kho tăng]
               ↓
      ┌─────────┴─────────┐
      ↓                   ↓
[Bán tại quầy]     [Đơn hàng Online]
 Tạo hóa đơn        Tiếp nhận đơn
 Thanh toán         Xác nhận đơn
      ↓                   ↓
      └─────────┬─────────┘
                ↓
       [Tồn kho tự động giảm]
                ↓
  [Kiểm tra ngưỡng tối thiểu & HSD]
                ↓
     [Cảnh báo lên Dashboard 🔔]
                ↓
     [Báo cáo doanh thu & tồn kho]
```

---

## 6. Cấu trúc CSDL tổng quan

```
NhanVien ──────────────────────────────────────────┐
    │                                               │
    ├── HoaDonBan ──── ChiTietHoaDon               │
    │       │                                       │
    │       └── Voucher                             │
    │                                               │
    ├── DonHangOnline ── ChiTietDonHangOnline       │
    │                                               │
    └── PhieuNhapHang ── ChiTietPhieuNhap           │
                                                    │
HangHoa ─── LoaiSP                                 │
    │                                               │
    ├── LoBatch (FIFO + HSD tracking)              │
    │                                               │
    └── NhaCungCap ─────────────────────────────────┘
```
