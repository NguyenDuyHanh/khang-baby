const feedbackService = require('../services/feedbackService');

async function getAllFeedbacks(req, res) {
  try {
    const filters = {
      search: req.query.search,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };
    const { rows, totalItems, page, limit } = await feedbackService.getAllFeedbacks(filters);
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

async function getFeedbackById(req, res) {
  try {
    const feedback = await feedbackService.getFeedbackById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ ok: false, message: 'Feedback not found' });
    }
    res.json({ ok: true, data: feedback });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

async function createFeedback(req, res) {
  try {
    const { ma_phht, id_phieu_nhap, items } = req.body;

    if (!id_phieu_nhap || !items || items.length === 0) {
      return res.status(400).json({ ok: false, message: 'Receipt ID and items required' });
    }

    const id = await feedbackService.createFeedback({
      ma_phht,
      id_nhan_vien: req.user.id,
      id_phieu_nhap,
      items,
    });

    res.status(201).json({
      ok: true,
      message: 'Feedback sheet created successfully',
      id,
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

async function updateFeedback(req, res) {
  try {
    const { id_phieu_nhap, items } = req.body;

    if (!id_phieu_nhap || !items || items.length === 0) {
      return res.status(400).json({ ok: false, message: 'Receipt ID and items required' });
    }

    await feedbackService.updateFeedback(req.params.id, {
      id_phieu_nhap,
      items,
    });

    res.json({
      ok: true,
      message: 'Feedback sheet updated successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

async function deleteFeedback(req, res) {
  try {
    await feedbackService.deleteFeedback(req.params.id);
    res.json({
      ok: true,
      message: 'Feedback sheet deleted successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

module.exports = {
  getAllFeedbacks,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
};
