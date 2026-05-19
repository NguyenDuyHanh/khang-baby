const returnService = require('../services/returnService');

async function getAllReturns(req, res) {
  try {
    const filters = {
      search: req.query.search,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };
    const { rows, totalItems, page, limit } = await returnService.getAllReturns(filters);
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

async function getReturnById(req, res) {
  try {
    const returnSheet = await returnService.getReturnById(req.params.id);
    if (!returnSheet) {
      return res.status(404).json({ ok: false, message: 'Return voucher not found' });
    }
    res.json({ ok: true, data: returnSheet });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

async function createReturn(req, res) {
  try {
    const { ma_pth, id_phieu_nhap, ngay_tra, ly_do, items } = req.body;

    if (!id_phieu_nhap || !items || items.length === 0) {
      return res.status(400).json({ ok: false, message: 'Receipt ID and items required' });
    }

    const id = await returnService.createReturn({
      ma_pth,
      id_phieu_nhap,
      id_nhan_vien: req.user.id,
      ngay_tra: ngay_tra || new Date(),
      ly_do,
      items,
    });

    res.status(201).json({
      ok: true,
      message: 'Return voucher created successfully',
      id,
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

async function updateReturn(req, res) {
  try {
    const { id_phieu_nhap, ngay_tra, ly_do, items } = req.body;

    if (!id_phieu_nhap || !items || items.length === 0) {
      return res.status(400).json({ ok: false, message: 'Receipt ID and items required' });
    }

    await returnService.updateReturn(req.params.id, {
      id_phieu_nhap,
      ngay_tra: ngay_tra || new Date(),
      ly_do,
      items,
    });

    res.json({
      ok: true,
      message: 'Return voucher updated successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

async function deleteReturn(req, res) {
  try {
    await returnService.deleteReturn(req.params.id);
    res.json({
      ok: true,
      message: 'Return voucher deleted successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

module.exports = {
  getAllReturns,
  getReturnById,
  createReturn,
  updateReturn,
  deleteReturn,
};
