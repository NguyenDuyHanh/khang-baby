require('dotenv').config();
const app = require('./app');
const { ensureTables } = require('./setup');
const orderService = require('./services/orderService');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await ensureTables();
    
    // Bật cronjob kiểm tra đơn hàng tự động hoàn thành mỗi giờ
    setInterval(() => {
      orderService.autoCompleteOrders().catch(err => console.error("Auto complete error:", err));
    }, 1000 * 60 * 60);

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
