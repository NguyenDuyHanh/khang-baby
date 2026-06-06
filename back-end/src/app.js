const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const staffRoutes = require('./routes/staff');
const productRoutes = require('./routes/products');
const invoiceRoutes = require('./routes/invoices');
const receiptRoutes = require('./routes/receipts');
const orderRoutes = require('./routes/orders');
const reportRoutes = require('./routes/reports');
const returnRoutes = require('./routes/returns');
const feedbackRoutes = require('./routes/feedbacks');
const voucherRoutes = require('./routes/vouchers');
const publicRoutes = require('./routes/public');
const customerRoutes = require('./routes/customers');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/customers', customerRoutes);

// Health check
app.get('/', (req, res) => res.json({ ok: true, message: 'Backend for khang-baby' }));
app.get('/api/health', (req, res) => res.json({ ok: true, message: 'API is running' }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Not found' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
