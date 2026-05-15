const pool = require('../db');

// Get dashboard KPIs
async function getDashboardKPIs() {
  // Today's revenue
  const [revenueRows] = await pool.query(`
    SELECT SUM(tong_can_thanh_toan) as tong_doanh_thu
    FROM hoa_don_ban
    WHERE DATE(ngay_ban) = CURDATE() AND trang_thai = 'DA_THANH_TOAN'
  `);
  const todayRevenue = revenueRows[0].tong_doanh_thu || 0;

  // Pending online orders
  const [ordersRows] = await pool.query(`
    SELECT COUNT(*) as count FROM don_hang_online WHERE trang_thai = 'CHO_XU_LY'
  `);
  const pendingOrders = ordersRows[0].count;

  // Products running low
  const [lowStockRows] = await pool.query(`
    SELECT COUNT(*) as count FROM hang_hoa WHERE ton_kho <= ton_kho_toi_thieu AND trang_thai = 'HOAT_DONG'
  `);
  const lowStockProducts = lowStockRows[0].count;

  // Products expiring/expired
  const [expiryRows] = await pool.query(`
    SELECT COUNT(*) as count FROM hang_hoa 
    WHERE han_su_dung IS NOT NULL AND han_su_dung <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND trang_thai = 'HOAT_DONG'
  `);
  const expiringProducts = expiryRows[0].count;

  return {
    todayRevenue,
    pendingOrders,
    lowStockProducts,
    expiringProducts,
  };
}

// Get order report
async function getOrderReport(startDate, endDate) {
  const [rows] = await pool.query(`
    SELECT 
      DATE(ngay_ban) as ngay,
      COUNT(*) as tong_don,
      SUM(CASE WHEN trang_thai = 'DA_THANH_TOAN' THEN 1 ELSE 0 END) as da_thanh_toan,
      SUM(CASE WHEN trang_thai != 'DA_THANH_TOAN' AND trang_thai != 'DA_HUY' THEN 1 ELSE 0 END) as chua_thanh_toan
    FROM hoa_don_ban
    WHERE DATE(ngay_ban) BETWEEN ? AND ?
    GROUP BY DATE(ngay_ban)
    ORDER BY ngay DESC
  `, [startDate, endDate]);

  return rows;
}

// Get revenue report
async function getRevenueReport(startDate, endDate) {
  // Total revenue
  const [revenueRows] = await pool.query(`
    SELECT 
      SUM(CASE WHEN h.trang_thai = 'DA_THANH_TOAN' THEN h.tong_can_thanh_toan ELSE 0 END) as offline_revenue,
      SUM(CASE WHEN o.trang_thai = 'DA_HOAN_THANH' THEN o.tong_thanh_toan ELSE 0 END) as online_revenue
    FROM (
      SELECT tong_can_thanh_toan, trang_thai FROM hoa_don_ban WHERE DATE(ngay_ban) BETWEEN ? AND ?
    ) h
    FULL OUTER JOIN (
      SELECT tong_thanh_toan, trang_thai FROM don_hang_online WHERE DATE(ngay_dat) BETWEEN ? AND ?
    ) o ON 1=1
  `, [startDate, endDate, startDate, endDate]);

  const offlineRevenue = revenueRows[0]?.offline_revenue || 0;
  const onlineRevenue = revenueRows[0]?.online_revenue || 0;

  // Daily revenue
  const [dailyRows] = await pool.query(`
    SELECT 
      DATE(ngay_ban) as ngay,
      SUM(tong_can_thanh_toan) as tong_doanh_thu
    FROM hoa_don_ban
    WHERE DATE(ngay_ban) BETWEEN ? AND ? AND trang_thai = 'DA_THANH_TOAN'
    GROUP BY DATE(ngay_ban)
    ORDER BY ngay ASC
  `, [startDate, endDate]);

  // Top products
  const [topProductsRows] = await pool.query(`
    SELECT 
      h.ten_sp,
      SUM(ct.so_luong) as tong_so_luong,
      SUM(ct.thanh_tien) as tong_doanh_thu
    FROM chi_tiet_hoa_don_ban ct
    JOIN hang_hoa h ON ct.id_hang_hoa = h.id
    JOIN hoa_don_ban hd ON ct.id_hoa_don = hd.id
    WHERE DATE(hd.ngay_ban) BETWEEN ? AND ? AND hd.trang_thai = 'DA_THANH_TOAN'
    GROUP BY h.id
    ORDER BY tong_so_luong DESC
    LIMIT 5
  `, [startDate, endDate]);

  // Revenue by category
  const [categoryRows] = await pool.query(`
    SELECT 
      d.ten_danh_muc,
      SUM(ct.thanh_tien) as tong_doanh_thu
    FROM chi_tiet_hoa_don_ban ct
    JOIN hang_hoa h ON ct.id_hang_hoa = h.id
    JOIN danh_muc d ON h.id_danh_muc = d.id
    JOIN hoa_don_ban hd ON ct.id_hoa_don = hd.id
    WHERE DATE(hd.ngay_ban) BETWEEN ? AND ? AND hd.trang_thai = 'DA_THANH_TOAN'
    GROUP BY d.id
    ORDER BY tong_doanh_thu DESC
  `, [startDate, endDate]);

  return {
    totalRevenue: offlineRevenue + onlineRevenue,
    offlineRevenue,
    onlineRevenue,
    dailyRevenue: dailyRows,
    topProducts: topProductsRows,
    revenueByCategory: categoryRows,
  };
}

