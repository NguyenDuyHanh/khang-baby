const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');
const auth = require('../middleware/auth');
const { checkRole } = auth;

router.use(auth);

router.get('/', checkRole('MANAGER', 'WAREHOUSE'), returnController.getAllReturns);
router.get('/:id', checkRole('MANAGER', 'WAREHOUSE'), returnController.getReturnById);
router.post('/', checkRole('MANAGER', 'WAREHOUSE'), returnController.createReturn);
router.put('/:id', checkRole('MANAGER', 'WAREHOUSE'), returnController.updateReturn);
router.delete('/:id', checkRole('MANAGER', 'WAREHOUSE'), returnController.deleteReturn);

module.exports = router;
