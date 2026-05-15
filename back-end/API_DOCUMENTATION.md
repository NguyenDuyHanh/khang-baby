# KhangBaby Backend API Documentation

Complete backend API implementation for KhangBaby management system.

## Base URL
```
http://localhost:4000/api
```

## Authentication
All API endpoints (except `/auth/login` and `/auth/register`) require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication API (`/auth`)

### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "ho_ten": "Nguyễn Văn A",
  "so_dien_thoai": "0912345678",
  "vai_tro": "SALES"  // MANAGER, WAREHOUSE, SALES, ONLINE_SALES, MARKETING
}

Response:
{
  "ok": true,
  "message": "Staff registered successfully",
  "id": 1
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "ok": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "staff": {
    "id": 1,
    "email": "user@example.com",
    "ho_ten": "Nguyễn Văn A",
    "vai_tro": "SALES"
  }
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response:
{
  "ok": true,
  "staff": {
    "id": 1,
    "email": "user@example.com",
    "ho_ten": "Nguyễn Văn A",
    "so_dien_thoai": "0912345678",
    "vai_tro": "SALES",
    "trang_thai": "HOAT_DONG"
  }
}
```

---

## 2. Staff Management API (`/staff`)
*Requires: MANAGER role*

### Get All Staff
```
GET /staff
Response: Array of staff members
```

### Get Staff by ID
```
GET /staff/:id
```

### Create Staff
```
POST /staff
{
  "email": "user@example.com",
  "password": "password123",
  "ho_ten": "Nguyễn Văn A",
  "so_dien_thoai": "0912345678",
  "vai_tro": "SALES"
}
```

### Update Staff
```
PUT /staff/:id
{
  "ho_ten": "Nguyễn Văn A",
  "so_dien_thoai": "0912345678",
  "vai_tro": "MANAGER",
  "trang_thai": "HOAT_DONG"
}
```

### Delete Staff
```
DELETE /staff/:id
```

### Change Password
```
POST /staff/change-password
{
  "newPassword": "newPassword123"
}
```

---

## 3. Product & Inventory API (`/products`)

### Get All Products
```
GET /products?search=sữa&danh_muc=1&nha_cung_cap=1&trang_thai=HOAT_DONG
```

### Get Product by ID
```
GET /products/:id
```

### Create Product
```
POST /products
{
  "ma_sp": "SP001",
  "ten_sp": "Sữa Nan Optipro 3",
  "id_danh_muc": 1,
  "id_nha_cung_cap": 1,
  "don_vi_tinh": "HOP",
  "gia_nhap": 450000,
  "gia_ban": 620000,
  "ton_kho_toi_thieu": 10,
  "han_su_dung": "2025-12-31",
  "ngay_nhap_batch": "2024-01-15"
}
```

### Update Product
```
PUT /products/:id
{
  "ten_sp": "Sữa Nan Optipro 3 (Updated)",
  "gia_ban": 630000,
  "ton_kho_toi_thieu": 15
}
```

### Delete Product
```
DELETE /products/:id
```

### Get Products Running Low
```
GET /products/alerts/near-minimum
```

### Get Expiring Products
```
GET /products/alerts/expiring?days=30
```

### Get Categories
```
GET /products/categories/list
```

### Create Category
```
POST /products/categories
{
  "ten_danh_muc": "Sữa",
  "mo_ta": "Sản phẩm sữa các loại"
}
```

### Get Suppliers
```
GET /products/suppliers/list
```

### Create Supplier
```
POST /products/suppliers
{
  "ten_ncc": "Nestle VN",
  "email": "contact@nestle.vn",
  "so_dien_thoai": "0243123456",
  "dia_chi": "123 Trần Phú, Hà Nội"
}
```

---

## 4. Invoice/POS API (`/invoices`)
*Requires: MANAGER, SALES*

### Get All Invoices
```
GET /invoices?trang_thai=DA_THANH_TOAN&search=HD001&ngay_bat_dau=2024-05-01&ngay_ket_thuc=2024-05-31
```

### Get Invoice by ID
```
GET /invoices/:id
```

### Create Invoice
```
POST /invoices
{
  "ten_khach_hang": "Nguyễn Văn A",
  "id_khach_hang": null,
  "ma_voucher": "VOUCHER01",
  "phuong_thuc_thanh_toan": "TIEN_MAT",
  "items": [
    {
      "id_hang_hoa": 1,
      "gia_ban": 620000,
      "so_luong": 2
    }
  ]
}

Response:
{
  "ok": true,
  "message": "Invoice created successfully",
  "id": 1,
  "ma_hdb": "HDB2405001"
}
```

### Confirm Payment
```
POST /invoices/:id/confirm-payment
```

### Update Invoice
```
PUT /invoices/:id
{
  "ten_khach_hang": "Nguyễn Văn B"
}
```

### Delete Invoice
```
DELETE /invoices/:id
```

### Get Today's Revenue
```
GET /invoices/revenue/today
```

### Get Recent Invoices
```
GET /invoices/recent?limit=10
```

---

## 5. Receipt/Inventory Intake API (`/receipts`)
*Requires: MANAGER, WAREHOUSE*

### Get All Receipts
```
GET /receipts?trang_thai_thanh_toan=DA_THANH_TOAN_HET&search=PN001
```

### Get Receipt by ID
```
GET /receipts/:id
```

### Create Receipt
```
POST /receipts
{
  "id_nha_cung_cap": 1,
  "items": [
    {
      "id_hang_hoa": 1,
      "gia_nhap": 450000,
      "so_luong": 10,
      "ngay_san_xuat": "2024-01-15",
      "han_su_dung": "2025-01-15"
    }
  ]
}

Response:
{
  "ok": true,
  "message": "Receipt created successfully",
  "id": 1,
  "ma_pnh": "PN0001"
}
```

### Update Receipt
```
PUT /receipts/:id
{
  "so_luong_thuc_nhan": 10
}
```

### Delete Receipt
```
DELETE /receipts/:id
```

---

## 6. Online Orders API (`/orders`)
*Requires: MANAGER, ONLINE_SALES*

### Get All Orders
```
GET /orders?trang_thai=CHO_XU_LY&search=HD001&kenh_dat_hang=FACEBOOK&ngay_bat_dau=2024-05-01&ngay_ket_thuc=2024-05-31
```

### Get Order by ID
```
GET /orders/:id
```

### Create Order
```
POST /orders
{
  "ten_khach_hang": "Trần Thị B",
  "so_dien_thoai": "0987654321",
  "dia_chi_giao": "123 Nguyễn Huệ, TP HCM",
  "ghi_chu_don": "Giao hàng vào buổi sáng",
  "kenh_dat_hang": "FACEBOOK",
  "ma_voucher": "VOUCHER01",
  "don_vi_van_chuyen": "Giao hàng nhanh",
  "phi_giao_hang": 30000,
  "ngay_giao_du_kien": "2024-05-25",
  "phuong_thuc_thanh_toan": "COD",
  "items": [
    {
      "id_hang_hoa": 1,
      "gia_ban": 620000,
      "so_luong": 1
    }
  ]
}

Response:
{
  "ok": true,
  "message": "Order created successfully",
  "id": 1,
  "ma_don": "HD202405001"
}
```

### Confirm Order
```
POST /orders/:id/confirm
```

### Cancel Order
```
POST /orders/:id/cancel
```

### Complete Order
```
POST /orders/:id/complete
```

### Update Order
```
PUT /orders/:id
{
  "dia_chi_giao": "456 Lê Lợi, TP HCM"
}
```

### Get Pending Orders Count
```
GET /orders/stats/pending
```

### Get Recent Orders
```
GET /orders/recent?limit=10
```

---

## 7. Reports API (`/reports`)

### Get Dashboard KPIs
```
GET /reports/dashboard/kpis

Response:
{
  "ok": true,
  "data": {
    "todayRevenue": 5000000,
    "pendingOrders": 2,
    "lowStockProducts": 3,
    "expiringProducts": 1
  }
}
```

### Get Order Report
```
GET /reports/orders?startDate=2024-05-01&endDate=2024-05-31
```

### Get Revenue Report
```
GET /reports/revenue?startDate=2024-05-01&endDate=2024-05-31
```

### Get Inventory Report
```
GET /reports/inventory
```

### Get Products Needing Reorder
```
GET /reports/inventory/reorder
```

### Get Expiring Products
```
GET /reports/inventory/expiring?days=30
```

### Get Staff Performance Report
```
GET /reports/staff?startDate=2024-05-01&endDate=2024-05-31
```

---

## Error Responses

### 400 Bad Request
```json
{
  "ok": false,
  "message": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "ok": false,
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "ok": false,
  "message": "Forbidden: Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "ok": false,
  "message": "Not found"
}
```

### 500 Internal Server Error
```json
{
  "ok": false,
  "message": "Internal server error"
}
```

---

## Environment Variables

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=khang_baby
JWT_SECRET=khang-baby-secret
PORT=4000
```

---

## Role-Based Access Control (RBAC)

| Endpoint | MANAGER | WAREHOUSE | SALES | ONLINE_SALES | MARKETING |
|----------|---------|-----------|-------|--------------|-----------|
| Staff Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Products CRUD | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invoices/POS | ✅ | ❌ | ✅ | ❌ | ❌ |
| Receipts | ✅ | ✅ | ❌ | ❌ | ❌ |
| Online Orders | ✅ | ❌ | ❌ | ✅ | ❌ |
| All Reports | ✅ | ❌ | ❌ | ❌ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Database Schema

The system uses MySQL with the following main tables:
- `nhan_vien` - Staff members
- `hang_hoa` - Products
- `danh_muc` - Product categories
- `nha_cung_cap` - Suppliers
- `hoa_don_ban` - Sales invoices
- `chi_tiet_hoa_don_ban` - Invoice items
- `phieu_nhap_hang` - Receipts
- `chi_tiet_phieu_nhap` - Receipt items
- `don_hang_online` - Online orders
- `chi_tiet_don_hang_online` - Order items
- `voucher` - Promotional codes

---

## Installation & Running

### Install Dependencies
```bash
npm install
```

### Setup Environment
Create `.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=khang_baby
JWT_SECRET=khang-baby-secret
PORT=4000
```

### Run Development Server
```bash
npm run dev
```

### Run Production Server
```bash
npm start
```

---

## Features Implemented

✅ Complete database schema for all modules
✅ Staff authentication & role-based access control
✅ Product & inventory management with alerts
✅ POS (Point of Sale) with invoicing
✅ Receipt/inventory intake management
✅ Online order management with status tracking
✅ Voucher validation system
✅ Comprehensive reporting & analytics
✅ Dashboard KPI calculation
✅ Error handling & validation
✅ JWT-based authentication
✅ API documentation

---

Generated: May 15, 2026
