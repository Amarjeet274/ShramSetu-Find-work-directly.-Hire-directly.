const router = require('express').Router();
const c = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/auth');
router.post('/initiate', protect, restrictTo('employer'), c.initiate);
router.get('/', protect, c.listMine);
router.post('/webhook', c.webhook); // provider-signed
module.exports = router;