const router = require('express').Router();
const c = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
router.post('/chat', protect, c.chat);
module.exports = router;