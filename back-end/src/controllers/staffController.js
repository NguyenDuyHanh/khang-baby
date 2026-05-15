const staffService = require('../services/staffService');
const { checkRole } = require('../middleware/auth');

// Get all staff
async function getAllStaff(req, res) {
  try {
    const staff = await staffService.getAllStaff();
    res.json({ ok: true, data: staff });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Get staff by ID
async function getStaffById(req, res) {
  try {
    const staff = await staffService.getStaffById(req.params.id);
    if (!staff) {
      return res.status(404).json({ ok: false, message: 'Staff not found' });
    }
    res.json({ ok: true, data: staff });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

// Create staff
async function createStaff(req, res) {
  try {
    const { email, password, ho_ten, so_dien_thoai, vai_tro } = req.body;

    if (!email || !password || !ho_ten || !vai_tro) {
      return res.status(400).json({ ok: false, message: 'Missing required fields' });
    }

    const id = await staffService.registerStaff(email, password, ho_ten, so_dien_thoai, vai_tro);

    res.status(201).json({
      ok: true,
      message: 'Staff created successfully',
      id,
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Update staff
async function updateStaff(req, res) {
  try {
    const { ho_ten, so_dien_thoai, vai_tro, trang_thai } = req.body;

    await staffService.updateStaff(req.params.id, { ho_ten, so_dien_thoai, vai_tro, trang_thai });

    res.json({
      ok: true,
      message: 'Staff updated successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Delete staff (deactivate)
async function deleteStaff(req, res) {
  try {
    await staffService.deleteStaff(req.params.id);

    res.json({
      ok: true,
      message: 'Staff deleted successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Change password
async function changePassword(req, res) {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ ok: false, message: 'New password required' });
    }

    await staffService.changePassword(req.user.id, newPassword);

    res.json({
      ok: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  changePassword,
};
