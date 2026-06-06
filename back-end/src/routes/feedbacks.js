const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/auth');
const { checkRole } = auth;

router.use(auth);

router.get('/', checkRole('MANAGER', 'WAREHOUSE'), feedbackController.getAllFeedbacks);
router.get('/:id', checkRole('MANAGER', 'WAREHOUSE'), feedbackController.getFeedbackById);
router.post('/', checkRole('MANAGER', 'WAREHOUSE'), feedbackController.createFeedback);
router.put('/:id', checkRole('MANAGER', 'WAREHOUSE'), feedbackController.updateFeedback);
router.delete('/:id', checkRole('MANAGER', 'WAREHOUSE'), feedbackController.deleteFeedback);

module.exports = router;
