const router = require('express').Router();
const c = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../validators/validate');
const { updateStatusRules } = require('../validators/applicationValidators');

router.get('/', protect, restrictTo('worker'), c.listMyApplications);
router.patch('/:id', protect, restrictTo('employer'), updateStatusRules, validate, c.updateStatus);
router.post('/:id/hire', protect, restrictTo('employer'), c.hire);

module.exports = router;