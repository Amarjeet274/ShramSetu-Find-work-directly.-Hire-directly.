const router = require('express').Router();
const c = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
router.get('/conversations', protect, c.listConversations);
router.post('/conversations', protect, c.getOrCreate);
router.get('/conversations/:id/messages', protect, c.listMessages);
module.exports = router;