const router = require('express').Router();
const c = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const validate = require('../validators/validate');
const { createReportRules } = require('../validators/reportValidators');

router.post('/', protect, createReportRules, validate, c.create);
router.get('/me', protect, c.listMine);

module.exports = router;