// Get inventory report
async function getInventoryReport() {
  // Total items and value
  const [totalRows] = await pool.query(`
    SELECT 
      COUNT(*) as tong_mat_hang,
      SUM(ton_kho * gia_nhap) as tong_gia_tri_ton_kho
    FROM hang_hoa
    WHERE trang_thai = 'HOAT_DONG'
  `);

  // Products running low
  const [lowRows] = await pool.query(`
    SELECT COUNT(*) as count FROM hang_hoa WHERE ton_kho <= ton_kho_toi_thieu AND trang_thai = 'HOAT_DONG'
  `);

  // Out of stock
  const [outRows] = await pool.query(`
    SELECT COUNT(*) as count FROM hang_hoa WHERE ton_kho = 0 AND trang_thai = 'HOAT_DONG'
  `);

  // Expiring soon
  const [expiringRows] = await pool.query(`
    SELECT COUNT(*) as count FROM hang_hoa 
    WHERE han_su_dung IS NOT NULL AND han_su_dung <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND trang_thai = 'HOAT_DONG'
  `);

  // Already expired
  const [expiredRows] = await pool.query(`
    SELECT COUNT(*) as count FROM hang_hoa 
    WHERE han_su_dung IS NOT NULL AND han_su_dung < CURDATE() AND trang_thai = 'HOAT_DONG'
  `);

  return {
    totalItems: totalRows[0].tong_mat_hang,
    totalInventoryValue: totalRows[0].tong_gia_tri_ton_kho || 0,
    runningLow: lowRows[0].count,
    outOfStock: outRows[0].count,
    expiringInMonth: expiringRows[0].count,
    alreadyExpired: expiredRows[0].count,
  };
}

// Get staff performance report
async function getStaffPerformanceReport(startDate, endDate) {
  const [rows] = await pool.query(`
    SELECT 
      nv.id,
      nv.ho_ten,
      COUNT(hd.id) as tong_don,
      SUM(hd.tong_can_thanh_toan) as tong_doanh_so,
      COUNT(CASE WHEN hd.trang_thai = 'DA_THANH_TOAN' THEN 1 END) as don_hoan_thanh
    FROM nhan_vien nv
    LEFT JOIN hoa_don_ban hd ON nv.id = hd.id_nhan_vien AND DATE(hd.ngay_ban) BETWEEN ? AND ?
    WHERE nv.vai_tro IN ('SALES', 'ONLINE_SALES')
    GROUP BY nv.id
    ORDER BY tong_doanh_so DESC
  `, [startDate, endDate]);

  return rows;
}

// Get products needing reorder
async function getProductsNeedingReorder() {
  const [rows] = await pool.query(`
    SELECT 
      h.ma_sp,
      h.ten_sp,
      h.ton_kho,
      h.ton_kho_toi_thieu,
      (h.ton_kho_toi_thieu * 2 - h.ton_kho) as so_luong_can_nhap,
      n.ten_ncc,
      h.gia_nhap
    FROM hang_hoa h
    LEFT JOIN nha_cung_cap n ON h.id_nha_cung_cap = n.id
    WHERE h.ton_kho < h.ton_kho_toi_thieu AND h.trang_thai = 'HOAT_DONG'
    ORDER BY h.ton_kho ASC
  `);

  return rows;
}

// Get expiring products
async function getExpiringProducts(days = 30) {
  const [rows] = await pool.query(`
    SELECT 
      h.ma_sp,
      h.ten_sp,
      h.ton_kho,
      h.han_su_dung,
      DATEDIFF(h.han_su_dung, CURDATE()) as ngay_con_lai,
      n.ten_ncc
    FROM hang_hoa h
    LEFT JOIN nha_cung_cap n ON h.id_nha_cung_cap = n.id
    WHERE h.han_su_dung IS NOT NULL AND h.han_su_dung <= DATE_ADD(CURDATE(), INTERVAL ? DAY) AND h.trang_thai = 'HOAT_DONG'
    ORDER BY h.han_su_dung ASC
  `, [days]);

  return rows;
}

module.exports = {
  getDashboardKPIs,
  getOrderReport,
  getRevenueReport,
  getInventoryReport,
  getStaffPerformanceReport,
  getProductsNeedingReorder,
  getExpiringProducts,
};
