const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const staffRoutes = require('./routes/staff');
const productRoutes = require('./routes/products');
const invoiceRoutes = require('./routes/invoices');
const receiptRoutes = require('./routes/receipts');
const orderRoutes = require('./routes/orders');
const reportRoutes = require('./routes/reports');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/', (req, res) => res.json({ ok: true, message: 'Backend for khang-baby' }));
app.get('/api/health', (req, res) => res.json({ ok: true, message: 'API is running' }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Not found' });
});

// Error handler
app.use(errorHandler);

const pool = require('./db');

// Auto complete orders after 7 days
setInterval(async () => {
  try {
    const result = await pool.query(`
      UPDATE don_hang_online 
      SET trang_thai = 'KHACH_DA_NHAN', ly_do_khieu_nai = 'Hệ thống tự động xác nhận sau 7 ngày'
      WHERE trang_thai = 'DA_HOAN_THANH' AND ngay_hoan_thanh < CURRENT_TIMESTAMP - INTERVAL '7 days'
    `);
    if (result[0] && result[0].rowCount > 0) {
      console.log(`Auto completed ${result[0].rowCount} orders`);
    }
  } catch (err) {
    console.error('Error in auto-complete orders job:', err);
  }
}, 60 * 60 * 1000); // Check every 1 hour

module.exports = app;
