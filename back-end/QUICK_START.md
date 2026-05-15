# Backend Setup & Quick Start Guide

## Installation

1. **Install Dependencies**
   ```bash
   cd back-end
   npm install
   ```

2. **Create `.env` file** in the `back-end` directory:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=khang_baby
   JWT_SECRET=khang-baby-secret
   PORT=4000
   NODE_ENV=development
   ```

3. **Create MySQL Database**
   ```sql
   CREATE DATABASE khang_baby CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   The server will:
   - Initialize all database tables automatically
   - Start on http://localhost:4000

## Testing the API

### 1. Register a New Staff
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@khangbaby.com",
    "password": "Manager@123",
    "ho_ten": "Quản lý cửa hàng",
    "so_dien_thoai": "0912345678",
    "vai_tro": "MANAGER"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@khangbaby.com",
    "password": "Manager@123"
  }'
```

Get the token from response and use it in Authorization header:
```
Authorization: Bearer <token>
```

### 3. Get Dashboard KPIs
```bash
curl -X GET http://localhost:4000/api/reports/dashboard/kpis \
  -H "Authorization: Bearer <token>"
```

## Project Structure

```
back-end/
├── src/
│   ├── app.js                 # Express app setup
│   ├── index.js               # Server entry point
│   ├── db.js                  # MySQL connection pool
│   ├── setup.js               # Database schema initialization
│   ├── controllers/           # API handlers
│   │   ├── authController.js
│   │   ├── staffController.js
│   │   ├── productController.js
│   │   ├── invoiceController.js
│   │   ├── receiptController.js
│   │   ├── orderController.js
│   │   └── reportController.js
│   ├── services/              # Business logic
│   │   ├── staffService.js
│   │   ├── productService.js
│   │   ├── invoiceService.js
│   │   ├── receiptService.js
│   │   ├── orderService.js
│   │   ├── voucherService.js
│   │   └── reportService.js
│   ├── routes/                # API routes
│   │   ├── auth.js
│   │   ├── staff.js
│   │   ├── products.js
│   │   ├── invoices.js
│   │   ├── receipts.js
│   │   ├── orders.js
│   │   └── reports.js
│   ├── middleware/            # Express middleware
│   │   ├── auth.js            # JWT verification
│   │   └── errorHandler.js    # Error handling
│   └── utils/
│       └── helpers.js         # Utility functions
├── package.json
├── .env                       # Environment variables
└── API_DOCUMENTATION.md       # Complete API docs
```

## Database Tables

| Table | Purpose |
|-------|---------|
| `nhan_vien` | Staff members & authentication |
| `hang_hoa` | Product catalog |
| `danh_muc` | Product categories |
| `nha_cung_cap` | Suppliers |
| `hoa_don_ban` | Sales invoices (POS) |
| `chi_tiet_hoa_don_ban` | Invoice line items |
| `phieu_nhap_hang` | Inventory receipts |
| `chi_tiet_phieu_nhap` | Receipt line items |
| `don_hang_online` | Online orders |
| `chi_tiet_don_hang_online` | Order line items |
| `voucher` | Promotional codes |

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new staff
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Staff Management (MANAGER only)
- `GET /api/staff` - List all staff
- `POST /api/staff` - Create staff
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Deactivate staff

### Products & Inventory
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/alerts/near-minimum` - Low stock items
- `GET /api/products/alerts/expiring` - Expiring items
- `GET /api/products/categories/list` - Product categories
- `GET /api/products/suppliers/list` - Suppliers

### Invoicing (POS)
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `POST /api/invoices/:id/confirm-payment` - Confirm payment
- `GET /api/invoices/revenue/today` - Today's revenue

### Inventory Receipts
- `GET /api/receipts` - List receipts
- `POST /api/receipts` - Create receipt
- `PUT /api/receipts/:id` - Update receipt

### Online Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `POST /api/orders/:id/confirm` - Confirm order
- `POST /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/stats/pending` - Pending orders

### Reports
- `GET /api/reports/dashboard/kpis` - Dashboard metrics
- `GET /api/reports/revenue` - Revenue report
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/orders` - Order report
- `GET /api/reports/staff` - Staff performance

## Key Features

✅ **Complete 6-Module System**
- Dashboard with KPIs
- Staff & Roles Management
- Point of Sale (POS)
- Inventory Management
- Online Orders
- Reports & Analytics

✅ **Business Logic**
- Automatic stock deduction on payment
- Voucher validation with discounts
- FIFO inventory tracking
- Expiry date management
- Real-time KPI calculation

✅ **Security**
- JWT authentication (30-day expiry)
- Role-based access control
- Password hashing with bcryptjs
- Input validation

✅ **Database**
- Complete schema with relationships
- Automatic table initialization
- MySQL transactions support

## Common Issues & Solutions

### Issue: Can't connect to database
**Solution:** Check `.env` file and MySQL connection parameters
```bash
mysql -h localhost -u root -p -e "CREATE DATABASE khang_baby;"
```

### Issue: Port 4000 already in use
**Solution:** Change PORT in `.env` or kill existing process
```bash
lsof -i :4000
kill -9 <PID>
```

### Issue: JWT errors
**Solution:** Make sure token is correctly passed:
```
Authorization: Bearer <token>
```

## Development Commands

```bash
# Start dev server with auto-reload
npm run dev

# Start production server
npm start

# View database
mysql -u root khang_baby

# Check tables
SHOW TABLES;
DESC nhan_vien;
```

## Next Steps

1. ✅ Backend API complete
2. 📝 Connect frontend to backend API
3. 🧪 Integration testing
4. 🚀 Production deployment

## Support

For issues or questions, check:
- `API_DOCUMENTATION.md` - Complete API reference
- `src/controllers/` - Implementation examples
- `.env.example` - Environment setup

---

Created: May 15, 2026
Backend Version: 1.0.0
