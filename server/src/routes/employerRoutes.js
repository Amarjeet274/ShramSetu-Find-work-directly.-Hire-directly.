const router = require('express').Router();
const c = require('../controllers/employerController');
const { protect, restrictTo } = require('../middleware/auth');
router.get('/me', protect, restrictTo('employer'), c.getMe);
router.patch('/me', protect, restrictTo('employer'), c.updateMe);
router.get('/:id', protect, c.getPublic);
module.exports = router;
router.post('/me/verification', protect, restrictTo('employer'), c.submitVerification);