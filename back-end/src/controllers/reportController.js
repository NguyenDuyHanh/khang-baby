const reportService = require('../services/reportService');

// Get dashboard KPIs
async function getDashboardKPIs(req, res) {
  try {
    const kpis = await reportService.getDashboardKPIs();
    res.json({ ok: true, data: kpis });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Get order report
async function getOrderReport(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ ok: false, message: 'Start date and end date required' });
    }

    const report = await reportService.getOrderReport(startDate, endDate);
    res.json({ ok: true, data: report });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Get revenue report
async function getRevenueReport(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ ok: false, message: 'Start date and end date required' });
    }

    const report = await reportService.getRevenueReport(startDate, endDate);
    res.json({ ok: true, data: report });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Get inventory report
async function getInventoryReport(req, res) {
  try {
    const report = await reportService.getInventoryReport();
    res.json({ ok: true, data: report });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Get staff performance report
async function getStaffPerformanceReport(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ ok: false, message: 'Start date and end date required' });
    }

    const report = await reportService.getStaffPerformanceReport(startDate, endDate);
    res.json({ ok: true, data: report });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Get products needing reorder
async function getProductsNeedingReorder(req, res) {
  try {
    const products = await reportService.getProductsNeedingReorder();
    res.json({ ok: true, data: products });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Get expiring products
async function getExpiringProducts(req, res) {
  try {
    const days = req.query.days || 30;
    const products = await reportService.getExpiringProducts(days);
    res.json({ ok: true, data: products });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
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
