const customerService = require('../services/customerService');

async function getAllCustomers(req, res) {
  try {
    const filters = {
      search: req.query.search,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    const { rows, totalItems, page, limit } = await customerService.getAllCustomers(filters);
    res.json({ 
      ok: true, 
      data: rows,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

module.exports = {
  getAllCustomers
};
