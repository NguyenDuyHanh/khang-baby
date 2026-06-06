const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middleware/auth');
const { checkRole } = auth;

router.get('/', auth, checkRole('MANAGER', 'SALES', 'ONLINE_SALES'), customerController.getAllCustomers);

module.exports = router;
