const router = require('express').Router();
const c = require('../controllers/assignmentController');
const { protect, restrictTo } = require('../middleware/auth');
router.get('/', protect, c.listMine);
router.post('/:id/complete', protect, restrictTo('worker'), c.requestCompletion);
router.post('/:id/confirm', protect, restrictTo('employer'), c.confirmCompletion);
module.exports = router;