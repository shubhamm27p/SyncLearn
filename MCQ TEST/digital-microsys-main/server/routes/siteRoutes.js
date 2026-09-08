const express = require('express');
const siteController = require('../controllers/siteController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/status', siteController.getStatus);
router.put('/status', protect, authorize('admin'), siteController.updateStatus);

module.exports = router;