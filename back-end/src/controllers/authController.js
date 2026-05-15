const staffService = require('../services/staffService');

// Register
async function register(req, res) {
  try {
    const { email, password, ho_ten, so_dien_thoai, vai_tro } = req.body;

    if (!email || !password || !ho_ten || !vai_tro) {
      return res.status(400).json({ ok: false, message: 'Missing required fields' });
    }

    const id = await staffService.registerStaff(email, password, ho_ten, so_dien_thoai, vai_tro);

    res.status(201).json({
      ok: true,
      message: 'Staff registered successfully',
      id,
    });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

// Login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email and password required' });
    }

    const result = await staffService.loginStaff(email, password);

    res.json({
      ok: true,
      message: 'Login successful',
      token: result.token,
      staff: result.staff,
    });
  } catch (error) {
    res.status(401).json({ ok: false, message: error.message });
  }
}

// Get current user
async function getCurrentUser(req, res) {
  try {
    const staff = await staffService.getStaffById(req.user.id);

    if (!staff) {
      return res.status(404).json({ ok: false, message: 'User not found' });
    }

    res.json({
      ok: true,
      staff: {
        id: staff.id,
        email: staff.email,
        ho_ten: staff.ho_ten,
        so_dien_thoai: staff.so_dien_thoai,
        vai_tro: staff.vai_tro,
        trang_thai: staff.trang_thai,
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
};

